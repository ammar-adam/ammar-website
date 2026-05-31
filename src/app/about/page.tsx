"use client";

import { useState } from "react";
import Link from "next/link";
import { aboutAmenities, aboutFunFacts, aboutIntro, aboutLocationStamps, aboutMenuItems, aboutPhotos } from "@/data/about";
import { boardingPassConfig } from "@/data/boardingPass";

type Flyer = "passport" | "safety" | "magazine" | "menu" | null;

export default function AboutPage() {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [flyer, setFlyer] = useState<Flyer>(null);
  const currentPhoto = photoIndex === null ? null : aboutPhotos[photoIndex];

  return (
    <section className="view wrap" data-screen-label="About">
      <div className="masthead">
        <Link className="back-link" href="/">{"<-"} Terminal</Link>
        <div className="kicker mast-kicker">Gate C · In-Flight</div>
        <h1>About Me</h1>
        <p className="m-sub">Welcome to seat 1A. Everything you need is in front of you.</p>
      </div>

      <div className="seat-page">
        <div className="sp-wing l" />
        <div className="sp-wing r" />
        <div className="sp-headrest" />
        <div className="sp-back">
          <div className="sp-screen">
            <div className="sp-bar"><span className="live"><i />AFA · IN-FLIGHT ENTERTAINMENT</span><span>{photoIndex === null ? "GALLERY" : `CH ${photoIndex + 1} / ${aboutPhotos.length}`}</span></div>
            {currentPhoto ? (
              <>
                <div className="sp-feature" key={currentPhoto.src}>
                  <img src={currentPhoto.src} alt={currentPhoto.caption} />
                  <button type="button" className="ife-grid-back" onClick={() => setPhotoIndex(null)}>All photos</button>
                  <div className="sp-cap"><div className="np">NOW PLAYING</div><div className="cp">{currentPhoto.caption}</div></div>
                </div>
              </>
            ) : (
              <div className="ife-gallery-grid">
                {aboutPhotos.slice(0, 15).map((photo, index) => (
                  <button type="button" className="ife-gallery-tile" key={photo.src} onClick={() => setPhotoIndex(index)}>
                    <img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" />
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            )}
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
              <span>CS + Finance</span>
              <span>Waterloo</span>
              <span>Toronto / Dubai / Karachi</span>
            </div>
          </div>

          <div className="sp-pocket">
            <div className="flyers">
              <button type="button" className="flyer passport" onClick={() => setFlyer("passport")}><div className="fl-k">DOC</div><div className="fl-t">Passport</div></button>
              <button type="button" className="flyer safety" onClick={() => setFlyer("safety")}><div className="fl-k">MANUAL</div><div className="fl-t">Safety</div></button>
              <button type="button" className="flyer magazine" onClick={() => setFlyer("magazine")}><div className="fl-k">READ</div><div className="fl-t">Magazine</div></button>
              <button type="button" className="flyer menu" onClick={() => setFlyer("menu")}><div className="fl-k">F&B</div><div className="fl-t">Menu</div></button>
            </div>
            <div className="pocket-front" />
            <div className="pocket-label">PULL A DOCUMENT</div>
          </div>
        </div>
      </div>

      {flyer && (
        <div className="flyer-overlay" onClick={() => setFlyer(null)}>
          <div onClick={(event) => event.stopPropagation()}>
            <FlyerCard flyer={flyer} onClose={() => setFlyer(null)} />
          </div>
        </div>
      )}
    </section>
  );
}

function FlyerCard({ flyer, onClose }: { flyer: Exclude<Flyer, null>; onClose: () => void }) {
  if (flyer === "passport") {
    return (
      <div className="flyer-card fc-passport">
        <button type="button" className="fc-close" onClick={onClose}>CLOSE</button>
        <div className="fc-pad">
          <div className="pp-cover-mark">PASSPORT</div>
          <div className="pp-top"><span>AFA INTL</span><span>NO. 1A-YYZ</span></div>
          <h3>{boardingPassConfig.displayName}</h3>
          <div className="pp-sub">Computer Science and Finance · University of Waterloo</div>
          <div className="pp-photo-row">
            <div className="pp-photo-placeholder">AFA</div>
            <div className="pp-fields"><span>FROM YYZ</span><span>STATUS IN PROGRESS</span><span>FOCUS SYSTEMS / STARTUPS / FINTECH</span></div>
          </div>
          <div className="pp-stamps">
            {aboutLocationStamps.map((stamp) => (
              <a className="pp-stamp" key={stamp.code} href={stamp.url} target="_blank" rel="noreferrer"><b>{stamp.code}</b><span>STAMP</span></a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const content = {
    safety: { heading: "Safety Card", items: aboutAmenities, list: true, className: "fc-safety" },
    magazine: { heading: "Inflight Magazine", items: aboutFunFacts, list: false, className: "fc-magazine" },
    menu: { heading: "Flight Menu", items: aboutMenuItems, list: false, className: "fc-menu" },
  }[flyer];

  return (
    <div className={`flyer-card fc-list ${content.className}`}>
      <button type="button" className="fc-close" onClick={onClose}>CLOSE</button>
      <div className="fc-pad">
        <h3>{content.heading}</h3>
        {flyer === "menu" && (
          <div className="menu-stamps" aria-hidden>
            <span>☕</span><span>🥙</span><span>🍵</span><span>🍽</span>
          </div>
        )}
        {flyer === "magazine" && (
          <p className="fc-sub">Random facts from seat 1A.</p>
        )}
        {flyer === "menu" && (
          <p className="fc-sub">What&apos;s on the menu this flight.</p>
        )}
        {content.list ? (
          <ul>{content.items.map((item) => <li key={item}>{item}</li>)}</ul>
        ) : (
          <div className="fc-chips">{content.items.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
        )}
      </div>
    </div>
  );
}
