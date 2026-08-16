import { useState } from "react";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [view, setView] = useState("login"); // "login" | "register"
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (loggedInUser) => setUser(loggedInUser);
  const handleLogout = () => setUser(null);

  return (
    <div className="app-shell">
      <h1>Auth + Audit Logging Service</h1>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : view === "login" ? (
        <Login onSwitchToRegister={() => setView("register")} onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Register onSwitchToLogin={() => setView("login")} />
      )}
    </div>
  );
}

export default App;