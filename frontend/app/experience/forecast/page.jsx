import { ForecastScene } from "@/components/scenes/ForecastScene";
import { CinematicNav } from "@/components/foundation/CinematicNav";
import { ParticleField } from "@/components/foundation/ParticleField";

export const metadata = {
  title: "RetailOS AI | Temporal Intelligence — Forecast",
  description: "Navigate future retail timelines with AI-powered demand forecasting.",
};

export default function ForecastPage() {
  return (
    <main className="cinema-root">
      <ParticleField />
      <div className="cinema-shell">
        <CinematicNav />
        <ForecastScene />
      </div>
    </main>
  );
}
