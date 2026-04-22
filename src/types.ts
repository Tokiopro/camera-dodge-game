export interface FallingObject {
  x: number;
  y: number;
  speed: number;
  emoji: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export interface PlayerLandmark {
  x: number;
  y: number;
  visibility: number;
}

export interface GameState {
  status: "idle" | "playing" | "gameover";
  lives: number;
  startTime: number;
  elapsed: number;
  objects: FallingObject[];
  spawnTimer: number;
  difficulty: number;
  landmarks: PlayerLandmark[];
  invincibleUntil: number;
}

export interface RankingEntry {
  name: string;
  score: number;
  timestamp: number;
}
