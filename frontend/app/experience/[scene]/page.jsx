import { redirect } from "next/navigation";

// Old scaffold slugs (origin, signal, motion, atmosphere) are gone.
// Known valid experience slugs have their own dedicated pages.
// Anything hitting this catch-all gets redirected home.
const EXPERIENCE_ROUTES = {
  dataset:      "/experience/dataset",
  forecast:     "/experience/forecast",
  intelligence: "/experience/intelligence",
};

export default function ScenePage({ params }) {
  const target = EXPERIENCE_ROUTES[params.scene];
  if (target) redirect(target);
  redirect("/");
}
