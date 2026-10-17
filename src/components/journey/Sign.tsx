"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { SignItem } from "@/data/journey";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * The black wayfinding sign from the arrivals hall. Used once as the nav and
 * then again as the header of every stop, so the whole page speaks one language.
 */
export function Sign({
  items,
  aside,
  className = "",
  delay = 0,
  as: Tag = "nav",
}: {
  items: SignItem[];
  aside?: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "nav" | "header";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <motion.div
      ref={ref}
      className={`sign ${className}`}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease, delay }}
    >
      <Tag className="sign-items" aria-label={Tag === "nav" ? "Sections" : undefined}>
        {items.map((s, i) => (
          <motion.a
            key={s.label}
            href={s.href}
            className="sign-item"
            target={s.external ? "_blank" : undefined}
            rel={s.external ? "noreferrer" : undefined}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: delay + 0.25 + i * 0.1 }}
          >
            <span className="sign-arrow" aria-hidden>{s.arrow}</span>
            <span className="sign-text">
              <span className="sign-label">{s.label}</span>
              <span className="sign-sub">{s.sub}</span>
            </span>
          </motion.a>
        ))}
      </Tag>
      {aside && <div className="sign-aside">{aside}</div>}
    </motion.div>
  );
}
