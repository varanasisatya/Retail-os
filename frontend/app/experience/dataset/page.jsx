import { DatasetUploadScene } from "@/components/scenes/DatasetUploadScene";
import { CinematicNav } from "@/components/foundation/CinematicNav";
import { ParticleField } from "@/components/foundation/ParticleField";

export const metadata = {
  title: "RetailOS AI | Dataset Intelligence Ingestion",
  description: "Upload your retail dataset to activate the AI forecast engine.",
};

export default function DatasetPage() {
  return (
    <main className="cinema-root">
      <ParticleField />
      <div className="cinema-shell">
        <CinematicNav />
        <DatasetUploadScene />
      </div>
    </main>
  );
}
