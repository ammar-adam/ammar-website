import { BagDrop } from "@/components/stops/BagDrop";
import { Boarding } from "@/components/stops/Boarding";
import { CheckIn } from "@/components/stops/CheckIn";
import { Gate } from "@/components/stops/Gate";
import { InFlight } from "@/components/stops/InFlight";

/** One walk through the terminal, check-in to wheels up. */
export default function Home() {
  return (
    <>
      <CheckIn />
      <BagDrop />
      <Gate />
      <Boarding />
      <InFlight />
    </>
  );
}
