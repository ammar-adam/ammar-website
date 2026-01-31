import { notFound } from "next/navigation";
import { getArrivalBySlug } from "@/data/arrivals";
import { ArrivalDetailPage } from "@/components/ArrivalDetailPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArrivalPage({ params }: Props) {
  const { slug } = await params;
  const arrival = getArrivalBySlug(slug);

  if (!arrival) {
    notFound();
  }

  return <ArrivalDetailPage arrival={arrival} />;
}
