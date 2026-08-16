import { useState } from "react";
import apiClient from "../api/client";

function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ message: "", isError: false });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", isError: false });
    try {
      const res = await apiClient.post("/auth/login", form);
      setStatus({ message: res.data.message, isError: false });
      onLoginSuccess(res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setStatus({ message: msg, isError: true });
    }
  };

  return (
    <div className="auth-card">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      {status.message && (
        <p className={status.isError ? "error-text" : "success-text"}>{status.message}</p>
      )}
      <button className="link-btn" onClick={onSwitchToRegister}>
        Need an account? Register
      </button>
    </div>
  );
}

export default Login;