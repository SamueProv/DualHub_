import { useState, useRef, useEffect } from "react";

const SYSTEM_STUDIO = `Sei un assistente IA specializzato nello studio e nell'apprendimento. 
Ti chiami StudyBot e fai parte della hub Studio di DualHub. 
Aiuti gli studenti con: spiegazioni di materie scolastiche e universitarie, 
metodi di studio, appunti, esercizi, matematica, scienze, letteratura, storia e qualsiasi argomento di studio.
Rispondi in italiano, in modo chiaro e didattico. Usa esempi pratici quando possibile.`;

const SYSTEM_GAME = `Sei un assistente IA specializzato nel mondo dei videogiochi.
Ti chiami GameBot e fai parte della hub Gioco di DualHub.
Aiuti i giocatori con: guide e walkthrough, strategie, build di personaggi, 
consigli per migliorare, news sui giochi, raccomandazioni, lore e storia dei giochi.
Rispondi in italiano, in modo entusiasta e competente. Usa terminologia gaming quando appropriato.`;

export default function ChatIA({ hub, username }) {
  const isStudio = hub === "studio";

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: isStudio
        ? "Ciao! Sono StudyBot 📗 Sono qui per aiutarti con lo studio. Che materia vuoi approfondire?"
        : "Ciao gamer! Sono GameBot 🎮 Sono qui per aiutarti con tutto il mondo dei videogiochi. Di che gioco vuoi parlare?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const prevHub = useRef(hub);

  useEffect(() => {
    if (prevHub.current !== hub) {
      prevHub.current = hub;
      setMessages([
        {
          role: "ai",
          text: isStudio
            ? "Ciao! Sono StudyBot 📗 Sono qui per aiutarti con lo studio. Che materia vuoi approfondire?"
            : "Ciao gamer! Sono GameBot 🎮 Sono qui per aiutarti con tutto il mondo dei videogiochi. Di che gioco vuoi parlare?",
        },
      ]);
    }
  }, [hub, isStudio]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages
        .filter((m) => m.role !== "loading")
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: isStudio ? SYSTEM_STUDIO : SYSTEM_GAME,
          messages: history,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "Non ho capito, puoi ripetere?";
      setMessages([...newMessages, { role: "ai", text: reply }]);
    } catch {
      setMessages([...newMessages, { role: "ai", text: "Errore di connessione. Riprova tra poco." }]);
    }

    setLoading(false);
  };

  return (
    <div className={`chat-container ${isStudio ? "hub-accent-studio" : "hub-accent-game"}`}>
      <div className="chat-header">
        <div>
          <div className={`chat-header-dot ${hub}`} />
        </div>
        <div>
          <h3>{isStudio ? "StudyBot" : "GameBot"}</h3>
          <p>{isStudio ? "Assistente IA per lo studio" : "Assistente IA per i giochi"}</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role} ${m.role === "user" ? hub : ""}`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai loading">
            {isStudio ? "StudyBot sta scrivendo..." : "GameBot sta scrivendo..."}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={isStudio ? "Chiedi qualcosa sullo studio..." : "Chiedi qualcosa sui giochi..."}
        />
        <button
          className={`chat-send-btn ${hub}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          →
        </button>
      </div>
    </div>
  );
}
