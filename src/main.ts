import { initCamera } from "./camera";
import { initPose } from "./pose";
import { createGameState, startGame, gameLoop } from "./game";
import { saveScore, getTopScores } from "./ranking";

const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const hud = document.getElementById("hud")!;
const livesEl = document.getElementById("lives")!;
const timerEl = document.getElementById("timer")!;
const overlay = document.getElementById("overlay")!;
const startScreen = document.getElementById("start-screen")!;
const gameoverScreen = document.getElementById("gameover-screen")!;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const retryBtn = document.getElementById("retry-btn") as HTMLButtonElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const nameInput = document.getElementById("name-input") as HTMLInputElement;
const finalScoreEl = document.getElementById("final-score")!;
const rankingList = document.getElementById("ranking-list")!;
const loadingStatus = document.getElementById("loading-status")!;

const video = document.createElement("video");
video.playsInline = true;
video.muted = true;

let state = createGameState();
let lastTime = 0;
let finalScore = 0;

function resizeCanvas(): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function updateHud(): void {
  livesEl.textContent = "♥".repeat(state.lives) + "♡".repeat(3 - state.lives);
  timerEl.textContent = `${state.elapsed.toFixed(1)}s`;
}

function showScreen(screen: "start" | "gameover" | "none"): void {
  startScreen.classList.toggle("visible", screen === "start");
  gameoverScreen.classList.toggle("visible", screen === "gameover");
  overlay.classList.toggle("active", screen !== "none");
  hud.style.display = screen === "none" ? "flex" : "none";
}

async function renderRanking(): Promise<void> {
  const scores = await getTopScores(10);
  rankingList.innerHTML = scores
    .map(
      (entry, i) =>
        `<li><span class="rank-num">${i + 1}.</span><span class="rank-name">${escapeHtml(entry.name)}</span><span class="rank-score">${entry.score.toFixed(1)}s</span></li>`
    )
    .join("");
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function onLifeLost(): void {
  // Flash screen red
  canvas.style.boxShadow = "inset 0 0 100px rgba(255, 0, 0, 0.5)";
  setTimeout(() => {
    canvas.style.boxShadow = "none";
  }, 200);
}

function onGameOver(score: number): void {
  finalScore = score;
  finalScoreEl.textContent = `${score.toFixed(1)}s`;
  showScreen("gameover");
  renderRanking();
}

function tick(now: number): void {
  const deltaTime = lastTime ? now - lastTime : 16;
  lastTime = now;

  if (state.status === "playing") {
    state = gameLoop(state, video, canvas, ctx, now, deltaTime, onLifeLost, onGameOver);
    updateHud();
  }

  requestAnimationFrame(tick);
}

async function init(): Promise<void> {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  loadingStatus.textContent = "カメラ起動中...";
  try {
    await initCamera(video);
  } catch (e) {
    loadingStatus.textContent = "⚠️ カメラにアクセスできません";
    return;
  }

  loadingStatus.textContent = "AI モデル読込中...";
  try {
    await initPose();
  } catch (e) {
    loadingStatus.textContent = "⚠️ Poseモデルの読み込みに失敗";
    return;
  }

  loadingStatus.textContent = "準備完了！";
  startBtn.disabled = false;

  startBtn.addEventListener("click", () => {
    state = startGame(state);
    showScreen("none");
    lastTime = 0;
  });

  retryBtn.addEventListener("click", () => {
    state = startGame(state);
    showScreen("none");
    lastTime = 0;
  });

  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim() || "名無し";
    saveBtn.disabled = true;
    saveBtn.textContent = "保存中...";
    await saveScore(name, finalScore);
    await renderRanking();
    saveBtn.textContent = "✓ 登録済み";
  });

  requestAnimationFrame(tick);
}

init();
