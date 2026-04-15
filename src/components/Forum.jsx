import { useState, useRef, useEffect } from "react";
import OpenAI from 'openai';

const STUDIO_THREADS = [
  { id: 1, title: "Come memorizzare le formule di trigonometria in poco tempo?", type: "domanda", author: "Luca Ferrari", replies: 14, views: 203, tag: "Matematica" },
  { id: 2, title: "Discussione: i metodi di studio del futuro con l'IA", type: "discussione", author: "Sofia Romano", replies: 28, views: 441, tag: "Metodo" },
  { id: 3, title: "Risorse gratuite per imparare il latino online", type: "discussione", author: "Andrea Conti", replies: 9, views: 118, tag: "Latino" },
  { id: 4, title: "Qual è la differenza tra mitosi e meiosi in modo semplice?", type: "domanda", author: "Giulia Esposito", replies: 7, views: 89, tag: "Biologia" },
];

const GAME_THREADS = [
  { id: 1, title: "Qual è il miglior setup per iniziare a fare speedrun su Celeste?", type: "domanda", author: "Matteo Ricci", replies: 22, views: 378, tag: "Speedrun" },
  { id: 2, title: "Discussione: i giochi indie del 2024 che meritano di più", type: "discussione", author: "Chiara Marino", replies: 47, views: 812, tag: "Indie" },
  { id: 3, title: "Come migliorare l'aim su FPS? Consigli pratici", type: "domanda", author: "Francesco Costa", replies: 31, views: 560, tag: "FPS" },
  { id: 4, title: "Build consigliata per un personaggio mago in Elden Ring", type: "domanda", author: "Davide Gallo", replies: 18, views: 290, tag: "Soulslike" },
];

