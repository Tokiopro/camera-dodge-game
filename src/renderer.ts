import type { FallingObject, PlayerLandmark } from "./types";
import { drawObjects } from "./objects";
import { drawPoseLandmarks } from "./pose";

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  objects: FallingObject[],
  landmarks: PlayerLandmark[],
  isInvincible: boolean
): void {
  const { width, height } = canvas;

  // Mirror camera feed
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();

  // Darken overlay for better visibility
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  ctx.fillRect(0, 0, width, height);

  // Draw pose landmarks (mirrored)
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  if (isInvincible) {
    ctx.globalAlpha = 0.4 + Math.sin(Date.now() * 0.01) * 0.3;
  }
  drawPoseLandmarks(ctx, landmarks, width, height);
  ctx.restore();

  // Draw falling objects (mirrored to match camera)
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  drawObjects(ctx, objects, width, height);
  ctx.restore();
}
