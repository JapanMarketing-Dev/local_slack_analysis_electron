# Slack Export Analyzer (Electron App)

本アプリケーションは、Slackのエクスポートデータを統合し、Google Gemini 2.5 Pro APIを利用して分析するローカルデスクトップアプリです。

---

## 🚀 概要

- Slackの複数のエクスポートデータを一括で統合し、1つのデータファイルにまとめる
- 統合したデータをGoogle Gemini APIで分析
- Electronベースで完全ローカル動作（Gemini API呼び出し時のみインターネット接続が必要）
- WindowsおよびMacで動作

---

## 📂 ファイル構成

```
SlackExportAnalyzer/
├── package.json
├── main.js                  # Electronメインプロセス
├── preload.js               # Electronプリロードスクリプト
├── renderer/
│   ├── index.html
│   ├── App.jsx              # Reactエントリーポイント
│   ├── components/
│   │   ├── Home.jsx         # メイン画面
│   │   └── Settings.jsx     # 設定画面（Gemini API Key）
│   └── utils/
│       ├── fileProcessor.js # ファイル統合処理
│       └── geminiApi.js     # Gemini API 呼び出し処理
└── assets/
    └── icon.png
```

---

## 🖥️ 画面構成

### 1. ホーム画面（Home）
- Slackエクスポートファイル（ZIPまたはフォルダ）選択
- 統合処理実行ボタン
- Gemini分析実行ボタン
- 分析結果表示エリア

### 2. 設定画面（Settings）
- Google Gemini API Key入力・保存

---

## 🛠️ 機能一覧

### Slackデータ統合
- 特定フォルダ内にあるZIP形式または解凍済みのSlackエクスポートデータをJSON形式で統合
- 統合結果を1つのJSONファイルとしてローカル保存

### Gemini分析
- 統合したSlackデータをGemini APIに送信し、分析結果を取得
- 結果を画面に表示

### 設定
- Gemini API Keyの登録・変更
- Keyはローカルストレージに暗号化せずにシンプルに保存（完全ローカル想定）

---

## ⚙️ 使用技術
- Electron
- React (フロントエンド)
- Node.js (バックエンド処理)
- Google Gemini API（外部）

---

## 📌 利用手順

1. Electron環境セットアップ
2. 依存関係インストール (`npm install`)
3. 設定画面でGemini API Key設定
4. ホーム画面でSlackデータを選択し、統合・分析を実行

---

## 📦 ビルド方法

```bash
npm run build
```

---

©️ 2025 Slack Export Analyzer

