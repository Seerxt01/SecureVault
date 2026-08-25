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
          <>
            <p className="note-text" style={{ margin: "14px 0 16px" }}>
              Verified via protected route <span className="mono">/api/auth/me</span>
            </p>
            <div className="session-row">
              <span className="session-label">User ID</span>
              <span className="session-value">{meData._id}</span>
            </div>
            <div className="session-row">
              <span className="session-label">Email</span>
              <span className="session-value">{meData.email}</span>
            </div>
            <div className="session-row">
              <span className="session-label">Role</span>
              <span className="role-badge">● {meData.role}</span>
            </div>
          </>
        )}

        <p className="note-text" style={{ marginTop: "16px" }}>
          Files are encrypted at rest using AES-256-GCM.
        </p>
        <button className="ghost" style={{ marginTop: "18px" }} onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <div style={{ marginTop: "16px" }}>
        <FileUpload accessToken={accessToken} />
      </div>
    </div>
  );
}

export default Dashboard;