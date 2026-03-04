export default function Navbar({ user, onLogout }) {

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#1e293b",
      color: "white"
    }}>
      <h2>🚚 Logistics AI</h2>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span>
          {user.username} ({user.role})
        </span>

        <button
          onClick={onLogout}
          style={{
            padding: "6px 12px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}