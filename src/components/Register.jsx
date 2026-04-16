import { useState } from "react";

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password || !form.confirm) {
      setFeedback({ type: "error", msg: "Tutti i campi sono obbligatori" });
      return;
    }
    if (form.password !== form.confirm) {
      setFeedback({ type: "error", msg: "Le password non coincidono" });
      return;
    }
    if (form.password.length < 6) {
      setFeedback({ type: "error", msg: "La password deve avere almeno 6 caratteri" });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // piccolo delay UX

    // Leggi utenti esistenti da localStorage
    const users = JSON.parse(localStorage.getItem("dh_users") || "[]");

    if (users.find((u) => u.username === form.username)) {
      setFeedback({ type: "error", msg: "Username già in uso" });
      setLoading(false);
      return;
    }
    if (users.find((u) => u.email === form.email)) {
      setFeedback({ type: "error", msg: "Email già registrata" });
      setLoading(false);
      return;
    }

    // Salva nuovo utente (password in chiaro — ok per demo locale)
    users.push({ username: form.username, email: form.email, password: form.password });
    localStorage.setItem("dh_users", JSON.stringify(users));

    setFeedback({ type: "success", msg: "Account creato! Ora accedi." });
    setTimeout(() => onSuccess(), 1200);
    setLoading(false);
  };

  return (
    <div>
      <div className="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Scegli un username"
          value={form.username} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" name="email" placeholder="La tua email"
          value={form.email} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="Almeno 6 caratteri"
          value={form.password} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Conferma password</label>
        <input type="password" name="confirm" placeholder="Ripeti la password"
          value={form.confirm} onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
      </div>
      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Registrazione..." : "Crea account"}
      </button>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}
    </div>
  );
}