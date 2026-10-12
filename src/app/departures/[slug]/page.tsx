import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/data/departures";
import { ProjectDestinationPage } from "@/components/ProjectDestinationPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectDestinationPage project={project} />;
}
