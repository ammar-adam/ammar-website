"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { loungeRoomContent } from "@/data/loungeRoom";
import "./photo-gallery.css";

const photos = loungeRoomContent.photos.items;
const validIndex = (index: number) => Math.max(0, Math.min(photos.length - 1, Math.trunc(index) || 0));

type PhotoGalleryProps = { open: boolean; onClose: () => void; initialIndex?: number };

export function PhotoGallery({ open, onClose, initialIndex = 0 }: PhotoGalleryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) { if (element.open) element.close(); return; }
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    if (!element.open) element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={dialog} className="sv-photo-gallery" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}>
    {open && <PhotoViewer key={validIndex(initialIndex)} initialIndex={validIndex(initialIndex)} titleId={titleId} onClose={onClose} />}
  </dialog>;
}

function PhotoViewer({ initialIndex, titleId, onClose }: { initialIndex: number; titleId: string; onClose: () => void }) {
  const [active, setActive] = useState(initialIndex);
  const [showIndex, setShowIndex] = useState(false);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const indexButton = useRef<HTMLButtonElement>(null);
  const indexId = useId();
  const photo = photos[active];
  const number = String(active + 1).padStart(2, "0");

  useEffect(() => {
    if (showIndex) thumbnails.current[active]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [active, showIndex]);

  function select(index: number, focusThumbnail = false) {
    const next = (index + photos.length) % photos.length;
    setActive(next);
    if (focusThumbnail) thumbnails.current[next]?.focus({ preventScroll: true });
  }
  function viewPhoto(index: number) {
    select(index);
    setShowIndex(false);
    indexButton.current?.focus({ preventScroll: true });
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const next = event.key === "ArrowLeft" ? active - 1 : event.key === "ArrowRight" ? active + 1 : event.key === "Home" ? 0 : event.key === "End" ? photos.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    select(next, event.target instanceof HTMLElement && event.target.closest(".pg-thumb") !== null);
  }

  return <div className="pg-layout" onKeyDown={navigate} data-view={showIndex ? "index" : "photo"}>
    <header className="pg-header">
      <div className="pg-title"><p className="pg-eyebrow">Ammar’s photo archive</p><h2 id={titleId}>Life, lately<span>.</span></h2></div>
      <div className="pg-header-actions">
        <button ref={indexButton} type="button" className="pg-index-toggle" aria-expanded={showIndex} aria-controls={indexId} onClick={() => setShowIndex(!showIndex)}><span aria-hidden="true">{showIndex ? "←" : "▦"}</span>{showIndex ? "Back to photo" : "All 25 photos"}</button>
        <button type="button" className="pg-close" onClick={onClose} aria-label="Close photo archive"><span>Close</span><span aria-hidden="true">×</span></button>
      </div>
    </header>

    <div className="pg-content">
      <figure className="pg-viewer" hidden={showIndex}>
        <div className="pg-image-stage"><div className="pg-image" key={photo.src}><Image src={photo.src} alt={photo.caption} fill unoptimized sizes="100vw" loading="eager" draggable={false} /></div></div>
        <figcaption className="pg-caption">
          <div className="pg-caption-copy" aria-live="polite" aria-atomic="true"><span className="pg-counter">{number}<span> / {photos.length}</span></span><p>{photo.caption}</p></div>
          <div className="pg-controls" aria-label="Photo navigation"><button type="button" onClick={() => select(active - 1)} aria-label="Previous photo"><span aria-hidden="true">←</span></button><button type="button" onClick={() => select(active + 1)} aria-label="Next photo"><span aria-hidden="true">→</span></button></div>
        </figcaption>
      </figure>

      <section id={indexId} className="pg-contact-sheet" aria-label="All 25 photos" hidden={!showIndex}>
        <div className="pg-sheet-heading"><p>A few moments worth keeping.</p><span>Choose a frame to look closer.</span></div>
        <div className="pg-thumbnails" role="group" aria-label="Choose a photo. Use the left and right arrow keys to browse.">
          {photos.map((item, index) => <button key={item.src} ref={element => { thumbnails.current[index] = element; }} type="button" className="pg-thumb" aria-label={`Photo ${index + 1} of ${photos.length}: ${item.caption}`} aria-pressed={index === active} tabIndex={index === active ? 0 : -1} onClick={() => viewPhoto(index)}>
            <span className="pg-thumb-image"><Image src={item.src} alt="" fill sizes="(max-width: 720px) 45vw, 250px" draggable={false} /><span className="pg-thumb-number">{String(index + 1).padStart(2, "0")}</span></span>
            <span className="pg-thumb-caption">{item.caption}</span>
          </button>)}
        </div>
      </section>
    </div>
    <footer className="pg-footer"><span>25 moments from my camera roll.</span><span className="pg-key-hint"><kbd>←</kbd><kbd>→</kbd> to browse <span>·</span> <kbd>Esc</kbd> to close</span><span className="pg-mobile-hint">Made of good company.</span></footer>
  </div>;
}
