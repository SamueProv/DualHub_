import { useState, useRef, useEffect } from "react";

const SYSTEM_STUDIO = `Sei un assistente IA specializzato nello studio e nell'apprendimento. 
Ti chiami StudyBot e fai parte della hub Studio di DualHub. 
Aiuti gli studenti con: spiegazioni di materie scolastiche e universitarie, 
metodi di studio, appunti, esercizi, matematica, scienze, letteratura, storia e qualsiasi argomento di studio.
Rispondi in italiano, in modo chiaro e didattico. Usa esempi pratici quando possibile.
Quando usi elenchi puntati usa il carattere "•". Quando vuoi enfatizzare usa **testo**.`;

const SYSTEM_GAME = `Sei un assistente IA specializzato nel mondo dei videogiochi.
Ti chiami GameBot e fai parte della hub Gioco di DualHub.
Aiuti i giocatori con: guide e walkthrough, strategie, build di personaggi, 
consigli per migliorare, news sui giochi, raccomandazioni, lore e storia dei giochi.
Rispondi in italiano, in modo entusiasta e competente. Usa terminologia gaming quando appropriato.
Quando usi elenchi puntati usa il carattere "•". Quando vuoi enfatizzare usa **testo**.`;

function renderText(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <span key={i}>
        {parts.map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        )}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem("dh_anthropic_key") || "";

export default function ChatIA({ hub, username }) {
  const isStudio = hub === "studio";
  const botName = isStudio ? "StudyBot" : "GameBot";
  const botEmoji = isStudio ? "📗" : "🎮";

  const welcomeMsg = isStudio
    ? "Ciao! Sono StudyBot 📗 Sono qui per aiutarti con lo studio. Che materia vuoi approfondire?"
    : "Ciao gamer! Sono GameBot 🎮 Sono qui per aiutarti con tutto il mondo dei videogiochi. Di che gioco vuoi parlare?";

  const [messages, setMessages] = useState([{ role: "ai", text: welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(ANTHROPIC_API_KEY);
  const [showApiInput, setShowApiInput] = useState(!ANTHROPIC_API_KEY);
  const [tempKey, setTempKey] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const prevHub = useRef(hub);

  useEffect(() => {
    if (prevHub.current !== hub) {
      prevHub.current = hub;
      setMessages([{ role: "ai", text: welcomeMsg }]);
    }
  }, [hub, welcomeMsg]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!apiKey) { setShowApiInput(true); return; }

    const userText = input.trim();
    setInput("");
    inputRef.current?.focus();

    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build Anthropic messages format (skip welcome msg, alternate user/assistant)
      const history = newMessages
        .slice(1) // skip welcome
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const body = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: isStudio ? SYSTEM_STUDIO : SYSTEM_GAME,
        messages: history,
      };

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error.message || "Errore API");

      const reply =
        data.content?.[0]?.text || "Non ho capito, puoi ripetere?";

      setMessages([...newMessages, { role: "ai", text: reply }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          text: `⚠️ ${err.message || "Errore di connessione. Controlla la tua API key Anthropic."}`,
        },
      ]);
    }

    setLoading(false);
  };

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      setApiKey(tempKey.trim());
      localStorage.setItem("dh_anthropic_key", tempKey.trim());
      setShowApiInput(false);
      setTempKey("");
    }
  };

  return (
    <div className={`chat-container ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`}>
      {/* Header */}
      <div className="chat-header">
        <div className={`chat-bot-avatar ${hub}`}>{botEmoji}</div>
        <div className="chat-header-info">
          <h3>{botName}</h3>
          <p className="chat-header-sub">
            <span className={`chat-status-dot ${hub}`} />
            Claude Sonnet 4
          </p>
        </div>
        <button
          className="chat-key-btn"
          onClick={() => setShowApiInput(!showApiInput)}
          title="Imposta API Key Anthropic"
        >
          🔑
        </button>
      </div>

      {/* API Key input */}
      {showApiInput && (
        <div className="chat-apikey-bar">
          <div className="chat-apikey-hint">
            Ottieni la tua key su{" "}
            <a href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer">
              console.anthropic.com
            </a>
          </div>
          <div className="chat-apikey-row">
            <input
              className="chat-apikey-input"
              type="password"
              placeholder="sk-ant-..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
            />
            <button
              className={`chat-apikey-save ${hub}`}
              onClick={handleSaveKey}
              disabled={!tempKey.trim()}
            >
              Salva
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble-row ${m.role}`}>
            {m.role === "ai" && (
              <div className={`chat-bubble-avatar ai ${hub}`}>{botEmoji}</div>
            )}
            <div className={`chat-bubble ${m.role} ${m.role === "user" ? hub : ""}`}>
              {renderText(m.text)}
            </div>
            {m.role === "user" && (
              <div className={`chat-bubble-avatar user ${hub}`}>
                {username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble-row ai">
            <div className={`chat-bubble-avatar ai ${hub}`}>{botEmoji}</div>
            <div className="chat-bubble ai loading-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className={`chat-input ${hub}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder={isStudio ? "Chiedi qualcosa sullo studio..." : "Chiedi qualcosa sui giochi..."}
          disabled={loading}
        />
        <button
          className={`chat-send-btn ${hub}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          title="Invia"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}