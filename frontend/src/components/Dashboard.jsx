import { useEffect, useState } from "react";
import apiClient from "../api/client";
import FileUpload from "./FileUpload";

function Dashboard({ user, accessToken, onLogout }) {
  const [meData, setMeData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
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
    <div>
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
          Day 4 adds AES encryption/decryption for uploaded files.
        </p>
        <button onClick={handleLogout}>Log Out</button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <FileUpload accessToken={accessToken} />
      </div>
    </div>
  );
}

export default Dashboard;