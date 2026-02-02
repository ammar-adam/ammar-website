import { CheckInHero } from "@/components/CheckInHero";
import { LoungeDoorSection } from "@/components/LoungeDoorSection";
import { TerminalHubCards } from "@/components/TerminalHubCards";
import { MovingWalkway } from "@/components/ambient/MovingWalkway";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { ArrivalsBoard } from "@/components/ArrivalsBoard";
import { BoardingPassViewer } from "@/components/BoardingPassViewer";

export default function HomePage() {
  return (
    <>
      <section id="check-in">
        <CheckInHero />
      </section>
      <section id="terminal">
        <TerminalHubCards />
      </section>
      <section id="departures">
        <DeparturesBoard />
      </section>
      <section id="arrivals">
        <ArrivalsBoard />
      </section>
      <section id="lounge">
        <LoungeDoorSection />
      </section>
      <section id="boarding-pass">
        <BoardingPassViewer />
      </section>
    </>
  );
}
