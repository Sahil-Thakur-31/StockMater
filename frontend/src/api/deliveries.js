import client from "./client";

export const createDelivery = (data) =>
  client.post("/api/deliveries", data).then(res => res.data);

// MUST include location_id
export const validateDelivery = (id, locationId) =>
  client.post(`/api/deliveries/${id}/validate`, { location_id: locationId }).then(res => res.data);
