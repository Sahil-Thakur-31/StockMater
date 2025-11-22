import React, { useState } from "react";
import { createTransfer, completeTransfer } from "../api/transfers";
import DataTable from "../components/DataTable";

export default function Transfers() {
  const [form, setForm] = useState({
    fromLocation: "",
    toLocation: "",
    products: "",
  });
  const [transfers, setTransfers] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const lines = form.products
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((entry) => {
          const [sku, qty] = entry.split(":").map((v) => v.trim());
          return { sku, quantity: Number(qty) };
        });

      const payload = {
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        lines,
      };

      const created = await createTransfer(payload);
      setTransfers((t) => [...t, created]);
      setForm({ fromLocation: "", toLocation: "", products: "" });
    } catch (e) {
      console.error(e);
      alert("Failed to create transfer");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (row) => {
    try {
      await completeTransfer(row._id || row.id);
      setTransfers((t) =>
        t.map((tr) =>
          (tr._id || tr.id) === (row._id || row.id)
            ? { ...tr, status: "Done" }
            : tr
        )
      );
    } catch (e) {
      console.error(e);
      alert("Failed to complete transfer");
    }
  };

  const columns = [
    { header: "From", accessor: "fromLocation" },
    { header: "To", accessor: "toLocation" },
    { header: "Status", accessor: "status" },
    {
      header: "Lines",
      key: "lines",
      render: (row) => row.lines?.length ?? 0,
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) =>
        row.status === "Scheduled" || row.status === "Ready" ? (
          <button
            className="btn-small"
            type="button"
            onClick={() => handleComplete(row)}
          >
            Complete
          </button>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">Internal Transfers</h1>

      <div className="grid-2">
        <div className="card">
          <h2>Create Transfer</h2>
          <form className="form" onSubmit={handleCreate}>
            <div className="form-row">
              <label>From Location</label>
              <input
                name="fromLocation"
                value={form.fromLocation}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <label>To Location</label>
              <input
                name="toLocation"
                value={form.toLocation}
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
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Creating..." : "Create Transfer"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <DataTable columns={columns} data={transfers} keyField="_id" />
        </div>
      </div>
    </div>
  );
}
