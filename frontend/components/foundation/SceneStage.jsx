"use client";

import { motion } from "framer-motion";
import { ArrowRight, Orbit } from "lucide-react";
import { motionTimings, sceneMotion } from "@/lib/motion";

export function SceneStage({ scene }) {
  return (
    <section className="scene-stage" id={scene.slug}>
      <motion.div
        animate="visible"
        className="scene-copy"
        initial="hidden"
        variants={sceneMotion.reveal}
        transition={motionTimings.entrance}
      >
        <p className="scene-kicker">
          <Orbit size={16} />
          {scene.eyebrow}
        </p>
        <h1 className="scene-title">
          {scene.title.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h1>
        <p className="scene-description">{scene.description}</p>
        <div className="scene-actions">
          <a className="cinema-button primary" href="/experience/signal">
            Begin Scene Map
            <ArrowRight size={17} />
          </a>
          <a className="cinema-button" href="#foundation-system">
            View Foundation
          </a>
        </div>
      </motion.div>

      <motion.div animate={sceneMotion.float} className="scene-card" transition={motionTimings.ambient}>
        <div className="scene-orbit" />
        <div className="scene-orbit" />
        <div className="scene-core" />
        <div className="scene-stat">
          <span>{scene.metricLabel}</span>
          <strong>{scene.metric}</strong>
        </div>
      </motion.div>
    </section>
  );
}
