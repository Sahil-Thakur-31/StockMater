import client from "./client";

export const login = (data) => client.post("/api/auth/login", data).then(res => res.data);
export const register = (data) => client.post("/api/auth/register", data).then(res => res.data);
export const requestOtp = (email) => client.post("/api/auth/request-reset", { email }).then(res => res.data);
export const resetPassword = (payload) => client.post("/api/auth/reset-password", payload).then(res => res.data);
