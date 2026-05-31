"use client";

import { useState } from "react";
import Link from "next/link";
import { arrivals } from "@/data/arrivals";

const bagColor: Record<string, string> = {
  Waterloo: "#d8a64a",
  Mississauga: "#5b9bd8",
  Dubai: "#c97b4a",
};

export default function ArrivalsPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [dropKey, setDropKey] = useState(0);
  const current = selected === null ? null : arrivals[selected];
  const loop = [...arrivals, ...arrivals];

  const pick = (index: number) => {
    setSelected(index);
    setDropKey((value) => value + 1);
  };

  return (
    <section className="view wrap" data-screen-label="Experiences">
      <div className="masthead">
        <Link className="back-link" href="/">{"<-"} Terminal</Link>
        <div className="kicker mast-kicker">Gate B · Arrivals</div>
        <h1>Experiences</h1>
        <p className="m-sub">Pick a bag off the belt and watch it drop into the trolley.</p>
      </div>

      <div className="claim">
        <div className="claim-head">
          <span className="ch-l"><i />BAGGAGE CLAIM · CAROUSEL 03</span>
          <span>{arrivals.length} BAGS · NOW ARRIVING</span>
        </div>
        <div className="carousel">
          <div className="belt-tex" />
          <div className="belt-track">
            {loop.map((arrival, index) => {
              const realIndex = index % arrivals.length;
              return (
                <button
                  type="button"
                  className={`bag${realIndex === selected ? " sel" : ""}`}
                  key={`${arrival.slug}-${index}`}
                  onClick={() => pick(realIndex)}
                >
                  {arrival.image && <img className="b-img" src={arrival.image} alt={arrival.from} loading="lazy" decoding="async" />}
                  <span className="b-tag">{arrival.origin}</span>
                  <div className="b-body">
                    <div className="b-from">{arrival.from}</div>
                    <div className="b-title">{arrival.title}</div>
                    <div className="b-strip" />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="belt-rollers" />
        </div>
        <div className="claim-floor">
          <img className="prop-ic" src="/airport-icons/suitcase-1.svg" alt="" style={{ left: "3%", width: 30 }} />
          <img className="prop-ic accent" src="/airport-icons/gate-sign.svg" alt="" style={{ left: "20%", width: 28 }} />
          <img className="prop-ic" src="/airport-icons/plane-top.svg" alt="" style={{ left: "42%", width: 30 }} />
          <img className="prop-ic accent" src="/airport-icons/coffee-cup.svg" alt="" style={{ right: "26%", width: 28 }} />
          <img className="prop-ic" src="/airport-icons/suitcase-1.svg" alt="" style={{ right: "12%", width: 36 }} />
        </div>
      </div>

      <div className="arr-detail">
        <div className="ad-l">
          <div className="trolley-load">
            <div className="tl-bags tl-bags-single">
              {current ? (
                <div
                  className="tl-photo-bag"
                  key={`${current.slug}-${dropKey}`}
                  style={{ "--bc": bagColor[current.origin] || "#8a8f9a" } as React.CSSProperties}
                >
                  <span className="tl-photo-handle" />
                  <span className="tl-photo-pull" />
                  <strong>{current.origin}</strong>
                  <small>{current.from}</small>
                  <i aria-hidden />
                </div>
              ) : (
                <div className="tl-empty-cart">Cart empty</div>
              )}
            </div>
            <div className="tl-cart"><span className="tl-handle" /><span className="tl-platform" /><span className="tl-wheel l" /><span className="tl-wheel r" /></div>
            <div className="tl-count">{current ? `${current.origin} bag loaded` : "Select a bag above"}</div>
          </div>
        </div>
        <div className="ad-r" key={current?.slug ?? "empty"}>
          {current ? (
            <>
              <div className="ad-origin">{current.origin.toUpperCase()} · {current.from}</div>
              <div className="ad-title">{current.detailTitle || current.title}</div>
              <div className="ad-impact">{current.impact}</div>
              <div className="ad-det">{current.details}</div>
              <div className="ad-status"><i />{current.status}</div>
              {current.fromUrl && <div className="ad-link"><a className="btn" href={current.fromUrl} target="_blank" rel="noreferrer">Visit {current.from} -&gt;</a></div>}
            </>
          ) : (
            <>
              <div className="ad-origin">BAGGAGE CLAIM · CAROUSEL 03</div>
              <div className="ad-title">Select a bag</div>
              <div className="ad-impact">Pick an experience from the belt to load it into the trolley.</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
