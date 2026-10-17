/**
 * Copy for the single-page journey. Experience and project facts live in
 * arrivals.ts and departures.ts; this file only holds the words around them.
 */

import { loungeRoomContent } from "./loungeRoom";

export const stops = [
  { id: "check-in", label: "Check-in" },
  { id: "departures", label: "Departures" },
  { id: "security", label: "Security" },
  { id: "gate", label: "Gate" },
  { id: "boarding", label: "Boarding" },
] as const;

export type StopId = (typeof stops)[number]["id"];

export const homeCities = [
  { code: "YYZ", city: "Toronto", country: "Canada" },
  { code: "DXB", city: "Dubai", country: "UAE" },
  { code: "KHI", city: "Karachi", country: "Pakistan" },
] as const;

export const hero = {
  name: "Ammar Adam",
  lede: "I grew up between Toronto, Dubai and Karachi. Now I study CS & Finance at Waterloo, build AI tools at Sagard and scout student builders for OpenAI.",
};

/** The three beats that play while the sky outside the gate goes from day to night. */
export const gateBeats = [
  {
    time: "14:20",
    title: "Three home airports.",
    body: "Toronto, Dubai and Karachi. I spent a lot of my life in departure halls between them, so this site lives in one.",
  },
  {
    time: "18:45",
    title: "Right now.",
    body: "Second year of CS & Finance at Waterloo. Building a Legal AI hub at Sagard, scouting builders for OpenAI as one of five Founding Builder Leads, and shipping things like Backseat and RocketShip on the side.",
  },
  {
    time: "22:10",
    title: "Off the clock.",
    body: "Liverpool since I was ten. Paddington 2 is the best movie ever made. Ask me about airline economics, mango matcha, or the best shawarma in the GTA.",
  },
] as const;

export const moments = loungeRoomContent.photos.items;
