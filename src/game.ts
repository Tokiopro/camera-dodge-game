import type { GameState } from "./types";
import { spawnObject, updateObjects, checkCollisions } from "./objects";
import { detectPose } from "./pose";
import { renderFrame } from "./renderer";

const MAX_LIVES = 3;
const INITIAL_SPAWN_INTERVAL = 1200;
const MIN_SPAWN_INTERVAL = 300;
const INVINCIBLE_DURATION = 1500;

export function createGameState(): GameState {
  return {
    status: "idle",
    lives: MAX_LIVES,
    startTime: 0,
    elapsed: 0,
    objects: [],
    spawnTimer: 0,
    difficulty: 1,
    landmarks: [],
    invincibleUntil: 0,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    status: "playing",
    lives: MAX_LIVES,
    startTime: performance.now(),
    elapsed: 0,
    objects: [],
    spawnTimer: 0,
    difficulty: 1,
    landmarks: [],
    invincibleUntil: 0,
  };
}

export function gameLoop(
  state: GameState,
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  now: number,
  deltaTime: number,
  onLifeLost: () => void,
  onGameOver: (score: number) => void
): GameState {
  if (state.status !== "playing") return state;

  let newState = { ...state };

  // Update elapsed time
  newState.elapsed = (now - newState.startTime) / 1000;

  // Increase difficulty over time
  newState.difficulty = 1 + newState.elapsed / 15;

  // Detect pose
  newState.landmarks = detectPose(video, Math.round(now));

  // Spawn objects
  newState.spawnTimer += deltaTime;
  const spawnInterval = Math.max(
    MIN_SPAWN_INTERVAL,
    INITIAL_SPAWN_INTERVAL - newState.difficulty * 80
  );

  if (newState.spawnTimer >= spawnInterval) {
    newState.spawnTimer = 0;
    newState.objects = [...newState.objects, spawnObject(newState.difficulty)];

    // Spawn extra objects at higher difficulty
    if (newState.difficulty > 3 && Math.random() < 0.3) {
      newState.objects = [...newState.objects, spawnObject(newState.difficulty)];
    }
  }

  // Update objects
  newState.objects = updateObjects(newState.objects, deltaTime);

  // Check collisions (only if not invincible)
  const isInvincible = now < newState.invincibleUntil;
  if (!isInvincible) {
    const { hit, remaining } = checkCollisions(
      newState.objects,
      newState.landmarks,
      canvas.width,
      canvas.height
    );

    if (hit) {
      newState.lives -= 1;
      newState.objects = remaining;
      newState.invincibleUntil = now + INVINCIBLE_DURATION;
      onLifeLost();

      if (newState.lives <= 0) {
        newState.status = "gameover";
        const score = Math.round(newState.elapsed * 10) / 10;
        onGameOver(score);
        return newState;
      }
    }
  }

  // Render
  renderFrame(
    ctx,
    video,
    canvas,
    newState.objects,
    newState.landmarks,
    isInvincible
  );

  return newState;
}
