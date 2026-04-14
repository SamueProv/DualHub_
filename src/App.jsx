import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import HubPage from "./components/HubPage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("login");
  const [loggedUser, setLoggedUser] = useState(null);

  if (loggedUser) {
    return <HubPage username={loggedUser} onLogout={() => setLoggedUser(null)} />;
  }

  return (
    <div className="app-wrapper">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-icon">D</div>
          <h1 className="brand-name">DualHub</h1>
        </div>
        <div className="tab-bar">
          <button className={`tab-btn ${page === "login" ? "active" : ""}`} onClick={() => setPage("login")}>Accedi</button>
          <button className={`tab-btn ${page === "register" ? "active" : ""}`} onClick={() => setPage("register")}>Registrati</button>
        </div>
        {page === "login"
          ? <Login onSuccess={(u) => setLoggedUser(u)} />
          : <Register onSuccess={() => setPage("login")} />}
      </div>
    </div>
  );
}
