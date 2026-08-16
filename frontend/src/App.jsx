import { useState, useEffect } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import apiClient from "./api/client";
import "./App.css";

function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // On page load/refresh, the access token in memory is gone (that's intentional -
  // it's never persisted to localStorage). Try the refresh cookie to silently restore the session.
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await apiClient.post("/auth/refresh");
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
      } catch (err) {
        // No valid refresh cookie - just show the login screen, this is expected for a fresh visit
      } finally {
        setCheckingSession(false);
      }
    };
    tryRefresh();
  }, []);

  const handleLoginSuccess = (loggedInUser, token) => {
    setUser(loggedInUser);
    setAccessToken(token);
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
  };

  if (checkingSession) {
    return (
      <div className="app-shell">
        <p className="note-text">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <h1>Auth + Audit Logging Service</h1>
      {user ? (
        <Dashboard user={user} accessToken={accessToken} onLogout={handleLogout} />
      ) : view === "login" ? (
        <Login onSwitchToRegister={() => setView("register")} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Register onSwitchToLogin={() => setView("login")} />
      )}
    </div>
  );
}

export default App;