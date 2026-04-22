import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  query,
  orderByChild,
  limitToLast,
  get,
} from "firebase/database";
import type { RankingEntry } from "./types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
};

let db: ReturnType<typeof getDatabase> | null = null;

function getDb() {
  if (!db) {
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  }
  return db;
}

function isConfigured(): boolean {
  return !!firebaseConfig.databaseURL;
}

export async function saveScore(name: string, score: number): Promise<void> {
  if (!isConfigured()) {
    saveScoreLocal(name, score);
    return;
  }
  try {
    const dbRef = ref(getDb(), "rankings");
    await push(dbRef, {
      name,
      score,
      timestamp: Date.now(),
    });
  } catch {
    saveScoreLocal(name, score);
  }
}

export async function getTopScores(limit = 10): Promise<RankingEntry[]> {
  if (!isConfigured()) {
    return getTopScoresLocal(limit);
  }
  try {
    const dbRef = ref(getDb(), "rankings");
    const q = query(dbRef, orderByChild("score"), limitToLast(limit));
    const snapshot = await get(q);

    const entries: RankingEntry[] = [];
    snapshot.forEach((child) => {
      entries.push(child.val() as RankingEntry);
    });

    return entries.sort((a, b) => b.score - a.score);
  } catch {
    return getTopScoresLocal(limit);
  }
}

function saveScoreLocal(name: string, score: number): void {
  const entries = getLocalEntries();
  entries.push({ name, score, timestamp: Date.now() });
  localStorage.setItem("camera-dodge-rankings", JSON.stringify(entries));
}

function getTopScoresLocal(limit: number): RankingEntry[] {
  return getLocalEntries()
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function getLocalEntries(): RankingEntry[] {
  try {
    return JSON.parse(localStorage.getItem("camera-dodge-rankings") || "[]");
  } catch {
    return [];
  }
}
