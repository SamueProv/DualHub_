import { useState } from "react";

export default function Login({ onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setFeedback({ type: "error", msg: "Inserisci username e password" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", msg: data.error });
      } else {
        setFeedback({ type: "success", msg: data.message });
        setTimeout(() => onSuccess(data.username), 800);
      }
    } catch {
      setFeedback({ type: "error", msg: "Impossibile connettersi al server" });
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="form-group">
        <label>Username</label>
        <input type="text" name="username" placeholder="Il tuo username"
          value={form.username} onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" name="password" placeholder="La tua password"
          value={form.password} onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
      </div>
      <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "Accesso in corso..." : "Accedi"}
      </button>
      {feedback && <div className={`feedback ${feedback.type}`}>{feedback.msg}</div>}
    </div>
  );
}
