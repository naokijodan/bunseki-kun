# ぶんせき君 開発ルール

## ストレージ
- **必ず `chrome.storage.local` を使う**（`sync` は使わない）
- 保存と読み込みで同じストレージを参照しているか常に確認

## キー名
APIキーのキー名は以下で統一：
- `openaiApiKey`
- `claudeApiKey`
- `geminiApiKey`

## コード変更時の確認事項
1. 設定の保存・読み込みを変更したら、options.js と popup.js 両方を確認
2. 新しいストレージキーを追加したら、全ファイルで同じ名前を使う
3. chrome.storage を使う際は必ず `local` か確認
