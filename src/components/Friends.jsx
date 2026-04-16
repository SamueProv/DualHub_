import { useState, useEffect } from "react";
import {
  getUsers, getFriends, getFriendRequests,
  sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
  removeFriend, isFriend, hasPendingRequest,
} from "../utils/db";

export default function Friends({ username, hub }) {
  const isStudio = hub === "studio";
  const [tab, setTab] = useState("friends"); // friends | search | requests
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [feedback, setFeedback] = useState({});

  const reload = () => {
    setFriends(getFriends(username));
    setRequests(getFriendRequests(username));
  };

  useEffect(() => { reload(); }, [username]);

  const handleSearch = (q) => {
    setSearchQ(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const all = getUsers();
    const res = all.filter(
      (u) =>
        u.username !== username &&
        u.username.toLowerCase().includes(q.toLowerCase())
    );
    setSearchResults(res);
  };

  const handleSendRequest = (to) => {
    const sent = sendFriendRequest(username, to);
    setFeedback((f) => ({ ...f, [to]: sent ? "Richiesta inviata!" : "Già inviata" }));
    setTimeout(() => setFeedback((f) => { const n = { ...f }; delete n[to]; return n; }), 2000);
  };

  const handleAccept = (from) => {
    acceptFriendRequest(username, from);
    reload();
  };
  const handleReject = (from) => {
    rejectFriendRequest(username, from);
    reload();
  };
  const handleRemove = (friend) => {
    removeFriend(username, friend);
    reload();
  };

  const pendingCount = requests.length;

  return (
    <div className={`friends-panel hub-accent-${hub}`}>
      <p className="sidebar-title" style={{ marginBottom: "10px" }}>Amici</p>

      {/* Tabs */}
      <div className="friends-tabs">
        <button
          className={`friends-tab ${tab === "friends" ? "active " + hub : ""}`}
          onClick={() => setTab("friends")}
        >
          👥 {friends.length}
        </button>
        <button
          className={`friends-tab ${tab === "search" ? "active " + hub : ""}`}
          onClick={() => setTab("search")}
        >
          🔍
        </button>
        <button
          className={`friends-tab ${tab === "requests" ? "active " + hub : ""}`}
          onClick={() => { setTab("requests"); reload(); }}
          style={{ position: "relative" }}
        >
          🔔
          {pendingCount > 0 && (
            <span className={`notif-badge ${hub}`}>{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Tab: Lista amici */}
      {tab === "friends" && (
        <div className="friends-list">
          {friends.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
              Nessun amico ancora.<br />Cercane uno! 🔍
            </p>
          )}
          {friends.map((f) => (
            <div className="friend-item" key={f}>
              <div className={`user-avatar-sm ${hub}`}>{f.charAt(0).toUpperCase()}</div>
              <div className="friend-info">
                <div className="friend-name">{f}</div>
              </div>
              <button
                className="friend-remove-btn"
                onClick={() => handleRemove(f)}
                title="Rimuovi amico"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Cerca utenti */}
      {tab === "search" && (
        <div>
          <input
            className={`friend-search-input ${hub}`}
            placeholder="Cerca utente..."
            value={searchQ}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="friends-list" style={{ marginTop: "8px" }}>
            {searchQ && searchResults.length === 0 && (
              <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "8px 0" }}>
                Nessun utente trovato.
              </p>
            )}
            {searchResults.map((u) => {
              const alreadyFriend = isFriend(username, u.username);
              const pending = hasPendingRequest(username, u.username);
              return (
                <div className="friend-item" key={u.username}>
                  <div className={`user-avatar-sm ${hub}`}>{u.username.charAt(0).toUpperCase()}</div>
                  <div className="friend-info">
                    <div className="friend-name">{u.username}</div>
                    {feedback[u.username] && (
                      <div style={{ fontSize: "10px", color: "var(--studio-primary)" }}>{feedback[u.username]}</div>
                    )}
                  </div>
                  {alreadyFriend ? (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Amico</span>
                  ) : pending ? (
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Inviata</span>
                  ) : (
                    <button
                      className={`friend-add-btn ${hub}`}
                      onClick={() => handleSendRequest(u.username)}
                    >+</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Richieste */}
      {tab === "requests" && (
        <div className="friends-list">
          {requests.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
              Nessuna richiesta in arrivo.
            </p>
          )}
          {requests.map((from) => (
            <div className="friend-item" key={from}>
              <div className={`user-avatar-sm ${hub}`}>{from.charAt(0).toUpperCase()}</div>
              <div className="friend-info">
                <div className="friend-name">{from}</div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>vuole aggiungerti</div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                <button className={`friend-add-btn ${hub}`} onClick={() => handleAccept(from)} title="Accetta">✓</button>
                <button className="friend-remove-btn" onClick={() => handleReject(from)} title="Rifiuta">×</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
