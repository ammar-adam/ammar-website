"use client";

import { useEffect, useState } from "react";
import { StopSign } from "@/components/stops/StopSign";
import { aboutFunFacts, aboutIntro, aboutPhotos } from "@/data/about";

type DockSection = "home" | "info" | "comms" | "entertainment" | "search" | "favourites";

export function InFlight() {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [activeDock, setActiveDock] = useState<DockSection>("entertainment");
  const [milesLeft, setMilesLeft] = useState(4081);
  const currentPhoto = photoIndex === null ? null : aboutPhotos[photoIndex];

  const goHome = () => {
    setPhotoIndex(null);
    setActiveDock("entertainment");
  };

  const goPrev = () => {
    setPhotoIndex((index) => (index === null ? aboutPhotos.length - 1 : (index - 1 + aboutPhotos.length) % aboutPhotos.length));
    setActiveDock("entertainment");
  };

  const goNext = () => {
    setPhotoIndex((index) => (index === null ? 0 : (index + 1) % aboutPhotos.length));
    setActiveDock("entertainment");
  };


  useEffect(() => {
    if (!playing || photoIndex !== null) return;
    const timer = window.setInterval(() => {
      setMilesLeft((value) => Math.max(0, value - 1));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [playing, photoIndex]);

  const dockAction = (section: DockSection) => {
    setActiveDock(section);
    if (section === "home" || section === "entertainment") goHome();
  };

  return (
    <section className="stop wrap" id="in-flight" data-screen-label="About">
      <StopSign code="5" name="In-flight" dest="Off the clock" hint="Welcome to seat 1A. Tap a photo." />

      <div className="seat-page">
        <div className="sp-wing l" />
        <div className="sp-wing r" />
        <div className="sp-headrest" />
        <div className="sp-back">
          <div className="sp-screen ife-screen">
            <div className="ife-status-bar">
              <span className="ife-miles">{milesLeft.toLocaleString()} mi to YYZ</span>
              <span className="ife-ticker">Welcome aboard · Seat 1A · AFA International</span>
              <button type="button" className="ife-gear" aria-label="Screen settings" onClick={() => setPlaying((value) => !value)}>
                ⚙
              </button>
            </div>

            <div className="ife-nav-bar">
              {photoIndex !== null ? (
                <button type="button" className="ife-back" onClick={goHome}>Back</button>
              ) : (
                <span className="ife-back ife-back-placeholder" aria-hidden />
              )}
              <span className="ife-category">{photoIndex === null ? "In-Flight Entertainment" : "Now Viewing"}</span>
              <span className="ife-ch">{photoIndex === null ? "IFE" : `CH ${photoIndex + 1} / ${aboutPhotos.length}`}</span>
            </div>

            <div className="ife-body">
              {currentPhoto ? (
                <div className="ife-feature" key={currentPhoto.src}>
                  <img src={currentPhoto.src} alt={currentPhoto.caption} />
                  <p className="ife-feature-cap">{currentPhoto.caption}</p>
                </div>
              ) : (
                <div className="ife-gallery-grid">
                  {aboutPhotos.slice(0, 15).map((photo, index) => (
                    <button
                      type="button"
                      className={`ife-poster${photoIndex === index ? " is-active" : ""}`}
                      key={photo.src}
                      onClick={() => {
                        setPhotoIndex(index);
                        setActiveDock("entertainment");
                      }}
                    >
                      <span className="ife-poster-art">
                        <img src={photo.src.replace(/^\//, "/thumbs/")} alt={photo.caption} loading="lazy" decoding="async" />
                      </span>
                      <span className="ife-poster-title">{photo.caption}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ife-dock">
              <div className="ife-dock-icons">
                <button type="button" className={`ife-icon ife-icon-home${activeDock === "home" ? " is-active" : ""}`} title="Home" aria-label="Home" onClick={() => dockAction("home")} />
                <button type="button" className={`ife-icon ife-icon-i${activeDock === "info" ? " is-active" : ""}`} title="Information" aria-label="Information" onClick={() => dockAction("info")} />
                <button type="button" className={`ife-icon ife-icon-c${activeDock === "comms" ? " is-active" : ""}`} title="Communications" aria-label="Communications" onClick={() => dockAction("comms")} />
                <button type="button" className={`ife-icon ife-icon-e${activeDock === "entertainment" ? " is-active" : ""}`} title="Entertainment" aria-label="Entertainment" onClick={() => dockAction("entertainment")} />
                <button type="button" className={`ife-icon ife-icon-search${activeDock === "search" ? " is-active" : ""}`} title="Search" aria-label="Search" onClick={() => dockAction("search")} />
                <button type="button" className={`ife-icon ife-icon-heart${activeDock === "favourites" ? " is-active" : ""}`} title="Favourites" aria-label="Favourites" onClick={() => dockAction("favourites")} />
              </div>
              <div className="ife-now-playing">
                <span className="ife-np-label">Now Playing</span>
                <span className="ife-np-title">{currentPhoto ? currentPhoto.caption : "Browse In-Flight Entertainment"}</span>
                <span className="ife-np-controls">
                  <button type="button" className="ife-np-btn" aria-label="Previous" onClick={goPrev}>⏮</button>
                  <button type="button" className="ife-np-btn" aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((value) => !value)}>
                    {playing ? "⏸" : "▶"}
                  </button>
                  <button type="button" className="ife-np-btn" aria-label="Next" onClick={goNext}>⏭</button>
                </span>
              </div>
            </div>
          </div>

          <div className="sp-deck">
            <span className="sp-btn" title="reading light"><img src="/airport-icons/window.svg" alt="" /></span>
            <span className="sp-btn" title="call attendant"><img src="/airport-icons/coffee-cup.svg" alt="" /></span>
            <span className="sp-jack" title="headphones" />
            <span className="sp-tag">SEAT 1A</span>
          </div>

          <div className="sp-tray">
            <div className="tray-lead">{aboutIntro}</div>
            <div className="tray-items">
              {aboutFunFacts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}

