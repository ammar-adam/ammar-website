"use client";

import { useEffect, useState } from "react";
import { experience, links, projects, type Item } from "@/data/content";
import "./board.css";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** Text that rattles through random letters once, then settles. */
function Flap({ text, delay = 0 }: { text: string; delay?: number }) {
  const target = text.toUpperCase();
  const [shown, setShown] = useState(() => target.replace(/[^ ]/g, " "));

  useEffect(() => {
    let frame = 0;
    const frames = 14;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        frame += 1;
        setShown(
          target
            .split("")
            .map((ch, i) => {
              if (ch === " " || frame > frames - (target.length - i) * 0.2) return ch;
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
            })
            .join(""),
        );
        if (frame >= frames) window.clearInterval(id);
      }, 55);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [target, delay]);

  return <span className="flap">{shown}</span>;
}

function useClock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Toronto" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

function Rows({ label, items, offset }: { label: string; items: Item[]; offset: number }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <div className="brd-label">{label}</div>
      {items.map((item, i) => {
        const isOpen = open === item.code;
        return (
          <div key={item.code} className={`brd-item${isOpen ? " open" : ""}`}>
            <button type="button" className="brd-row" onClick={() => setOpen(isOpen ? null : item.code)} aria-expanded={isOpen}>
              <span className="c-code"><Flap text={item.code} delay={(offset + i) * 90} /></span>
              <span className="c-name"><Flap text={item.name} delay={(offset + i) * 90 + 60} /></span>
              <span className="c-role">{item.role ?? ""}</span>
              <span className={`c-status ${item.now ? "now" : "done"}`}>{item.now ? "● now" : "landed"}</span>
            </button>
            {isOpen && (
              <div className="brd-note">
                {item.note}{" "}
                <a href={item.url} target="_blank" rel="noreferrer">visit ↗</a>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function BoardPage() {
  const time = useClock();
  return (
    <div className="board-page">
      <div className="brd">
        <div className="brd-head">
          <span>afa international · departures</span>
          <span>yyz {time}</span>
        </div>
        <div className="brd-who">
          <h1><Flap text="ammar adam" /></h1>
          <p>cs &amp; finance at waterloo. toronto, dubai, karachi.</p>
          <nav>
            {links.map((link) => (
              <a key={link.label} href={link.url} target={link.url.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer">{link.label}</a>
            ))}
          </nav>
        </div>
        <Rows label="experience" items={experience} offset={0} />
        <Rows label="projects" items={projects} offset={experience.length} />
        <div className="brd-foot">tap a flight for details · built in waterloo</div>
      </div>
    </div>
  );
}
