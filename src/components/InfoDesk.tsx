"use client";

import { useState, useCallback } from "react";

const RESPONSES: Record<string, string> = {
  "what should i look at first":
    "Use the nav: Projects, Experiences, About Me, or Resume. Or go to the home page and use the navigation board.",
  "show me your projects":
    "Click Projects in the nav, or go to /departures. Each card opens a project.",
  "what is this place":
    "This is my personal site. Projects = things I build. Experiences = what has landed. About Me = who I am. Resume = download my CV.",
  "projects":
    "Click Projects in the nav or go to /departures.",
  "resume":
    "Click Resume in the nav or go to /boarding-pass. Use 'Export boarding pass' to download the PDF.",
  "help":
    "Use the top nav: Projects, Experiences, About Me, Resume. Each goes to a dedicated page.",
};

const SUGGESTIONS = [
  "What should I look at first?",
  "Show me your projects",
  "Where is your resume?",
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
                  className="block w-full text-left text-sm text-[var(--accent-warm)] hover:underline"
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
              className="w-full bg-transparent border border-[var(--border-subtle)] rounded px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-warm)]"
              aria-label="Question"
            />
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent-warm)]"
        aria-label={isOpen ? "Close Info Desk" : "Open Info Desk"}
      >
        Info Desk
      </button>
    </div>
  );
}
