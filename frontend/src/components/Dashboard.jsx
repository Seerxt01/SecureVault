import { useEffect, useState } from "react";
import apiClient from "../api/client";

function Dashboard({ user, accessToken, onLogout }) {
  const [meData, setMeData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Sending the access token proves this route is actually protected -
        // without this header, the backend's `protect` middleware returns 401
        const res = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setMeData(res.data.user);
      } catch (err) {
        setError("Could not verify session - try logging in again.");
      }
    };
    fetchMe();
  }, [accessToken]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      // Even if the logout request fails, clear the local session
    }
    onLogout();
  };

  return (
    <div className="auth-card">
      <h2>Welcome, {user.username}</h2>
      {error && <p className="error-text">{error}</p>}
      {meData && (
        <div className="note-text">
          <p>Verified via protected route /api/auth/me:</p>
          <p>ID: {meData._id}</p>
          <p>Email: {meData.email}</p>
          <p>Role: {meData.role}</p>
        </div>
      )}
      <p className="note-text">
        Day 3+ adds file upload, encryption, and the real audit-log dashboard.
      </p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default Dashboard;