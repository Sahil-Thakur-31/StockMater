import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage("");

      const res = await client.put("/api/auth/update-profile", form);

      // Update local session instantly
      localStorage.setItem("user", JSON.stringify(res.data));
      window.location.reload();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">My Profile</h1>
      <div className="card">
        <form className="form" onSubmit={handleUpdate}>
          <div className="form-row">
            <label>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {message && <div className="error-text">{message}</div>}

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Profile"}
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ marginLeft: 10 }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
