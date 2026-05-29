export const motionTimings = {
  gentle: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  entrance: { duration: 1.05, ease: [0.16, 1, 0.3, 1] },
  ambient: { duration: 16, repeat: Infinity, ease: "easeInOut" },
};

export const sceneMotion = {
  reveal: {
    hidden: { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0 },
  },
  float: {
    y: [0, -16, 0],
    rotate: [0, 1.5, 0],
  },
  drift: {
    x: [0, 22, 0],
    y: [0, -18, 0],
  },
};
