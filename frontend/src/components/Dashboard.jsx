function Dashboard({ user, onLogout }) {
  return (
    <div className="auth-card">
      <h2>Welcome, {user.username}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <p className="note-text">
        This is a placeholder. Day 2 adds JWT-protected routes; Day 3+ adds file upload,
        encryption, and the real audit-log dashboard.
      </p>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
}

export default Dashboard;