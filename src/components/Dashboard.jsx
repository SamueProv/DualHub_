export default function Dashboard({ username, onLogout }) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <div className="avatar">{initial}</div>
        <h2>Ciao, {username}!</h2>
        <p>Hai effettuato l'accesso con successo a DualHub.</p>
        <button className="logout-btn" onClick={onLogout}>
          Esci dall'account
        </button>
      </div>
    </div>
  );
}
