import type { CSSProperties } from "react";
import "./film-type.css";

/** Uneven lettering is confined to spoken titles, never navigation or body copy. */
export function FilmTitle({ words, className = "" }: { words: string[]; className?: string }) {
  return <span className={`film-title ${className}`} aria-label={words.join(" ")}>
    {words.map((word, row) => <span className="film-title-word" key={`${row}-${word}`} aria-hidden="true" style={{ "--line": row } as CSSProperties}>
      {[...word].map((letter, i) => <span key={i} style={{ "--tilt": `${[-1.8, .8, -1, 1.4, -.5][i % 5]}deg`, "--lift": `${[0, -.025, .012, -.016][i % 4]}em`, "--letter": i } as CSSProperties}>{letter === " " ? "\u00a0" : letter}</span>)}
    </span>)}
  </span>;
}
