import React, { useState } from "react";
import { createAdjustment } from "../api/adjustments";
import DataTable from "../components/DataTable";

export default function Adjustments() {
  const [form, setForm] = useState({
    product_id: "",
    location_id: "",
    counted_quantity: "",
  });
  const [adjustments, setAdjustments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        product_id: Number(form.product_id),
        location_id: Number(form.location_id),
        counted_quantity: Number(form.counted_quantity),
      };

      const created = await createAdjustment(payload);
      setAdjustments((prev) => [created, ...prev]);

      setForm({ product_id: "", location_id: "", counted_quantity: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create adjustment");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Reference", accessor: "reference_no" },
    { header: "Product ID", accessor: "product_id" },
    { header: "Location ID", accessor: "location_id" },
    { header: "Counted Qty", accessor: "counted_quantity" },
    { header: "System Qty", accessor: "system_quantity" },
    { header: "Difference", accessor: "difference" },
    { header: "Created At", accessor: "created_at" },
  ];

  return (
    <div>
      <h1 className="page-title">Stock Adjustments</h1>

      <div className="grid-2">
        <div className="card">
          <h2>Create Adjustment</h2>
          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Product ID</label>
              <input
                name="product_id"
                type="number"
                value={form.product_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Location ID</label>
              <input
                name="location_id"
                type="number"
                value={form.location_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Counted Quantity</label>
              <input
                name="counted_quantity"
                type="number"
                value={form.counted_quantity}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-text">{error}</div>}

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create Adjustment"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <DataTable data={adjustments} columns={columns} keyField="id" />
        </div>
      </div>
    </div>
  );
}
