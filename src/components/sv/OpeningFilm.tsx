"use client";

import Link from "next/link";
import { SocialLinks } from "./SocialLinks";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./opening-film.css";

export function OpeningFilm({ onFinish }: { onFinish: () => void }) {
  const finish = useRef(onFinish);
  const [named, setNamed] = useState(false);
  useEffect(() => { finish.current = onFinish; }, [onFinish]);

  useEffect(() => {
    // A slow download or blocked autoplay must never hold the visitor captive.
    const caption = window.setTimeout(() => setNamed(true), 1850);
    const end = window.setTimeout(() => finish.current(), 6000);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") finish.current(); };
    window.addEventListener("keydown", escape);
    return () => { clearTimeout(caption); clearTimeout(end); window.removeEventListener("keydown", escape); };
  }, []);

  return <motion.section className="opening-film" aria-label="Six-second introduction" initial={false} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
    <video className="of-video" autoPlay muted playsInline preload="auto" poster="/film/arrival-desktop.webp?v=3d-final" onEnded={onFinish} onError={onFinish} aria-hidden="true" tabIndex={-1}>
      <source src="/film/arrival-portrait.mp4?v=3d-final" type="video/mp4" media="(max-width: 720px)" />
      <source src="/film/arrival-desktop.mp4?v=3d-final" type="video/mp4" />
    </video>
    <div className="of-shade" />
    <header className="of-header"><span className="of-mark">a<span>/</span>a</span><div className="of-header-links"><nav><Link href="/short">Short version</Link><button onClick={onFinish}>Skip intro <span aria-hidden="true">→</span></button></nav><SocialLinks /></div></header>
    <div className={`of-caption${named ? " of-named" : ""}`} aria-live="off">
      {named ? <><p>My name’s</p><h2>Ammar<br /><span>Adam.</span></h2><p>CS &amp; Finance at Waterloo.</p></> : <><h2>Alright.</h2><p>Let’s do this one more time.</p></>}
    </div>
    <footer className="of-footer"><span>AN INTRODUCTION, IN SIX SECONDS.</span><span>Scroll opens next <b aria-hidden="true">↓</b></span></footer>
    <div className="of-progress" aria-hidden="true"><i /></div>
  </motion.section>;
}
