# Chrome Web Store 掲載用テキスト

## 拡張機能名
ぶんせき君 - eBay分析ツール

## 短い説明（132文字以内）
eBayからダウンロードしたCSVを分析し、市場データ（CSV・ZIP）との比較・AI提案を行う統合ツール。ブランド・カテゴリ別の売上分析、3つのAI（GPT-4、Claude、Gemini）による販売戦略提案に対応。

## 詳細な説明

### 日本語

ぶんせき君は、eBayセラー向けの総合分析ツールです。

📊 **主な機能**

【自分のデータ分析】
• eBayからダウンロードしたCSVファイル（Active Listings、Orders）を読み込み
• ブランド別・カテゴリ別の出品状況を自動分類
• 出品ペース・販売ペースをグラフで可視化
• Watch数分析で注目商品を特定

【市場データ分析】
• 市場データのCSV・ZIPファイルを読み込み
• 競合の価格帯・ブランド構成を分析
• 保存した市場データから傾向を把握

【市場比較】
• 自分のデータと市場データを比較
• 強み・弱み・ギャップを自動検出
• 改善ポイントを明確化

【AI提案】
• 3つのAI（OpenAI GPT-4、Anthropic Claude、Google Gemini）に対応
• 複数AIの回答を比較して最適な戦略を発見
• 仕入れ提案・価格戦略・トレンド分析

【シート機能】
• 最大10シートで異なる分析を並行管理
• カテゴリ別・シーズン別など用途に合わせて活用

🔒 **プライバシー重視**
• データはすべてお使いのブラウザ内に保存
• 外部サーバーへの送信なし（AI機能使用時を除く。AI機能はご自身のAPIキーで各AIサービスに直接送信）
• eBayやテラピークのページからデータを読み取る機能はありません

💡 **こんな方におすすめ**
• eBayでの売上を伸ばしたいセラー
• 市場分析に時間をかけたくない方
• データに基づいた戦略を立てたい方
• 複数カテゴリを扱うパワーセラー

---

### English

Bunseki-kun is a comprehensive analysis tool for eBay sellers.

📊 **Key Features**

【Your Data Analysis】
• Import CSV files downloaded from eBay (Active Listings, Orders)
• Automatic classification by brand and category
• Visualize listing and sales pace with charts
• Identify popular items through Watch count analysis

【Market Data Analysis】
• Import market data from CSV / ZIP files
• Analyze competitor pricing and brand composition
• Track trends from your saved market data

【Market Comparison】
• Compare your data with market data
• Automatic detection of strengths, weaknesses, and gaps
• Clear identification of improvement points

【AI Suggestions】
• Support for 3 AI services (OpenAI GPT-4, Anthropic Claude, Google Gemini)
• Compare responses from multiple AIs to find optimal strategies
• Sourcing suggestions, pricing strategies, trend analysis

【Sheet Function】
• Manage up to 10 different analyses in parallel
• Use by category, season, or any other purpose

🔒 **Privacy-Focused**
• All data stored within your browser
• No transmission to external servers (except AI features, which call the AI service directly with your own API key)
• The extension does not read data from eBay or Terapeak pages

💡 **Recommended For**
• Sellers looking to increase eBay sales
• Those who don't want to spend time on market analysis
• Those who want data-driven strategies
• Power sellers handling multiple categories

---

## v4.6.1 変更点
- eBayの利用規約（User Agreement Section 3：eBayの許可なくデータ収集・抽出ツールでサービスにアクセスすることの禁止）に配慮し、eBay検索結果・テラピーク画面からデータを読み取る機能をすべて停止
- コンテンツスクリプト（eBayページへの埋め込み）と、eBayサイトへのアクセス権限（host_permissions）を削除
- 不要になった権限（tabs、activeTab）を削除
- ポップアップ上部にお知らせを常時表示。アップデート後に初めて1回だけお知らせページを表示
- 保存済みの市場データは削除されず、閲覧・エクスポート可能。市場データはCSV・ZIP読み込みで引き続き利用可能

## 権限の使用理由（Permissions justification）
- storage：分析データ・設定・ご自身のAPIキーをブラウザ内（chrome.storage.local）に保存するため
- host_permissions https://api.openai.com/* ：ユーザーが選んだ場合に、OpenAIへAI提案のリクエストを送るため
- host_permissions https://api.anthropic.com/* ：同上（Anthropic Claude）
- host_permissions https://generativelanguage.googleapis.com/* ：同上（Google Gemini）
- ※eBayサイトへのアクセス権限、tabs、activeTab、コンテンツスクリプトは使用していません

## カテゴリ
生産性 / Productivity

## 言語
日本語、English

---

## 検索キーワード（参考）
- eBay
- eBay seller
- eBay analysis
- eBay tool
- market research
- competitor analysis
- AI analysis
- sales analytics
- イーベイ
- イーベイ 分析
- 出品管理
- 売上分析
