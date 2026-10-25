"use client";

import type { ReactNode } from "react";

/* Small DOM pieces that sit on top of the world. */

export function LinkPill({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const ext = href.startsWith("http");
  return (
    <a className={`pill ${className}`} href={href} target={ext ? "_blank" : undefined} rel={ext ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}
