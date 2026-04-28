import type { FallingObject, PlayerLandmark } from "./types";

const EMOJIS = ["💣", "🪨", "🔥", "⚡", "❄️", "☄️", "🌪️", "💀"];

// Pose landmark indices for collision (head, shoulders, chest, hips)
const HIT_LANDMARKS = [0, 11, 12, 23, 24, 13, 14, 15, 16];

export function spawnObject(difficulty: number): FallingObject {
  const baseSpeed = 2 + difficulty * 0.5;
  const speedVariation = Math.random() * 2;

  return {
    x: 0.05 + Math.random() * 0.9,
    y: -0.05,
    speed: (baseSpeed + speedVariation) * 0.001,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    size: 30 + Math.random() * 20,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
  };
}

export function updateObjects(
  objects: FallingObject[],
  deltaTime: number
): FallingObject[] {
  return objects
    .map((obj) => ({
      ...obj,
      y: obj.y + obj.speed * deltaTime,
      rotation: obj.rotation + obj.rotationSpeed,
    }))
    .filter((obj) => obj.y < 1.15);
}

export function checkCollisions(
  objects: FallingObject[],
  landmarks: PlayerLandmark[],
  canvasWidth: number,
  canvasHeight: number
): { hit: boolean; remaining: FallingObject[]; hitPoints: Array<{ x: number; y: number; emoji: string }> } {
  if (landmarks.length === 0) return { hit: false, remaining: objects, hitPoints: [] };

  let hit = false;
  const remaining: FallingObject[] = [];
  const hitPoints: Array<{ x: number; y: number; emoji: string }> = [];

  for (const obj of objects) {
    let objHit = false;
    const objX = obj.x * canvasWidth;
    const objY = obj.y * canvasHeight;
    const hitRadius = obj.size * 0.6;

    for (const idx of HIT_LANDMARKS) {
      if (idx >= landmarks.length) continue;
      const lm = landmarks[idx];
      if (lm.visibility < 0.5) continue;

      const lmX = lm.x * canvasWidth;
      const lmY = lm.y * canvasHeight;
      const dist = Math.hypot(objX - lmX, objY - lmY);

      if (dist < hitRadius + 20) {
        objHit = true;
        hit = true;
        hitPoints.push({ x: obj.x, y: obj.y, emoji: obj.emoji });
        break;
      }
    }

    if (!objHit) {
      remaining.push(obj);
    }
  }

  return { hit, remaining, hitPoints };
}

export function drawObjects(
  ctx: CanvasRenderingContext2D,
  objects: FallingObject[],
  width: number,
  height: number
): void {
  for (const obj of objects) {
    ctx.save();
    ctx.translate(obj.x * width, obj.y * height);
    ctx.rotate(obj.rotation);
    ctx.font = `${obj.size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(obj.emoji, 0, 0);
    ctx.restore();
  }
}
