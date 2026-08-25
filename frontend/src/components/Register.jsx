import { useState } from "react";
import apiClient from "../api/client";

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState({ message: "", isError: false });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", isError: false });
    try {
      const res = await apiClient.post("/auth/register", form);
      setStatus({ message: res.data.message, isError: false });
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      setStatus({ message: msg, isError: true });
    }
  };

  return (
    <div className="auth-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />
        <button type="submit">Create Account</button>
      </form>
      {status.message && (
        <p className={status.isError ? "error-text" : "success-text"}>{status.message}</p>
      )}
      <button className="link-btn" onClick={onSwitchToLogin}>
        Already have an account? Log in
      </button>
    </div>
  );
}

export default Register;