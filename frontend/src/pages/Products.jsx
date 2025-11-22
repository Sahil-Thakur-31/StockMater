import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchProducts, createProduct, updateProduct } from "../api/products";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  uom: "",
  initialStock: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      category: p.category,
      uom: p.uom,
      initialStock: "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        uom: form.uom,
      };

      // Only include initialStock when creating
      if (!editingId && form.initialStock !== "") {
        payload.initialStock = Number(form.initialStock);
      }

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Name", accessor: "name" },
    { header: "SKU/Code", accessor: "sku" },
    { header: "Category", accessor: "category" },
    { header: "UoM", accessor: "uom" },
    { header: "Current Stock", accessor: "currentStock" },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <button
          className="btn-small"
          type="button"
          onClick={() => handleEdit(row)}
        >
          Edit
        </button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="page-title">Products</h1>

      <div className="grid-2">
        <div className="card">
          <h2>{editingId ? "Edit Product" : "Create Product"}</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <label>SKU / Code</label>
              <input name="sku" value={form.sku} onChange={handleChange} required />
            </div>

            <div className="form-row">
              <label>Category</label>
              <input name="category" value={form.category} onChange={handleChange} />
            </div>

            <div className="form-row">
              <label>Unit of Measure</label>
              <input
                name="uom"
                value={form.uom}
                onChange={handleChange}
                placeholder="kg, pcs, box..."
              />
            </div>

            {!editingId && (
              <div className="form-row">
                <label>Initial Stock (optional)</label>
                <input
                  name="initialStock"
                  type="number"
                  min="0"
                  value={form.initialStock}
                  onChange={handleChange}
                />
              </div>
            )}

            {error && <div className="error-text">{error}</div>}

            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>

              {editingId && (
                <button type="button" className="btn-outline" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <DataTable columns={columns} data={products} keyField="id" />
          )}
        </div>
      </div>
    </div>
  );
}
