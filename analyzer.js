/**
 * eBay分析ロジック
 * ぶんせき君 v2.1.2 - 統合版
 */

class EbayAnalyzer {
  constructor() {
    this.customBrandRules = {}; // AI学習したカスタムブランドルール
    this.reset();
  }

  /**
   * カスタムブランドルールをストレージから読み込み
   */
  async loadCustomBrandRules() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const data = await chrome.storage.local.get(['customBrandRules']);
      this.customBrandRules = data.customBrandRules || {};
      console.log('カスタムブランドルール読み込み:', Object.keys(this.customBrandRules).length, '件');
      // デバッグ: 登録されているブランドを表示
      if (Object.keys(this.customBrandRules).length > 0) {
        console.log('登録ブランド一覧:', Object.keys(this.customBrandRules).slice(0, 10));
      }
    }
  }

  reset() {
    this.activeListings = [];
    this.soldItems = [];
    this.results = {
      summary: {
        totalActive: 0,
        totalSold: 0,
        totalWatchers: 0,
        daysSinceLastListing: null,
        lastListingDate: null
      },
      listingPace: [],
      byBrand: {},
      byCategory: {},
      watchRanking: [],
      brandPerformance: [],
      alerts: [],
      // 市場比較用データ
      strongBrands: [],      // 自分が強いブランド
      opportunityBrands: [], // チャンスブランド
      pricingAlerts: {}      // 価格アラート
    };
  }

  /**
   * eBay日付文字列をDateオブジェクトに変換
   * 形式: "Jun-26-25 15:27:17 PDT" または "Dec-14-25"
   */
  parseEbayDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return null;

    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    try {
      // "Jun-26-25 15:27:17 PDT" または "Dec-14-25" 形式
      const parts = dateStr.trim().split(' ');
      const datePart = parts[0];
      const dateMatch = datePart.match(/^([A-Za-z]{3})-(\d{1,2})-(\d{2})$/);

      if (dateMatch) {
        const month = months[dateMatch[1]];
        const day = parseInt(dateMatch[2], 10);
        let year = parseInt(dateMatch[3], 10);
        year = year < 50 ? 2000 + year : 1900 + year;

        const date = new Date(year, month, day);
        return date;
      }
    } catch (e) {
      console.error('Date parse error:', dateStr, e);
    }

    return null;
  }

  /**
   * 価格文字列を数値に変換
   * 形式: "$29.99" など
   */
  parsePrice(priceStr) {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * タイトルからブランドを抽出
   * 1. 組み込みのBRAND_PATTERNSを優先
   * 2. カスタムルール（AI学習）を参照
   */
  extractBrand(title) {
    if (!title) return null;

    // 1. 組み込みのBRAND_PATTERNSで判定
    for (const rule of BRAND_PATTERNS) {
      if (rule.pattern.test(title)) {
        return rule.brand;
      }
    }

    // 2. カスタムルール（AI学習）で判定
    const titleLower = title.toLowerCase();
    for (const [brandKey, rule] of Object.entries(this.customBrandRules)) {
      if (rule.keywords && rule.keywords.length > 0) {
        for (const keyword of rule.keywords) {
          const keywordLower = keyword.toLowerCase();
          // 大文字小文字を無視してキーワードを含むかチェック
          if (titleLower.includes(keywordLower)) {
            return rule.brand;
          }
        }
      }
    }

    return null;
  }

  /**
   * 正規表現のエスケープ
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * タイトルからカテゴリを抽出（キーワードマッチング）
   */
  extractCategoryFromTitle(title) {
    if (!title || typeof CATEGORY_RULES === 'undefined') return null;

    const titleLower = title.toLowerCase();
    let bestMatch = null;
    let highestPriority = -1;

    for (const [category, rules] of Object.entries(CATEGORY_RULES)) {
      const priority = rules.priority || 10;

      for (const keyword of rules.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (titleLower.includes(keywordLower)) {
          if (priority > highestPriority) {
            highestPriority = priority;
            bestMatch = category;
          }
          break; // このカテゴリでマッチしたら次のカテゴリへ
        }
      }
    }

    return bestMatch;
  }

  /**
   * ブランドパターンからカテゴリを取得
   */
  extractCategoryFromBrand(title) {
    if (!title) return null;

    for (const rule of BRAND_PATTERNS) {
      if (rule.pattern.test(title) && rule.category) {
        return rule.category;
      }
    }

    return null;
  }

  /**
   * Active Listings CSVをパース
   */
  parseActiveListingsCsv(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // ヘッダー解析
    const headers = this.parseCsvLine(lines[0]);
    const titleIdx = this.findColumnIndex(headers, ['Title', 'Item title']);
    const startDateIdx = this.findColumnIndex(headers, ['Start date', 'Listed date']);
    const watchersIdx = this.findColumnIndex(headers, ['Watchers', 'Watch count']);
    const priceIdx = this.findColumnIndex(headers, ['Current price', 'Price', 'Buy It Now price']);
    const categoryIdx = this.findColumnIndex(headers, ['eBay category 1 name', 'Category', 'Primary category']);
    const skuIdx = this.findColumnIndex(headers, ['Custom label (SKU)', 'Custom label', 'SKU']);

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const cols = this.parseCsvLine(lines[i]);
      const title = cols[titleIdx] || '';
      const startDate = this.parseEbayDate(cols[startDateIdx]);
      const watchers = parseInt(cols[watchersIdx], 10) || 0;
      const price = this.parsePrice(cols[priceIdx]);
      let category = cols[categoryIdx] || '';
      const sku = cols[skuIdx] || '';
      const brand = this.extractBrand(title);

      // eBayカテゴリが空または不明な場合、タイトルから判定
      if (!category || category === '' || category === '(不明)') {
        // まずキーワードマッチでカテゴリを判定（より正確）
        category = this.extractCategoryFromTitle(title);
        // キーワードでマッチしなければブランドパターンから取得
        if (!category) {
          category = this.extractCategoryFromBrand(title);
        }
      }

      items.push({
        title,
        startDate,
        watchers,
        price,
        category: category || '(不明)',
        sku,
        brand
      });
    }

    return items;
  }

  /**
   * Orders CSVをパース
   */
  parseOrdersCsv(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];

    // ヘッダー行を探す（最初の空でない行、または"Sales Record Number"を含む行）
    let headerLineIdx = 0;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.includes('Sales Record Number') || line.includes('Item Title') || line.includes('Item title')) {
        headerLineIdx = i;
        break;
      }
      // 空行やカンマだけの行はスキップ
      if (line === '' || /^,+$/.test(line)) {
        continue;
      }
    }

    // ヘッダー解析
    const headers = this.parseCsvLine(lines[headerLineIdx]);
    const titleIdx = this.findColumnIndex(headers, ['Item Title', 'Item title', 'Title']);
    const saleDateIdx = this.findColumnIndex(headers, ['Sale Date', 'Sale date', 'Paid On Date', 'Paid on date', 'Date']);
    const soldForIdx = this.findColumnIndex(headers, ['Sold For', 'Sold for', 'Total Price', 'Total price', 'Price']);
    const skuIdx = this.findColumnIndex(headers, ['Custom Label', 'Custom label', 'Custom label (SKU)', 'SKU']);
    const quantityIdx = this.findColumnIndex(headers, ['Quantity', 'Qty']);

    console.log('Orders CSV Headers:', headers);
    console.log('Title column index:', titleIdx, 'Sale date index:', saleDateIdx, 'Sold for index:', soldForIdx);

    const items = [];
    for (let i = headerLineIdx + 1; i < lines.length; i++) {
      if (lines[i].trim() === '' || /^,+$/.test(lines[i].trim())) continue;

      const cols = this.parseCsvLine(lines[i]);

      // 空行やヘッダー直後の空データ行をスキップ
      if (cols.length < 5) continue;
      if (!cols[titleIdx] || cols[titleIdx].trim() === '') continue;

      const title = cols[titleIdx] || '';
      const saleDate = this.parseEbayDate(cols[saleDateIdx]);
      const soldFor = this.parsePrice(cols[soldForIdx]);
      const sku = cols[skuIdx] || '';
      const quantity = parseInt(cols[quantityIdx], 10) || 1;

      // タイトルが空でない場合のみ追加
      if (title.trim()) {
        const brand = this.extractBrand(title);
        // カテゴリをタイトルから判定（キーワードマッチ優先）
        let category = this.extractCategoryFromTitle(title);
        if (!category) {
          category = this.extractCategoryFromBrand(title);
        }

        items.push({
          title,
          saleDate,
          soldFor,
          sku,
          quantity,
          brand,
          category: category || '(不明)'
        });
      }
    }

    console.log('Parsed orders:', items.length, 'items');
    if (items.length > 0) {
      console.log('Sample item:', items[0]);
    }

    return items;
  }

  /**
   * CSVの1行をパース（ダブルクォート対応）
   */
  parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }

  /**
   * カラム名からインデックスを検索
   */
  findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
      const idx = headers.findIndex(h =>
        h.toLowerCase().trim() === name.toLowerCase()
      );
      if (idx !== -1) return idx;
    }
    return -1;
  }

  /**
   * メイン分析処理
   */
  analyze(activeListings, soldItems) {
    this.activeListings = activeListings || [];
    this.soldItems = soldItems || [];

    // 基本集計
    this.calculateSummary();

    // 出品ペース分析
    this.calculateListingPace();

    // ブランド別分析
    this.calculateBrandPerformance();

    // カテゴリ別分析
    this.calculateCategoryStats();

    // Watch数ランキング
    this.calculateWatchRanking();

    // 強み・弱み分析
    this.calculateStrengthsWeaknesses();

    // アラート生成
    this.generateAlerts();

    // Content Scriptへデータを共有
    this.saveToStorage();

    return this.results;
  }

  /**
   * 強み・弱み分析（市場比較用）
   */
  calculateStrengthsWeaknesses() {
    const performance = this.results.brandPerformance;

    // 強いブランド: 売上率が高い（50%以上）かつ販売実績あり
    this.results.strongBrands = performance
      .filter(b => {
        const sellRate = parseFloat(b.sellThroughRate);
        return sellRate >= 50 && b.sold >= 2 && b.brand !== '(不明)';
      })
      .map(b => b.brand);

    // 弱いブランド（見直し推奨）: 出品多いが売上率低い
    this.results.weakBrands = performance
      .filter(b => {
        const sellRate = parseFloat(b.sellThroughRate);
        return sellRate < 20 && b.active >= 5 && b.brand !== '(不明)';
      })
      .map(b => b.brand);
  }

  /**
   * 市場データと比較分析
   */
  analyzeMarketComparison(marketData) {
    if (!marketData || !marketData.items) return;

    const marketBrands = {};

    // 市場データを集計
    for (const item of marketData.items) {
      if (!item.brand) continue;

      if (!marketBrands[item.brand]) {
        marketBrands[item.brand] = {
          count: 0,
          totalPrice: 0,
          sold: 0
        };
      }

      marketBrands[item.brand].count++;
      if (item.price) {
        marketBrands[item.brand].totalPrice += item.price;
      }
      if (item.sold) {
        marketBrands[item.brand].sold += item.sold;
      }
    }

    // 自分のデータと比較
    const pricingAlerts = {};
    const opportunityBrands = [];

    for (const [brand, marketStats] of Object.entries(marketBrands)) {
      const myBrand = this.results.byBrand[brand];

      // 市場で売れているが自分は出品していない → チャンス
      if (marketStats.sold > 0 && (!myBrand || myBrand.active === 0)) {
        opportunityBrands.push(brand);
      }

      // 価格比較
      if (myBrand && myBrand.active > 0 && marketStats.count > 0) {
        const myAvgPrice = this.calculateAveragePrice(brand);
        const marketAvgPrice = marketStats.totalPrice / marketStats.count;

        if (myAvgPrice && marketAvgPrice) {
          const diff = ((myAvgPrice - marketAvgPrice) / marketAvgPrice) * 100;

          // 20%以上の差がある場合はアラート
          if (Math.abs(diff) >= 20) {
            pricingAlerts[brand] = {
              myAvg: myAvgPrice,
              marketAvg: marketAvgPrice,
              diff: diff
            };
          }
        }
      }
    }

    this.results.opportunityBrands = opportunityBrands;
    this.results.pricingAlerts = pricingAlerts;

    // 更新したデータをStorageに保存
    this.saveToStorage();

    return {
      opportunityBrands,
      pricingAlerts
    };
  }

  /**
   * ブランドの平均価格を計算
   */
  calculateAveragePrice(brand) {
    const items = this.activeListings.filter(item =>
      item.brand === brand && item.price > 0
    );

    if (items.length === 0) return null;

    const total = items.reduce((sum, item) => sum + item.price, 0);
    return total / items.length;
  }

  /**
   * Content Script用にStorageにデータを保存
   */
  async saveToStorage() {
    const bunsekiData = {
      // ブランド情報（content scriptでハイライト判定に使用）
      brands: {},
      // 出品中タイトル一覧
      activeListings: this.activeListings.map(item => item.title),
      // 強いブランド
      strongBrands: this.results.strongBrands,
      // 弱いブランド
      weakBrands: this.results.weakBrands,
      // チャンスブランド
      opportunityBrands: this.results.opportunityBrands,
      // 価格アラート
      pricingAlerts: this.results.pricingAlerts,
      // 最終更新日時
      updatedAt: new Date().toISOString()
    };

    // ブランド別データを整形
    const brandPerformance = {};
    for (const brand of this.results.brandPerformance) {
      if (brand.brand === '(不明)') continue;

      const brandData = {
        active: brand.active,
        sold: brand.sold,
        sellRate: parseFloat(brand.sellThroughRate),
        avgWatchers: parseFloat(brand.avgWatchers),
        revenue: brand.revenue
      };

      bunsekiData.brands[brand.brand] = brandData;
      brandPerformance[brand.brand] = brandData;
    }

    // analysisData形式でも保存（popup.js互換）
    const analysisData = {
      ...bunsekiData,
      brandPerformance
    };

    // Chrome Storageに保存
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({
        bunsekiData,
        analysisData,
        lastAnalysisTime: new Date().toISOString()
      });
      console.log('ぶんせき君: データをStorageに保存しました', bunsekiData);
    }
  }

  /**
   * Storageからデータを読み込み
   */
  async loadFromStorage() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const data = await chrome.storage.local.get(['bunsekiData']);
      return data.bunsekiData || null;
    }
    return null;
  }

  /**
   * 基本集計
   */
  calculateSummary() {
    const summary = this.results.summary;

    summary.totalActive = this.activeListings.length;
    summary.totalSold = this.soldItems.reduce((sum, item) => sum + item.quantity, 0);
    summary.totalWatchers = this.activeListings.reduce((sum, item) => sum + item.watchers, 0);

    // 最終出品日を特定
    let latestDate = null;
    for (const item of this.activeListings) {
      if (item.startDate && (!latestDate || item.startDate > latestDate)) {
        latestDate = item.startDate;
      }
    }

    if (latestDate) {
      summary.lastListingDate = latestDate;
      const now = new Date();
      const diffTime = now - latestDate;
      summary.daysSinceLastListing = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  /**
   * 出品・販売ペース（指定日数分の日別データ）
   * @param {number} days - 分析期間（30, 60, 90）
   */
  calculateListingPace(days = 30) {
    const pace = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999); // 今日の終わりに設定
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0); // 開始日の最初に設定

    // 指定日数分の日付を生成
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      pace.push({
        date: dateStr,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        listings: 0,
        sales: 0
      });
    }

    // 出品数をカウント
    for (const item of this.activeListings) {
      if (item.startDate) {
        // Dateオブジェクトに変換（文字列の場合も対応）
        const itemDate = item.startDate instanceof Date ? item.startDate : new Date(item.startDate);
        if (!isNaN(itemDate.getTime()) && itemDate >= startDate && itemDate <= now) {
          const dateStr = itemDate.toISOString().split('T')[0];
          const paceItem = pace.find(p => p.date === dateStr);
          if (paceItem) {
            paceItem.listings++;
          }
        }
      }
    }

    // 販売数をカウント
    console.log('販売データ件数:', this.soldItems.length);
    let salesCounted = 0;
    for (const item of this.soldItems) {
      if (item.saleDate) {
        // Dateオブジェクトに変換（文字列の場合も対応）
        const itemDate = item.saleDate instanceof Date ? item.saleDate : new Date(item.saleDate);
        if (!isNaN(itemDate.getTime()) && itemDate >= startDate && itemDate <= now) {
          const dateStr = itemDate.toISOString().split('T')[0];
          const paceItem = pace.find(p => p.date === dateStr);
          if (paceItem) {
            const qty = item.quantity || 1;
            paceItem.sales += qty;
            salesCounted += qty;
          }
        }
      }
    }
    console.log('期間内販売数:', salesCounted, '（期間:', days, '日）');

    this.results.listingPace = pace;
    return pace;
  }

  /**
   * ブランド別パフォーマンス分析
   */
  calculateBrandPerformance() {
    const brandStats = {};

    // 出品中のブランド集計
    for (const item of this.activeListings) {
      const brand = item.brand || '(不明)';
      if (!brandStats[brand]) {
        brandStats[brand] = {
          brand,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          avgDaysToSell: null,
          daysToSellList: []
        };
      }
      brandStats[brand].active++;
      brandStats[brand].totalWatchers += item.watchers;
    }

    // 売れたブランド集計
    for (const item of this.soldItems) {
      const brand = item.brand || '(不明)';
      if (!brandStats[brand]) {
        brandStats[brand] = {
          brand,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          avgDaysToSell: null,
          daysToSellList: []
        };
      }
      brandStats[brand].sold += item.quantity;
      brandStats[brand].revenue += item.soldFor * item.quantity;
    }

    // 売上率を計算してソート
    const performance = Object.values(brandStats)
      .map(stat => ({
        ...stat,
        sellThroughRate: stat.active + stat.sold > 0
          ? ((stat.sold / (stat.active + stat.sold)) * 100).toFixed(1)
          : 0,
        avgWatchers: stat.active > 0
          ? (stat.totalWatchers / stat.active).toFixed(1)
          : 0
      }))
      .sort((a, b) => (b.sold + b.active) - (a.sold + a.active));

    this.results.brandPerformance = performance;
    this.results.byBrand = brandStats;
  }

  /**
   * カテゴリ別分析
   */
  calculateCategoryStats() {
    const categoryStats = {};

    // 出品中のカテゴリ集計
    for (const item of this.activeListings) {
      const category = item.category || '(不明)';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          active: 0,
          sold: 0,
          totalWatchers: 0
        };
      }
      categoryStats[category].active++;
      categoryStats[category].totalWatchers += item.watchers;
    }

    this.results.byCategory = categoryStats;
  }

  /**
   * Watch数ランキング TOP10
   */
  calculateWatchRanking() {
    const ranking = this.activeListings
      .filter(item => item.watchers > 0)
      .sort((a, b) => b.watchers - a.watchers)
      .slice(0, 10)
      .map((item, idx) => ({
        rank: idx + 1,
        title: item.title,
        watchers: item.watchers,
        price: item.price,
        brand: item.brand
      }));

    this.results.watchRanking = ranking;
  }

  /**
   * アラート生成
   */
  generateAlerts() {
    const alerts = [];
    const summary = this.results.summary;

    // 出品ペースアラート
    if (summary.daysSinceLastListing !== null) {
      if (summary.daysSinceLastListing >= 7) {
        alerts.push({
          type: 'warning',
          message: `最終出品から${summary.daysSinceLastListing}日経過しています`,
          severity: summary.daysSinceLastListing >= 14 ? 'high' : 'medium'
        });
      }
    }

    // Watch数が多いのに売れていない商品
    const highWatchNoSale = this.activeListings.filter(item => item.watchers >= 5);
    if (highWatchNoSale.length >= 3) {
      alerts.push({
        type: 'opportunity',
        message: `Watch数5以上の商品が${highWatchNoSale.length}件あります。価格見直しを検討してください`,
        severity: 'medium'
      });
    }

    // 在庫数アラート
    if (summary.totalActive < 50) {
      alerts.push({
        type: 'info',
        message: `出品数が${summary.totalActive}件です。在庫を増やすことを検討してください`,
        severity: 'low'
      });
    }

    this.results.alerts = alerts;
  }

  /**
   * AI分析用サマリーデータ
   */
  getAISummary() {
    return {
      summary: this.results.summary,
      brandPerformance: this.results.brandPerformance.slice(0, 20),
      categoryStats: Object.values(this.results.byCategory).slice(0, 15),
      watchRanking: this.results.watchRanking,
      listingPace: {
        last7days: this.results.listingPace.slice(-7),
        totalListings: this.results.listingPace.reduce((sum, p) => sum + p.listings, 0),
        totalSales: this.results.listingPace.reduce((sum, p) => sum + p.sales, 0)
      },
      alerts: this.results.alerts
    };
  }

  /**
   * CSV出力用データ生成
   */
  generateCsvData() {
    const rows = [];

    // サマリー
    rows.push(['=== 集計サマリー ===']);
    rows.push(['項目', '値']);
    rows.push(['出品中', this.results.summary.totalActive]);
    rows.push(['販売済み', this.results.summary.totalSold]);
    rows.push(['総Watch数', this.results.summary.totalWatchers]);
    rows.push(['最終出品からの日数', this.results.summary.daysSinceLastListing || '-']);
    rows.push([]);

    // ブランド別パフォーマンス
    rows.push(['=== ブランド別パフォーマンス ===']);
    rows.push(['ブランド', '出品中', '販売済', '売上率', '平均Watch', '売上金額']);
    for (const brand of this.results.brandPerformance.slice(0, 30)) {
      rows.push([
        brand.brand,
        brand.active,
        brand.sold,
        brand.sellThroughRate + '%',
        brand.avgWatchers,
        '$' + brand.revenue.toFixed(2)
      ]);
    }
    rows.push([]);

    // Watch数ランキング
    rows.push(['=== Watch数ランキング TOP10 ===']);
    rows.push(['順位', 'タイトル', 'Watch数', '価格', 'ブランド']);
    for (const item of this.results.watchRanking) {
      rows.push([
        item.rank,
        item.title,
        item.watchers,
        '$' + item.price.toFixed(2),
        item.brand || '-'
      ]);
    }

    return rows;
  }

  /**
   * CSVダウンロード
   */
  downloadCsv(filename = 'ebay_analysis.csv') {
    const rows = this.generateCsvData();

    const csvContent = rows.map(row =>
      row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
      }).join(',')
    ).join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// グローバルインスタンス
const analyzer = new EbayAnalyzer();
