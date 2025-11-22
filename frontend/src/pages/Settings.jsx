import React from "react";

export default function Settings() {
  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <div className="card">
        <h2>Warehouses & Locations</h2>
        <p>
          Configure warehouses, racks, and locations here once your backend
          exposes the relevant endpoints (e.g. <code>/api/warehouses</code>).
        </p>
      </div>
    </div>
  );
}
