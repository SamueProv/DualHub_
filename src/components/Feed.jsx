import { useState, useEffect } from "react";
import {
  getPosts, addPost, deletePost,
  getPostLikes, toggleLike,
  getPostComments, addComment,
  sharePost, getPostShares,
} from "../utils/db";

const SEED_STUDIO = [
  { id: "seed-s1", user: "Sofia Romano", time: "2 ore fa", text: "Ho appena finito il capitolo sulla meccanica quantistica. La sovrapposizione degli stati è davvero affascinante!", emoji: "⚛️", tag: "Fisica" },
  { id: "seed-s2", user: "Giulia Esposito", time: "5 ore fa", text: "Condivido i miei appunti su Dante — l'Inferno è pieno di riferimenti politici del 1300 che ancora risuonano oggi.", emoji: "📚", tag: "Letteratura" },
  { id: "seed-s3", user: "Marco Bianchi", time: "ieri", text: "Formula trovata per risolvere integrali doppi in coordinate polari in meno di 3 passaggi. Vi posto il metodo.", emoji: "🧮", tag: "Matematica" },
];
const SEED_GAME = [
  { id: "seed-g1", user: "Matteo Ricci", time: "1 ora fa", text: "Ho raggiunto il Diamond rank su Valorant! Dopo 3 mesi di grind finalmente. Qualcuno vuole fare ranked?", emoji: "💎", tag: "Valorant" },
  { id: "seed-g2", user: "Chiara Marino", time: "3 ore fa", text: "Baldur's Gate 3 — il finale della questione Shadowheart mi ha lasciato senza parole. Capolavoro assoluto.", emoji: "⚔️", tag: "RPG" },
  { id: "seed-g3", user: "Davide Gallo", time: "ieri", text: "Nuovo record personale su Hollow Knight: Pantheon of Hallownest completato senza morire una volta!", emoji: "🏆", tag: "Speedrun" },
];

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Adesso";
  if (m < 60) return m + " min fa";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " ore fa";
  return Math.floor(h / 24) + " giorni fa";
}

