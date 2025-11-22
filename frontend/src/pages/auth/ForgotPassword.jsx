import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { requestPasswordOtp, resetUserPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** Step 1 — Request OTP */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await requestPasswordOtp(email);      // backend call
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /** Step 2 — Reset password using OTP */
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await resetUserPassword({ email, otp, newPassword });   // backend call
      alert("Password reset successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Reset Password</h1>

        {!otpSent ? (
          <form className="form" onSubmit={handleSendOtp}>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form className="form" onSubmit={handleReset}>
            <div className="form-row">
              <label>OTP</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <div className="form-actions">
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
