import client from "./client";

export const fetchProducts = () => client.get("/api/products").then(res => res.data);
export const createProduct = (data) => client.post("/api/products", data).then(res => res.data);
export const updateProduct = (id, data) => client.put(`/api/products/${id}`, data).then(res => res.data);
