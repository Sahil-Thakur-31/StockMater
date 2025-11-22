import React, { useState } from "react";
import { createDelivery, validateDelivery } from "../api/deliveries";
import DataTable from "../components/DataTable";

export default function Deliveries() {
  const [form, setForm] = useState({
    customer_name: "",
    delivery_date: "",
    products: "",
  });

  const [deliveries, setDeliveries] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Format: "1:10,2:5" -> [{ product_id:1, quantity:10 }, ...]
      const lines = form.products
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((entry) => {
          const [product_id, qty] = entry.split(":").map((v) => v.trim());
          return { product_id: Number(product_id), quantity: Number(qty) };
        });

      const payload = {
        customer_name: form.customer_name,
        delivery_date: form.delivery_date,
        items: lines,
      };

      const created = await createDelivery(payload);
      setDeliveries((prev) => [...prev, created]);
      setForm({ customer_name: "", delivery_date: "", products: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create delivery");
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (delivery) => {
    try {
      await validateDelivery(delivery.id);
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === delivery.id ? { ...d, status: "Done" } : d
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to complete delivery");
    }
  };

  const columns = [
    { header: "Reference", accessor: "reference_no" },
    { header: "Customer", accessor: "customer_name" },
    { header: "Status", accessor: "status" },
    {
      header: "Items",
      key: "items",
      render: (row) => row.items?.length ?? 0,
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) =>
        row.status === "Waiting" || row.status === "Ready" ? (
          <button
            type="button"
            className="btn-small"
            onClick={() => handleValidate(row)}
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
      <h1 className="page-title">Delivery Orders (Outgoing Stock)</h1>

      <div className="grid-2">
        <div className="card">
          <h2>Create Delivery</h2>
          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <label>Customer Name</label>
              <input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Delivery Date</label>
              <input
                name="delivery_date"
                type="date"
                value={form.delivery_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Products (productId:qty, productId:qty)</label>
              <textarea
                name="products"
                value={form.products}
                onChange={handleChange}
                placeholder="Example: 1:10, 2:5"
                required
              />
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create Delivery"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <DataTable columns={columns} data={deliveries} keyField="id" />
        </div>
      </div>
    </div>
  );
}
