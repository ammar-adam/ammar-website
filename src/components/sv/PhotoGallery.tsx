"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { loungeRoomContent } from "@/data/loungeRoom";
import "./photo-gallery.css";

const photos = loungeRoomContent.photos.items;

function validIndex(index: number) {
  return Math.max(0, Math.min(photos.length - 1, Math.trunc(index) || 0));
}

type PhotoGalleryProps = {
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
};

export function PhotoGallery({ open, onClose, initialIndex = 0 }: PhotoGalleryProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }

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

  return (
    <dialog
      ref={dialog}
      className="sv-photo-gallery"
      aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      {open && <PhotoViewer key={validIndex(initialIndex)} initialIndex={validIndex(initialIndex)} titleId={titleId} onClose={onClose} />}
    </dialog>
  );
}

function PhotoViewer({ initialIndex, titleId, onClose }: { initialIndex: number; titleId: string; onClose: () => void }) {
  const [active, setActive] = useState(initialIndex);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const photo = photos[active];
  const number = String(active + 1).padStart(2, "0");

  useEffect(() => {
    thumbnails.current[active]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  }, [active]);

  function select(index: number, focusThumbnail = false) {
    const next = (index + photos.length) % photos.length;
    setActive(next);
    if (focusThumbnail) thumbnails.current[next]?.focus({ preventScroll: true });
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (event.key === "ArrowLeft") next = active - 1;
    else if (event.key === "ArrowRight") next = active + 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = photos.length - 1;
    else return;
    event.preventDefault();
    select(next, event.target instanceof HTMLElement && event.target.closest(".pg-thumb") !== null);
  }

  return (
    <div className="pg-layout" onKeyDown={navigate}>
      <header className="pg-header">
        <div>
          <p className="pg-eyebrow">Ammar&apos;s camera roll</p>
          <h2 id={titleId}>Life, lately.</h2>
        </div>
        <button type="button" className="pg-close" onClick={onClose}>
          <span>Close</span><span aria-hidden="true">×</span>
        </button>
      </header>
      <div className="pg-content">
      <figure className="pg-viewer">
        <div className="pg-image-stage">
          <span className="pg-frame-label" aria-hidden="true">AA / {number}</span>
          <div className="pg-image" key={photo.src}>
            <Image
              src={photo.src}
              alt={photo.caption}
              fill
              unoptimized
              sizes="(max-width: 720px) 100vw, 75vw"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
        <figcaption className="pg-caption">
          <div className="pg-caption-copy" aria-live="polite" aria-atomic="true">
            <span className="pg-counter">{number} <span>/ {String(photos.length).padStart(2, "0")}</span></span>
            <p>{photo.caption}</p>
          </div>
          <div className="pg-controls" aria-label="Photo navigation">
            <button type="button" onClick={() => select(active - 1)} aria-label="Previous photo">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" onClick={() => select(active + 1)} aria-label="Next photo">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </figcaption>
      </figure>

      <aside className="pg-contact-sheet" aria-label="All photos">
        <div className="pg-sheet-heading"><span>Contact sheet</span><span>{photos.length} frames</span></div>
        <div className="pg-thumbnails" role="group" aria-label="Choose a photo. Use the left and right arrow keys to browse.">
          {photos.map((item, index) => (
            <button
              key={item.src}
              ref={(element) => { thumbnails.current[index] = element; }}
              type="button"
              className="pg-thumb"
              aria-label={`Photo ${index + 1} of ${photos.length}: ${item.caption}`}
              aria-pressed={index === active}
              tabIndex={index === active ? 0 : -1}
              onClick={() => select(index)}
            >
              <Image src={item.src} alt="" fill unoptimized sizes="90px" draggable={false} />
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
        <p className="pg-key-hint">← → to browse <span>Esc to close</span></p>
      </aside>
      </div>
    </div>
  );
}
