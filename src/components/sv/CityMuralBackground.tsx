"use client";

import { useId } from "react";
import "./city-mural.css";

function randomAt(index: number) {
  let n = (index + 19) ^ 0x9e3779b9;
  n = Math.imul(n ^ (n >>> 16), 0x21f0aaad);
  n = Math.imul(n ^ (n >>> 15), 0x735a2d97);
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
}
const spray = Array.from({ length: 130 }, (_, i) => ({ x: Math.round(randomAt(i) * 1600), y: 250 + Math.round(randomAt(i + 170) * 480), r: 1 + i % 4 }));
const drips = Array.from({ length: 39 }, (_, i) => ({ x: 17 + i * 42, y: 550 + i % 6 * 21, length: 35 + Math.round(randomAt(i + 450) * 235), width: 1 + i % 4 }));

function Toronto() {
  return <g className="short-city-toronto">
    <path d="M0 630V471H48V385H103V510H143V425H192V630M323 630V449H365V361H414V476H458V404H506V630" fill="#122d37" stroke="#5a8a8b" strokeWidth="3" />
    <path d="m240 630 13-341 9-63 3-91 6 91 11 63 13 341Z" fill="#173c48" stroke="#8fbdad" strokeWidth="3" />
    <path d="M265 85v54" stroke="#c7d6b1" strokeWidth="4" />
    <ellipse cx="266" cy="287" rx="39" ry="15" fill="#345f68" stroke="#b2c3a5" strokeWidth="3" />
    <path d="M230 287q35 22 72 0m-65 14 16 13h27l17-13M255 318l-9 298m28-298 10 298" fill="none" stroke="#76a7a1" strokeWidth="3" />
    <path d="M18 497h20m-20 21h20m29-109h25m-25 23h25m70 20h22m-22 22h22m160 0h20m12-91h21m-21 23h21m64 22h26m-26 23h26" stroke="#d9b75e" strokeWidth="4" opacity=".55" />
    <path d="M0 634q106-19 182-7t327-6" fill="none" stroke="#4a898a" strokeWidth="5" />
  </g>;
}

function Dubai() {
  return <g className="short-city-dubai">
    <path d="M269 624V390h9V278h10V193h10V118h8V54h5v64h7v75h10v85h11v112h10v234Z" fill="#173747" stroke="#88b1aa" strokeWidth="3" />
    <path d="M310 54V14m-4 108v498m-18-341h42m-51 115h63M291 307h37m-38 21h39m-39 21h39" fill="none" stroke="#b4c9b7" strokeWidth="2" />
    <path d="M41 623V550h47V475h49V623M375 623V486h45V436h42V623" fill="#153945" stroke="#629193" strokeWidth="3" />
    <path d="M137 285v338h132C279 483 223 354 137 285Z" fill="#194751" stroke="#a7c9b8" strokeWidth="4" />
    <path d="M150 305v301m-13-285 104 271m-87-250h28m-28 35h51m-51 35h72m-72 35h88m-88 35h101m-101 35h108m-108 35h113m-113 35h111" fill="none" stroke="#54888b" strokeWidth="3" />
    <path d="M125 623h157m-168 15h180" stroke="#95b4a5" strokeWidth="4" />
  </g>;
}

function Karachi() {
  return <g className="short-city-karachi">
    <path d="M72 624V420h246v204Z" fill="#3a5555" stroke="#c1ceb0" strokeWidth="4" />
    <path d="M111 419c-1-125 165-125 164 0Z" fill="#769285" stroke="#c5d0af" strokeWidth="4" />
    <path d="M128 419c-2-101 131-101 130 0M194 318v-19m-10 0h20" fill="none" stroke="#aac0a5" strokeWidth="3" />
    <path d="M166 624V502q30-60 59 0v122M94 552v-53q18-32 35 0v53m133 0v-53q18-32 35 0v53" fill="#112e34" stroke="#91b09e" strokeWidth="3" />
    <path d="M59 631h272M43 645h303M27 659h336M153 435v177m84-177v177" stroke="#9db6a3" strokeWidth="3" />
    <path d="M366 631V360h137M372 399l69-98 74 98m-74-98V631m-51-211h91m-96 28h100m-99 29h99m-104 29h106m-111 29h116" fill="none" stroke="#537878" strokeWidth="4" />
    <path d="m471 362 23 55m-24-55v128" fill="none" stroke="#d0b55d" strokeWidth="2.5" />
  </g>;
}

function Paint({ id }: { id: string }) {
  return <g filter={`url(#${id}-rough)`}>
    <g fill="#d02b76" opacity=".5">{spray.map((dot, i) => <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} />)}</g>
    <path d="M-78 596C27 445 111 452 238 406s220-31 323 38 142 123 274 95 168-112 287-138 193 5 298-48 168-52 221 9l-28 139c-69 62-170 58-254 103s-180 46-288 71-200 51-320 26-169-109-277-108-148 55-229 56S-2 733-78 696Z" fill="#dd286e" opacity=".98" />
    <path d="M-31 619C115 535 215 482 317 511s146 93 244 95 188-36 237-67M1043 500c140-75 251-30 406-89s151-66 198-58" fill="none" stroke="#ed6b5c" strokeWidth="116" strokeLinecap="round" opacity=".83" />
    <path d="M-3 508C115 441 212 442 297 410m829 256c187-81 301-33 455-116" fill="none" stroke="#a41e70" strokeWidth="56" strokeLinecap="round" opacity=".95" />
    <g strokeLinecap="round">{drips.map((drip, i) => <path key={i} d={`M${drip.x} ${drip.y}v${drip.length}`} stroke={i % 3 === 0 ? "#df735f" : "#bf286a"} strokeWidth={drip.width} opacity=".6" />)}</g>
  </g>;
}

