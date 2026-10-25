"use client";

import type { MotionValue } from "framer-motion";
import { useSceneProgress } from "./timeline";
import { IntroSequence } from "./IntroSequence";
import { CheckInExperience } from "./CheckInExperience";
import { SecurityProjects } from "./SecurityProjects";
import { PersonalLife } from "./PersonalLife";
import { BoardingPass } from "./BoardingPass";

type SceneProps = { chapter: number; t: MotionValue<number>; reduced: boolean; onDirectory: () => void; onGallery: (index?: number) => void; onEnter: () => void; onDeparture: () => void };
export function JourneyScene(props: SceneProps) {
  const p = useSceneProgress(props.t, props.chapter);
  const shared = { p, reduced: props.reduced };
  return <section className={`sv-scene sv-scene-${props.chapter}`} aria-label={["Introduction", "Experience", "Projects", "Personal life", "Contact"][props.chapter]}>
    {props.chapter === 0 && <IntroSequence {...shared} onEnter={props.onEnter} />}
    {props.chapter === 1 && <CheckInExperience {...shared} onDirectory={props.onDirectory} />}
    {props.chapter === 2 && <SecurityProjects {...shared} />}
    {props.chapter === 3 && <PersonalLife {...shared} onGallery={props.onGallery} />}
    {props.chapter === 4 && <BoardingPass {...shared} onDeparture={props.onDeparture} />}
  </section>;
}
