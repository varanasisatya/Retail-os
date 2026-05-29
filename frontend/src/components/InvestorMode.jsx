import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Brain, Rocket, X } from "lucide-react";

const investorHighlights = [
  { label: "Projected ARR signal", value: "₹18.4Cr", detail: "Based on multi-region demand expansion" },
  { label: "Inventory efficiency", value: "+27%", detail: "Reorder queue reduces stockout exposure" },
  { label: "AI decision velocity", value: "4.8x", detail: "Faster category and region response loops" },
];

export default function InvestorMode() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        className="investor-mode-button"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.97 }}
        type="button"
      >
        <Rocket size={17} />
        <span>ENTER INVESTOR MODE</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="investor-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="investor-modal"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="investor-mode-title"
            >
              <button className="investor-close" onClick={() => setIsOpen(false)} type="button">
                <X size={18} />
              </button>

              <div className="investor-hero">
                <div className="investor-orbit">
                  <Rocket size={30} />
                </div>
                <p className="eyebrow">Executive simulation</p>
                <h2 id="investor-mode-title">Investor Mode</h2>
                <p>
                  RetailOS AI is positioned as a real-time retail intelligence layer for demand
                  forecasting, inventory optimization, and category growth decisions.
                </p>
              </div>

              <div className="investor-grid">
                {investorHighlights.map((item) => (
                  <article className="investor-metric" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <p>{item.detail}</p>
                  </article>
                ))}
              </div>

              <div className="investor-footer">
                <div>
                  <Brain size={18} />
                  <span>AI narrative engine active</span>
                </div>
                <div>
                  <BarChart3 size={18} />
                  <span>Forecast, trends, and inventory signals synchronized</span>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
