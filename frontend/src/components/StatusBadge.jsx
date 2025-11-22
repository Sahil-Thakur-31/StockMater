import React from "react";

const statusClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "draft":
      return "badge badge-gray";
    case "waiting":
      return "badge badge-yellow";
    case "ready":
      return "badge badge-blue";
    case "done":
      return "badge badge-green";
    case "canceled":
      return "badge badge-red";
    default:
      return "badge";
  }
};

export default function StatusBadge({ status }) {
  return <span className={statusClass(status)}>{status}</span>;
}