export default function Forum({ hub }) {
  const isStudio = hub === "studio";
  const threads = isStudio ? STUDIO_THREADS : GAME_THREADS;
  const [filter, setFilter] = useState("tutti");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("discussione");
  const [extraThreads, setExtraThreads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [genAI, setGenAI] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);  // Storia chat
  const [chatInput, setChatInput] = useState("");  // Input utente chat
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);  // Toggle chat
  const messagesEndRef = useRef(null);  // Auto-scroll
  const [pplxClient, setPplxClient] = useState(null);

  const relevantThreads = threads.map(t => `${t.tag}: ${t.title}`).join(', ');  // Contesto forum

  const filtered = [...extraThreads, ...threads].filter(
    (t) => filter === "tutti" || t.type === filter
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleApiKeyChange = (e) => {
  const key = e.target.value;
  setApiKey(key);
  if (key.trim()) {
    const client = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.perplexity.ai',  // Perplexity endpoint
    });
    setPplxClient(client);
    setChatMessages([{ role: "system", content: "Perplexity API OK! Chiedi con web search." }]);
  }
};

  const handleChatSubmit = async () => {
  if (!pplxClient || !chatInput.trim()) return;
  const userMsg = chatInput;
  setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
  setChatInput("");
  setChatLoading(true);

  try {
    const context = isStudio 
      ? `Rispondi su studio/forum (${relevantThreads}). Usa web search per info aggiornate. Italiano preciso.`
      : `Rispondi su gaming/forum (${relevantThreads}). Usa web search per info aggiornate. Italiano preciso.`;
    
    const completion = await pplxClient.chat.completions.create({
      model: "llama-3.1-sonar-large-128k-online",  // Con web search!
      messages: [
        { role: "system", content: context },
        ...chatMessages.slice(-10),  // Ultimi 10 msg per memoria
        { role: "user", content: userMsg }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });
    const aiReply = completion.choices[0].message.content;
    setChatMessages(prev => [...prev, { role: "assistant", content: aiReply }]);
  } catch (error) {
    setChatMessages(prev => [...prev, { role: "assistant", content: `Errore: ${error.message}` }]);
  }
  setChatLoading(false);
};

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    setExtraThreads([{
      id: Date.now(), title: newTitle, type: newType,
      author: "Tu", replies: 0, views: 1, tag: "Nuovo"
    }, ...extraThreads]);
    setNewTitle(""); 
    setShowForm(false);
  };

  return (
    <section style={{ marginTop: "0.5rem" }}>
      <div className="section-header" style={{ justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div className={`section-dot ${hub}`} />
          <h2>Forum {isStudio ? "Studio" : "Gioco"}</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              padding: "6px 14px", border: "none",
              borderRadius: "var(--radius-xs)",
              background: isStudio ? "var(--studio-soft)" : "var(--game-soft)",
              color: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
              fontFamily: "'Sora', sans-serif", fontSize: "12px", fontWeight: "600",
              cursor: "pointer",
            }}
          >
            🤖 Chat AI
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "6px 14px", border: "none",
              borderRadius: "var(--radius-xs)",
              background: isStudio ? "var(--studio-soft)" : "var(--game-soft)",
              color: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
              fontFamily: "'Sora', sans-serif", fontSize: "12px", fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Nuovo thread
          </button>
        </div>
      </div>

      {/* Chat AI (visibile solo se showChat e isStudio preferibilmente) */}
      {showChat && (
        <div className={`post-card ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`} style={{ marginBottom: "1rem", padding: "1rem" }}>
          <div style={{ marginBottom: "10px" }}>
            <input
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="API key Google AI Studio..."
              type="password"
              style={{
                width: "100%", padding: "10px 12px", marginBottom: "10px",
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", color: "var(--text)",
                fontFamily: "'Sora', sans-serif", fontSize: "14px", outline: "none",
              }}
            />
          </div>
          <div style={{ height: "200px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px", background: "var(--surface2)", marginBottom: "10px" }}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: "8px", textAlign: msg.role === "user" ? "right" : "left" }}>
                <span style={{ 
                  padding: "4px 8px", borderRadius: "12px",
                  background: msg.role === "user" ? (isStudio ? "var(--studio-primary)" : "var(--game-primary)") : "var(--surface1)",
                  color: msg.role === "user" ? "#0d0f14" : "var(--text)"
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {chatLoading && <div>AI sta pensando...</div>}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Chiedi all'AI (es. 'Spiega mitosi')..."
              style={{
                flex: 1, padding: "8px 12px",
                background: "var(--surface2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)", color: "var(--text)",
                fontFamily: "'Sora', sans-serif", fontSize: "14px", outline: "none",
              }}
            />
            <button 
              onClick={handleChatSubmit} 
              disabled={chatLoading || !genAI}
              style={{
                padding: "8px 16px",
                background: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
                border: "none", borderRadius: "var(--radius-sm)",
                color: "#0d0f14", fontWeight: "600", cursor: "pointer",
              }}
            >
              Invia
            </button>
          </div>
        </div>
      )}

      {/* Form nuovo thread (invariato, rimosso suggest per semplicità) */}
      {showForm && (
        <div className={`post-card ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`} style={{ marginBottom: "1rem", padding: "1rem" }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Titolo del thread..."
            style={{
              width: "100%", padding: "10px 12px",
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", color: "var(--text)",
              fontFamily: "'Sora', sans-serif", fontSize: "14px",
              outline: "none", marginBottom: "10px",
            }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              style={{
                padding: "7px 10px", background: "var(--surface2)",
                border: "1px solid var(--border)", borderRadius: "var(--radius-xs)",
                color: "var(--text)", fontFamily: "'Sora', sans-serif", fontSize: "13px",
              }}
            >
              <option value="discussione">Discussione</option>
              <option value="domanda">Domanda</option>
            </select>
            <button onClick={handleCreate} style={{
              padding: "7px 16px",
              background: isStudio ? "var(--studio-primary)" : "var(--game-primary)",
              border: "none", borderRadius: "var(--radius-xs)",
              color: "#0d0f14", fontFamily: "'Sora', sans-serif",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>
              Pubblica
            </button>
          </div>
        </div>
      )}

      {/* Filtri e Thread list invariati */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
        {["tutti", "discussione", "domanda"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", border: "1px solid",
              borderRadius: "50px",
              borderColor: filter === f ? (isStudio ? "var(--studio-primary)" : "var(--game-primary)") : "var(--border)",
              background: filter === f ? (isStudio ? "var(--studio-soft)" : "var(--game-soft)") : "transparent",
              color: filter === f ? (isStudio ? "var(--studio-primary)" : "var(--game-primary)") : "var(--text-muted)",
              fontFamily: "'Sora', sans-serif", fontSize: "12px", fontWeight: "500",
              cursor: "pointer", textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {filtered.map((t) => (
          <div className={`forum-card ${hub}`} key={t.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className={`forum-badge ${hub}`}>{t.type === "domanda" ? "❓ Domanda" : "💬 Discussione"}</span>
                  <span className={`forum-badge ${hub}`}>{t.tag}</span>
                </div>
                <p className="forum-title">{t.title}</p>
                <div className="forum-meta">
                  <span>👤 {t.author}</span>
                  <span>💬 {t.replies} risposte</span>
                  <span>👁 {t.views} visualizzazioni</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}