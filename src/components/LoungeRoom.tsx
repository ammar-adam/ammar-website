"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { loungeRoomContent } from "@/data/loungeRoom";
import { siteConfig } from "@/data/site";
import { cafeContent } from "@/data/lounge";

type ContentType = "window" | "bookshelf" | "photos" | "table" | "cafe";

export function LoungeRoom() {
  const [activeModal, setActiveModal] = useState<ContentType | null>(null);
  const [instructionHidden, setInstructionHidden] = useState(false);

  const openModal = useCallback((content: ContentType) => {
    setActiveModal(content);
    setInstructionHidden(true);
  }, []);

  const closeModal = useCallback(() => setActiveModal(null), []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeModal]);

  const w = loungeRoomContent.window;
  const b = loungeRoomContent.bookshelf;
  const p = loungeRoomContent.photos;
  const t = loungeRoomContent.table;
  const c = loungeRoomContent.cafe;
  const emailUrl = cafeContent.sayHelloEmail;
  const linkedinUrl = siteConfig.socialLinks.linkedin;

  return (
    <div className="lounge-room-page min-h-screen relative">
      <div className="ambient-particles" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="particle" style={{ left: `${20 + i * 15}%`, animationDelay: `${i * 3}s` }} />
        ))}
      </div>
      <div className="floor-lamp-glow" aria-hidden />
      <Link
        href="/#terminal"
        className="lounge-back-link inline-flex items-center gap-2 font-mono text-xs text-[var(--accent-warm)] mb-6 px-3 py-2 border border-[var(--border-medium)] rounded-lg bg-[rgba(47,55,66,0.4)] transition-all duration-200 hover:bg-[rgba(47,55,66,0.6)] hover:border-[var(--accent-warm)] hover:gap-3"
      >
        <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Terminal
      </Link>

      <div className="room-container max-w-[1200px] min-w-0 w-full mx-auto relative px-4">
        <div className="lounge-floor-perspective" aria-hidden />
        <svg viewBox="0 0 1400 900" className="room-svg w-full h-auto block relative z-[1]" aria-label="Lounge room">
          <defs>
            <filter id="objectShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="2" dy="6" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="objectGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.25 0" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="floorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(37,43,54,0.6)" />
              <stop offset="100%" stopColor="rgba(26,30,38,0.8)" />
            </linearGradient>
            <linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(47,55,66,0.4)" />
              <stop offset="100%" stopColor="rgba(37,43,54,0.7)" />
            </linearGradient>
            <linearGradient id="windowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(135,180,200,0.08)" />
              <stop offset="50%" stopColor="rgba(232,166,100,0.12)" />
              <stop offset="100%" stopColor="rgba(232,166,100,0.06)" />
            </linearGradient>
            <linearGradient id="lampLightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(232,166,100,0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Floor */}
          <rect x="0" y="600" width="1400" height="300" fill="url(#floorGradient)" />
          {/* Back wall */}
          <polygon points="0,200 1400,200 1400,600 0,600" fill="url(#wallGradient)" />
          {/* Left wall */}
          <polygon points="0,200 200,100 200,700 0,600" fill="rgba(37,43,54,0.6)" />
          {/* Right wall */}
          <polygon points="1400,200 1200,100 1200,700 1400,600" fill="rgba(37,43,54,0.6)" />
          {/* Ceiling */}
          <polygon points="200,100 1200,100 1400,200 0,200" fill="rgba(26,30,38,0.8)" />

          {/* Window with light rays */}
          <g
            className="hotspot hotspot-with-shadow cursor-pointer"
            filter="url(#objectShadow)"
            onClick={() => openModal("window")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal("window")}
            aria-label="Window — current thoughts"
          >
            <rect x="50" y="250" width="120" height="200" fill="url(#windowGradient)" stroke="rgba(232,166,100,0.4)" strokeWidth="2" rx="4" className="interactive-object transition-all duration-300" />
            <line x1="110" y1="250" x2="110" y2="450" stroke="rgba(232,166,100,0.3)" strokeWidth="2" />
            <line x1="50" y1="350" x2="170" y2="350" stroke="rgba(232,166,100,0.3)" strokeWidth="2" />
            <path d="M 170,280 L 250,320 L 250,340 L 170,300 Z" fill="rgba(232,166,100,0.08)" opacity="0.6" />
            <path d="M 170,360 L 280,400 L 280,420 L 170,380 Z" fill="rgba(232,166,100,0.06)" opacity="0.5" />
          </g>

          {/* Bookshelf */}
          <g
            className="hotspot hotspot-with-shadow cursor-pointer"
            filter="url(#objectShadow)"
            onClick={() => openModal("bookshelf")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal("bookshelf")}
            aria-label="Bookshelf — what I'm reading"
          >
            <rect x="300" y="300" width="200" height="250" fill="rgba(47,55,66,0.8)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" className="interactive-object transition-all duration-300" />
            <line x1="300" y1="375" x2="500" y2="375" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" />
            <line x1="300" y1="450" x2="500" y2="450" stroke="rgba(232,166,100,0.2)" strokeWidth="1.5" />
            <rect x="310" y="310" width="15" height="60" fill="rgba(232,166,100,0.4)" />
            <rect x="330" y="310" width="20" height="60" fill="rgba(102,187,106,0.4)" />
            <rect x="355" y="310" width="18" height="60" fill="rgba(147,197,253,0.4)" />
            <rect x="310" y="385" width="25" height="60" fill="rgba(251,191,36,0.4)" />
            <rect x="340" y="385" width="15" height="60" fill="rgba(244,114,182,0.4)" />
          </g>

          {/* Photo wall */}
          <g
            className="hotspot hotspot-with-shadow cursor-pointer"
            filter="url(#objectShadow)"
            onClick={() => openModal("photos")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal("photos")}
            aria-label="Photos — moments"
          >
            <rect x="700" y="280" width="140" height="100" fill="rgba(47,55,66,0.6)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" className="interactive-object transition-all duration-300" />
            <rect x="860" y="280" width="120" height="100" fill="rgba(47,55,66,0.6)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" className="interactive-object transition-all duration-300" />
            <rect x="780" y="400" width="130" height="95" fill="rgba(47,55,66,0.6)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" className="interactive-object transition-all duration-300" />
          </g>

          {/* Coffee table */}
          <g
            className="hotspot cursor-pointer"
            onClick={() => openModal("table")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal("table")}
            aria-label="Coffee table — current projects"
          >
            <ellipse cx="700" cy="680" rx="180" ry="40" fill="rgba(47,55,66,0.8)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" className="interactive-object transition-all duration-300" />
            <rect x="560" y="680" width="12" height="80" fill="rgba(37,43,54,0.9)" />
            <rect x="828" y="680" width="12" height="80" fill="rgba(37,43,54,0.9)" />
            <circle cx="650" cy="675" r="8" fill="rgba(232,166,100,0.4)" />
            <rect x="720" y="665" width="30" height="20" fill="rgba(102,187,106,0.3)" rx="2" />
          </g>

          {/* Couch / Café */}
          <g
            className="hotspot hotspot-with-shadow cursor-pointer"
            filter="url(#objectShadow)"
            onClick={() => openModal("cafe")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openModal("cafe")}
            aria-label="Couch — connect"
          >
            <rect x="1000" y="520" width="300" height="80" fill="rgba(47,55,66,0.9)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" rx="8" className="interactive-object transition-all duration-300" />
            <rect x="1000" y="600" width="300" height="100" fill="rgba(47,55,66,0.8)" stroke="rgba(232,166,100,0.3)" strokeWidth="2" rx="4" className="interactive-object transition-all duration-300" />
            <rect x="1020" y="530" width="60" height="60" fill="rgba(232,166,100,0.2)" rx="4" />
            <rect x="1160" y="530" width="60" height="60" fill="rgba(232,166,100,0.2)" rx="4" />
          </g>

          {/* Floor lamp with animated glow */}
          <g className="ambient-light" aria-hidden>
            <line x1="1100" y1="300" x2="1100" y2="550" stroke="rgba(232,166,100,0.4)" strokeWidth="3" opacity="0.7" />
            <path d="M 1080,270 L 1070,290 L 1130,290 L 1120,270 Z" fill="rgba(47,55,66,0.8)" stroke="rgba(232,166,100,0.5)" strokeWidth="2" />
            <circle cx="1100" cy="280" r="6" fill="rgba(232,166,100,0.9)" className="lamp-bulb" />
            <circle cx="1100" cy="280" r="22" fill="none" stroke="rgba(232,166,100,0.3)" strokeWidth="1" className="glow-ring glow-ring-1" />
            <circle cx="1100" cy="280" r="40" fill="none" stroke="rgba(232,166,100,0.2)" strokeWidth="1" className="glow-ring glow-ring-2" />
            <circle cx="1100" cy="280" r="60" fill="none" stroke="rgba(232,166,100,0.1)" strokeWidth="1" className="glow-ring glow-ring-3" />
            <path d="M 1090,290 L 1080,550 L 1120,550 L 1110,290 Z" fill="url(#lampLightGradient)" opacity="0.12" />
          </g>
        </svg>

        {!instructionHidden && (
          <div className="room-instruction absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 font-body text-base text-[var(--text-secondary)] bg-[rgba(26,30,38,0.9)] px-8 py-6 rounded-xl border border-[var(--border-medium)] pointer-events-none animate-fade-pulse">
            <svg viewBox="0 0 24 24" width="24" className="text-[var(--accent-warm)]" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Click objects to explore</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <LoungeModal isOpen={activeModal === "window"} onClose={closeModal} title={w.title}>
        <div className="space-y-5">
          {w.paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p className="font-mono text-sm text-[var(--text-tertiary)] italic mt-8">{w.date}</p>
        </div>
      </LoungeModal>

      <LoungeModal isOpen={activeModal === "bookshelf"} onClose={closeModal} title={b.title}>
        <ul className="space-y-4">
          {b.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {item.label ? (
                <>
                  <h3 className="font-display text-sm font-semibold text-[var(--accent-warm)] uppercase tracking-wider">{item.label}</h3>
                  <span>—</span>
                </>
              ) : null}
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </LoungeModal>

      <LoungeModal isOpen={activeModal === "photos"} onClose={closeModal} title={p.title} wide>
        <div className="photo-grid grid grid-cols-2 gap-4">
          {p.items.map((item, i) => (
            <div key={i} className="photo-item relative aspect-[4/3] rounded-lg overflow-hidden bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
              <div className="relative w-full h-full">
                <img
                  src={item.src}
                  alt=""
                  className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-[filter]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.parentElement?.querySelector(".photo-fallback");
                    if (fallback) (fallback as HTMLElement).classList.remove("hidden");
                  }}
                />
                <div className="photo-fallback hidden absolute inset-0 flex items-center justify-center bg-[var(--bg-surface)]">
                  <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Add {item.src} to public</span>
                </div>
              </div>
              <span className="absolute bottom-0 left-0 right-0 px-3 py-2.5 bg-gradient-to-t from-black/80 to-transparent font-body text-sm text-[var(--text-primary)]">
                {item.caption}
              </span>
            </div>
          ))}
        </div>
      </LoungeModal>

      <LoungeModal isOpen={activeModal === "table"} onClose={closeModal} title={t.title}>
        <div className="space-y-6">
          {t.items.map((item, i) => (
            <div key={i} className="table-item p-6 bg-[rgba(47,55,66,0.4)] border border-[var(--border-subtle)] rounded-lg">
              <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-3">{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </LoungeModal>

      <LoungeModal isOpen={activeModal === "cafe"} onClose={closeModal} title={c.title}>
        <p className="mb-4 font-semibold text-[var(--text-primary)]">{c.intro}</p>
        <ul className="space-y-2 mb-8">
          {c.items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-[var(--accent-warm)]">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <a href={emailUrl} className="cafe-button inline-flex items-center gap-3 font-display font-semibold px-6 py-3.5 rounded-lg border border-[var(--accent-warm)] bg-[var(--accent-warm)] text-[var(--bg-deep)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(232,166,100,0.3)]">
          {c.cta}
          <span aria-hidden>→</span>
        </a>
      </LoungeModal>
    </div>
  );
}

function LoungeModal({
  isOpen,
  onClose,
  title,
  children,
  wide,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="content-modal fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[1000] p-5 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-container bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-[var(--shadow-lg)] animate-slide-up ${wide ? "max-w-3xl" : ""}`}>
        <button
          type="button"
          onClick={onClose}
          className="modal-close absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(26,30,38,0.8)] text-[var(--text-secondary)] text-2xl border-0 cursor-pointer transition-all hover:bg-[var(--accent-warm)] hover:text-[var(--bg-deep)] hover:rotate-90 z-10"
          aria-label="Close"
        >
          ×
        </button>
        <div className="modal-content p-10 sm:p-12">
          <h2 id="modal-title" className="font-display text-2xl font-bold text-[var(--text-primary)] mb-8">
            {title}
          </h2>
          <div className="modal-body font-body text-base leading-relaxed text-[var(--text-secondary)] [&>p]:mb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
