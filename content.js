/**
 * ぶんせき君 v4.2.0 - Content Script
 * eBayページでリアルタイム市場分析・部分ハイライト
 *
 * 改善点:
 * - ブランド名のみ部分ハイライト（タイトル全体ではなく）
 * - 注目キーワードのハイライト対応
 * - テキスト選択時にミニボタン表示（+注目/×除外）
 * - ハイライト以外の部分はクリック可能（商品ページへジャンプ）
 */

class BunsekiKunHighlighter {
  constructor() {
    // 自分のデータ（Storageから読み込み）
    this.myBrands = {};
    this.myActiveListings = [];
    this.excludedBrands = [];

    // 分析結果
    this.strongBrands = [];
    this.opportunityBrands = [];
    this.pricingAlerts = {};

    // ブランドマスター（chrome.storageから読み込み）
    this.brandMasterData = null;
    this.brandPatternCache = [];

    // 注目キーワード・除外キーワード
    this.watchedKeywords = [];
    this.excludedKeywords = [];

    // 処理済み要素の追跡
    this.processedElements = new WeakSet();

    // ツールチップ・選択ポップアップ
    this.tooltip = null;
    this.selectionPopup = null;

    // 設定
    this.settings = {
      highlightEnabled: true,
      priceAlertThreshold: 20
    };

    this.init();
  }

