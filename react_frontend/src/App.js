import { useState } from "react";
import RoleSelect from "./pages/RoleSelect";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setRole(null);
  };

  if (!role) return <RoleSelect setRole={setRole} />;
  if (!user) return <Login setUser={setUser} role={role} onBack={() => setRole(null)} />;

  return user.role === "admin"
    ? <AdminDashboard user={user} onLogout={handleLogout} />
    : <CustomerDashboard user={user} onLogout={handleLogout} />;
}

export default App;