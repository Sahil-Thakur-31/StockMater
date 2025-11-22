import React, { useEffect, useState } from "react";
import { fetchKpis } from "../api/dashboard";
import KpiCard from "../components/KpiCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchKpis();
      setKpis(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load KPIs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);


  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="error-text">
        {error}
        <br />
        <button className="btn-outline" onClick={load} style={{ marginTop: 10 }}>
          Retry
        </button>
      </div>
    );

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="kpi-grid">
        <KpiCard label="Total Products in Stock" value={kpis?.totalProducts ?? "-"} />
        <KpiCard label="Low / Out of Stock" value={kpis?.lowStockCount ?? "-"} />
        <KpiCard label="Pending Receipts" value={kpis?.pendingReceipts ?? "-"} />
        <KpiCard label="Pending Deliveries" value={kpis?.pendingDeliveries ?? "-"} />
        <KpiCard
          label="Internal Transfers Scheduled"
          value={kpis?.scheduledTransfers ?? "-"}
        />
      </div>
    </div>
  );
}
