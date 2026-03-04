import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/api";

function TypewriterMessage({ text }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text]);
  return <div dangerouslySetInnerHTML={{ __html: displayed.replace(/\n/g, '<br/>') }} />;
}

export default function ChatWindow({ userId }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Greetings. I am JackShelby AI. How can I assist with your logistics today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function handleSend() {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessage(userId, input);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "Communication error with JackShelby Core." }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSend();
  }

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[500px] border border-primary/20 relative overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.1)]">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
          <span className="text-white font-bold tracking-tighter text-sm">AI</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-white">JackShelby AI Agent</h3>
          <p className="text-xs text-primary animate-pulse">Online & Synchronized</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === "user"
                ? "bg-primary text-white rounded-br-sm shadow-lg shadow-primary/20"
                : "bg-surfaceHover border border-white/10 text-gray-200 rounded-bl-sm"
                }`}
            >
              {msg.role === "user" ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
              ) : (
                <TypewriterMessage text={msg.text} />
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surfaceHover border border-white/10 p-4 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-16 h-12">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 relative">
        <input
          className="w-full bg-surfaceHover border border-white/10 rounded-xl pl-4 pr-14 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Transmit message to AI..."
          disabled={isTyping}
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 mt-1 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${!input.trim() || isTyping ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-primary text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:scale-105'}`}
        >
          <span className="text-xl leading-none">↗</span>
        </button>
      </div>
    </div>
  );
}