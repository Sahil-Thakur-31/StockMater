import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title">Inventory Dashboard</div>
      <div className="topbar-right">
        <span className="topbar-user">
          {user ? `Hello, ${user.name}` : "Not logged in"}
        </span>
      </div>
    </header>
  );
}
