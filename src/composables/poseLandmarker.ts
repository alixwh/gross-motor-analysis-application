import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";

export const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.6/wasm"
  );
  let landmarker = undefined;
  await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  }).then((land) => {
    landmarker = land;
  });
  return landmarker;
};
