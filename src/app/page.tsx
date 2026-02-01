import { CheckInHero } from "@/components/CheckInHero";
import { TerminalHubCards } from "@/components/TerminalHubCards";
import { DeparturesBoard } from "@/components/DeparturesBoard";
import { ArrivalsBoard } from "@/components/ArrivalsBoard";
import { LoungePanel } from "@/components/LoungePanel";
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
        <LoungePanel />
      </section>
      <section id="boarding-pass">
        <BoardingPassViewer />
      </section>
    </>
  );
}
