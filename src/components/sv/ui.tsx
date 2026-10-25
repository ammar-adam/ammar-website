"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/* Shared comic-book primitives: caption boxes, onomatopoeia bursts, panels
   that pop in on stepped frames when scrolled into view. All motion is CSS
   (steps() easing) so it runs on the compositor and respects reduced-motion. */

/** Adds `.in` once the element is in view. Children animate via CSS. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  style,
  amount = 0.25,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "figure" | "article";
  style?: CSSProperties;
  amount?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { setInView(true); io.disconnect(); }
      },
      { threshold: amount, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);
  const Comp = Tag as "div";
  return (
    <Comp
      id={id}
      ref={ref as React.Ref<HTMLDivElement>}
      className={`rv ${inView ? "in" : ""} ${className}`}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
    >
      {children}
    </Comp>
  );
}

/** Yellow hand-lettered caption box. `tone` swaps the fill. */
export function Caption({
  children,
  tone = "yellow",
  className = "",
  rotate = -1,
  size = "md",
}: {
  children: ReactNode;
  tone?: "yellow" | "cream" | "ink" | "cyan" | "magenta";
  className?: string;
  rotate?: number;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <p className={`cap cap-${tone} cap-${size} ${className}`} style={{ ["--rot" as string]: `${rotate}deg` }}>
      {children}
    </p>
  );
}

/** Hand-lettered onomatopoeia with a rough starburst behind it. */
export function Bang({
  text,
  color = "var(--sv-mag)",
  burst = "var(--sv-yel)",
  rotate = -8,
  size = 72,
  className = "",
  style,
}: {
  text: string;
  color?: string;
  burst?: string;
  rotate?: number;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const w = Math.max(220, text.length * size * 0.62 + 90);
  const h = size * 1.9;
  const cx = w / 2, cy = h / 2;
  const spikes = 14;
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
    const rx = i % 2 === 0 ? w * 0.5 : w * 0.38;
    const ry = i % 2 === 0 ? h * 0.5 : h * 0.33;
    const j = i % 3 === 0 ? 1.04 : 1;
    pts.push(`${(cx + Math.cos(a) * rx * j).toFixed(1)},${(cy + Math.sin(a) * ry * j).toFixed(1)}`);
  }
  return (
    <svg
      className={`bang ${className}`}
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      style={{ ["--rot" as string]: `${rotate}deg`, ...style }}
      aria-hidden="true"
    >
      <polygon points={pts.join(" ")} fill={burst} stroke="var(--sv-ink)" strokeWidth="6" strokeLinejoin="round" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-bangers), Impact, sans-serif"
        fontSize={size}
        fill={color}
        stroke="var(--sv-ink)"
        strokeWidth={size * 0.11}
        strokeLinejoin="round"
        paintOrder="stroke"
        letterSpacing="2"
      >
        {text}
      </text>
    </svg>
  );
}

/** Big display title with CMYK misregistration fringe. */
export function Cmyk({ text, className = "", as: Tag = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" }) {
  return (
    <Tag className={`cmyk ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}

/** Issue-number style kicker (mono). */
export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`kick ${className}`}>{children}</span>;
}

export function LinkPill({ href, children }: { href: string; children: ReactNode }) {
  const ext = href.startsWith("http");
  return (
    <a className="pill" href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}
