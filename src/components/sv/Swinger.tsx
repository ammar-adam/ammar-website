"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { SwingState } from "./geometry";

const STEPS = 12; // 12fps-style stepped motion for the figure
const ARC = 44; // degrees each side

function stepped(phase: number, lag = 0) {
  const t = Math.min(1, Math.max(0, phase - lag));
  return Math.round(t * STEPS) / STEPS;
}

/**
 * Angle of the web line at a (stepped) phase. CSS rotate is clockwise, so a positive
 * angle hangs the figure to the left (behind) and a negative one swings it ahead.
 */
function angleAt(phase: number) {
  return Math.cos(phase * Math.PI) * ARC;
}

/**
 * A kid with a backpack and headphones on a web line. Animates on 2s/3s while the
 * camera is smooth; three echo silhouettes trail it like multiple exposures.
 */
export function Swinger({ state }: { state: MotionValue<SwingState> }) {
  const visible = useTransform(state, (s) => (s.index < 0 ? 0 : Math.min(1, s.intensity * 4)));
  const rot0 = useTransform(state, (s) => angleAt(stepped(s.phase)));
  const rot1 = useTransform(state, (s) => angleAt(stepped(s.phase, 1 / STEPS)));
  const rot2 = useTransform(state, (s) => angleAt(stepped(s.phase, 2 / STEPS)));
  const rot3 = useTransform(state, (s) => angleAt(stepped(s.phase, 3 / STEPS)));
  /* smear frame: stretched along the arc when angular speed peaks */
  const smear = useTransform(state, (s) => (s.index < 0 ? 0 : Math.max(0, Math.sin(s.phase * Math.PI) - 0.6) * 2.5));
  const smearScale = useTransform(smear, (v) => 1 + v * 0.9);
  /* body pose steps: tucked at ends, stretched in the middle */
  const pose = useTransform(state, (s) => Math.round(Math.sin(s.phase * Math.PI) * 2)); // 0,1,2

  return (
    <motion.div className="sv-swinger" style={{ opacity: visible }} aria-hidden="true">
      <motion.div className="sv-web sv-web-echo sv-web-echo-3" style={{ rotate: rot3 }}>
        <Figure pose={pose} />
      </motion.div>
      <motion.div className="sv-web sv-web-echo sv-web-echo-2" style={{ rotate: rot2 }}>
        <Figure pose={pose} />
      </motion.div>
      <motion.div className="sv-web sv-web-echo sv-web-echo-1" style={{ rotate: rot1 }}>
        <Figure pose={pose} />
      </motion.div>
      <motion.div className="sv-web sv-web-smear" style={{ rotate: rot0, opacity: smear, scaleX: smearScale }}>
        <Figure pose={pose} />
      </motion.div>
      <motion.div className="sv-web" style={{ rotate: rot0 }}>
        <div className="sv-web-line" />
        <Figure pose={pose} main />
      </motion.div>
    </motion.div>
  );
}

/* Three held poses. Legs and free arm change per frame; head, torso and bag are fixed. */
const LEGS = [
  "M 50 96 L 40 118 L 46 136 M 60 96 L 66 118 L 58 136", // tucked
  "M 50 96 L 36 122 L 44 142 M 60 96 L 70 120 L 64 142", // mid
  "M 50 96 L 28 118 L 22 140 M 60 96 L 80 112 L 92 128", // stretched
];
const ARM = [
  "M 60 66 L 78 78 L 84 96", // down
  "M 60 66 L 82 72 L 96 84", // out
  "M 60 66 L 86 60 L 104 50", // flung back
];

function Figure({ pose, main = false }: { pose: MotionValue<number>; main?: boolean }) {
  const legs = useTransform(pose, (p) => LEGS[Math.min(2, Math.max(0, p))]);
  const arm = useTransform(pose, (p) => ARM[Math.min(2, Math.max(0, p))]);
  return (
    <svg className={`sv-fig ${main ? "sv-fig-main" : ""}`} viewBox="0 0 120 150" width="120" height="150">
      <g fill="var(--ink)" stroke="var(--ink)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        {/* arm up, holding the line */}
        <path d="M 50 58 L 50 -10" fill="none" strokeWidth={8} />
        {/* head + headphones */}
        <circle cx="52" cy="34" r="15" stroke="none" />
        <path d="M 37 34 a 15 15 0 0 1 30 0" fill="none" strokeWidth={5} />
        <rect x="33" y="30" width="8" height="13" rx="3" stroke="none" />
        <rect x="63" y="30" width="8" height="13" rx="3" stroke="none" />
        {/* torso */}
        <path d="M 54 54 L 56 96" fill="none" strokeWidth={18} />
        {/* backpack */}
        <rect x="62" y="56" width="22" height="34" rx="8" stroke="none" />
        <rect x="60" y="60" width="6" height="28" rx="3" stroke="none" />
        {/* free arm + legs, stepped poses */}
        <motion.path d={arm} fill="none" />
        <motion.path d={legs} fill="none" />
      </g>
      {main && (
        <g stroke="none">
          <rect x="47" y="62" width="12" height="7" fill="var(--red)" />
          <rect x="66" y="62" width="14" height="4" fill="var(--cyan)" />
        </g>
      )}
    </svg>
  );
}
