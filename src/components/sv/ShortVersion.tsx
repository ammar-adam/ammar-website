"use client";

import { useEffect, useId, useRef } from "react";
import { ShortPortfolioContent } from "./ShortPortfolioContent";
import "./short-version.css";

type ShortVersionProps = { open: boolean; onClose: () => void };

export function ShortVersion({ open, onClose }: ShortVersionProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    scroll.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  return <dialog ref={dialog} className="sv-short-dialog" aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <header className="sp-chrome"><div><span className="sp-mark" aria-hidden="true">a/a</span><h2 id={`${id}-title`}>The short version</h2></div><button ref={closeButton} className="sp-close" type="button" onClick={onClose} aria-label="Close short version"><span>Close</span><span aria-hidden="true">×</span></button></header>
    <div className="sv-short-scroll" ref={scroll}>{open && <ShortPortfolioContent idPrefix={id} onReturn={onClose} />}</div>
  </dialog>;
}
