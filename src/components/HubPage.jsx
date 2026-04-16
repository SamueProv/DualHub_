import { useState } from "react";
import Feed from "./Feed";
import Forum from "./Forum";
import ChatIA from "./ChatIA";
import Friends from "./Friends";

export default function HubPage({ username, onLogout }) {
  const [hub, setHub] = useState("studio");
  const isStudio = hub === "studio";

  return (
    <div className="main-layout">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-icon">D</div>
          <span className="nav-brand-name">DualHub</span>
        </div>

        <div className="hub-switch">
          <button
            className={`hub-switch-btn ${isStudio ? "active-studio" : ""}`}
            onClick={() => setHub("studio")}
          >
            📗 Studio
          </button>
          <button
            className={`hub-switch-btn ${!isStudio ? "active-game" : ""}`}
            onClick={() => setHub("game")}
          >
            🎮 Gioco
          </button>
        </div>

        <div className="nav-user">
          <div className={`nav-avatar ${hub}`}>
            {username.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{username}</span>
          <button className="nav-logout" onClick={onLogout}>Esci</button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="hub-content">
        {/* LEFT - Amici */}
        <aside className="sidebar-left">
          <Friends username={username} hub={hub} />
        </aside>

        {/* CENTER - Feed + Forum */}
        <main className="center-column">
          <Feed hub={hub} username={username} />
          <Forum hub={hub} username={username} />
        </main>

        {/* RIGHT - Chat IA */}
        <aside className="sidebar-right">
          <ChatIA hub={hub} username={username} />
        </aside>
      </div>
    </div>
  );
}