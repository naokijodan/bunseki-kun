# プライバシーポリシー / Privacy Policy

**ぶんせき君 - eBay分析ツール**

最終更新日: 2025年12月18日

---

## 日本語

### 1. はじめに

「ぶんせき君」（以下、「本拡張機能」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、本拡張機能がどのような情報を収集し、どのように使用するかを説明します。

### 2. 収集する情報

本拡張機能は以下の情報を収集・保存します：

#### 2.1 ローカルに保存されるデータ
- **eBay出品データ**: ユーザーがアップロードしたCSVファイルの内容（Active Listings、Orders）
- **市場データ**: eBay検索結果から取得した商品情報
- **分析結果**: ブランド分類、カテゴリ分類などの分析結果
- **設定情報**: APIキー、シート名、表示設定など
- **認証情報**: ライセンス認証状態

これらのデータはすべて**ユーザーのブラウザ内（chrome.storage.local、IndexedDB）**に保存され、外部サーバーには送信されません。

#### 2.2 外部に送信されるデータ
- **AI分析リクエスト**: AI提案機能を使用する場合、分析対象のデータ（商品タイトル、価格、カテゴリ等）がユーザーが選択したAIサービス（OpenAI、Anthropic Claude、Google Gemini）に送信されます。
- **決済情報**: 有料版を購入する場合、決済処理はStripe経由で行われます。本拡張機能はクレジットカード情報を直接収集・保存しません。

### 3. 情報の使用目的

収集した情報は以下の目的でのみ使用されます：
- eBay出品データの分析と可視化
- 市場データとの比較分析
- AIによる販売戦略の提案
- ユーザー設定の保存と復元
- ライセンス認証の管理

### 4. 情報の共有

本拡張機能は、以下の場合を除き、ユーザーの情報を第三者と共有しません：
- ユーザーがAI分析機能を使用した場合（選択したAIサービスプロバイダーへの送信）
- 法的要求がある場合

### 5. データの保護

- すべてのAPI通信はHTTPS暗号化を使用しています
- APIキーはユーザーのブラウザ内にのみ保存されます
- 外部サーバーへのデータ保存は行いません

### 6. ユーザーの権利

ユーザーは以下の権利を有します：
- **データの削除**: 拡張機能の設定から、保存されたデータをいつでも削除できます
- **拡張機能の削除**: Chromeから拡張機能を削除すると、すべてのローカルデータが削除されます

### 7. 変更について

本プライバシーポリシーは、必要に応じて更新されることがあります。重要な変更がある場合は、拡張機能内で通知します。

### 8. お問い合わせ

プライバシーに関するご質問やご懸念がある場合は、GitHubリポジトリのIssuesページからお問い合わせください。

---

## English

### 1. Introduction

"Bunseki-kun" (hereinafter referred to as "this extension") respects user privacy and is committed to protecting personal information. This Privacy Policy explains what information this extension collects and how it is used.

### 2. Information We Collect

This extension collects and stores the following information:

#### 2.1 Data Stored Locally
- **eBay listing data**: Contents of CSV files uploaded by the user (Active Listings, Orders)
- **Market data**: Product information obtained from eBay search results
- **Analysis results**: Brand classification, category classification, and other analysis results
- **Settings**: API keys, sheet names, display settings, etc.
- **Authentication information**: License authentication status

All of this data is stored **within the user's browser (chrome.storage.local, IndexedDB)** and is not transmitted to external servers.

#### 2.2 Data Transmitted Externally
- **AI analysis requests**: When using the AI suggestion feature, data to be analyzed (product titles, prices, categories, etc.) is sent to the AI service selected by the user (OpenAI, Anthropic Claude, Google Gemini).
- **Payment information**: When purchasing the paid version, payment processing is handled via Stripe. This extension does not directly collect or store credit card information.

### 3. Purpose of Use

The collected information is used only for the following purposes:
- Analysis and visualization of eBay listing data
- Comparative analysis with market data
- AI-powered sales strategy suggestions
- Saving and restoring user settings
- License authentication management

### 4. Information Sharing

This extension does not share user information with third parties except in the following cases:
- When the user uses the AI analysis feature (transmission to the selected AI service provider)
- When required by law

### 5. Data Protection

- All API communications use HTTPS encryption
- API keys are stored only within the user's browser
- No data is stored on external servers

### 6. User Rights

Users have the following rights:
- **Data deletion**: Users can delete stored data at any time from the extension settings
- **Extension removal**: Removing the extension from Chrome will delete all local data

### 7. Changes

This Privacy Policy may be updated as necessary. Users will be notified within the extension of any significant changes.

### 8. Contact

If you have any questions or concerns about privacy, please contact us through the Issues page of the GitHub repository.

---

© 2025 ぶんせき君
