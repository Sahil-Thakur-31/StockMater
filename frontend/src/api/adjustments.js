import client from "./client";

export const createAdjustment = (data) =>
  client.post("/api/adjustments", data).then(res => res.data);
