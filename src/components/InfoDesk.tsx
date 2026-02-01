"use client";

import { useState, useCallback } from "react";

const RESPONSES: Record<string, string> = {
  "what should i look at first":
    "Start at Departures — a few things I'm getting ready to ship. Or head to Terminal and choose where to go.",
  "show me your projects":
    "Scroll to Departures, or use the nav. Each project is a flight you can board.",
  "what is this place":
    "This is a terminal. Departures are projects, Arrivals are experiences. The Lounge is for personality, Boarding Pass is the resume.",
  "projects":
    "See Departures. Click a row to board.",
  "help":
    "Use the nav to move around. Terminal shows the main areas. Departures and Arrivals have the content.",
};

const SUGGESTIONS = [
  "What should I look at first?",
  "Show me your projects",
  "What is this place?",
];

function getResponse(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (normalized.length < 2) return "Ask something. Try the suggestions above.";
  for (const [key, response] of Object.entries(RESPONSES)) {
    if (normalized.includes(key)) return response;
  }
  if (/project|work|build|ship/.test(normalized)) return RESPONSES["show me your projects"];
  if (/first|start|begin|look/.test(normalized)) return RESPONSES["what should i look at first"];
  if (/place|this|what|where|terminal|airport/.test(normalized)) return RESPONSES["what is this place"];
  return "I can help with where to go, projects, or what this place is. Try one of the suggestions.";
}

export function InfoDesk() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ type: "user" | "desk"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const send = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { type: "user", text: text.trim() }]);
    const response = getResponse(text);
    setMessages((m) => [...m, { type: "desk", text: response }]);
    setInput("");
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="mb-3 w-80 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg overflow-hidden">
          <div className="p-3 border-b border-[var(--border-subtle)]">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              Info Desk
            </p>
          </div>
          <div className="h-48 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-[var(--text-muted)]">
                Ask for help. Try:
              </p>
            )}
            {messages.length === 0 &&
              SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="block w-full text-left text-sm text-[var(--accent-amber)] hover:underline"
                >
                  {s}
                </button>
              ))}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`text-sm ${
                  m.type === "user"
                    ? "text-[var(--text-secondary)]"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-[var(--border-subtle)]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="w-full bg-transparent border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-amber)]"
              aria-label="Question"
            />
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-amber)]"
        aria-label={isOpen ? "Close Info Desk" : "Open Info Desk"}
      >
        Info Desk
      </button>
    </div>
  );
}
