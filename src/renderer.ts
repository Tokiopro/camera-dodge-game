import type { FallingObject, PlayerLandmark, HitEffect } from "./types";
import { drawObjects } from "./objects";

const EFFECT_DURATION = 600;

function drawHitEffects(
  ctx: CanvasRenderingContext2D,
  effects: HitEffect[],
  width: number,
  height: number,
  now: number
): void {
  for (const effect of effects) {
    const age = now - effect.createdAt;
    const progress = age / EFFECT_DURATION;
    if (progress >= 1) continue;

    const cx = effect.x * width;
    const cy = effect.y * height;

    // Expanding ring
    const radius = 20 + progress * 60;
    const alpha = 1 - progress;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 80, 80, ${alpha})`;
    ctx.lineWidth = 3 - progress * 2;
    ctx.stroke();

    // Second ring (delayed, larger)
    if (progress > 0.15) {
      const p2 = (progress - 0.15) / 0.85;
      const r2 = 10 + p2 * 80;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 200, 60, ${(1 - p2) * 0.6})`;
      ctx.lineWidth = 2 - p2 * 1.5;
      ctx.stroke();
    }

    // Flash emoji at impact point (scales up, fades out)
    const scale = 1 + progress * 0.5;
    const emojiAlpha = 1 - progress * progress;
    ctx.save();
    ctx.globalAlpha = emojiAlpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.font = "40px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(effect.emoji, 0, 0);
    ctx.restore();
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  objects: FallingObject[],
  landmarks: PlayerLandmark[],
  isInvincible: boolean,
  hitEffects: HitEffect[]
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

  // Invincibility flash effect
  if (isInvincible) {
    const alpha = 0.05 + Math.sin(Date.now() * 0.01) * 0.05;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw falling objects (mirrored to match camera)
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  drawObjects(ctx, objects, width, height);
  ctx.restore();

  // Draw hit effects (mirrored to match camera)
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  drawHitEffects(ctx, hitEffects, width, height, performance.now());
  ctx.restore();
}
