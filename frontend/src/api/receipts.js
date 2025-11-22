import client from "./client";

export async function fetchReceiptsByWarehouse(warehouseId) {
  const res = await client.get(`/api/receipts/warehouse/${warehouseId}`);
  return res.data;
}

export async function createReceipt(payload) {
  const res = await client.post("/api/receipts", payload);
  return res.data;
}

export async function validateReceipt(id, location_id) {
  const res = await client.post(`/api/receipts/${id}/validate`, { location_id });
  return res.data;
}
