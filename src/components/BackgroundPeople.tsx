"use client";

type SectionId = "checkin" | "terminal" | "departures" | "arrivals" | "lounge";

const SECTION_CLASSES: Record<SectionId, string> = {
  checkin: "checkin-people",
  terminal: "terminal-people",
  departures: "departures-people",
  arrivals: "arrivals-people",
  lounge: "lounge-people",
};

interface BackgroundPeopleProps {
  section: SectionId;
  images: readonly string[];
}

export function BackgroundPeople({ section, images }: BackgroundPeopleProps) {
  if (images.length === 0) return null;

  const baseClass = SECTION_CLASSES[section];

  return (
    <div className={`background-people ${baseClass}`} aria-hidden>
      {images.map((src, i) => (
        <div
          key={`${section}-person-${i}`}
          className={`person-silhouette ${baseClass}-person-${i + 1}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}
