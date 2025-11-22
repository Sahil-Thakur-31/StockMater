import client from "./client";

export const fetchMoveHistory = async () => {
  const res = await client.get("/api/move-history");
  return res.data;
};
