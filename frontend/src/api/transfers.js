import client from "./client";

export const createTransfer = (data) =>
  client.post("/api/transfers", data).then(res => res.data);

export const completeTransfer = (id) =>
  client.post(`/api/transfers/${id}/complete`).then(res => res.data);
