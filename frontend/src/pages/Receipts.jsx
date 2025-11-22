import React, { useEffect, useState } from "react";
import {
  fetchReceiptsByWarehouse,
  createReceipt,
  validateReceipt,
} from "../api/receipts";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import client from "../api/client"; // axios for fetching locations list

export default function Receipts() {
  const [warehouseId, setWarehouseId] = useState("");
  const [locations, setLocations] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    supplier: "",
    products: "",
  });

  // Load warehouse list
  const loadLocations = async () => {
    try {
      const res = await client.get("/api/locations");
      setLocations(res.data);
      if (res.data.length > 0) {
        setWarehouseId(res.data[0].code); // set first warehouse by default
      }
    } catch (e) {
      console.error("Failed to load locations", e);
    }
  };

  // Load receipts by warehouse
  const loadReceipts = async () => {
    if (!warehouseId) return;
    try {
      setLoading(true);
      setError("");
      const data = await fetchReceiptsByWarehouse(warehouseId);
      setReceipts(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    loadReceipts();
  }, [warehouseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError("");

      // Example input format => "SKU1:10,SKU2:5"
      const lines = form.products
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((entry) => {
          const [sku, qty] = entry.split(":").map((v) => v.trim());
          return { sku, quantity: Number(qty) };
        });

      const payload = {
        supplier: form.supplier,
        warehouseId,
        lines,
      };

      await createReceipt(payload);
      setForm({ supplier: "", products: "" });
      await loadReceipts();
    } catch (e) {
      console.error(e);
      setError("Failed to create receipt");
    } finally {
      setCreating(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await validateReceipt(id, warehouseId);
      await loadReceipts();
    } catch (e) {
      console.error(e);
      alert("Failed to validate receipt");
    }
  };

  const columns = [
    { header: "Reference", accessor: "reference" },
    { header: "Supplier", accessor: "supplier" },
    {
      header: "Warehouse",
      accessor: "warehouse_id",
      render: (row) => {
        const loc = locations.find((l) => l.id === row.warehouse_id);
        return loc ? loc.name : row.warehouse_id;
      },
    },
    {
      header: "Status",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Total Lines",
      key: "linesCount",
      render: (row) => row.linesCount ?? 0,
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) =>
        row.status === "Waiting" ? (
          <button
            className="btn-small"
            type="button"
            onClick={() => handleValidate(row.id)}
          >
            Validate
          </button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">Receipts (Incoming Stock)</h1>

      <div className="toolbar">
        <label>
          Warehouse:
          <select
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Create Receipt</h2>
          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <label>Supplier</label>
              <input
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Products (sku:qty, sku:qty)</label>
              <textarea
                name="products"
                value={form.products}
                onChange={handleChange}
                placeholder="EX: STEEL-ROD:50, NUT-10MM:200"
                required
              />
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? "Creating..." : "Create Receipt"}
              </button>
            </div>
          </form>
        </div>

        <div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <DataTable columns={columns} data={receipts} keyField="id" />
          )}
        </div>
      </div>
    </div>
  );
}
