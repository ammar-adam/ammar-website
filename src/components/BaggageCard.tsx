"use client";

import type { ArrivalArtifact } from "@/data/arrivals";

/* Theme-aligned gradients: accent-warm #e8a664, accent-gold #d4a574, accent-deep #8b6b47 */
const TYPE_STYLES: Record<string, { gradient: string; icon: "chart" | "box" | "play" | "doc" | "default" }> = {
  analytics: { gradient: "linear-gradient(135deg, #e8a664 0%, #8b6b47 100%)", icon: "chart" },
  automation: { gradient: "linear-gradient(135deg, #d4a574 0%, #e8a664 100%)", icon: "box" },
  presentation: { gradient: "linear-gradient(135deg, #ff9f5a 0%, #e8a664 100%)", icon: "play" },
  finance: { gradient: "linear-gradient(135deg, #8b6b47 0%, #d4a574 100%)", icon: "doc" },
  default: { gradient: "linear-gradient(135deg, #2f3742 0%, rgba(232,166,100,0.4) 100%)", icon: "default" },
};

const ICONS = {
  chart: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="white" opacity="0.85">
      <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zm-2-12H7v2h10V7zm0 4H7v2h10v-2zm-4 4H7v2h6v-2z" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="white" opacity="0.85">
      <path d="M22 9l-10-7L2 9v13h20V9zm-2 11H4v-9l8-5.67L20 11v9z" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="white" opacity="0.85">
      <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM10 12l5-3-5-3v6z" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="white" opacity="0.85">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="white" opacity="0.85">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
    </svg>
  ),
};

const TYPE_LABELS: Record<string, string> = {
  analytics: "Analytics",
  automation: "Automation",
  presentation: "Presentation",
  finance: "Finance",
  default: "Artifact",
};

export function BaggageCard({ artifact }: { artifact: ArrivalArtifact }) {
  const type = artifact.type ?? "default";
  const style = TYPE_STYLES[type] ?? TYPE_STYLES.default;
  const typeLabel = TYPE_LABELS[type] ?? "Artifact";

  return (
    <div className="baggage-card flex-shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:border-[var(--accent-warm)] hover:shadow-[var(--shadow-lg)] hover:shadow-[0_0_24px_rgba(232,166,100,0.2)]">
      <div
        className="card-visual w-full h-44 flex items-center justify-center relative overflow-hidden"
        style={{ background: style.gradient }}
      >
        <div className="card-icon z-[1] drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]">{ICONS[style.icon]}</div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`,
          }}
        />
      </div>
      <div className="card-label px-4 py-4 flex flex-col gap-1.5 bg-[var(--bg-surface)]">
        <span className="card-title font-display text-sm font-semibold text-[var(--text-primary)]">{artifact.label}</span>
        {artifact.sublabel ? (
          <span className="card-sublabel text-xs text-[var(--text-secondary)]">{artifact.sublabel}</span>
        ) : (
          <span className="card-type font-mono text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{typeLabel}</span>
        )}
      </div>
    </div>
  );
}
