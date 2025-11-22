import React, { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, register as apiRegister, requestOtp, resetPassword } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // REAL LOGIN (calls backend)
  const login = async ({ email, password }) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem("user", JSON.stringify(res));
    localStorage.setItem("token", res.token);
    setUser(res);
  };

  // REAL REGISTER (calls backend)
  const register = async ({ name, email, password }) => {
    const res = await apiRegister({ name, email, password });
    localStorage.setItem("user", JSON.stringify(res));
    localStorage.setItem("token", res.token);
    setUser(res);
  };

  // Request OTP
  const requestPasswordOtp = async (email) => {
    await requestOtp(email);
  };

  // Reset password
  const resetUserPassword = async ({ email, otp, newPassword }) => {
    await resetPassword({ email, otp, newPassword });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    requestPasswordOtp,
    resetUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
