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
    { role: "bot", text: "Greetings. I am JackShelby AI. I can help you with order tracking, cancellations, returns, and refunds. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Speech-to-Text setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
    }
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  }

  // Text-to-Speech
  function speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]*>/g, "").replace(/\n/g, ". "));
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendMessage(userId, userMsg);
      setMessages((prev) => [...prev, { role: "bot", text: res.reply }]);
      speakText(res.reply);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "Communication error with JackShelby Core." }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[520px] border border-primary/20 relative overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.1)]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
          <span className="text-white font-bold tracking-tighter text-sm">AI</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white">JackShelby AI Agent</h3>
          <p className="text-xs text-primary animate-pulse">Online & Synchronized</p>
        </div>
        {isSpeaking && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10">
            <span className="text-xs text-primary">🔊</span>
            <div className="flex gap-0.5">
              {[1,2,3].map(i => (
                <div key={i} className="w-0.5 bg-primary rounded-full animate-bounce" style={{
                  height: `${8 + Math.random() * 8}px`,
                  animationDelay: `${i * 0.15}s`
                }}></div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className="pt-2 relative flex gap-2">
        {/* Mic Button */}
        <button
          onClick={toggleRecording}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
            isRecording
              ? "bg-danger text-white voice-pulse"
              : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={isRecording ? "Stop recording" : "Start voice input"}
        >
          <span className="text-lg">{isRecording ? "⏹" : "🎤"}</span>
        </button>

        <div className="flex-1 relative">
          <input
            className="w-full bg-surfaceHover border border-white/10 rounded-xl pl-4 pr-14 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRecording ? "Listening..." : "Transmit message to AI..."}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              !input.trim() || isTyping
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:scale-105'
            }`}
          >
            <span className="text-lg leading-none">↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}