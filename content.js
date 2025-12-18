/**
 * ぶんせき君 v2.1.0 - Content Script
 * eBayページでリアルタイム市場分析・ハイライト
 */

class BunsekiKunHighlighter {
  constructor() {
    // 自分のデータ（Storageから読み込み）
    this.myBrands = {};           // { brandName: { active: 10, sold: 5, avgPrice: 50, sellRate: 50 } }
    this.myActiveListings = [];   // 自分の出品中タイトル
    this.excludedBrands = [];     // 除外ブランド

    // 分析結果
    this.strongBrands = [];       // 自分が強いブランド
    this.opportunityBrands = [];  // チャンス（売れてるが自分は出品なし）
    this.pricingAlerts = {};      // 価格アラート { brand: { myAvg, marketAvg, diff } }

    // ブランドマスター（chrome.storageから読み込み）
    this.brandMasterData = null;
    this.brandPatternCache = [];  // プリコンパイル済み正規表現

    // 処理済み要素の追跡
    this.processedElements = new WeakSet();

    // ツールチップ
    this.tooltip = null;

    // 設定
    this.settings = {
      highlightEnabled: true,
      priceAlertThreshold: 20  // 20%以上の差で警告
    };

    this.init();
  }

  async init() {
    await this.loadData();
    this.observeDOM();
    this.highlightPage();
    this.setupTooltip();
    this.setupMessageListener();

    // Storage変更を監視
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.bunsekiData || changes.bunsekiSettings || changes.analysisData) {
        this.loadData().then(() => {
          this.processedElements = new WeakSet();
          this.highlightPage();
        });
      }
      if (changes.highlightEnabled) {
        this.settings.highlightEnabled = changes.highlightEnabled.newValue;
        if (this.settings.highlightEnabled) {
          this.processedElements = new WeakSet();
          this.highlightPage();
        } else {
          this.removeAllHighlights();
        }
      }
      if (changes.excludedBrands) {
        this.excludedBrands = (changes.excludedBrands.newValue || []).map(b => b.toLowerCase());
        this.processedElements = new WeakSet();
        this.highlightPage();
      }
      // ブランドマスター変更を監視
      if (changes.brandMaster) {
        console.log('ぶんせき君: ブランドマスター更新検知');
        this.loadBrandMaster(changes.brandMaster.newValue).then(() => {
          this.processedElements = new WeakSet();
          this.highlightPage();
        });
      }
    });
  }

  /**
   * Storageからデータを読み込み
   */
  async loadData() {
    const data = await chrome.storage.local.get([
      'bunsekiData',
      'bunsekiSettings',
      'excludedBrands',
      'highlightEnabled',
      'brandMaster'
    ]);

    if (data.bunsekiData) {
      this.myBrands = data.bunsekiData.brands || {};
      this.myActiveListings = data.bunsekiData.activeListings || [];
      this.strongBrands = data.bunsekiData.strongBrands || [];
      this.opportunityBrands = data.bunsekiData.opportunityBrands || [];
      this.pricingAlerts = data.bunsekiData.pricingAlerts || {};
    }

    if (data.bunsekiSettings) {
      this.settings = { ...this.settings, ...data.bunsekiSettings };
    }

    // ハイライト有効/無効
    this.settings.highlightEnabled = data.highlightEnabled !== false;

    this.excludedBrands = (data.excludedBrands || []).map(b => b.toLowerCase());

    // ブランドマスターを読み込み・パターンをプリコンパイル
    await this.loadBrandMaster(data.brandMaster);
  }

  /**
   * ブランドマスターを読み込み、正規表現パターンをプリコンパイル
   */
  async loadBrandMaster(brandMaster) {
    this.brandMasterData = brandMaster;
    this.brandPatternCache = [];

    if (!brandMaster || !brandMaster.brands) {
      console.log('ぶんせき君: ブランドマスターが見つかりません（初回起動時は正常）');
      return;
    }

    const brands = brandMaster.brands.filter(b => b.enabled !== false);
    console.log('ぶんせき君: ブランドマスター読み込み:', brands.length, '件');

    // 各ブランドのパターンをプリコンパイル
    for (const brand of brands) {
      if (!brand.patterns || brand.patterns.length === 0) continue;

      for (const pattern of brand.patterns) {
        let regex;
        try {
          switch (brand.matchType) {
            case 'exact':
              // 完全一致（大文字小文字無視）
              regex = new RegExp(`^${this.escapeRegex(pattern)}$`, 'i');
              break;
            case 'contains':
              // 部分一致
              regex = new RegExp(this.escapeRegex(pattern), 'i');
              break;
            case 'word':
            default:
              // 単語境界マッチ（デフォルト）
              regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'i');
              break;
          }

          this.brandPatternCache.push({
            regex,
            brandName: brand.name,
            brandId: brand.id,
            pattern: pattern
          });
        } catch (e) {
          console.warn('ぶんせき君: 正規表現エラー:', pattern, e);
        }
      }
    }

    console.log('ぶんせき君: パターンキャッシュ作成完了:', this.brandPatternCache.length, '件');
  }

  /**
   * 正規表現の特殊文字をエスケープ
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * メッセージリスナー（popup/backgroundからの通信）
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'getPageData':
        case 'capturePageData':
          const pageData = this.extractPageData();
          sendResponse({ success: true, data: pageData.items });
          break;

        case 'refreshHighlight':
        case 'dataUpdated':
          this.processedElements = new WeakSet();
          this.loadData().then(() => this.highlightPage());
          sendResponse({ success: true });
          break;

        case 'toggleHighlight':
          this.settings.highlightEnabled = request.enabled;
          if (request.enabled) {
            this.highlightPage();
          } else {
            this.removeAllHighlights();
          }
          sendResponse({ success: true });
          break;

        case 'excludedBrandsUpdated':
          this.excludedBrands = (request.brands || []).map(b => b.toLowerCase());
          this.processedElements = new WeakSet();
          this.highlightPage();
          sendResponse({ success: true });
          break;

        case 'captureMarketData':
          this.captureMarketData().then(result => {
            sendResponse(result);
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true; // 非同期レスポンスのため

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }

      return true;
    });
  }

  /**
   * すべてのハイライトを削除
   */
  removeAllHighlights() {
    const highlighted = document.querySelectorAll('.bunseki-highlight');
    highlighted.forEach(el => {
      el.classList.remove(
        'bunseki-highlight',
        'bunseki-strong',
        'bunseki-opportunity',
        'bunseki-price-alert',
        'bunseki-owned',
        'bunseki-excluded',
        'bunseki-unknown'
      );
      delete el.dataset.bunsekiType;
      delete el.dataset.bunsekiBrand;
    });
    this.processedElements = new WeakSet();
  }

  /**
   * ページから商品データを抽出
   */
  extractPageData() {
    const items = [];
    const pageType = this.detectPageType();

    if (pageType === 'terapeak') {
      items.push(...this.extractTerapeakData());
    } else if (pageType === 'search') {
      items.push(...this.extractSearchData());
    }

    return {
      pageType,
      items,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * ページタイプを検出
   */
  detectPageType() {
    const url = window.location.href;
    if (url.includes('/sh/research')) {
      return 'terapeak';
    } else if (url.includes('/sch/')) {
      return 'search';
    }
    return 'unknown';
  }

  /**
   * Terapeakからデータ抽出
   */
  extractTerapeakData() {
    const items = [];
    const seenTitles = new Set(); // 重複防止用

    // 方法1: span[data-item-id]から直接取得（キーワードみつけるくんと同じ方式）
    const titleSpans = document.querySelectorAll('span[data-item-id]');

    console.log('ぶんせき君: Terapeak span[data-item-id] found:', titleSpans.length);

    titleSpans.forEach(titleSpan => {
      const title = titleSpan.textContent.trim();
      if (!title) return;

      // 重複チェック
      const titleKey = title.toLowerCase();
      if (seenTitles.has(titleKey)) return;
      seenTitles.add(titleKey);

      const brand = this.extractBrandFromTitle(title);

      // 親要素から価格・販売数を探す
      const row = titleSpan.closest('tr') || titleSpan.closest('[class*="row"]') || titleSpan.parentElement?.parentElement?.parentElement;
      let price = null;
      let sold = 0;

      if (row) {
        // 価格を探す（$マークを含むテキスト）
        const priceMatch = row.textContent.match(/\$[\d,.]+/);
        if (priceMatch) {
          price = this.parsePrice(priceMatch[0]);
        }

        // 販売数を探す（"sold"の前の数字）
        const soldMatch = row.textContent.match(/(\d+)\s*sold/i);
        if (soldMatch) {
          sold = parseInt(soldMatch[1]) || 0;
        }
      }

      items.push({
        title,
        brand,
        price,
        sold,
        element: titleSpan
      });
    });

    // 方法2: テーブル構造の場合（フォールバック）
    if (items.length === 0) {
      const rows = document.querySelectorAll('table tbody tr');
      console.log('ぶんせき君: Fallback table rows found:', rows.length);

      rows.forEach(row => {
        const titleEl = row.querySelector('span[data-item-id]') || row.querySelector('td:first-child');
        if (titleEl) {
          const title = titleEl.textContent.trim();
          if (!title || title.length < 5) return;

          // 重複チェック
          const titleKey = title.toLowerCase();
          if (seenTitles.has(titleKey)) return;
          seenTitles.add(titleKey);

          const brand = this.extractBrandFromTitle(title);
          const cells = row.querySelectorAll('td');
          let price = null;
          let sold = 0;

          cells.forEach(cell => {
            const text = cell.textContent;
            if (!price && text.includes('$')) {
              price = this.parsePrice(text);
            }
            if (text.toLowerCase().includes('sold')) {
              const match = text.match(/(\d+)/);
              if (match) sold = parseInt(match[1]) || 0;
            }
          });

          items.push({
            title,
            brand,
            price,
            sold,
            element: titleEl
          });
        }
      });
    }

    // 方法3: 汎用的なリスト要素（さらなるフォールバック）
    if (items.length === 0) {
      const listItems = document.querySelectorAll('[class*="listing"], [class*="product"], [class*="item"]');
      console.log('ぶんせき君: Generic list items found:', listItems.length);

      listItems.forEach(item => {
        const titleEl = item.querySelector('[class*="title"], h3, h4, a');
        if (titleEl) {
          const title = titleEl.textContent.trim();
          if (!title || title.length < 10) return;

          // 重複チェック
          const titleKey = title.toLowerCase();
          if (seenTitles.has(titleKey)) return;
          seenTitles.add(titleKey);

          const brand = this.extractBrandFromTitle(title);
          const priceMatch = item.textContent.match(/\$[\d,.]+/);
          const price = priceMatch ? this.parsePrice(priceMatch[0]) : null;

          items.push({
            title,
            brand,
            price,
            sold: 0,
            element: titleEl
          });
        }
      });
    }

    console.log('ぶんせき君: Total items extracted:', items.length, '(after dedup)');
    return items;
  }

  /**
   * 検索結果からデータ抽出
   */
  extractSearchData() {
    const items = [];

    // 検索結果の商品
    const searchItems = document.querySelectorAll('.s-item');

    searchItems.forEach(item => {
      const titleEl = item.querySelector('.s-item__title');
      const priceEl = item.querySelector('.s-item__price');
      const watchersEl = item.querySelector('.s-item__watchCount, .s-item__hotness');

      if (titleEl && !titleEl.textContent.includes('Shop on eBay')) {
        const title = titleEl.textContent.trim();
        const brand = this.extractBrandFromTitle(title);
        const price = priceEl ? this.parsePrice(priceEl.textContent) : null;
        const watchers = watchersEl ? parseInt(watchersEl.textContent.replace(/[^0-9]/g, '')) || 0 : 0;

        items.push({
          title,
          brand,
          price,
          watchers,
          element: titleEl
        });
      }
    });

    return items;
  }

  /**
   * タイトルからブランドを抽出（ブランドマスター使用）
   */
  extractBrandFromTitle(title) {
    if (!title) return null;

    // 1. ブランドマスターのプリコンパイル済みパターンを使用（545ブランド）
    if (this.brandPatternCache && this.brandPatternCache.length > 0) {
      for (const { regex, brandName } of this.brandPatternCache) {
        if (regex.test(title)) {
          return brandName;
        }
      }
    }

    // 2. フォールバック: ブランドマスターがまだ読み込まれていない場合の基本パターン
    const fallbackPatterns = [
      { pattern: /\b(CHANEL)\b/i, brand: 'CHANEL' },
      { pattern: /\b(HERMES|HERMÈS)\b/i, brand: 'HERMES' },
      { pattern: /\b(Louis\s?Vuitton|LV)\b/i, brand: 'LOUIS VUITTON' },
      { pattern: /\b(GUCCI)\b/i, brand: 'GUCCI' },
      { pattern: /\b(PRADA)\b/i, brand: 'PRADA' },
      { pattern: /\b(ROLEX)\b/i, brand: 'ROLEX' },
      { pattern: /\b(OMEGA)\b/i, brand: 'OMEGA' },
      { pattern: /\b(SEIKO)\b/i, brand: 'SEIKO' },
      { pattern: /\b(CASIO)\b/i, brand: 'CASIO' },
      { pattern: /\b(NIKE)\b/i, brand: 'NIKE' },
      { pattern: /\b(ADIDAS)\b/i, brand: 'ADIDAS' }
    ];

    for (const { pattern, brand } of fallbackPatterns) {
      if (pattern.test(title)) {
        return brand;
      }
    }

    return null;
  }

  /**
   * 価格をパース
   */
  parsePrice(priceStr) {
    if (!priceStr) return null;
    const match = priceStr.match(/[\d,.]+/);
    if (match) {
      return parseFloat(match[0].replace(/,/g, ''));
    }
    return null;
  }

  /**
   * タイトル要素を取得
   */
  getTitleElements() {
    const elements = [];

    // Terapeak
    const terapeakTitles = document.querySelectorAll('span[data-item-id]');
    elements.push(...terapeakTitles);

    // 検索結果
    const searchTitles = document.querySelectorAll(
      '.s-item__title, ' +
      'h3.s-item__title, ' +
      '.srp-results .s-item__link span[role="heading"]'
    );
    elements.push(...searchTitles);

    return elements;
  }

  /**
   * ページをハイライト
   */
  highlightPage() {
    if (!this.settings.highlightEnabled) return;

    const titleElements = this.getTitleElements();

    titleElements.forEach(element => {
      if (this.processedElements.has(element)) return;
      this.processedElements.add(element);

      this.highlightElement(element);
    });
  }

  /**
   * 要素をハイライト
   */
  highlightElement(element) {
    const title = element.textContent.trim();
    const brand = this.extractBrandFromTitle(title);
    const lowerTitle = title.toLowerCase();

    // 除外ブランドチェック
    if (brand && this.excludedBrands.includes(brand.toLowerCase())) {
      element.classList.add('bunseki-excluded');
      return;
    }

    // ブランドが判定できた場合
    if (brand) {
      const brandLower = brand.toLowerCase();
      const myBrandData = this.myBrands[brand] || this.myBrands[brandLower];

      // 自分が強いブランド（緑）
      if (this.strongBrands.map(b => b.toLowerCase()).includes(brandLower)) {
        this.applyHighlight(element, 'strong', brand);
        return;
      }

      // チャンスブランド（黄色）- 市場で売れてるが自分は出品なし
      if (!myBrandData || myBrandData.active === 0) {
        this.applyHighlight(element, 'opportunity', brand);
        return;
      }

      // 価格アラート（オレンジ）
      if (this.pricingAlerts[brand]) {
        this.applyHighlight(element, 'price-alert', brand);
        return;
      }

      // 自分も扱っているブランド（薄い緑）
      if (myBrandData && myBrandData.active > 0) {
        this.applyHighlight(element, 'owned', brand);
        return;
      }
    }

    // ブランド不明 - 新しいキーワードとして黄色
    // (ただし一般的すぎるタイトルは除く)
    if (!brand && title.length > 10) {
      this.applyHighlight(element, 'unknown', null);
    }
  }

  /**
   * ハイライトを適用
   */
  applyHighlight(element, type, brand) {
    element.classList.add('bunseki-highlight', `bunseki-${type}`);
    element.dataset.bunsekiType = type;
    if (brand) {
      element.dataset.bunsekiBrand = brand;
    }
  }

  /**
   * DOM変更を監視
   */
  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      let shouldHighlight = false;

      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) {
          shouldHighlight = true;
        }
      });

      if (shouldHighlight) {
        clearTimeout(this.highlightTimeout);
        this.highlightTimeout = setTimeout(() => this.highlightPage(), 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * ツールチップ設定
   */
  setupTooltip() {
    document.addEventListener('click', (e) => {
      const highlighted = e.target.closest('.bunseki-highlight');

      if (highlighted) {
        e.preventDefault();
        e.stopPropagation();
        this.showTooltip(highlighted, e);
      } else if (!e.target.closest('.bunseki-tooltip')) {
        this.hideTooltip();
      }
    });

    document.addEventListener('scroll', () => this.hideTooltip(), true);
  }

  /**
   * ツールチップ表示
   */
  showTooltip(element, event) {
    this.hideTooltip();

    const type = element.dataset.bunsekiType;
    const brand = element.dataset.bunsekiBrand;
    const rect = element.getBoundingClientRect();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'bunseki-tooltip';

    let content = '';

    switch (type) {
      case 'strong':
        const strongData = this.myBrands[brand];
        content = `
          <div class="bunseki-tooltip-header strong">
            <span class="icon">💪</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>あなたが強いブランドです</p>
            ${strongData ? `
              <div class="bunseki-stats">
                <span>出品中: ${strongData.active}件</span>
                <span>販売済: ${strongData.sold}件</span>
                <span>売上率: ${strongData.sellRate || '-'}%</span>
              </div>
            ` : ''}
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
        break;

      case 'opportunity':
        content = `
          <div class="bunseki-tooltip-header opportunity">
            <span class="icon">✨</span>
            <strong>${brand || '新しいキーワード'}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>市場で売れていますが、あなたは出品していません</p>
            <p class="hint">仕入れを検討してみては？</p>
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="watch-btn">注目に追加</button>
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
        break;

      case 'price-alert':
        const alertData = this.pricingAlerts[brand];
        content = `
          <div class="bunseki-tooltip-header price-alert">
            <span class="icon">⚠️</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>価格の見直しを検討してください</p>
            ${alertData ? `
              <div class="bunseki-stats">
                <span>あなたの平均: $${alertData.myAvg?.toFixed(0) || '-'}</span>
                <span>市場平均: $${alertData.marketAvg?.toFixed(0) || '-'}</span>
                <span class="diff ${alertData.diff > 0 ? 'high' : 'low'}">
                  ${alertData.diff > 0 ? '+' : ''}${alertData.diff?.toFixed(0) || '-'}%
                </span>
              </div>
            ` : ''}
          </div>
        `;
        break;

      case 'owned':
        const ownedData = this.myBrands[brand];
        content = `
          <div class="bunseki-tooltip-header owned">
            <span class="icon">📦</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>取り扱い中のブランド</p>
            ${ownedData ? `
              <div class="bunseki-stats">
                <span>出品中: ${ownedData.active}件</span>
                <span>販売済: ${ownedData.sold}件</span>
              </div>
            ` : ''}
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
        break;

      case 'excluded':
        content = `
          <div class="bunseki-tooltip-header excluded">
            <span class="icon">🚫</span>
            <strong>${brand || 'このキーワード'}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>除外リストに登録済み</p>
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="unexclude-btn">除外を解除</button>
          </div>
        `;
        break;

      default:
        content = `
          <div class="bunseki-tooltip-header unknown">
            <span class="icon">❓</span>
            <strong>未分類</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>ブランドが特定できませんでした</p>
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
    }

    this.tooltip.innerHTML = content;

    // 位置
    const tooltipX = Math.min(rect.left + window.scrollX, window.innerWidth - 280);
    const tooltipY = rect.bottom + window.scrollY + 8;
    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;

    document.body.appendChild(this.tooltip);

    // ボタンイベント
    this.setupTooltipButtons(element, brand);
  }

  /**
   * ツールチップボタンのイベント設定
   */
  setupTooltipButtons(element, brand) {
    const watchBtn = this.tooltip.querySelector('.watch-btn');
    const excludeBtn = this.tooltip.querySelector('.exclude-btn');
    const unexcludeBtn = this.tooltip.querySelector('.unexclude-btn');

    if (watchBtn) {
      watchBtn.addEventListener('click', () => {
        this.addToWatchList(brand);
        this.hideTooltip();
      });
    }

    if (excludeBtn) {
      excludeBtn.addEventListener('click', () => {
        this.addToExcludeList(brand || element.textContent.trim());
        element.classList.remove('bunseki-strong', 'bunseki-opportunity', 'bunseki-owned', 'bunseki-unknown');
        element.classList.add('bunseki-excluded');
        this.hideTooltip();
      });
    }

    if (unexcludeBtn) {
      unexcludeBtn.addEventListener('click', () => {
        this.removeFromExcludeList(brand);
        element.classList.remove('bunseki-excluded');
        this.hideTooltip();
        // 再ハイライト
        this.processedElements.delete(element);
        this.highlightElement(element);
      });
    }
  }

  /**
   * 注目リストに追加
   */
  async addToWatchList(keyword) {
    if (!keyword) return;

    const data = await chrome.storage.local.get(['watchedBrands']);
    const list = data.watchedBrands || [];

    if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      list.push(keyword);
      await chrome.storage.local.set({ watchedBrands: list });
    }
  }

  /**
   * 除外リストに追加
   */
  async addToExcludeList(keyword) {
    if (!keyword) return;

    const data = await chrome.storage.local.get(['excludedBrands']);
    const list = data.excludedBrands || [];

    if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      list.push(keyword);
      await chrome.storage.local.set({ excludedBrands: list });
      this.excludedBrands.push(keyword.toLowerCase());
    }
  }

  /**
   * 除外リストから削除
   */
  async removeFromExcludeList(keyword) {
    if (!keyword) return;

    const data = await chrome.storage.local.get(['excludedBrands']);
    const list = data.excludedBrands || [];
    const filtered = list.filter(k => k.toLowerCase() !== keyword.toLowerCase());

    await chrome.storage.local.set({ excludedBrands: filtered });
    this.excludedBrands = this.excludedBrands.filter(k => k !== keyword.toLowerCase());
  }

  /**
   * ツールチップ非表示
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  /**
   * 市場データをキャプチャしてbackground経由でIndexedDBに保存
   */
  async captureMarketData() {
    try {
      console.log('ぶんせき君: captureMarketData開始');
      console.log('ぶんせき君: 現在のURL:', window.location.href);

      const pageData = this.extractPageData();
      console.log('ぶんせき君: pageType:', pageData.pageType);
      console.log('ぶんせき君: 抽出アイテム数:', pageData.items?.length || 0);

      if (!pageData.items || pageData.items.length === 0) {
        // デバッグ情報を追加
        const debugInfo = {
          pageType: pageData.pageType,
          spanCount: document.querySelectorAll('span[data-item-id]').length,
          tableRowCount: document.querySelectorAll('table tbody tr').length,
          sItemCount: document.querySelectorAll('.s-item').length
        };
        console.log('ぶんせき君: デバッグ情報:', debugInfo);
        return {
          success: false,
          error: `データが見つかりませんでした (pageType: ${pageData.pageType}, spans: ${debugInfo.spanCount}, rows: ${debugInfo.tableRowCount})`
        };
      }

      // element参照を除去（シリアライズできないため）
      const cleanItems = pageData.items.map(item => ({
        title: item.title,
        brand: item.brand,
        price: item.price,
        sold: item.sold,
        source: window.location.href
      }));

      // 現在のシートIDを取得（デフォルトはsheet1）
      const currentSheetId = localStorage.getItem('currentSheetId') || 'sheet1';

      // background scriptに送信して保存
      const result = await chrome.runtime.sendMessage({
        action: 'saveMarketData',
        items: cleanItems,
        sheetId: currentSheetId
      });

      console.log('ぶんせき君: 保存結果:', result);

      if (result && result.success) {
        return {
          success: true,
          count: pageData.items.length,
          added: result.added,
          duplicates: result.duplicates
        };
      } else {
        return {
          success: false,
          error: result?.error || '保存に失敗しました'
        };
      }
    } catch (error) {
      console.error('市場データキャプチャエラー:', error);
      return { success: false, error: error.message };
    }
  }
}

// 初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BunsekiKunHighlighter());
} else {
  new BunsekiKunHighlighter();
}
