import { useState } from "react";

const STUDIO_POSTS = [
  {
    id: 1, user: "Sofia Romano", time: "2 ore fa",
    text: "Ho appena finito il capitolo sulla meccanica quantistica. La sovrapposizione degli stati è davvero affascinante!",
    emoji: "⚛️", likes: 24, comments: 5, tag: "Fisica",
  },
  {
    id: 2, user: "Giulia Esposito", time: "5 ore fa",
    text: "Condivido i miei appunti su Dante — l'Inferno è pieno di riferimenti politici del 1300 che ancora risuonano oggi.",
    emoji: "📚", likes: 41, comments: 12, tag: "Letteratura",
  },
  {
    id: 3, user: "Marco Bianchi", time: "ieri",
    text: "Formula trovata per risolvere integrali doppi in coordinate polari in meno di 3 passaggi. Vi posto il metodo.",
    emoji: "🧮", likes: 88, comments: 31, tag: "Matematica",
  },
];

const GAME_POSTS = [
  {
    id: 1, user: "Matteo Ricci", time: "1 ora fa",
    text: "Ho raggiunto il Diamond rank su Valorant! Dopo 3 mesi di grind finalmente. Qualcuno vuole fare ranked?",
    emoji: "💎", likes: 112, comments: 28, tag: "Valorant",
  },
  {
    id: 2, user: "Chiara Marino", time: "3 ore fa",
    text: "Baldur's Gate 3 — il finale della questione Shadowheart mi ha lasciato senza parole. Capolavoro assoluto.",
    emoji: "⚔️", likes: 67, comments: 19, tag: "RPG",
  },
  {
    id: 3, user: "Davide Gallo", time: "ieri",
    text: "Nuovo record personale su Hollow Knight: Pantheon of Hallownest completato senza morire una volta!",
    emoji: "🏆", likes: 203, comments: 44, tag: "Speedrun",
  },
];

export default function Feed({ hub, username }) {
  const isStudio = hub === "studio";
  const posts = isStudio ? STUDIO_POSTS : GAME_POSTS;
  const [likes, setLikes] = useState({});
  const [newPost, setNewPost] = useState("");
  const [extraPosts, setExtraPosts] = useState([]);

  const toggleLike = (id) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    setExtraPosts([{ id: Date.now(), user: username, time: "Adesso", text: newPost, emoji: isStudio ? "📝" : "🎮", likes: 0, comments: 0, tag: isStudio ? "Nuovo" : "Nuovo" }, ...extraPosts]);
    setNewPost("");
  };

  const allPosts = [...extraPosts, ...posts];

  return (
    <section>
      <div className="section-header">
        <div className={`section-dot ${hub}`} />
        <h2>Feed {isStudio ? "Studio" : "Gioco"}</h2>
      </div>

      {/* Nuovo post */}
      <div className={`post-card ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`} style={{ marginBottom: "1rem" }}>
        <div style={{ padding: "1rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div className={`user-avatar-sm ${hub}`} style={{ marginTop: 2 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={isStudio ? "Condividi un appunto, una scoperta..." : "Racconta la tua partita, un achievement..."}
              style={{
                width: "100%", background: "var(--surface2)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                color: "var(--text)", fontFamily: "'Sora', sans-serif",
                fontSize: "13px", padding: "10px 12px",
                resize: "none", outline: "none", minHeight: "70px",
              }}
            />
            <button
              onClick={handlePost}
              style={{
                marginTop: "8px", padding: "7px 18px",
                background: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
                border: "none", borderRadius: "var(--radius-xs)",
                color: "#0d0f14", fontFamily: "'Sora', sans-serif",
                fontSize: "13px", fontWeight: "600", cursor: "pointer",
              }}
            >
              Pubblica
            </button>
          </div>
        </div>
      </div>

      {/* Lista post */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {allPosts.map((post) => (
          <div className="post-card" key={post.id}>
            <div className="post-header">
              <div className={`user-avatar-sm ${hub}`}>{post.user.charAt(0)}</div>
              <div>
                <div className="post-user-name">{post.user}</div>
                <div className="post-time">{post.time}</div>
              </div>
            </div>
            <div className={`post-image-placeholder ${hub}`}>
              <span style={{ fontSize: "52px" }}>{post.emoji}</span>
            </div>
            <div className="post-body">
              <p className="post-text">{post.text}</p>
              <span className={`post-tag ${hub}`}>#{post.tag}</span>
            </div>
            <div className="post-actions">
              <button
                className={`post-action-btn ${likes[post.id] ? `liked ${hub}` : ""}`}
                onClick={() => toggleLike(post.id)}
              >
                {likes[post.id] ? "♥" : "♡"} {post.likes + (likes[post.id] ? 1 : 0)}
              </button>
              <button className="post-action-btn">
                💬 {post.comments}
              </button>
              <button className="post-action-btn">↗ Condividi</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
