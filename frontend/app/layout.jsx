import "./globals.css";
import { RetailDataProvider } from "@/lib/retailContext";
import { SmoothScrollProvider } from "@/components/foundation/SmoothScrollProvider";
import { EnvironmentEngine } from "@/components/foundation/EnvironmentEngine";
import { CursorReactor } from "@/components/foundation/CursorReactor";
import { ScanlineOverlay } from "@/components/foundation/ScanlineOverlay";
import { AICommandCenter } from "@/components/scenes/AICommandCenter";
import AICommandAgentDrawer from "@/components/scenes/AICommandAgentDrawer";
import { BootGate } from "@/components/foundation/BootGate";
import { ErrorBoundary } from "@/components/foundation/ErrorBoundary";

export const metadata = {
  title: "RetailOS AI | Cinematic Retail Intelligence",
  description: "An immersive AI operating system for the future of commerce. Neural forecasting, demand intelligence, and inventory signals — unified.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <RetailDataProvider>
            <SmoothScrollProvider>
              {/* Global environment systems */}
              <EnvironmentEngine />
              <CursorReactor />
              <ScanlineOverlay />

              {/* Boot gate wraps all content */}
              <BootGate>
                {children}
                {/* AI Command Center — available on all pages */}
                <AICommandCenter />
                {/* AI Command Agent Drawer — available on all pages */}
                <AICommandAgentDrawer />
              </BootGate>
            </SmoothScrollProvider>
          </RetailDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
