"use client";

import Link from "next/link";
import { FilmTitle } from "./FilmTitle";
import { SocialLinks } from "./SocialLinks";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./opening-film.css";

export function OpeningFilm({ onFinish, onPrepareWorld }: { onFinish: () => void; onPrepareWorld?: () => void }) {
  const finish = useRef(onFinish);
  const prepareWorld = useRef(onPrepareWorld);
  const video = useRef<HTMLVideoElement>(null);
  const [named, setNamed] = useState(false);
  const [source, setSource] = useState<string>();
  useEffect(() => { finish.current = onFinish; prepareWorld.current = onPrepareWorld; }, [onFinish, onPrepareWorld]);

  useEffect(() => {
    const portrait = window.matchMedia("(max-width: 720px)").matches;
    const profile = portrait ? "portrait" : "desktop";
    let stopped = false, settled = false;
    const choose = (av1: boolean) => {
      if (stopped || settled) return;
      settled = true;
      setSource(`/film/arrival-${profile}${av1 ? "-av1" : ""}.mp4?v=set-v8`);
    };
    // Prefer the smaller film only when the device reports smooth hardware
    // decoding. Older phones retain H.264 instead of expensive software AV1.
    const fallback = window.setTimeout(() => choose(false), 150);
    if (navigator.mediaCapabilities?.decodingInfo) {
      navigator.mediaCapabilities.decodingInfo({type:"file",video:{
        contentType:'video/mp4; codecs="av01.0.09M.08"',
        width:portrait?900:1920,height:portrait?1950:1080,
        bitrate:6000000,framerate:60,
      }}).then(info => { clearTimeout(fallback); choose(info.supported && info.smooth && info.powerEfficient); })
        .catch(() => { clearTimeout(fallback); choose(false); });
    }
    return () => { stopped = true; clearTimeout(fallback); };
  }, []);


  useEffect(() => {
    const media = video.current;
    if (!media) return;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType ?? "")) return;
    let timer = 0, queued = false;
    const warm = () => {
      // Wait until the remaining film is buffered. Fetch only the three
      // first-room textures and module; never construct the world or its GPU here.
      if (media.ended) return;
      if (media.paused || media.readyState < 3) { timer = window.setTimeout(warm, 500); return; }
      let buffered = 0;
      for (let i = 0; i < media.buffered.length; i++) {
        if (media.buffered.start(i) <= media.currentTime && media.buffered.end(i) > media.currentTime) {
          buffered = media.buffered.end(i) - media.currentTime;
        }
      }
      if (buffered < Math.max(0, media.duration - media.currentTime - .08)) { timer = window.setTimeout(warm, 500); return; }
      for (const href of ["/art/terminal-city-v3.webp", "/art/terminal-paint-material.webp", "/art/traveler-v2.webp"]) {
        const hint = document.createElement("link");
        hint.rel = "prefetch"; hint.as = "image"; hint.fetchPriority = "low"; hint.href = href;
        // Finish in-flight prefetches across the film-to-world handoff.
        // Removing an unfinished link aborts it and makes the world fetch again.
        hint.addEventListener("load", () => hint.remove(), { once: true });
        hint.addEventListener("error", () => hint.remove(), { once: true });
        document.head.append(hint);
      }
      prepareWorld.current?.();
    };
    const playing = () => { if (!queued) { queued = true; timer = window.setTimeout(warm, 2000); } };
    media.addEventListener("playing", playing);
    return () => { clearTimeout(timer); media.removeEventListener("playing", playing); };
  }, []);

  useEffect(() => {
    // A slow download or blocked autoplay must never hold the visitor captive.

    const end = window.setTimeout(() => finish.current(), 6000);
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") finish.current(); };
    window.addEventListener("keydown", escape);
    return () => { clearTimeout(end); window.removeEventListener("keydown", escape); };
  }, []);

  return <motion.section className="opening-film" aria-label="Introduction" initial={false} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
    <picture className="of-poster"><source media="(max-width: 720px)" srcSet="/film/arrival-portrait.webp?v=set-v8" /><img src="/film/arrival-desktop.webp?v=set-v8" alt="" /></picture>
    <video ref={video} className="of-video" src={source} autoPlay muted playsInline preload="auto" onTimeUpdate={event => { if (event.currentTarget.currentTime >= 1.85) setNamed(true); }} onEnded={onFinish} onError={() => { if (source?.includes("-av1")) setSource(source.replace("-av1", "")); else onFinish(); }} aria-hidden="true" tabIndex={-1} />
    <div className="of-shade" />
    <header className="of-header"><span className="of-mark">a<span>/</span>a</span><div className="of-header-links"><nav><Link href="/short">Short version</Link><button onClick={onFinish}>Skip intro <span aria-hidden="true">→</span></button></nav><SocialLinks /></div></header>
    <div key={named ? "named" : "first"} className={`of-caption${named ? " of-named" : ""}`} aria-live="off">
      {named ? <><p>My name’s</p><h2><FilmTitle words={["AMMAR", "ADAM."]} /></h2><p>CS &amp; Finance at Waterloo.</p></> : <><h2><FilmTitle words={["Alright."]} /></h2><p>Let’s do this one more time.</p></>}
    </div>
    <div className="of-progress" aria-hidden="true"><i /></div>
  </motion.section>;
}
