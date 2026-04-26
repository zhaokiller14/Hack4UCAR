"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const RAG_API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "";
const LS_KEY = "ai_chat_conversation";

type Message = { role: "user" | "ai"; content: string };

function loadConversation(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

// Lightweight markdown → HTML renderer (bold, headers, numbered lists, sub-lists)
function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^(\d+)\. (.+)$/gm, (_m, _n, c) => `<li>${c}</li>`)
    .replace(/^ {3,}- (.+)$/gm, (_m, c) => `<li class="sub-item">${c}</li>`)
    .replace(/((?:<li[\s\S]*?<\/li>\n?)+)/g, (m) => `<ol>${m}</ol>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br />");
}

function MarkdownBubble({ content }: { content: string }) {
  return (
    <div
      className="prose-bubble"
      dangerouslySetInnerHTML={{ __html: `<p>${parseMarkdown(content)}</p>` }}
    />
  );
}

function TypingDots() {
  return (
    <span className="typing-dots" aria-label="L'IA réfléchit">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function InstitutionAiChat() {
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<Message[]>(loadConversation);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(conversation));
  }, [conversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    const handle = () => {
      localStorage.removeItem(LS_KEY);
      setConversation([]);
    };
    window.addEventListener("ai-chat-signout", handle);
    return () => window.removeEventListener("ai-chat-signout", handle);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setConversation((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch(RAG_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMsg.content }),
      });
      const data = await res.json();
      setConversation((prev) => [
        ...prev,
        { role: "ai", content: data?.output || "[Aucune réponse]" },
      ]);
    } catch {
      setConversation((prev) => [
        ...prev,
        { role: "ai", content: "[Erreur de connexion au serveur.]" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        .chat-root {
          display: flex;
          flex-direction: column;
          height: 600px;
          max-width: 720px;
          margin: 0 auto;
          border: 0.5px solid var(--color-border-tertiary, #e5e7eb);
          border-radius: 14px;
          overflow: hidden;
          font-family: var(--font-sans, system-ui, sans-serif);
          background: var(--color-background-primary, #fff);
        }
        .chat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          border-bottom: 0.5px solid var(--color-border-tertiary, #e5e7eb);
          background: var(--color-background-primary, #fff);
        }
        .header-status {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #1D9E75;
          flex-shrink: 0;
        }
        .header-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary, #111);
        }
        .header-badge {
          margin-left: auto;
          font-size: 11px;
          color: var(--color-text-tertiary, #888);
        }
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-thumb {
          background: var(--color-border-tertiary, #e5e7eb);
          border-radius: 4px;
        }
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--color-text-tertiary, #aaa);
          font-size: 13px;
        }
        .msg-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        .msg-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 500;
        }
        .avatar.ai { background: #E1F5EE; color: #0F6E56; border: 0.5px solid #9FE1CB; }
        .avatar.user { background: #E6F1FB; color: #185FA5; border: 0.5px solid #B5D4F4; }
        .bubble {
          max-width: 72%;
          padding: 10px 14px;
          font-size: 14px;
          line-height: 1.65;
          color: var(--color-text-primary, #111);
          word-break: break-word;
        }
        .bubble.ai {
          background: var(--color-background-secondary, #f9f9f9);
          border: 0.5px solid var(--color-border-tertiary, #e5e7eb);
          border-radius: 4px 14px 14px 14px;
        }
        .bubble.user {
          background: #E6F1FB;
          color: #0C447C;
          border: 0.5px solid #B5D4F4;
          border-radius: 14px 4px 14px 14px;
        }
        .prose-bubble p { margin: 0 0 8px; }
        .prose-bubble p:last-child { margin: 0; }
        .prose-bubble strong { font-weight: 500; }
        .prose-bubble ol { padding-left: 18px; margin: 6px 0; }
        .prose-bubble li { margin: 3px 0; }
        .prose-bubble .sub-item { margin-left: 16px; list-style: disc; }
        .prose-bubble h3 { font-size: 13px; font-weight: 500; margin: 10px 0 4px; }
        .typing-dots {
          display: inline-flex;
          gap: 4px;
          align-items: center;
          padding: 4px 0;
        }
        .typing-dots span {
          display: block;
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-text-tertiary, #aaa);
          animation: blink 1.2s ease-in-out infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: .3; } 40% { opacity: 1; } }
        .input-area {
          display: flex;
          gap: 10px;
          align-items: flex-end;
          padding: 12px 16px;
          border-top: 0.5px solid var(--color-border-tertiary, #e5e7eb);
          background: var(--color-background-primary, #fff);
        }
        .input-box {
          flex: 1;
          resize: none;
          border: 0.5px solid var(--color-border-secondary, #d1d5db);
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 14px;
          font-family: inherit;
          line-height: 1.5;
          background: var(--color-background-secondary, #f9f9f9);
          color: var(--color-text-primary, #111);
          outline: none;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .input-box:focus { border-color: var(--color-border-primary, #9ca3af); }
        .send-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: #1D9E75;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: opacity 0.15s, transform 0.1s;
        }
        .send-btn:hover:not(:disabled) { opacity: 0.85; }
        .send-btn:active:not(:disabled) { transform: scale(0.95); }
        .send-btn:disabled { opacity: 0.35; cursor: default; }
      `}</style>

      <div className="chat-root">
        <div className="chat-header">
          <div className="header-status" />
          <span className="header-title">Assistant IA institutionnel</span>
          <span className="header-badge">En ligne</span>
        </div>

        <div className="messages">
          {conversation.length === 0 && !loading && (
            <div className="empty-state">
              <span style={{ fontSize: 28, opacity: 0.4 }}>💬</span>
              <p>Posez votre question pour commencer.</p>
            </div>
          )}

          {conversation.map((msg, i) => (
            <div key={i} className={`msg-row ${msg.role}`}>
              <div className={`avatar ${msg.role}`}>
                {msg.role === "ai" ? "IA" : "vous"}
              </div>
              <div className={`bubble ${msg.role}`}>
                {msg.role === "ai" ? (
                  <MarkdownBubble content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-row ai">
              <div className="avatar ai">IA</div>
              <div className="bubble ai">
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <textarea
            ref={textareaRef}
            className="input-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez votre question… (Entrée pour envoyer)"
            disabled={loading}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
