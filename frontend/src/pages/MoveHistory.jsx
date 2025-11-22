import React, { useEffect, useState } from "react";
import { fetchMoveHistory } from "../api/moveHistory";
import DataTable from "../components/DataTable";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";

export default function MoveHistory() {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchMoveHistory();
      setMoves(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load movement history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { header: "Type", accessor: "movement_type" },
    { header: "Reference", accessor: "reference_no" },
    { header: "Product ID", accessor: "product_id" },
    { header: "From Location", accessor: "from_location_id" },
    { header: "To Location", accessor: "to_location_id" },
    { header: "Qty", accessor: "quantity" },
    { header: "Date", accessor: "created_at" },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-text">{error}</div>;

  return (
    <div>
      <h1 className="page-title">Move History</h1>
      <DataTable columns={columns} data={moves} keyField="id" />
    </div>
  );
}
