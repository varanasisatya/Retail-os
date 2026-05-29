import { HeroScene } from "@/components/scenes/HeroScene";
import { PlatformFeatures } from "@/components/foundation/FoundationTiles";
import { CinematicNav } from "@/components/foundation/CinematicNav";
import { ParticleField } from "@/components/foundation/ParticleField";

export const metadata = {
  title: "RetailOS AI | The Future of Retail Intelligence",
  description:
    "An immersive AI operating system for the future of commerce. Neural forecasting, demand intelligence, and inventory signals — unified.",
};

export default function HomePage() {
  return (
    <main className="cinema-root">
      <ParticleField />
      <CinematicNav />
      <HeroScene />
      <PlatformFeatures />
    </main>
  );
}