function PostCard({ post, hub, username, onDeleted }) {
  const [likes, setLikes] = useState(() => getPostLikes(hub, post.id));
  const [comments, setComments] = useState(() => getPostComments(hub, post.id));
  const [shares, setShares] = useState(() => getPostShares(hub, post.id));
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [shared, setShared] = useState(false);
  const isStudio = hub === "studio";
  const liked = likes.includes(username);

  const handleLike = () => {
    const updated = toggleLike(hub, post.id, username);
    setLikes([...updated]);
  };

  const handleComment = () => {
    if (!commentInput.trim()) return;
    const c = { id: Date.now(), user: username, text: commentInput.trim(), time: Date.now() };
    const updated = addComment(hub, post.id, c);
    setComments([...updated]);
    setCommentInput("");
  };

  const handleShare = () => {
    const count = sharePost(hub, post.id, username);
    setShares(count);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const canDelete = post.user === username;

  return (
    <div className="post-card">
      <div className="post-header">
        <div className={`user-avatar-sm ${hub}`}>{post.user.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div className="post-user-name">{post.user}</div>
          <div className="post-time">{post.timestamp ? timeAgo(post.timestamp) : post.time}</div>
        </div>
        {canDelete && (
          <button
            onClick={() => { deletePost(hub, post.id, username); onDeleted(post.id); }}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", padding: "2px 6px" }}
            title="Elimina post"
          >×</button>
        )}
      </div>

      <div className={`post-image-placeholder ${hub}`}>
        <span style={{ fontSize: "48px" }}>{post.emoji || (isStudio ? "📝" : "🎮")}</span>
      </div>

      <div className="post-body">
        <p className="post-text">{post.text}</p>
        <span className={`post-tag ${hub}`}>#{post.tag || "Post"}</span>
      </div>

      {/* Azioni */}
      <div className="post-actions">
        <button
          className={`post-action-btn ${liked ? "liked " + hub : ""}`}
          onClick={handleLike}
        >
          {liked ? "♥" : "♡"} {likes.length}
        </button>
        <button
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {comments.length}
        </button>
        <button
          className={`post-action-btn ${shared ? "liked " + hub : ""}`}
          onClick={handleShare}
        >
          {shared ? "✓ Condiviso" : "↗ Condividi"} {shares > 0 ? `(${shares})` : ""}
        </button>
      </div>

      {/* Sezione commenti */}
      {showComments && (
        <div className="comments-section">
          {comments.length === 0 && (
            <p style={{ fontSize: "12px", color: "var(--text-muted)", padding: "4px 0" }}>Nessun commento ancora.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className={`user-avatar-xs ${hub}`}>{c.user.charAt(0).toUpperCase()}</div>
              <div className="comment-body">
                <span className="comment-user">{c.user}</span>
                <span className="comment-text">{c.text}</span>
              </div>
            </div>
          ))}
          <div className="comment-input-row">
            <div className={`user-avatar-xs ${hub}`}>{username.charAt(0).toUpperCase()}</div>
            <input
              className={`comment-input ${hub}`}
              placeholder="Scrivi un commento..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <button
              className={`comment-send ${hub}`}
              onClick={handleComment}
              disabled={!commentInput.trim()}
            >↵</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Feed({ hub, username }) {
  const isStudio = hub === "studio";
  const seedPosts = isStudio ? SEED_STUDIO : SEED_GAME;

  const [posts, setPosts] = useState(() => {
    const saved = getPosts(hub);
    return saved.length > 0 ? saved : seedPosts;
  });
  const [newPost, setNewPost] = useState("");
  const [newTag, setNewTag] = useState("");
  const TAGS_STUDIO = ["Matematica", "Fisica", "Letteratura", "Storia", "Chimica", "Informatica", "Lingue", "Altro"];
  const TAGS_GAME = ["Valorant", "RPG", "FPS", "Speedrun", "Indie", "Strategy", "Sports", "Altro"];
  const tags = isStudio ? TAGS_STUDIO : TAGS_GAME;

  // Ricarica post quando cambia hub
  useEffect(() => {
    const saved = getPosts(hub);
    setPosts(saved.length > 0 ? saved : (hub === "studio" ? SEED_STUDIO : SEED_GAME));
  }, [hub]);

  const handlePost = () => {
    if (!newPost.trim()) return;
    const post = {
      id: "post-" + Date.now(),
      user: username,
      text: newPost.trim(),
      tag: newTag || tags[tags.length - 1],
      emoji: isStudio ? "📝" : "🎮",
      timestamp: Date.now(),
    };
    addPost(hub, post);
    setPosts([post, ...posts]);
    setNewPost("");
    setNewTag("");
  };

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  return (
    <section>
      <div className="section-header">
        <div className={`section-dot ${hub}`} />
        <h2>Feed {isStudio ? "Studio" : "Gioco"}</h2>
      </div>

      {/* Nuovo post */}
      <div className={`post-card hub-accent-${hub}`} style={{ marginBottom: "1rem" }}>
        <div style={{ padding: "1rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div className={`user-avatar-sm ${hub}`} style={{ marginTop: 2 }}>
            {username.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={isStudio ? "Condividi un appunto, una scoperta..." : "Racconta la tua partita, un achievement..."}
              style={{
                width: "100%", background: "var(--surface2)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
                color: "var(--text)", fontFamily: "'Sora', sans-serif",
                fontSize: "13px", padding: "10px 12px",
                resize: "none", outline: "none", minHeight: "70px", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{
                  flex: 1, minWidth: "120px", background: "var(--surface2)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
                  color: "var(--text)", fontFamily: "'Sora', sans-serif",
                  fontSize: "12px", padding: "7px 10px", outline: "none",
                }}
              >
                <option value="">Scegli tag...</option>
                {tags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                style={{
                  padding: "7px 18px",
                  background: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
                  border: "none", borderRadius: "var(--radius-xs)",
                  color: "#0d0f14", fontFamily: "'Sora', sans-serif",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  opacity: !newPost.trim() ? 0.5 : 1,
                }}
              >Pubblica</button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista post */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} hub={hub} username={username} onDeleted={handleDeleted} />
        ))}
      </div>
    </section>
  );
}