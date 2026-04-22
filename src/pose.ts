import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import type { PlayerLandmark } from "./types";

let poseLandmarker: PoseLandmarker | null = null;

export async function initPose(): Promise<void> {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numPoses: 1,
  });
}

export function detectPose(
  video: HTMLVideoElement,
  timestamp: number
): PlayerLandmark[] {
  if (!poseLandmarker) return [];

  const result = poseLandmarker.detectForVideo(video, timestamp);
  if (!result.landmarks || result.landmarks.length === 0) return [];

  return result.landmarks[0].map((lm) => ({
    x: lm.x,
    y: lm.y,
    visibility: lm.visibility ?? 0,
  }));
}

export function drawPoseLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: PlayerLandmark[],
  width: number,
  height: number
): void {
  if (landmarks.length === 0) return;

  ctx.fillStyle = "rgba(0, 255, 128, 0.6)";
  for (const lm of landmarks) {
    if (lm.visibility < 0.5) continue;
    ctx.beginPath();
    ctx.arc(lm.x * width, lm.y * height, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
