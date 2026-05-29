const items = [
  "LIVE: Gaming demand rising in Hyderabad",
  "SIGNAL: AI wearables expected to dominate Q4",
  "GROWTH: Beauty category up 18%",
  "AI: Inventory expansion recommended for metro stores",
  "RISK: Replenishment window tightening on premium SKUs",
];

export default function AITicker() {
  return (
    <section className="ai-ticker" aria-label="Realtime AI ticker">
      <div className="ticker-track">
        {[...items, ...items].map((item, index) => (
          <span key={`${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  );
}
