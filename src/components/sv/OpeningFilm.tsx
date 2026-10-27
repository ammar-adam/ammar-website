"use client";

import { FilmTitle } from "./FilmTitle";
import { INTRO_COPY } from "@/data/filmCopy";
import { JourneyHeader } from "./JourneyHeader";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./opening-film.css";

const FILM_VERSION = "mobile-v9";
const PORTRAIT_MEDIA = "(orientation: portrait) and (max-width: 720px), (orientation: portrait) and (pointer: coarse) and (max-width: 1100px)";
const MOBILE_LANDSCAPE_MEDIA = "(orientation: landscape) and (max-width: 720px), (orientation: landscape) and (pointer: coarse) and (max-width: 1100px), (orientation: landscape) and (pointer: coarse) and (max-height: 720px)";
const PROFILES = {
  desktop: { width: 1920, height: 1080, framerate: 60, bitrate: 6000000, codec: "av01.0.09M.08" },
  portrait: { width: 720, height: 1560, framerate: 30, bitrate: 2000000, codec: "av01.0.08M.08" },
  "mobile-landscape": { width: 960, height: 540, framerate: 30, bitrate: 2000000, codec: "av01.0.08M.08" },
} as const;
type FilmProfile = keyof typeof PROFILES;
type PlaybackState = "loading" | "playing" | "blocked" | "error";

function constrainedConnection() {
  const connection = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string; downlink?: number };
  }).connection;
  return Boolean(connection?.saveData || /^(slow-)?2g$|^3g$/.test(connection?.effectiveType ?? "")
    || connection?.downlink !== undefined && connection.downlink > 0 && connection.downlink < 1.5);
}

function chooseProfile(): FilmProfile {
  if (window.matchMedia(PORTRAIT_MEDIA).matches) return "portrait";
  if (window.matchMedia(MOBILE_LANDSCAPE_MEDIA).matches) return "mobile-landscape";
  if (constrainedConnection()) return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "mobile-landscape";
  return "desktop";
}

export function OpeningFilm({ onFinish, onPrepareWorld, onNavigate }: { onFinish: () => void; onPrepareWorld?: () => void; onNavigate: (index: number) => void }) {
  const finish = useRef(onFinish);
  const prepareWorld = useRef(onPrepareWorld);
  const video = useRef<HTMLVideoElement>(null);
  const [beat, setBeat] = useState(0);
  const caption = INTRO_COPY[beat];
  const [selection, setSelection] = useState<{ profile: FilmProfile; source: string }>();
  const source = selection?.source;
  const [playback, setPlayback] = useState<PlaybackState>("loading");
  const [hasFrame, setHasFrame] = useState(false);
  useEffect(() => { finish.current = onFinish; prepareWorld.current = onPrepareWorld; }, [onFinish, onPrepareWorld]);

  useEffect(() => {
    const profile = chooseProfile();
    const capability = PROFILES[profile];
    let stopped = false, settled = false;
    const choose = (av1: boolean) => {
      if (stopped || settled) return;
      settled = true;
      setSelection({ profile, source: `/film/arrival-${profile}${av1 ? "-av1" : ""}.mp4?v=${FILM_VERSION}` });
    };
    // Prefer the smaller film only when the device reports smooth hardware
    // decoding. Older phones retain H.264 instead of expensive software AV1.
    const fallback = window.setTimeout(() => choose(false), 150);
    if (navigator.mediaCapabilities?.decodingInfo) {
      navigator.mediaCapabilities.decodingInfo({type:"file",video:{
        contentType:`video/mp4; codecs="${capability.codec}"`,
        width:capability.width,height:capability.height,
        bitrate:capability.bitrate,framerate:capability.framerate,
      }}).then(info => { clearTimeout(fallback); choose(info.supported && info.smooth && info.powerEfficient); })
        .catch(() => { clearTimeout(fallback); choose(false); });
    }
    return () => { stopped = true; clearTimeout(fallback); };
  }, []);

  useEffect(() => {
    const media = video.current;
    if (!media || !source) return;
    let active = true;
    media.muted = true;
    // Safari and data-saving browsers can reject autoplay despite muted +
    // playsInline. Keep the first-frame poster and expose a real play control.
    void media.play().catch((error: unknown) => {
      if (active && !(error instanceof DOMException && error.name === "AbortError")) setPlayback("blocked");
    });
    return () => { active = false; };
  }, [source]);

  const playIntro = () => {
    const media = video.current;
    if (!media) return;
    if (media.error) media.load();
    media.muted = true;
    setPlayback("loading");
    void media.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setPlayback("blocked");
    });
  };

  const mediaError = () => {
    setHasFrame(false);
    if (selection?.source.includes("-av1.mp4")) {
      setBeat(0);
      setPlayback("loading");
      setSelection({ ...selection, source: selection.source.replace("-av1.mp4", ".mp4") });
    } else setPlayback("error");
  };

  useEffect(() => {
    const media = video.current;
    if (!media) return;
    if (constrainedConnection()) return;
    let timer = 0, queued = false;
    const warm = () => {
      // Wait until the remaining film is buffered. Fetch only the two
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
      for (const href of ["/art/terminal-city-v3.webp", "/art/traveler-v2.webp"]) {
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
    // The visible Skip control remains available even if autoplay is blocked.
    // Let the actual six-second film finish instead of cutting it by wall time.
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && !event.defaultPrevented) finish.current(); };
    window.addEventListener("keydown", escape);
    return () => { window.removeEventListener("keydown", escape); };
  }, []);

  return <motion.section className="opening-film" aria-label="Introduction" data-film-profile={selection?.profile} initial={false} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
    <picture className="of-poster"><source media={PORTRAIT_MEDIA} srcSet={`/film/arrival-portrait.webp?v=${FILM_VERSION}`} /><source media={MOBILE_LANDSCAPE_MEDIA} srcSet={`/film/arrival-mobile-landscape.webp?v=${FILM_VERSION}`} /><img src={`/film/arrival-${selection?.profile ?? "desktop"}.webp?v=${FILM_VERSION}`} alt="" /></picture>
    <video ref={video} className="of-video" data-has-frame={hasFrame} src={source} autoPlay muted playsInline preload="auto" onPlaying={() => { setHasFrame(true); setPlayback("playing"); }} onTimeUpdate={event => { setBeat(event.currentTarget.currentTime >= 4.15 ? 2 : event.currentTarget.currentTime >= 1.85 ? 1 : 0); }} onEnded={onFinish} onError={mediaError} aria-hidden="true" tabIndex={-1} />
    <div className="of-shade" />
    <JourneyHeader chapter={0} onNavigate={onNavigate} />
    <div key={beat} className={`of-caption${beat > 0 ? " of-named" : ""}`} aria-live="off">
      {caption.pre && <p>{caption.pre}</p>}
      {caption.lines.length > 0 && <h2><FilmTitle words={caption.lines} /></h2>}
      <p>{caption.aside}</p>
    </div>
    {(playback === "blocked" || playback === "error") && <button className="of-play" type="button" onClick={playIntro}><span aria-hidden="true">▶</span> Play intro</button>}
    <span className="of-playback-status" role="status">{playback === "blocked" ? "Autoplay paused. Play the intro or skip to the terminal." : playback === "error" ? "The intro could not load. Play to retry, or skip to the terminal." : ""}</span>
    <button className="of-skip" type="button" onClick={onFinish}>Skip intro <span aria-hidden="true">→</span></button>
  </motion.section>;
}