  async init() {
    await this.loadData();
    this.observeDOM();
    this.highlightPage();
    this.setupTooltip();
    this.setupSelectionPopup();
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
      if (changes.watchedKeywords) {
        this.watchedKeywords = changes.watchedKeywords.newValue || [];
        this.processedElements = new WeakSet();
        this.highlightPage();
      }
      if (changes.excludedKeywords) {
        this.excludedKeywords = changes.excludedKeywords.newValue || [];
        this.processedElements = new WeakSet();
        this.highlightPage();
      }
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
      'brandMaster',
      'watchedKeywords',
      'excludedKeywords'
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

    this.settings.highlightEnabled = data.highlightEnabled !== false;
    this.excludedBrands = (data.excludedBrands || []).map(b => b.toLowerCase());
    this.watchedKeywords = data.watchedKeywords || [];
    this.excludedKeywords = data.excludedKeywords || [];

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

    for (const brand of brands) {
      if (!brand.patterns || brand.patterns.length === 0) continue;

      for (const pattern of brand.patterns) {
        let regex;
        try {
          switch (brand.matchType) {
            case 'exact':
              regex = new RegExp(`^${this.escapeRegex(pattern)}$`, 'i');
              break;
            case 'contains':
              regex = new RegExp(this.escapeRegex(pattern), 'gi');
              break;
            case 'word':
            default:
              regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'gi');
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
          return true;

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
    // 部分ハイライトspan要素を元に戻す
    const brandSpans = document.querySelectorAll('.bunseki-brand, .bunseki-keyword');
    brandSpans.forEach(span => {
      const text = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(text, span);
    });

    // 除外クラスを削除
    const excluded = document.querySelectorAll('.bunseki-excluded-title');
    excluded.forEach(el => {
      el.classList.remove('bunseki-excluded-title');
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
    const seenTitles = new Set();

    const titleSpans = document.querySelectorAll('span[data-item-id]');

    titleSpans.forEach(titleSpan => {
      const title = titleSpan.textContent.trim();
      if (!title) return;

      const titleKey = title.toLowerCase();
      if (seenTitles.has(titleKey)) return;
      seenTitles.add(titleKey);

      const brand = this.extractBrandFromTitle(title);

      const row = titleSpan.closest('tr') || titleSpan.closest('[class*="row"]') || titleSpan.parentElement?.parentElement?.parentElement;
      let price = null;
      let sold = 0;

      if (row) {
        const priceMatch = row.textContent.match(/\$[\d,.]+/);
        if (priceMatch) {
          price = this.parsePrice(priceMatch[0]);
        }

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

    if (items.length === 0) {
      const rows = document.querySelectorAll('table tbody tr');

      rows.forEach(row => {
        const titleEl = row.querySelector('span[data-item-id]') || row.querySelector('td:first-child');
        if (titleEl) {
          const title = titleEl.textContent.trim();
          if (!title || title.length < 5) return;

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

    return items;
  }

  /**
   * 検索結果からデータ抽出
   */
  extractSearchData() {
    const items = [];
    const searchItems = document.querySelectorAll('.s-item');

    searchItems.forEach(item => {
      const titleEl = item.querySelector('.s-item__title');
      const priceEl = item.querySelector('.s-item__price');

      if (titleEl && !titleEl.textContent.includes('Shop on eBay')) {
        const title = titleEl.textContent.trim();
        const brand = this.extractBrandFromTitle(title);
        const price = priceEl ? this.parsePrice(priceEl.textContent) : null;

        items.push({
          title,
          brand,
          price,
          element: titleEl
        });
      }
    });

    return items;
  }

  /**
   * タイトルからブランドを抽出
   */
  extractBrandFromTitle(title) {
    if (!title) return null;

    if (this.brandPatternCache && this.brandPatternCache.length > 0) {
      for (const { regex, brandName } of this.brandPatternCache) {
        if (regex.test(title)) {
          return brandName;
        }
      }
    }

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
   * 要素を部分ハイライト（ブランド名・キーワードのみ）
   */
  highlightElement(element) {
    const originalText = element.textContent.trim();
    const lowerText = originalText.toLowerCase();

    // 除外キーワードを含む場合はタイトル全体をグレーアウト
    const hasExcluded = this.excludedKeywords.some(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );

    if (hasExcluded) {
      element.classList.add('bunseki-excluded-title');
      return;
    }

    // テキストノードを処理
    this.highlightTextNodes(element);
  }

  /**
   * テキストノードを走査してハイライト
   */
  highlightTextNodes(element) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const fragments = this.createHighlightedFragments(text);

      if (fragments) {
        textNode.parentNode.replaceChild(fragments, textNode);
      }
    });
  }

  /**
   * ハイライト済みフラグメントを作成
   */
  createHighlightedFragments(text) {
    const matches = [];

    // 1. ブランドマスターからマッチを検索
    for (const { regex, brandName, pattern } of this.brandPatternCache) {
      // regexをリセット（globalフラグがある場合）
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        // 除外ブランドはスキップ
        if (this.excludedBrands.includes(brandName.toLowerCase())) {
          continue;
        }

        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length,
          type: 'brand',
          brandName: brandName,
          highlightClass: this.getBrandHighlightClass(brandName)
        });

        // exactマッチの場合は1回だけ
        if (!regex.global) break;
      }
    }

    // 2. 注目キーワードからマッチを検索
    for (const keyword of this.watchedKeywords) {
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        // 既存のマッチと重複しないか確認
        const overlaps = matches.some(m =>
          (match.index >= m.index && match.index < m.index + m.length) ||
          (m.index >= match.index && m.index < match.index + match[0].length)
        );
        if (!overlaps) {
          matches.push({
            text: match[0],
            index: match.index,
            length: match[0].length,
            type: 'keyword',
            keyword: keyword,
            highlightClass: 'bunseki-keyword-watched'
          });
        }
      }
    }

    if (matches.length === 0) return null;

    // インデックス順にソート
    matches.sort((a, b) => a.index - b.index);

    // 重複を除去（後から追加されたものを優先）
    const filteredMatches = [];
    for (const match of matches) {
      const overlaps = filteredMatches.some(m =>
        (match.index >= m.index && match.index < m.index + m.length) ||
        (m.index >= match.index && m.index < match.index + match.length)
      );
      if (!overlaps) {
        filteredMatches.push(match);
      }
    }

    // フラグメントを構築
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    filteredMatches.forEach(match => {
      // マッチ前のテキスト
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
      }

      // ハイライトspan
      const span = document.createElement('span');
      span.className = `bunseki-${match.type} ${match.highlightClass}`;
      span.textContent = match.text;

      if (match.type === 'brand') {
        span.dataset.brand = match.brandName;
        span.dataset.type = match.highlightClass.replace('bunseki-brand-', '');
      } else {
        span.dataset.keyword = match.keyword;
      }

      fragment.appendChild(span);

      lastIndex = match.index + match.length;
    });

    // 残りのテキスト
    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }

    return fragment;
  }

  /**
   * ブランドのハイライトクラスを決定
   */
  getBrandHighlightClass(brandName) {
    const brandLower = brandName.toLowerCase();
    const myBrandData = this.myBrands[brandName] || this.myBrands[brandLower];

    // 自分が強いブランド（緑）
    if (this.strongBrands.map(b => b.toLowerCase()).includes(brandLower)) {
      return 'bunseki-brand-strong';
    }

    // チャンスブランド（黄色）
    if (!myBrandData || myBrandData.active === 0) {
      return 'bunseki-brand-opportunity';
    }

    // 価格アラート（オレンジ）
    if (this.pricingAlerts[brandName]) {
      return 'bunseki-brand-price-alert';
    }

    // 自分も扱っているブランド（薄い緑）
    if (myBrandData && myBrandData.active > 0) {
      return 'bunseki-brand-owned';
    }

    // デフォルト（青 - マスター登録済み）
    return 'bunseki-brand-registered';
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
   * ツールチップ設定（ブランド名・キーワードクリック時）
   */
  setupTooltip() {
    document.addEventListener('click', (e) => {
      const brandSpan = e.target.closest('.bunseki-brand');
      const keywordSpan = e.target.closest('.bunseki-keyword');

      if (brandSpan) {
        e.preventDefault();
        e.stopPropagation();
        this.showBrandTooltip(brandSpan, e);
      } else if (keywordSpan) {
        e.preventDefault();
        e.stopPropagation();
        this.showKeywordTooltip(keywordSpan, e);
      } else if (!e.target.closest('.bunseki-tooltip') && !e.target.closest('.bunseki-selection-popup')) {
        this.hideTooltip();
        this.hideSelectionPopup();
      }
    });

    document.addEventListener('scroll', () => {
      this.hideTooltip();
      this.hideSelectionPopup();
    }, true);
  }

  /**
   * ブランドツールチップ表示
   */
  showBrandTooltip(element, event) {
    this.hideTooltip();
    this.hideSelectionPopup();

    const brand = element.dataset.brand;
    const type = element.dataset.type;
    const rect = element.getBoundingClientRect();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'bunseki-tooltip';

    let content = '';
    const myBrandData = this.myBrands[brand] || this.myBrands[brand?.toLowerCase()];

    switch (type) {
      case 'strong':
        content = `
          <div class="bunseki-tooltip-header strong">
            <span class="icon">💪</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>あなたが強いブランドです</p>
            ${myBrandData ? `
              <div class="bunseki-stats">
                <span>出品中: ${myBrandData.active}件</span>
                <span>販売済: ${myBrandData.sold}件</span>
                <span>売上率: ${myBrandData.sellRate || '-'}%</span>
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
            <strong>${brand}</strong>
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
        content = `
          <div class="bunseki-tooltip-header owned">
            <span class="icon">📦</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>取り扱い中のブランド</p>
            ${myBrandData ? `
              <div class="bunseki-stats">
                <span>出品中: ${myBrandData.active}件</span>
                <span>販売済: ${myBrandData.sold}件</span>
              </div>
            ` : ''}
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
        break;

      default:
        content = `
          <div class="bunseki-tooltip-header registered">
            <span class="icon">🏷️</span>
            <strong>${brand}</strong>
          </div>
          <div class="bunseki-tooltip-body">
            <p>ブランドマスター登録済み</p>
          </div>
          <div class="bunseki-tooltip-actions">
            <button class="watch-btn">注目に追加</button>
            <button class="exclude-btn">除外に追加</button>
          </div>
        `;
    }

    this.tooltip.innerHTML = content;

    const tooltipX = Math.min(rect.left + window.scrollX, window.innerWidth - 280);
    const tooltipY = rect.bottom + window.scrollY + 8;
    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;

    document.body.appendChild(this.tooltip);

    this.setupTooltipButtons(element, brand, 'brand');
  }

  /**
   * キーワードツールチップ表示
   */
  showKeywordTooltip(element, event) {
    this.hideTooltip();
    this.hideSelectionPopup();

    const keyword = element.dataset.keyword;
    const rect = element.getBoundingClientRect();

    this.tooltip = document.createElement('div');
    this.tooltip.className = 'bunseki-tooltip';

    this.tooltip.innerHTML = `
      <div class="bunseki-tooltip-header keyword">
        <span class="icon">🔑</span>
        <strong>"${keyword}"</strong>
      </div>
      <div class="bunseki-tooltip-body">
        <p>注目キーワード</p>
      </div>
      <div class="bunseki-tooltip-actions">
        <button class="remove-btn">注目から削除</button>
        <button class="exclude-btn">除外に移動</button>
      </div>
    `;

    const tooltipX = Math.min(rect.left + window.scrollX, window.innerWidth - 280);
    const tooltipY = rect.bottom + window.scrollY + 8;
    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;

    document.body.appendChild(this.tooltip);

    this.setupTooltipButtons(element, keyword, 'keyword');
  }

  /**
   * ツールチップボタンのイベント設定
   */
  setupTooltipButtons(element, value, type) {
    const watchBtn = this.tooltip.querySelector('.watch-btn');
    const excludeBtn = this.tooltip.querySelector('.exclude-btn');
    const removeBtn = this.tooltip.querySelector('.remove-btn');

    if (watchBtn) {
      watchBtn.addEventListener('click', () => {
        if (type === 'brand') {
          this.addToWatchList(value);
        } else {
          this.addToWatchedKeywords(value);
        }
        this.hideTooltip();
      });
    }

    if (excludeBtn) {
      excludeBtn.addEventListener('click', () => {
        if (type === 'brand') {
          this.addToExcludeList(value);
        } else {
          this.removeFromWatchedKeywords(value);
          this.addToExcludedKeywords(value);
        }
        this.hideTooltip();
        // 再描画
        this.processedElements = new WeakSet();
        this.removeAllHighlights();
        this.highlightPage();
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        this.removeFromWatchedKeywords(value);
        this.hideTooltip();
        this.processedElements = new WeakSet();
        this.removeAllHighlights();
        this.highlightPage();
      });
    }
  }

  /**
   * テキスト選択時のミニボタン設定
   */
  setupSelectionPopup() {
    // 通常のドラッグ選択
    document.addEventListener('mouseup', (e) => {
      // ツールチップやポップアップ内でのクリックは無視
      if (e.target.closest('.bunseki-tooltip') || e.target.closest('.bunseki-selection-popup')) {
        return;
      }

      // Shift+クリックは別処理
      if (e.shiftKey) {
        return;
      }

      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText && selectedText.length >= 2 && selectedText.length <= 50) {
          // タイトル要素内での選択かチェック
          const anchorNode = selection.anchorNode;
          const titleElement = anchorNode?.parentElement?.closest('span[data-item-id], .s-item__title');

          if (titleElement || this.isInTitleArea(anchorNode)) {
            this.showSelectionPopup(selectedText, e);
          }
        } else {
          this.hideSelectionPopup();
        }
      }, 10);
    });

    // Shift+クリックで単語選択
    document.addEventListener('click', (e) => {
      if (!e.shiftKey) return;

      // ハイライト済み要素やツールチップは無視
      if (e.target.closest('.bunseki-brand') ||
          e.target.closest('.bunseki-keyword') ||
          e.target.closest('.bunseki-tooltip') ||
          e.target.closest('.bunseki-selection-popup')) {
        return;
      }

      // タイトルエリア内かチェック
      if (!this.isInTitleArea(e.target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // クリック位置の単語を取得
      const word = this.getWordAtPoint(e.clientX, e.clientY);

      if (word && word.length >= 2 && word.length <= 50) {
        this.showSelectionPopup(word, e);
      }
    }, true);
  }

  /**
   * クリック位置の単語を取得
   */
  getWordAtPoint(x, y) {
    // caretPositionFromPoint または caretRangeFromPoint を使用
    let range;

    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (!pos || !pos.offsetNode) return null;

      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    } else if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(x, y);
      if (!range) return null;
    } else {
      return null;
    }

    // テキストノードでなければ終了
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;

    const text = node.textContent;
    const offset = range.startOffset;

    // 単語の境界を探す
    let start = offset;
    let end = offset;

    // 単語文字: アルファベット、数字、一部の記号
    const isWordChar = (char) => /[\w\u00C0-\u024F\u0400-\u04FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(char);

    // 開始位置を探す
    while (start > 0 && isWordChar(text[start - 1])) {
      start--;
    }

    // 終了位置を探す
    while (end < text.length && isWordChar(text[end])) {
      end++;
    }

    if (start === end) return null;

    const word = text.substring(start, end).trim();

    // 単語をハイライト表示（視覚的フィードバック）
    const selection = window.getSelection();
    selection.removeAllRanges();
    const wordRange = document.createRange();
    wordRange.setStart(node, start);
    wordRange.setEnd(node, end);
    selection.addRange(wordRange);

    return word;
  }

  /**
   * タイトルエリア内かどうかをチェック
   */
  isInTitleArea(node) {
    if (!node) return false;
    let element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (element) {
      if (element.matches && element.matches('span[data-item-id], .s-item__title, .s-item__link')) {
        return true;
      }
      element = element.parentElement;
    }
    return false;
  }

  /**
   * 選択テキスト用ミニポップアップ表示
   */
  showSelectionPopup(selectedText, event) {
    this.hideSelectionPopup();
    this.hideTooltip();

    this.selectionPopup = document.createElement('div');
    this.selectionPopup.className = 'bunseki-selection-popup';
    this.selectionPopup.innerHTML = `
      <button class="watch-btn" title="注目キーワードに追加">+注目</button>
      <button class="exclude-btn" title="除外キーワードに追加">×除外</button>
    `;

    // 選択範囲の位置を取得
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      const popupX = Math.min(rect.left + window.scrollX, window.innerWidth - 150);
      const popupY = rect.top + window.scrollY - 40;

      this.selectionPopup.style.left = `${popupX}px`;
      this.selectionPopup.style.top = `${popupY}px`;
    }

    document.body.appendChild(this.selectionPopup);

    // ボタンイベント
    this.selectionPopup.querySelector('.watch-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.addToWatchedKeywords(selectedText);
      this.hideSelectionPopup();
      window.getSelection().removeAllRanges();
      // 再描画
      this.processedElements = new WeakSet();
      this.removeAllHighlights();
      this.highlightPage();
    });

    this.selectionPopup.querySelector('.exclude-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.addToExcludedKeywords(selectedText);
      this.hideSelectionPopup();
      window.getSelection().removeAllRanges();
      // 再描画
      this.processedElements = new WeakSet();
      this.removeAllHighlights();
      this.highlightPage();
    });
  }

  /**
   * 選択ポップアップを非表示
   */
  hideSelectionPopup() {
    if (this.selectionPopup) {
      this.selectionPopup.remove();
      this.selectionPopup = null;
    }
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

  // ========================================
  // キーワード管理メソッド
  // ========================================

  async addToWatchList(keyword) {
    if (!keyword) return;
    const data = await chrome.storage.local.get(['watchedBrands']);
    const list = data.watchedBrands || [];
    if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      list.push(keyword);
      await chrome.storage.local.set({ watchedBrands: list });
    }
  }

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

  async addToWatchedKeywords(keyword) {
    if (!keyword) return;
    const data = await chrome.storage.local.get(['watchedKeywords']);
    const list = data.watchedKeywords || [];
    if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      list.push(keyword);
      await chrome.storage.local.set({ watchedKeywords: list });
      this.watchedKeywords = list;
    }
  }

  async removeFromWatchedKeywords(keyword) {
    if (!keyword) return;
    const data = await chrome.storage.local.get(['watchedKeywords']);
    const list = data.watchedKeywords || [];
    const filtered = list.filter(k => k.toLowerCase() !== keyword.toLowerCase());
    await chrome.storage.local.set({ watchedKeywords: filtered });
    this.watchedKeywords = filtered;
  }

  async addToExcludedKeywords(keyword) {
    if (!keyword) return;
    const data = await chrome.storage.local.get(['excludedKeywords']);
    const list = data.excludedKeywords || [];
    if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
      list.push(keyword);
      await chrome.storage.local.set({ excludedKeywords: list });
      this.excludedKeywords = list;
    }
  }

  /**
   * 市場データをキャプチャ
   */
  async captureMarketData() {
    try {
      const pageData = this.extractPageData();

      if (!pageData.items || pageData.items.length === 0) {
        return {
          success: false,
          error: `データが見つかりませんでした`
        };
      }

      const cleanItems = pageData.items.map(item => ({
        title: item.title,
        brand: item.brand,
        price: item.price,
        sold: item.sold,
        source: window.location.href
      }));

      const currentSheetId = localStorage.getItem('currentSheetId') || 'sheet1';

      const result = await chrome.runtime.sendMessage({
        action: 'saveMarketData',
        items: cleanItems,
        sheetId: currentSheetId
      });

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
