import client from "./client";

export const fetchKpis = () =>
  client.get("/api/dashboard/kpis").then(res => res.data);
