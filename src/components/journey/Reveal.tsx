"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Masked line reveal: each child slides up out of its own clipping box. */
export function Lines({
  children,
  delay = 0,
  stagger = 0.09,
  as: Tag = "div",
  className = "",
  once = true,
  amount = 0.5,
}: {
  children: React.ReactNode[] | React.ReactNode;
  delay?: number;
  stagger?: number;
  as?: "div" | "h1" | "h2" | "p";
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount });
  const lines = Array.isArray(children) ? children : [children];
  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span className="mask" key={i}>
          <motion.span
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : {}}
            transition={{ duration: 1, ease, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Soft fade-up for blocks of content. */
export function Fade({
  children,
  delay = 0,
  className = "",
  y = 18,
  amount = 0.4,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease, delay }}
    >
      {children}
    </motion.div>
  );
}
