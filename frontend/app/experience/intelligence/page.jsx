import { IntelligenceFeedScene } from "@/components/scenes/IntelligenceFeedScene";
import { CinematicNav } from "@/components/foundation/CinematicNav";
import { ParticleField } from "@/components/foundation/ParticleField";

export const metadata = {
  title: "RetailOS AI | Live AI Intelligence Feed",
  description: "Realtime AI signals — demand shifts, inventory alerts, regional surges, and forecast updates.",
};

export default function IntelligencePage() {
  return (
    <main className="cinema-root">
      <ParticleField />
      <div className="cinema-shell">
        <CinematicNav />
        <IntelligenceFeedScene />
      </div>
    </main>
  );
}