function Marks({ id, mobile }: { id: string; mobile: boolean }) {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity=".94" transform={mobile ? "translate(-430 0)" : undefined}>
    <g filter={`url(#${id}-rough)`}>
      <path d="M-31 741C28 503 159 314 223 371s-7 193-79 231 13 141 124 97 171-143 215-187M1002 533c88-173 226-240 257-136s-160 172-68 257 265-39 465-153" stroke="#2957bb" strokeWidth="43" />
      <path d="M-40 732C19 494 150 305 214 362s-7 193-79 231 13 141 124 97 171-143 215-187M993 524c88-173 226-240 257-136s-160 172-68 257 265-39 465-153" stroke="#e5d941" strokeWidth="10" />
      <path d="m465 600 62-99-88 29m738 189 95 8-52 49" stroke="#e8d83f" strokeWidth="12" />
    </g>
    <path d="M-20 315c92-86 149-28 97 43s-125-32-34-8 99 55 161 11m970-132c94-36 129 52 73 74s-115-44-27-16 184 20 236-36M580 808c72-81 104 6 43 15s-35-64 43-31" stroke="#bc5299" strokeWidth="3" />
    <path d="m113 231 25 71 28-14m186 449-32 49-14-26m821-424 18-81 26 22m327 352-24 39-21-22M-45 821c165 17 274-3 344-39m1000 74c157 25 251-34 331-73" stroke="#d4c24e" strokeWidth="3" />
    <path d="m53 464 13 17m1-17-14 18m1319-72 14 18m0-18-13 18m-690 258 17 20m0-20-17 22m-401 111-6 41 20-4m967-431-5 32 16-2" stroke="#6dbf94" strokeWidth="4" />
  </g>;
}

function CityMural({ id, mobile = false }: { id: string; mobile?: boolean }) {
  return <svg className={`short-city-mural ${mobile ? "short-city-mobile" : "short-city-desktop"}`} viewBox={mobile ? "0 0 640 1000" : "0 0 1600 1000"} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <defs>
      <pattern id={`${id}-tile`} width="84" height="64" patternUnits="userSpaceOnUse"><rect width="84" height="64" fill="#0b0e12" /><path d="M1 1h49v29H1Zm51 0h30v29H52ZM1 33h30v29H1Zm32 0h49v29H33Z" fill="#14171c" /><path d="M3 3h44m8 0h24M3 35h25m8 0h43" stroke="#383c42" strokeWidth=".8" opacity=".27" /><path d="m12 15 14-2m37 37 9 1m-32-7 5 2" stroke="#787a7d" strokeWidth=".7" opacity=".19" /></pattern>
      <pattern id={`${id}-wear`} width="119" height="147" patternUnits="userSpaceOnUse"><path d="m6 14 15-4m21 97 11 2m33-77 3 17m12 68 15-9M58 143l9-3m-51-70 8 15M109 7l-5 12" stroke="#071b20" strokeWidth="1.3" opacity=".4" /><path d="m13 34 5-1m20 68 7 1m36-73 1 6m22 69 11-3" stroke="#bac2a2" strokeWidth=".8" opacity=".2" /><circle cx="28" cy="49" r="1" fill="#b0ad82" opacity=".28" /></pattern>
      <filter id={`${id}-rough`} x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" result="contour" /><feDisplacementMap in="SourceGraphic" in2="contour" scale="6" xChannelSelector="R" yChannelSelector="G" result="rough" /><feTurbulence type="fractalNoise" baseFrequency=".31" numOctaves="2" seed="11" result="grain" /><feColorMatrix in="grain" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 2.7 0 0 0 -.5" result="pigment" /><feComposite in="rough" in2="pigment" operator="in" /></filter>
    </defs>
    <rect width={mobile ? 640 : 1600} height="1000" fill={`url(#${id}-tile)`} />
    <path d={mobile ? "M-85 1100 4 463C-13 166 137 31 530-90" : "M-65 1110 25 463C-3 121 248-86 699-109M1684 1120l-92-657C1621 126 1387-69 945-114"} fill="none" stroke="#07090c" strokeWidth="65" />
    <g transform={mobile ? "translate(-430 0)" : undefined}><Paint id={id} /></g>
    {mobile ? <>
      <g transform="translate(-87 88) scale(.73)"><Toronto /></g>
      <g transform="translate(302 -35) scale(.79)"><Dubai /></g>
      <g transform="translate(98 456) scale(.78)"><Karachi /></g>
    </> : <>
      <g transform="translate(20 28)"><Toronto /></g>
      <g transform="translate(566 -66)"><Dubai /></g>
      <g transform="translate(1101 56)"><Karachi /></g>
    </>}
    <Marks id={id} mobile={mobile} />
    <rect width={mobile ? 640 : 1600} height="1000" fill={`url(#${id}-wear)`} />
  </svg>;
}

/** Original static graffiti cityscape. No image assets or animation/render loop. */
export function CityMuralBackground({ className = "" }: { className?: string }) {
  const id = useId().replaceAll(":", "");
  return <div className={`city-mural-background ${className}`} aria-hidden="true" data-ready="true" data-motion="still"><CityMural id={`${id}-wide`} /><CityMural id={`${id}-phone`} mobile /></div>;
}
