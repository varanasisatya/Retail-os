import { motion } from "framer-motion";

const neuralNodes = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  size: 2 + (index % 3),
  top: `${8 + ((index * 17) % 86)}%`,
  left: `${4 + ((index * 23) % 92)}%`,
  delay: index * 0.13,
}));

const neuralLines = Array.from({ length: 8 }, (_, index) => ({
  id: index,
  top: `${10 + index * 7}%`,
  left: `${(index * 11) % 80}%`,
  width: 110 + index * 24,
  rotate: -18 + index * 7,
  delay: index * 0.18,
}));

export default function NeuralBackground() {
  return (
    <div className="neural-background" aria-hidden="true">
      <div className="neural-grid" />
      <div className="neural-aurora" />
      {neuralLines.map((line) => (
        <motion.span
          className="neural-line"
          animate={{ opacity: [0.05, 0.22, 0.05], x: [0, 18, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: line.delay }}
          key={line.id}
          style={{
            top: line.top,
            left: line.left,
            width: line.width,
            transform: `rotate(${line.rotate}deg)`,
          }}
        />
      ))}
      {neuralNodes.map((node) => (
        <motion.span
          className="neural-node"
          animate={{ opacity: [0.3, 0.9, 0.3], y: [0, -14, 0] }}
          transition={{ duration: 7 + (node.id % 5), repeat: Infinity, delay: node.delay }}
          key={node.id}
          style={{
            width: node.size,
            height: node.size,
            top: node.top,
            left: node.left,
          }}
        />
      ))}
    </div>
  );
}
