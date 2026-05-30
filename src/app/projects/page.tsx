"use client";

import { useState } from "react";
import Link from "next/link";
import { projects } from "@/data/departures";

const seatIds = ["1A", "1B", "2A", "2B", "3A", "3B"];

function SeatSvg() {
  return (
    <svg className="seat-svg" viewBox="0 0 60 66" aria-hidden="true">
      <rect className="sv-bk" x="7" y="2" width="46" height="18" rx="8" />
      <rect className="sv-cu" x="10" y="15" width="40" height="47" rx="11" />
      <rect className="sv-ar" x="0.5" y="22" width="8.5" height="35" rx="4" />
      <rect className="sv-ar" x="51" y="22" width="8.5" height="35" rx="4" />
    </svg>
  );
}

function statusDot(status: string) {
  if (status === "Boarding") return "dot-boarding";
  if (status === "Departed") return "dot-departed";
  return "dot-closed";
}

function statusText(status: string) {
  if (status === "Boarding") return "BOARDING";
  if (status === "Boarding Closed") return "GATE CLOSED";
  return status.toUpperCase();
}

export default function ProjectsPage() {
  const [selected, setSelected] = useState(0);
  const current = projects[selected];

  return (
    <section className="view wrap" data-screen-label="Projects">
      <div className="masthead">
        <Link className="back-link" href="/">{"<-"} Terminal</Link>
        <div className="kicker mast-kicker">Gate A · Departures</div>
        <h1>Projects</h1>
        <p className="m-sub">Pick a seat - each one boards a different build. Your ticket prints on the right.</p>
      </div>

      <div className="proj">
        <div className="cabin">
          <div className="cabin-nose">
            <img src="/airport-icons/plane-top.svg" alt="" className="nose-ic" />
            CABIN · CHOOSE YOUR SEAT
          </div>
          <div className="cabin-cols"><span /><span>A</span><span className="aisle-h">aisle</span><span>B</span></div>
          {["1", "2", "3"].map((row) => {
            const leftIndex = seatIds.indexOf(`${row}A`);
            const rightIndex = seatIds.indexOf(`${row}B`);
            const renderSeat = (projectIndex: number) => {
              const project = projects[projectIndex];
              const seat = seatIds[projectIndex];
              return project ? (
                <button
                  type="button"
                  className={`pseat${projectIndex === selected ? " sel" : ""}`}
                  onClick={() => setSelected(projectIndex)}
                  title={project.name}
                >
                  <SeatSvg />
                  <span className="pn">{project.name}</span>
                  <span className="pc">{seat} <span className={`s-dot ${statusDot(project.status)}`} /></span>
                </button>
              ) : <span className="pseat empty" />;
            };
            return (
              <div className="seat-row" key={row}>
                <span className="rn">{row}</span>
                {renderSeat(leftIndex)}
                <span className="aisle" />
                {renderSeat(rightIndex)}
              </div>
            );
          })}
          <div className="cabin-legend">
            <span><i className="dot-boarding" />Boarding</span>
            <span><i className="dot-closed" />Closed</span>
            <span><i className="dot-departed" />Departed</span>
          </div>
        </div>

        <div className="case-open" key={current.slug}>
          <span className="case-handle" aria-hidden />
          <span className="case-wheel case-wheel-l" aria-hidden />
          <span className="case-wheel case-wheel-r" aria-hidden />
          <div className="case-lid">
            <div className="lid-mesh" />
            <div className="lid-brand"><img src="/airport-icons/plane-top.svg" alt="" />AFA · TRAVEL KIT</div>
            <div className="lid-name">{current.name}</div>
            <div className="lid-route">{current.routeName}</div>
            <div className="lid-stickers">
              <span className="sticker dest">{"->"} {current.destination}</span>
              <span className={`sticker stat ${current.status === "Boarding" ? "s-board" : current.status === "Departed" ? "s-dep" : "s-closed"}`}>{statusText(current.status)}</span>
            </div>
          </div>
          <div className="case-body">
            <div className="case-lining" />
            <div className="polaroid-stack">
              {current.screenshot && !current.screenshot.endsWith(".mp4") ? (
                <figure className="case-polaroid">
                  <img className="case-photo" src={current.screenshot} alt={current.name} />
                  <figcaption>{current.flightCode} evidence</figcaption>
                </figure>
              ) : (
                <figure className="case-polaroid ph"><span className="label">{current.name}</span><figcaption>{current.flightCode} media</figcaption></figure>
              )}
              <span className="case-strap strap-a" aria-hidden />
              <span className="case-strap strap-b" aria-hidden />
              <span className="case-object water-bottle" aria-hidden><i /></span>
              <span className="case-object hoodie" aria-hidden />
              <span className="case-object shoe shoe-a" aria-hidden />
              <span className="case-object shoe shoe-b" aria-hidden />
            </div>
            <div className="case-tag">FLIGHT {current.flightCode} · SEAT {seatIds[selected]} · GATE {current.gate} · {current.year}</div>
            <p className="case-note">{current.shortDesc}</p>
            <div className="case-links">
              {current.seats.flatMap((seat) => seat.links ?? []).map((link, index) => (
                <a className={`btn${index === 0 ? " solid" : ""}`} href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                  {link.label}{index === 0 ? " ->" : ""}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
