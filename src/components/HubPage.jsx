import { useState } from "react";
import Feed from "./Feed";
import Forum from "./Forum";
import ChatIA from "./ChatIA";

const FOLLOWING_STUDIO = [
  { name: "Marco Bianchi", status: "Online", online: true, color: "studio" },
  { name: "Sofia Romano", status: "Ha postato", online: true, color: "mixed" },
  { name: "Luca Ferrari", status: "Offline", online: false, color: "studio" },
  { name: "Giulia Esposito", status: "Online", online: true, color: "studio" },
  { name: "Andrea Conti", status: "Offline", online: false, color: "mixed" },
];

const FOLLOWING_GAME = [
  { name: "Matteo Ricci", status: "In partita", online: true, color: "game" },
  { name: "Chiara Marino", status: "Online", online: true, color: "game" },
  { name: "Davide Gallo", status: "Ha postato", online: true, color: "mixed" },
  { name: "Elena Bruno", status: "Offline", online: false, color: "game" },
  { name: "Francesco Costa", status: "Online", online: true, color: "game" },
];

export default function HubPage({ username, onLogout }) {
  const [hub, setHub] = useState("studio");
  const isStudio = hub === "studio";
  const following = isStudio ? FOLLOWING_STUDIO : FOLLOWING_GAME;

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
          <button className="nav-logout" onClick={onLogout}>Esci</button>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="hub-content">
        {/* LEFT - Following */}
        <aside className="sidebar-left">
          <div className={`sidebar-section ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`}>
            <p className="sidebar-title">Stai seguendo</p>
            <div className="following-list">
              {following.map((u) => (
                <div className="following-item" key={u.name}>
                  <div className={`user-avatar-sm ${u.color}`}>
                    {u.name.charAt(0)}
                  </div>
                  <div className="following-info">
                    <div className="following-name">{u.name}</div>
                    <div className="following-status">{u.status}</div>
                  </div>
                  {u.online && <div className="online-dot" style={!isStudio ? { background: "var(--game-primary)" } : {}} />}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER - Feed + Forum */}
        <main className="center-column">
          <Feed hub={hub} username={username} />
          <Forum hub={hub} />
        </main>

        {/* RIGHT - Chat IA */}
        <aside className="sidebar-right">
          <ChatIA hub={hub} username={username} />
        </aside>
      </div>
    </div>
  );
}
