# 📷 Camera Dodge Game

カメラに映った自分の体を動かして、上から降ってくるオブジェクトを避けるARブラウザゲーム。

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose-00C853)

## 遊び方

1. ブラウザでゲームを開く
2. カメラへのアクセスを許可
3. **START** を押す
4. 体を動かして落下物（💣🪨🔥⚡❄️☄️）を避ける！
5. 当たるとライフ（♥♥♥）が減る
6. ライフが0になったらゲームオーバー
7. 生存秒数でランキング登録

## デモ

> カメラ付きのPC/スマホブラウザ（Chrome推奨）でアクセスしてください。

## 技術スタック

| 技術 | 用途 |
|------|------|
| **TypeScript** | 型安全な開発 |
| **Vite** | 高速バンドラー |
| **MediaPipe Pose** | 全身33ランドマーク検出 |
| **Canvas 2D** | カメラ映像 + オーバーレイ描画 |
| **Firebase Realtime DB** | グローバルランキング |

## アーキテクチャ

```
カメラ映像 → MediaPipe Pose → 33ランドマーク座標
                                    ↓
落下オブジェクト生成 → 当たり判定 → ライフ管理
                                    ↓
Canvas描画（カメラ + ランドマーク + 落下物 + HUD）
                                    ↓
ゲームオーバー → Firebase ランキング登録
```

## セットアップ

### 前提条件

- Node.js 18+
- カメラ付きデバイス

### インストール

```bash
git clone https://github.com/tokiohata/camera-dodge-game.git
cd camera-dodge-game
npm install
```

### Firebase設定（ランキング機能を使う場合）

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Realtime Database を有効化
3. `.env` ファイルを作成:

```bash
cp .env.example .env
```

4. Firebase の設定値を `.env` に記入:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

5. Realtime Database のルール設定:

```json
{
  "rules": {
    "rankings": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score"]
    }
  }
}
```

> Firebase未設定の場合は自動的にlocalStorageにフォールバックします。

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### ビルド

```bash
npm run build
```

## ゲーム仕様

| 項目 | 値 |
|------|------|
| ライフ | 3 |
| 落下物 | 💣🪨🔥⚡❄️☄️🌪️💀 |
| 当たり判定 | 頭・肩・胸・腰（Poseランドマーク） |
| 難易度 | 時間経過で落下速度UP + 出現頻度UP |
| 被弾後無敵 | 1.5秒 |
| スコア | 生存秒数（小数点1桁） |

## ライセンス

MIT
