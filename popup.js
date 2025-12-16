/**
 * ポップアップUI操作
 * ぶんせき君 v4.0.0 - eBay統合分析ツール
 *
 * 新UI構造:
 * - データ入力タブ: 自分のデータ + 市場データ
 * - 分析タブ: 自分のデータ分析 + 市場比較分析
 * - AI提案タブ: 複数AI対応（OpenAI, Claude, Gemini）
 */

// =====================================
// グローバル変数
// =====================================

// ファイルデータ
let activeListingsData = null;
let ordersData = null;

// チャート インスタンス
let chartInstances = {
  listingPace: null,
  brand: null,
  watch: null,
  category: null,
  marketComparison: null,
  brandCategory: null
};

// チャット履歴
let chatHistory = [];

// 現在のAI分析結果
let currentAIResult = null;

// カラーパレット
const COLORS = {
  primary: '#f5a623',
  secondary: '#f7931e',
  success: '#4caf50',
  danger: '#ef4444',
  info: '#2196f3',
  chart: [
    '#f5a623', '#ff6b35', '#4caf50', '#2196f3', '#9c27b0',
    '#ff9800', '#00bcd4', '#e91e63', '#8bc34a', '#607d8b',
    '#795548', '#009688', '#673ab7', '#3f51b5', '#ffc107'
  ]
};

// 分析用カテゴリ定義
const ANALYSIS_CATEGORIES = {
  clothing_shoes: {
    name: 'Clothing, Shoes & Accessories',
    nameJa: '衣類・靴・アクセサリー',
    icon: '👗',
    ebayId: 11450,
    keywords: [
      'clothing', 'clothes', 'apparel', 'dress', 'shirt', 'blouse', 'top', 'pants', 'jeans', 'skirt', 'jacket', 'coat', 'blazer', 'sweater', 'cardigan', 'hoodie', 't-shirt', 'tee',
      'shoes', 'sneakers', 'boots', 'heels', 'pumps', 'sandals', 'loafers', 'flats', 'oxford', 'mules', 'slides',
      'scarf', 'belt', 'tie', 'hat', 'cap', 'gloves', 'sunglasses',
      'louis vuitton', 'lv', 'gucci', 'chanel', 'hermes', 'prada', 'burberry', 'fendi', 'dior', 'celine', 'balenciaga', 'bottega', 'loewe', 'saint laurent', 'ysl', 'givenchy', 'valentino', 'miu miu', 'coach', 'michael kors', 'kate spade', 'tory burch', 'marc jacobs', 'versace', 'dolce', 'armani', 'moschino', 'mcm', 'salvatore ferragamo', 'ferragamo', 'jimmy choo', 'manolo', 'christian louboutin', 'louboutin',
      'nike', 'adidas', 'new balance', 'puma', 'reebok', 'converse', 'vans', 'supreme', 'north face', 'patagonia', 'levis', 'ralph lauren', 'polo', 'tommy hilfiger', 'calvin klein', 'gap', 'zara', 'h&m', 'uniqlo',
      'bag', 'handbag', 'shoulder', 'tote', 'backpack', 'clutch', 'crossbody', 'wallet', 'purse', 'pouch'
    ]
  },
  jewelry_watches: {
    name: 'Jewelry & Watches',
    nameJa: '時計・ジュエリー',
    icon: '⌚',
    ebayId: 281,
    keywords: [
      'jewelry', 'jewellery', 'necklace', 'bracelet', 'ring', 'earring', 'pendant', 'chain', 'bangle', 'brooch', 'anklet', 'charm', 'cuff',
      'diamond', 'gold', 'silver', 'platinum', 'pearl', 'ruby', 'sapphire', 'emerald', '18k', '14k', '10k', 'sterling', '925',
      'watch', 'watches', 'wristwatch', 'timepiece', 'chronograph',
      'tiffany', 'cartier', 'bvlgari', 'bulgari', 'van cleef', 'harry winston', 'david yurman', 'mikimoto', 'pandora', 'swarovski', 'chopard', 'piaget', 'boucheron', 'graff',
      'rolex', 'omega', 'tag heuer', 'breitling', 'patek philippe', 'audemars piguet', 'iwc', 'longines', 'tissot', 'seiko', 'citizen', 'casio', 'g-shock', 'tudor', 'hamilton', 'orient', 'movado', 'fossil', 'michael kors watch'
    ]
  },
  health_beauty: {
    name: 'Health & Beauty',
    nameJa: 'ヘルス＆ビューティー',
    icon: '💄',
    ebayId: 26395,
    keywords: ['health', 'beauty', 'skincare', 'makeup', 'cosmetics', 'perfume', 'fragrance', 'cologne', 'hair care', 'vitamins', 'supplements', 'lipstick', 'mascara', 'foundation', 'cream', 'serum', 'lotion', 'shampoo', 'conditioner']
  },
  cell_phones: {
    name: 'Cell Phones & Accessories',
    nameJa: '携帯電話・アクセサリー',
    icon: '📱',
    ebayId: 15032,
    keywords: ['cell phone', 'smartphone', 'iphone', 'samsung', 'android', 'phone case', 'charger', 'screen protector', 'mobile']
  },
  computers: {
    name: 'Computers/Tablets & Networking',
    nameJa: 'PC・タブレット',
    icon: '💻',
    ebayId: 58058,
    keywords: ['computer', 'laptop', 'tablet', 'ipad', 'macbook', 'desktop', 'monitor', 'keyboard', 'mouse', 'networking', 'router', 'server']
  },
  consumer_electronics: {
    name: 'Consumer Electronics',
    nameJa: '家電・電子機器',
    icon: '📺',
    ebayId: 293,
    keywords: ['electronics', 'tv', 'television', 'audio', 'speaker', 'headphones', 'home theater', 'smart home', 'streaming']
  },
  cameras: {
    name: 'Cameras & Photo',
    nameJa: 'カメラ・写真',
    icon: '📷',
    ebayId: 625,
    keywords: ['camera', 'dslr', 'mirrorless', 'canon', 'nikon', 'sony', 'lens', 'photography', 'tripod', 'flash', 'film camera']
  },
  video_games: {
    name: 'Video Games & Consoles',
    nameJa: 'ゲーム',
    icon: '🎮',
    ebayId: 1249,
    keywords: ['video game', 'console', 'playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4', 'gaming', 'controller', 'retro game']
  },
  collectibles: {
    name: 'Collectibles',
    nameJa: 'コレクティブル',
    icon: '🏺',
    ebayId: 1,
    keywords: ['collectible', 'vintage', 'antique', 'memorabilia', 'advertising', 'animation', 'autograph', 'barware', 'decorative']
  },
  toys_hobbies: {
    name: 'Toys & Hobbies',
    nameJa: 'トイ・ホビー',
    icon: '🧸',
    ebayId: 220,
    keywords: ['toy', 'hobby', 'action figure', 'lego', 'model', 'rc', 'diecast', 'plush', 'board game', 'puzzle', 'building toy']
  },
  home_garden: {
    name: 'Home & Garden',
    nameJa: 'ホーム＆ガーデン',
    icon: '🏠',
    ebayId: 11700,
    keywords: ['home', 'garden', 'furniture', 'decor', 'kitchen', 'bedding', 'bath', 'outdoor', 'tools', 'lighting']
  },
  sporting_goods: {
    name: 'Sporting Goods',
    nameJa: 'スポーツ用品',
    icon: '⚽',
    ebayId: 888,
    keywords: ['sports', 'fitness', 'golf', 'tennis', 'cycling', 'fishing', 'camping', 'hunting', 'exercise', 'yoga']
  },
  music: {
    name: 'Music',
    nameJa: '音楽',
    icon: '🎵',
    ebayId: 11233,
    keywords: ['vinyl', 'record', 'cd', 'cassette', 'music', 'album', 'lp', 'single', '45 rpm', 'box set music']
  },
  books: {
    name: 'Books & Magazines',
    nameJa: '書籍・雑誌',
    icon: '📚',
    ebayId: 267,
    keywords: ['book', 'magazine', 'textbook', 'comic', 'manga', 'novel', 'rare book', 'first edition', 'signed book']
  },
  art: {
    name: 'Art',
    nameJa: 'アート',
    icon: '🎨',
    ebayId: 550,
    keywords: ['art', 'painting', 'print', 'sculpture', 'drawing', 'photograph', 'poster', 'mixed media', 'digital art']
  }
};

// =====================================
// 初期化
// =====================================

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  initDataInput();
  initAnalysisButtons();
  initAITab();
  initSettings();

  // 保存データの復元
  await loadSavedData();
  await updateMarketDataInfo();
  await checkAPIStatus();
});

/**
 * メインタブ初期化
 */
function initTabs() {
  const tabs = document.querySelectorAll('.main-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      // タブのアクティブ状態を切り替え
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // コンテンツの表示を切り替え
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetId}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// =====================================
// データ入力タブ
// =====================================

/**
 * データ入力の初期化
 */
function initDataInput() {
  // Active Listings ファイル入力
  const activeListingsFile = document.getElementById('activeListingsFile');
  const activeListingsUpload = document.getElementById('activeListingsUpload');

  if (activeListingsFile) {
    activeListingsFile.addEventListener('change', (e) => {
      handleFileUpload(e.target.files[0], 'active');
    });
  }

  if (activeListingsUpload) {
    activeListingsUpload.addEventListener('dragover', handleDragOver);
    activeListingsUpload.addEventListener('dragleave', handleDragLeave);
    activeListingsUpload.addEventListener('drop', (e) => handleDrop(e, 'active'));
  }

  // Orders ファイル入力
  const ordersFile = document.getElementById('ordersFile');
  const ordersUpload = document.getElementById('ordersUpload');

  if (ordersFile) {
    ordersFile.addEventListener('change', (e) => {
      handleFileUpload(e.target.files[0], 'orders');
    });
  }

  if (ordersUpload) {
    ordersUpload.addEventListener('dragover', handleDragOver);
    ordersUpload.addEventListener('dragleave', handleDragLeave);
    ordersUpload.addEventListener('drop', (e) => handleDrop(e, 'orders'));
  }

  // 市場データボタン
  const captureMarketBtn = document.getElementById('captureMarketBtn');
  const ebayUrlInput = document.getElementById('ebayUrlInput');
  const importMarketCsvBtn = document.getElementById('importMarketCsvBtn');
  const clearMarketDataBtn = document.getElementById('clearMarketDataBtn');
  const marketCsvFile = document.getElementById('marketCsvFile');

  if (captureMarketBtn) {
    captureMarketBtn.addEventListener('click', captureMarketDataFromUrl);
  }

  if (ebayUrlInput) {
    ebayUrlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        captureMarketDataFromUrl();
      }
    });
  }

  if (importMarketCsvBtn) {
    importMarketCsvBtn.addEventListener('click', () => marketCsvFile?.click());
  }

  if (marketCsvFile) {
    marketCsvFile.addEventListener('change', (e) => {
      importMarketCsv(e.target.files[0]);
    });
  }

  if (clearMarketDataBtn) {
    clearMarketDataBtn.addEventListener('click', clearMarketData);
  }

  // データ保存ボタン
  const saveAllDataBtn = document.getElementById('saveAllDataBtn');
  if (saveAllDataBtn) {
    saveAllDataBtn.addEventListener('click', saveAllData);
  }
}

/**
 * ドラッグオーバー処理
 */
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dragover');
}

/**
 * ドラッグリーブ処理
 */
function handleDragLeave(e) {
  e.currentTarget.classList.remove('dragover');
}

/**
 * ドロップ処理
 */
function handleDrop(e, type) {
  e.preventDefault();
  e.currentTarget.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) {
    handleFileUpload(file, type);
  }
}

/**
 * ファイルアップロード処理
 */
function handleFileUpload(file, type) {
  if (!file || !file.name.endsWith('.csv')) {
    showAlert('CSVファイルを選択してください', 'warning');
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    const content = e.target.result;

    if (type === 'active') {
      activeListingsData = content;
      const items = analyzer.parseActiveListingsCsv(content);
      updateDataStatus('activeListingsStatus', items.length, true);
      updateMyDataSummary();
    } else {
      ordersData = content;
      const items = analyzer.parseOrdersCsv(content);
      updateDataStatus('ordersStatus', items.length, true);
      updateMyDataSummary();
    }

    showAlert(`${file.name} を読み込みました`, 'success');
  };

  reader.readAsText(file, 'UTF-8');
}

/**
 * データステータス更新
 */
function updateDataStatus(elementId, count, success) {
  const statusEl = document.getElementById(elementId);
  if (!statusEl) return;

  if (success) {
    statusEl.innerHTML = `
      <span class="status-icon">✅</span>
      <span class="status-text">${count.toLocaleString()}件 読み込み済み</span>
    `;
    statusEl.classList.add('loaded');
  } else {
    statusEl.innerHTML = `
      <span class="status-icon">⏳</span>
      <span class="status-text">未読み込み</span>
    `;
    statusEl.classList.remove('loaded');
  }
}

/**
 * 自分のデータサマリー更新
 */
function updateMyDataSummary() {
  const summaryEl = document.getElementById('myDataSummary');
  if (!summaryEl) return;

  const activeItems = activeListingsData ? analyzer.parseActiveListingsCsv(activeListingsData) : [];
  const soldItems = ordersData ? analyzer.parseOrdersCsv(ordersData) : [];

  if (activeItems.length > 0 || soldItems.length > 0) {
    summaryEl.style.display = 'flex';

    // ブランド数を計算
    const brands = new Set();
    activeItems.forEach(item => {
      const brand = extractBrandFromTitle(item.title);
      if (brand && brand !== '(不明)') brands.add(brand);
    });
    soldItems.forEach(item => {
      const brand = extractBrandFromTitle(item.title);
      if (brand && brand !== '(不明)') brands.add(brand);
    });

    document.getElementById('myActiveCount').textContent = activeItems.length.toLocaleString();
    document.getElementById('mySoldCount').textContent = soldItems.length.toLocaleString();
    document.getElementById('myBrandCount').textContent = brands.size.toLocaleString();
  } else {
    summaryEl.style.display = 'none';
  }
}

/**
 * 市場データ情報更新
 */
async function updateMarketDataInfo() {
  try {
    const marketData = await BunsekiDB.getMarketData();

    const totalCountEl = document.getElementById('marketTotalCount');
    const brandCountEl = document.getElementById('marketBrandCount');
    const lastUpdateEl = document.getElementById('marketLastUpdate');

    if (marketData && marketData.length > 0) {
      // ブランド数を計算
      const brands = new Set();
      marketData.forEach(item => {
        if (item.brand && item.brand !== '(不明)') {
          brands.add(item.brand);
        }
      });

      if (totalCountEl) totalCountEl.textContent = marketData.length.toLocaleString();
      if (brandCountEl) brandCountEl.textContent = brands.size.toLocaleString();

      // 最終更新日
      const latestDate = marketData.reduce((latest, item) => {
        const date = item.capturedAt ? new Date(item.capturedAt) : null;
        return date && (!latest || date > latest) ? date : latest;
      }, null);

      if (lastUpdateEl && latestDate) {
        lastUpdateEl.textContent = formatDate(latestDate);
      }
    } else {
      if (totalCountEl) totalCountEl.textContent = '0';
      if (brandCountEl) brandCountEl.textContent = '0';
      if (lastUpdateEl) lastUpdateEl.textContent = '-';
    }
  } catch (error) {
    console.error('市場データ情報の取得に失敗:', error);
  }
}

/**
 * URLから市場データを取得
 * URLを自動で開き、データ取得後にタブを閉じる
 */
async function captureMarketDataFromUrl() {
  const urlInput = document.getElementById('ebayUrlInput');
  const url = urlInput?.value.trim();

  // URLが入力されている場合
  if (url) {
    if (!url.includes('ebay.com') && !url.includes('ebay.co.uk') && !url.includes('ebay.de') && !url.includes('ebay.fr') && !url.includes('ebay.it') && !url.includes('ebay.es') && !url.includes('ebay.com.au')) {
      showAlert('eBayのURLを入力してください', 'warning');
      return;
    }

    showLoading('ページを開いています...');

    let createdTabId = null;

    try {
      // バックグラウンドでタブを開く
      const tab = await chrome.tabs.create({
        url: url,
        active: false  // バックグラウンドで開く
      });
      createdTabId = tab.id;

      showLoading('ページの読み込みを待っています...');

      // ページの読み込み完了を待つ
      await waitForTabComplete(tab.id, 30000); // 最大30秒待機

      showLoading('市場データを取得中...');

      // 少し待ってからcontent scriptにメッセージ送信
      await new Promise(resolve => setTimeout(resolve, 2000));

      // content scriptにメッセージ送信（リトライ付き）
      let response = null;
      let retries = 5;

      while (retries > 0) {
        try {
          response = await chrome.tabs.sendMessage(tab.id, {
            action: 'captureMarketData'
          });
          break;
        } catch (e) {
          console.log('sendMessageエラー:', e.message, 'リトライ残り:', retries - 1);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
      }

      // タブを閉じる
      try {
        await chrome.tabs.remove(tab.id);
        createdTabId = null;
      } catch (e) {
        console.log('タブ削除エラー:', e.message);
      }

      if (response && response.success) {
        const added = response.added || response.count || 0;
        const duplicates = response.duplicates || 0;

        // 結果を表示
        showCaptureResult(added, duplicates);
        showAlert(`${added}件のデータを取得しました`, 'success');
        await updateMarketDataInfo();

        // 入力をクリア
        urlInput.value = '';
      } else {
        throw new Error(response?.error || 'データ取得に失敗しました');
      }
    } catch (error) {
      console.error('市場データ取得エラー:', error);
      showAlert('市場データの取得に失敗しました: ' + error.message, 'danger');

      // エラー時もタブを閉じる
      if (createdTabId) {
        try {
          await chrome.tabs.remove(createdTabId);
        } catch (e) {
          console.log('エラー時タブ削除失敗:', e.message);
        }
      }
    } finally {
      hideLoading();
    }
  } else {
    // URLが空の場合は現在のタブから取得
    await fetchMarketDataFromCurrentTab();
  }
}

/**
 * タブの読み込み完了を待つ
 */
function waitForTabComplete(tabId, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkTab = async () => {
      try {
        const tab = await chrome.tabs.get(tabId);

        if (tab.status === 'complete') {
          resolve(tab);
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error('ページ読み込みタイムアウト'));
          return;
        }

        // 500ms後に再チェック
        setTimeout(checkTab, 500);
      } catch (e) {
        reject(new Error('タブが見つかりません: ' + e.message));
      }
    };

    checkTab();
  });
}

/**
 * 現在のタブから市場データを取得
 */
async function fetchMarketDataFromCurrentTab() {
  showLoading('eBayからデータを取得中...');

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tabs[0] || !tabs[0].url || !tabs[0].url.includes('ebay')) {
      showAlert('eBayのURLを入力するか、eBayページを開いてください', 'warning');
      return;
    }

    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'captureMarketData'
    });

    if (response && response.success) {
      const added = response.added || response.count || 0;
      const duplicates = response.duplicates || 0;

      showCaptureResult(added, duplicates);
      showAlert(`${added}件のデータを取得しました`, 'success');
      await updateMarketDataInfo();
    } else {
      throw new Error(response?.error || 'データ取得に失敗しました');
    }
  } catch (error) {
    console.error('市場データ取得エラー:', error);
    showAlert('市場データの取得に失敗しました。eBayの検索結果ページで実行してください。', 'danger');
  } finally {
    hideLoading();
  }
}

/**
 * 取得結果を表示
 */
function showCaptureResult(added, duplicates) {
  const resultDiv = document.getElementById('marketCaptureResult');
  const addedSpan = document.getElementById('marketAddedCount');
  const duplicatesSpan = document.getElementById('marketDuplicateCount');

  if (resultDiv && addedSpan && duplicatesSpan) {
    addedSpan.textContent = added;
    duplicatesSpan.textContent = duplicates;
    resultDiv.style.display = 'flex';

    // 5秒後に非表示
    setTimeout(() => {
      resultDiv.style.display = 'none';
    }, 5000);
  }
}

/**
 * 市場データCSVインポート
 */
async function importMarketCsv(file) {
  if (!file) return;

  showLoading('CSVをインポート中...');

  try {
    const content = await readFileAsText(file);
    const items = parseMarketCsv(content);

    if (items.length === 0) {
      throw new Error('有効なデータが見つかりませんでした');
    }

    // IndexedDBに保存
    await BunsekiDB.addMarketData(items);

    showAlert(`${items.length}件のデータをインポートしました`, 'success');
    await updateMarketDataInfo();
  } catch (error) {
    console.error('CSVインポートエラー:', error);
    showAlert('CSVのインポートに失敗しました: ' + error.message, 'danger');
  } finally {
    hideLoading();
  }
}

/**
 * 市場データCSVパース
 */
function parseMarketCsv(content) {
  const lines = content.split('\n');
  const items = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSVパース（カンマ区切り、クォート対応）
    const cols = parseCSVLine(line);

    if (cols.length >= 2) {
      const title = cols[0];
      const price = parseFloat(cols[1]) || 0;
      const brand = extractBrandFromTitle(title);
      const category = cols[2] || detectCategoryFromTitle(title);

      items.push({
        title,
        price,
        brand,
        category,
        capturedAt: new Date().toISOString()
      });
    }
  }

  return items;
}

/**
 * CSV行をパース
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
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
 * 市場データクリア
 */
async function clearMarketData() {
  if (!confirm('市場データをすべて削除しますか？')) return;

  try {
    await BunsekiDB.clearMarketData();
    showAlert('市場データを削除しました', 'success');
    await updateMarketDataInfo();
  } catch (error) {
    console.error('市場データ削除エラー:', error);
    showAlert('市場データの削除に失敗しました', 'danger');
  }
}

/**
 * 全データ保存
 */
async function saveAllData() {
  showLoading('データを保存中...');

  try {
    // 分析実行
    if (activeListingsData || ordersData) {
      analyzer.reset();
      await analyzer.loadCustomBrandRules();

      const activeItems = activeListingsData ? analyzer.parseActiveListingsCsv(activeListingsData) : [];
      const soldItems = ordersData ? analyzer.parseOrdersCsv(ordersData) : [];

      analyzer.analyze(activeItems, soldItems);

      // IndexedDBに保存
      await BunsekiDB.setActiveListings(analyzer.activeListings);
      await BunsekiDB.setSoldItems(analyzer.soldItems);

      // メタデータをChrome Storageに保存
      const metaData = {
        results: analyzer.results,
        savedAt: new Date().toISOString(),
        counts: {
          active: analyzer.activeListings.length,
          sold: analyzer.soldItems.length
        }
      };

      await chrome.storage.local.set({ savedAnalysisMeta: metaData });
    }

    // 保存日時を更新
    updateLastSavedInfo();
    showAlert('データを保存しました', 'success');
  } catch (error) {
    console.error('データ保存エラー:', error);
    showAlert('データの保存に失敗しました', 'danger');
  } finally {
    hideLoading();
  }
}

/**
 * 保存済みデータの読み込み
 */
async function loadSavedData() {
  try {
    // IndexedDBからデータを復元
    const activeListings = await BunsekiDB.getActiveListings();
    const soldItems = await BunsekiDB.getSoldItems();
    const metaData = await chrome.storage.local.get(['savedAnalysisMeta']);

    if (activeListings.length > 0 || soldItems.length > 0) {
      analyzer.activeListings = activeListings;
      analyzer.soldItems = soldItems;

      if (metaData.savedAnalysisMeta?.results) {
        analyzer.results = metaData.savedAnalysisMeta.results;
      }

      // 再計算
      analyzer.results.listingPace = [];
      analyzer.calculateListingPace();
      analyzer.calculateSummary();

      // UI更新
      updateDataStatus('activeListingsStatus', activeListings.length, activeListings.length > 0);
      updateDataStatus('ordersStatus', soldItems.length, soldItems.length > 0);
      updateMyDataSummary();
      updateLastSavedInfo();

      console.log('保存データを復元しました:', activeListings.length + soldItems.length, '件');
    }
  } catch (error) {
    console.error('保存データの読み込みに失敗:', error);
  }
}

/**
 * 最終保存日時を更新
 */
async function updateLastSavedInfo() {
  const infoEl = document.getElementById('lastSavedInfo');
  if (!infoEl) return;

  try {
    const data = await chrome.storage.local.get(['savedAnalysisMeta']);
    if (data.savedAnalysisMeta?.savedAt) {
      const date = new Date(data.savedAnalysisMeta.savedAt);
      infoEl.textContent = `最終保存: ${formatDateTime(date)}`;
    }
  } catch (error) {
    console.error('保存日時の取得に失敗:', error);
  }
}

// =====================================
// 分析タブ
// =====================================

/**
 * 分析ボタンの初期化
 */
function initAnalysisButtons() {
  const analysisButtons = document.querySelectorAll('.analysis-btn');

  analysisButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const analysisType = btn.dataset.analysis;
      runAnalysis(analysisType);
    });
  });

  // 分析結果を閉じるボタン
  const closeBtn = document.getElementById('closeAnalysisResult');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeAnalysisResult);
  }
}

/**
 * 分析実行
 */
async function runAnalysis(type) {
  showLoading('分析中...');

  try {
    // データ確認
    if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
      // 保存データの復元を試行
      await loadSavedData();

      if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
        showAlert('データがありません。まずCSVを読み込んでください。', 'warning');
        return;
      }
    }

    let resultHtml = '';
    let title = '';

    switch (type) {
      case 'listing-pace':
        title = '📅 出品・販売ペース分析';
        resultHtml = generateListingPaceAnalysis(30);
        break;

      case 'brand-performance':
        title = '🏷️ ブランド別パフォーマンス';
        resultHtml = generateBrandPerformanceAnalysis();
        break;

      case 'watch-analysis':
        title = '👁️ Watch数分析';
        resultHtml = generateWatchAnalysis();
        break;

      case 'category-performance':
        title = '📂 カテゴリ別パフォーマンス';
        resultHtml = generateCategoryPerformanceAnalysis();
        break;

      case 'category-comparison':
        title = '📊 市場カテゴリ比較';
        resultHtml = await generateCategoryComparisonAnalysis();
        break;

      case 'brand-category-matrix':
        title = '🎯 ブランド×カテゴリ分析';
        resultHtml = await generateBrandCategoryMatrixAnalysis();
        break;

      default:
        throw new Error('不明な分析タイプです');
    }

    displayAnalysisResult(title, resultHtml);

  } catch (error) {
    console.error('分析エラー:', error);
    showAlert('分析中にエラーが発生しました: ' + error.message, 'danger');
  } finally {
    hideLoading();
  }
}

// 現在選択されている出品・販売ペースの期間
let currentPacePeriod = 30;

/**
 * 出品・販売ペース分析を生成
 */
function generateListingPaceAnalysis(days = 30) {
  currentPacePeriod = days;

  // 期間に応じたデータを再計算
  const pace = analyzer.calculateListingPace(days);
  const summary = analyzer.results.summary || {};

  // 集計
  const totalListings = pace.reduce((sum, d) => sum + d.listings, 0);
  const totalSales = pace.reduce((sum, d) => sum + d.sales, 0);

  let html = `
    <div class="period-selector">
      <span class="period-label">期間:</span>
      <button class="period-btn ${days === 30 ? 'active' : ''}" data-days="30">30日</button>
      <button class="period-btn ${days === 60 ? 'active' : ''}" data-days="60">60日</button>
      <button class="period-btn ${days === 90 ? 'active' : ''}" data-days="90">90日</button>
    </div>

    <div class="analysis-summary">
      <div class="summary-row">
        <span class="label">期間内出品数</span>
        <span class="value">${totalListings}</span>
      </div>
      <div class="summary-row">
        <span class="label">期間内販売数</span>
        <span class="value">${totalSales}</span>
      </div>
      <div class="summary-row">
        <span class="label">出品中（総数）</span>
        <span class="value">${summary.totalActive || 0}</span>
      </div>
      <div class="summary-row">
        <span class="label">最終出品からの日数</span>
        <span class="value">${summary.daysSinceLastListing !== null ? summary.daysSinceLastListing + '日' : '-'}</span>
      </div>
    </div>

    <div class="chart-container" style="height: 300px;">
      <canvas id="analysisChart"></canvas>
    </div>

    <div class="analysis-detail">
      <h4>過去${days}日間の出品・販売（日別）</h4>
      <div class="pace-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>日付</th>
              <th>出品数</th>
              <th>販売数</th>
            </tr>
          </thead>
          <tbody>
            ${pace.slice().reverse().slice(0, 14).map(day => `
              <tr>
                <td>${day.label}</td>
                <td>${day.listings || 0}</td>
                <td>${day.sales || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p class="table-note">※最新14日分を表示</p>
    </div>
  `;

  // チャート描画を遅延実行
  setTimeout(() => {
    drawListingPaceChart(pace);
    setupPeriodButtons();
  }, 100);

  return html;
}

/**
 * 期間選択ボタンのイベント設定
 */
function setupPeriodButtons() {
  const buttons = document.querySelectorAll('.period-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.days);
      const resultHtml = generateListingPaceAnalysis(days);
      displayAnalysisResult('📅 出品・販売ペース分析', resultHtml);
    });
  });
}

/**
 * ブランド別パフォーマンス分析を生成
 */
function generateBrandPerformanceAnalysis() {
  const brands = analyzer.results.brandPerformance || [];
  const top20 = brands.slice(0, 20);

  let html = `
    <div class="chart-container">
      <canvas id="analysisChart"></canvas>
    </div>

    <div class="analysis-detail">
      <h4>ブランド別パフォーマンス TOP20</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>ブランド</th>
            <th>出品中</th>
            <th>販売済</th>
            <th>売上率</th>
            <th>平均価格</th>
          </tr>
        </thead>
        <tbody>
          ${top20.map(brand => {
            const total = brand.active + brand.sold;
            const sellRate = total > 0 ? Math.round((brand.sold / total) * 100) : 0;
            return `
              <tr>
                <td>${escapeHtml(brand.brand)}</td>
                <td>${brand.active}</td>
                <td>${brand.sold}</td>
                <td>${sellRate}%</td>
                <td>$${brand.avgPrice ? brand.avgPrice.toFixed(2) : '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  setTimeout(() => {
    drawBrandChart(top20);
  }, 100);

  return html;
}

/**
 * Watch数分析を生成
 */
function generateWatchAnalysis() {
  const watchRanking = analyzer.results.watchRanking || [];
  const top20 = watchRanking.slice(0, 20);

  let html = `
    <div class="analysis-summary">
      <div class="summary-row">
        <span class="label">総Watch数</span>
        <span class="value">${analyzer.results.summary?.totalWatchers || 0}</span>
      </div>
    </div>

    <div class="analysis-detail">
      <h4>Watch数ランキング TOP20</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>商品名</th>
            <th>Watch数</th>
            <th>価格</th>
            <th>出品日数</th>
          </tr>
        </thead>
        <tbody>
          ${top20.map(item => `
            <tr>
              <td class="title-cell" title="${escapeHtml(item.title)}">${truncateText(item.title, 40)}</td>
              <td class="watch-count">${item.watchers}</td>
              <td>$${item.price ? item.price.toFixed(2) : '-'}</td>
              <td>${item.daysListed || '-'}日</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  return html;
}

/**
 * カテゴリ別パフォーマンス分析を生成
 */
function generateCategoryPerformanceAnalysis() {
  const categories = analyzer.results.categoryStats || [];

  let html = `
    <div class="chart-container">
      <canvas id="analysisChart"></canvas>
    </div>

    <div class="analysis-detail">
      <h4>カテゴリ別パフォーマンス</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>出品中</th>
            <th>販売済</th>
            <th>売上率</th>
          </tr>
        </thead>
        <tbody>
          ${categories.map(cat => {
            const total = cat.active + cat.sold;
            const sellRate = total > 0 ? Math.round((cat.sold / total) * 100) : 0;
            return `
              <tr>
                <td>${escapeHtml(cat.category)}</td>
                <td>${cat.active}</td>
                <td>${cat.sold}</td>
                <td>${sellRate}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  setTimeout(() => {
    drawCategoryChart(categories);
  }, 100);

  return html;
}

/**
 * 市場カテゴリ比較分析を生成
 */
async function generateCategoryComparisonAnalysis() {
  const marketData = await BunsekiDB.getMarketData();

  if (!marketData || marketData.length === 0) {
    return `
      <div class="no-data-message">
        <p>市場データがありません。</p>
        <p>eBayの検索結果ページでデータを取得してください。</p>
      </div>
    `;
  }

  // カテゴリ別に集計
  const myCategories = {};
  const marketCategories = {};

  // 自分のデータを集計
  analyzer.activeListings.forEach(item => {
    const category = detectCategoryFromTitle(item.title);
    if (!myCategories[category]) {
      myCategories[category] = { active: 0, sold: 0 };
    }
    myCategories[category].active++;
  });

  analyzer.soldItems.forEach(item => {
    const category = detectCategoryFromTitle(item.title);
    if (!myCategories[category]) {
      myCategories[category] = { active: 0, sold: 0 };
    }
    myCategories[category].sold++;
  });

  // 市場データを集計
  marketData.forEach(item => {
    const category = item.category || detectCategoryFromTitle(item.title);
    if (!marketCategories[category]) {
      marketCategories[category] = { count: 0, totalPrice: 0 };
    }
    marketCategories[category].count++;
    marketCategories[category].totalPrice += item.price || 0;
  });

  // 比較データを構築
  const allCategories = new Set([
    ...Object.keys(myCategories),
    ...Object.keys(marketCategories)
  ]);

  const comparisonData = [];
  allCategories.forEach(category => {
    const my = myCategories[category] || { active: 0, sold: 0 };
    const market = marketCategories[category] || { count: 0, totalPrice: 0 };

    comparisonData.push({
      category,
      myActive: my.active,
      mySold: my.sold,
      marketCount: market.count,
      marketAvgPrice: market.count > 0 ? Math.round(market.totalPrice / market.count) : 0
    });
  });

  // 市場シェアでソート
  comparisonData.sort((a, b) => b.marketCount - a.marketCount);

  let html = `
    <div class="chart-container">
      <canvas id="analysisChart"></canvas>
    </div>

    <div class="analysis-detail">
      <h4>カテゴリ別 自分 vs 市場</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>カテゴリ</th>
            <th>自分（出品中）</th>
            <th>自分（売却済）</th>
            <th>市場件数</th>
            <th>市場平均価格</th>
          </tr>
        </thead>
        <tbody>
          ${comparisonData.slice(0, 15).map(row => `
            <tr>
              <td>${escapeHtml(row.category)}</td>
              <td>${row.myActive}</td>
              <td>${row.mySold}</td>
              <td>${row.marketCount}</td>
              <td>$${row.marketAvgPrice}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  setTimeout(() => {
    drawComparisonChart(comparisonData.slice(0, 10));
  }, 100);

  return html;
}

/**
 * ブランド×カテゴリマトリックス分析を生成
 */
async function generateBrandCategoryMatrixAnalysis() {
  const marketData = await BunsekiDB.getMarketData();

  if (!marketData || marketData.length === 0) {
    return `
      <div class="no-data-message">
        <p>市場データがありません。</p>
        <p>eBayの検索結果ページでデータを取得してください。</p>
      </div>
    `;
  }

  // ブランド別に市場と自分を比較
  const brandComparison = {};

  // 自分のデータ
  analyzer.activeListings.forEach(item => {
    const brand = extractBrandFromTitle(item.title);
    if (!brand || brand === '(不明)') return;

    if (!brandComparison[brand]) {
      brandComparison[brand] = { myActive: 0, mySold: 0, marketCount: 0, marketSold: 0 };
    }
    brandComparison[brand].myActive++;
  });

  analyzer.soldItems.forEach(item => {
    const brand = extractBrandFromTitle(item.title);
    if (!brand || brand === '(不明)') return;

    if (!brandComparison[brand]) {
      brandComparison[brand] = { myActive: 0, mySold: 0, marketCount: 0, marketSold: 0 };
    }
    brandComparison[brand].mySold++;
  });

  // 市場データ
  marketData.forEach(item => {
    const brand = item.brand || extractBrandFromTitle(item.title);
    if (!brand || brand === '(不明)') return;

    if (!brandComparison[brand]) {
      brandComparison[brand] = { myActive: 0, mySold: 0, marketCount: 0, marketSold: 0 };
    }
    brandComparison[brand].marketCount++;
    if (item.sold) brandComparison[brand].marketSold++;
  });

  // 分析結果を生成
  const results = Object.entries(brandComparison)
    .map(([brand, data]) => {
      const myTotal = data.myActive + data.mySold;
      const mySellRate = myTotal > 0 ? Math.round((data.mySold / myTotal) * 100) : 0;
      const marketSellRate = data.marketCount > 0 ? Math.round((data.marketSold / data.marketCount) * 100) : 0;

      // 強み/弱み判定
      let status = '';
      if (data.myActive > 0 && data.marketCount > 0) {
        if (mySellRate > marketSellRate + 10) {
          status = '🟢 強み';
        } else if (mySellRate < marketSellRate - 10) {
          status = '🔴 改善要';
        } else {
          status = '🟡 普通';
        }
      } else if (data.marketCount > 5 && data.myActive === 0) {
        status = '💡 チャンス';
      }

      return {
        brand,
        ...data,
        mySellRate,
        marketSellRate,
        status
      };
    })
    .filter(item => item.myActive > 0 || item.marketCount > 3)
    .sort((a, b) => (b.myActive + b.mySold + b.marketCount) - (a.myActive + a.mySold + a.marketCount));

  // 強み/弱み/チャンスでグループ化
  const strengths = results.filter(r => r.status.includes('強み'));
  const weaknesses = results.filter(r => r.status.includes('改善要'));
  const opportunities = results.filter(r => r.status.includes('チャンス'));

  let html = `
    <div class="matrix-summary">
      <div class="summary-card strength">
        <h5>🟢 強みブランド</h5>
        <ul>
          ${strengths.slice(0, 5).map(b => `<li>${escapeHtml(b.brand)} (売上率: ${b.mySellRate}%)</li>`).join('')}
          ${strengths.length === 0 ? '<li>該当なし</li>' : ''}
        </ul>
      </div>
      <div class="summary-card weakness">
        <h5>🔴 改善が必要</h5>
        <ul>
          ${weaknesses.slice(0, 5).map(b => `<li>${escapeHtml(b.brand)} (売上率: ${b.mySellRate}%)</li>`).join('')}
          ${weaknesses.length === 0 ? '<li>該当なし</li>' : ''}
        </ul>
      </div>
      <div class="summary-card opportunity">
        <h5>💡 仕入れチャンス</h5>
        <ul>
          ${opportunities.slice(0, 5).map(b => `<li>${escapeHtml(b.brand)} (市場: ${b.marketCount}件)</li>`).join('')}
          ${opportunities.length === 0 ? '<li>該当なし</li>' : ''}
        </ul>
      </div>
    </div>

    <div class="analysis-detail">
      <h4>ブランド×市場 詳細比較</h4>
      <table class="data-table">
        <thead>
          <tr>
            <th>ブランド</th>
            <th>自分（出品中）</th>
            <th>自分（売却）</th>
            <th>自分売上率</th>
            <th>市場件数</th>
            <th>市場売上率</th>
            <th>評価</th>
          </tr>
        </thead>
        <tbody>
          ${results.slice(0, 30).map(row => `
            <tr>
              <td>${escapeHtml(row.brand)}</td>
              <td>${row.myActive}</td>
              <td>${row.mySold}</td>
              <td>${row.mySellRate}%</td>
              <td>${row.marketCount}</td>
              <td>${row.marketSellRate}%</td>
              <td>${row.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  return html;
}

/**
 * 分析結果を表示
 */
function displayAnalysisResult(title, html) {
  const resultArea = document.getElementById('analysisResultArea');
  const titleEl = document.getElementById('analysisResultTitle');
  const contentEl = document.getElementById('analysisResultContent');

  if (!resultArea || !contentEl) return;

  if (titleEl) titleEl.textContent = title;
  contentEl.innerHTML = html;
  resultArea.style.display = 'block';

  // スクロール
  resultArea.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 分析結果を閉じる
 */
function closeAnalysisResult() {
  const resultArea = document.getElementById('analysisResultArea');
  if (resultArea) {
    resultArea.style.display = 'none';
  }
}

// =====================================
// チャート描画
// =====================================

/**
 * 出品・販売ペースチャート描画（棒グラフ）
 */
function drawListingPaceChart(data) {
  const canvas = document.getElementById('analysisChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (chartInstances.listingPace) {
    chartInstances.listingPace.destroy();
  }

  // 期間が長い場合はラベルを間引く
  const labelInterval = data.length > 60 ? 7 : (data.length > 30 ? 3 : 1);
  const labels = data.map((d, i) => {
    if (i % labelInterval === 0 || i === data.length - 1) {
      return d.label;
    }
    return '';
  });

  chartInstances.listingPace = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '出品数',
          data: data.map(d => d.listings || 0),
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.8
        },
        {
          label: '販売数',
          data: data.map(d => d.sales || 0),
          backgroundColor: COLORS.success,
          borderColor: COLORS.success,
          borderWidth: 1,
          barPercentage: 0.9,
          categoryPercentage: 0.8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              // ツールチップでは実際の日付を表示
              const idx = context[0].dataIndex;
              return data[idx].label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            autoSkip: false
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

/**
 * ブランドチャート描画
 */
function drawBrandChart(data) {
  const canvas = document.getElementById('analysisChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (chartInstances.brand) {
    chartInstances.brand.destroy();
  }

  chartInstances.brand = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.brand),
      datasets: [
        {
          label: '出品中',
          data: data.map(d => d.active),
          backgroundColor: COLORS.primary
        },
        {
          label: '販売済',
          data: data.map(d => d.sold),
          backgroundColor: COLORS.success
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * カテゴリチャート描画
 */
function drawCategoryChart(data) {
  const canvas = document.getElementById('analysisChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (chartInstances.category) {
    chartInstances.category.destroy();
  }

  chartInstances.category = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.active + d.sold),
        backgroundColor: COLORS.chart.slice(0, data.length)
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        }
      }
    }
  });
}

/**
 * 比較チャート描画
 */
function drawComparisonChart(data) {
  const canvas = document.getElementById('analysisChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  if (chartInstances.marketComparison) {
    chartInstances.marketComparison.destroy();
  }

  chartInstances.marketComparison = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.category),
      datasets: [
        {
          label: '自分',
          data: data.map(d => d.myActive + d.mySold),
          backgroundColor: COLORS.primary
        },
        {
          label: '市場',
          data: data.map(d => d.marketCount),
          backgroundColor: COLORS.info
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// =====================================
// AI提案タブ
// =====================================

/**
 * AI提案タブの初期化
 */
function initAITab() {
  // AI分析実行ボタン
  const runAIBtn = document.getElementById('runAIAnalysisBtn');
  if (runAIBtn) {
    runAIBtn.addEventListener('click', runAIAnalysis);
  }

  // チャット送信
  const sendChatBtn = document.getElementById('sendChatBtn');
  const chatInput = document.getElementById('chatInput');

  if (sendChatBtn) {
    sendChatBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
}

/**
 * APIステータス確認
 */
async function checkAPIStatus() {
  try {
    const settings = await chrome.storage.sync.get({
      openaiApiKey: '',
      claudeApiKey: '',
      geminiApiKey: ''
    });

    updateAPIStatus('openaiStatus', !!settings.openaiApiKey);
    updateAPIStatus('claudeStatus', !!settings.claudeApiKey);
    updateAPIStatus('geminiStatus', !!settings.geminiApiKey);
  } catch (error) {
    console.error('APIステータス確認エラー:', error);
  }
}

/**
 * APIステータス表示を更新
 */
function updateAPIStatus(elementId, isConfigured) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const dot = el.querySelector('.status-dot');
  if (dot) {
    dot.classList.toggle('connected', isConfigured);
    dot.classList.toggle('disconnected', !isConfigured);
  }
}

/**
 * AI分析実行
 */
async function runAIAnalysis() {
  showLoading('AI分析中...');

  try {
    // 選択されたAIを取得
    const selectedAI = document.querySelector('input[name="aiProvider"]:checked')?.value || 'openai';

    // 分析オプションを取得
    const options = {
      includeStrengths: document.getElementById('includeStrengths')?.checked ?? true,
      includePurchasing: document.getElementById('includePurchasing')?.checked ?? true,
      includePricing: document.getElementById('includePricing')?.checked ?? true,
      includeMarketTrends: document.getElementById('includeMarketTrends')?.checked ?? true
    };

    // APIキーを確認
    const settings = await chrome.storage.sync.get({
      openaiApiKey: '',
      claudeApiKey: '',
      geminiApiKey: ''
    });

    // 分析データを準備
    const analysisData = await prepareAIAnalysisData();

    if (selectedAI === 'compare') {
      // 全AI比較モード
      await runCompareAllAI(analysisData, settings, options);
    } else {
      // 単一AI分析
      await runSingleAIAnalysis(selectedAI, analysisData, settings, options);
    }

  } catch (error) {
    console.error('AI分析エラー:', error);
    showAlert('AI分析中にエラーが発生しました: ' + error.message, 'danger');
  } finally {
    hideLoading();
  }
}

/**
 * AI分析用データを準備
 */
async function prepareAIAnalysisData() {
  const summary = analyzer.getAISummary ? analyzer.getAISummary() : {
    summary: analyzer.results?.summary || {},
    brandPerformance: analyzer.results?.brandPerformance || [],
    categoryStats: analyzer.results?.categoryStats || [],
    watchRanking: analyzer.results?.watchRanking || [],
    listingPace: analyzer.results?.listingPace || []
  };

  // 市場データを追加
  try {
    const marketData = await BunsekiDB.getMarketData();
    if (marketData && marketData.length > 0) {
      summary.marketData = summarizeMarketData(marketData);
    }
  } catch (error) {
    console.error('市場データ取得エラー:', error);
  }

  return summary;
}

/**
 * 市場データをサマリー化
 */
function summarizeMarketData(marketData) {
  const brandStats = {};

  marketData.forEach(item => {
    const brand = item.brand || '(不明)';
    if (!brandStats[brand]) {
      brandStats[brand] = { count: 0, totalPrice: 0, soldCount: 0 };
    }
    brandStats[brand].count++;
    brandStats[brand].totalPrice += item.price || 0;
    if (item.sold) brandStats[brand].soldCount++;
  });

  const topBrands = Object.entries(brandStats)
    .filter(([brand]) => brand !== '(不明)')
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20)
    .map(([brand, stats]) => ({
      brand,
      count: stats.count,
      avgPrice: Math.round(stats.totalPrice / stats.count),
      soldCount: stats.soldCount
    }));

  return {
    totalItems: marketData.length,
    topBrands
  };
}

/**
 * 単一AI分析
 */
async function runSingleAIAnalysis(provider, data, settings, options) {
  let apiKey;
  let action;

  switch (provider) {
    case 'openai':
      apiKey = settings.openaiApiKey;
      action = 'analyzeWithAI';
      break;
    case 'claude':
      apiKey = settings.claudeApiKey;
      action = 'analyzeWithClaude';
      break;
    case 'gemini':
      apiKey = settings.geminiApiKey;
      action = 'analyzeWithGemini';
      break;
    default:
      throw new Error('不明なAIプロバイダーです');
  }

  if (!apiKey) {
    showAlert(`${provider.toUpperCase()}のAPIキーが設定されていません。設定画面で登録してください。`, 'warning');
    return;
  }

  const response = await chrome.runtime.sendMessage({
    action,
    data,
    apiKey,
    options
  });

  if (response.success) {
    currentAIResult = response.data;
    displayAIResult(provider, response.data);
    await chrome.storage.local.set({ savedAIResults: response.data });
  } else {
    throw new Error(response.error);
  }
}

/**
 * 全AI比較分析
 */
async function runCompareAllAI(data, settings, options) {
  const results = {};
  const providers = ['openai', 'claude', 'gemini'];
  const actions = {
    openai: 'analyzeWithAI',
    claude: 'analyzeWithClaude',
    gemini: 'analyzeWithGemini'
  };
  const apiKeys = {
    openai: settings.openaiApiKey,
    claude: settings.claudeApiKey,
    gemini: settings.geminiApiKey
  };

  // 並列実行
  const promises = providers.map(async (provider) => {
    if (!apiKeys[provider]) {
      return { provider, error: 'APIキー未設定' };
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: actions[provider],
        data,
        apiKey: apiKeys[provider],
        options
      });

      if (response.success) {
        return { provider, data: response.data };
      } else {
        return { provider, error: response.error };
      }
    } catch (error) {
      return { provider, error: error.message };
    }
  });

  const allResults = await Promise.all(promises);

  // 結果を整理
  allResults.forEach(result => {
    results[result.provider] = result.error ? { error: result.error } : result.data;
  });

  displayCompareResults(results);
}

/**
 * AI分析結果を表示
 */
function displayAIResult(provider, data) {
  const resultArea = document.getElementById('aiResultArea');
  const tabsEl = document.getElementById('aiResultTabs');
  const contentEl = document.getElementById('aiResultContent');

  if (!resultArea || !contentEl) return;

  // タブは非表示（単一AI）
  if (tabsEl) tabsEl.style.display = 'none';

  // 結果を表示
  contentEl.innerHTML = formatAIResultHTML(data, provider);
  resultArea.style.display = 'block';

  // スクロール
  resultArea.scrollIntoView({ behavior: 'smooth' });
}

/**
 * AI比較結果を表示
 */
function displayCompareResults(results) {
  const resultArea = document.getElementById('aiResultArea');
  const tabsEl = document.getElementById('aiResultTabs');
  const contentEl = document.getElementById('aiResultContent');

  if (!resultArea || !contentEl) return;

  // タブを生成
  if (tabsEl) {
    tabsEl.style.display = 'flex';
    tabsEl.innerHTML = `
      <button class="ai-result-tab active" data-provider="openai">🟢 OpenAI</button>
      <button class="ai-result-tab" data-provider="claude">🟠 Claude</button>
      <button class="ai-result-tab" data-provider="gemini">🔵 Gemini</button>
    `;

    // タブクリックイベント
    tabsEl.querySelectorAll('.ai-result-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        tabsEl.querySelectorAll('.ai-result-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const provider = tab.dataset.provider;
        const data = results[provider];

        if (data && !data.error) {
          contentEl.innerHTML = formatAIResultHTML(data, provider);
        } else {
          contentEl.innerHTML = `
            <div class="ai-error">
              <p>❌ ${data?.error || '分析に失敗しました'}</p>
            </div>
          `;
        }
      });
    });
  }

  // 初期表示（OpenAI）
  const initialData = results.openai;
  if (initialData && !initialData.error) {
    contentEl.innerHTML = formatAIResultHTML(initialData, 'openai');
  } else {
    contentEl.innerHTML = `
      <div class="ai-error">
        <p>❌ ${initialData?.error || '分析に失敗しました'}</p>
      </div>
    `;
  }

  resultArea.style.display = 'block';
  resultArea.scrollIntoView({ behavior: 'smooth' });
}

/**
 * AI結果をHTMLにフォーマット
 */
function formatAIResultHTML(data, provider) {
  const providerName = {
    openai: 'OpenAI GPT-4',
    claude: 'Claude 3.5',
    gemini: 'Gemini Pro'
  }[provider] || provider;

  let html = `<div class="ai-result-header"><span>📊 ${providerName} の分析結果</span></div>`;

  // アラート
  if (data.alerts && data.alerts.length > 0) {
    html += `
      <div class="ai-section alerts">
        <h4>⚠️ アラート</h4>
        <ul>
          ${data.alerts.map(a => `<li><strong>${escapeHtml(a.name)}</strong>: ${escapeHtml(a.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 強化推奨
  if (data.strengthen && data.strengthen.length > 0) {
    html += `
      <div class="ai-section strengths">
        <h4>💪 強化推奨</h4>
        <ul>
          ${data.strengthen.map(s => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 見直し推奨
  if (data.review && data.review.length > 0) {
    html += `
      <div class="ai-section reviews">
        <h4>🔍 見直し推奨</h4>
        <ul>
          ${data.review.map(r => `<li><strong>${escapeHtml(r.name)}</strong>: ${escapeHtml(r.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 売れ筋・チャンス
  if (data.opportunities && data.opportunities.length > 0) {
    html += `
      <div class="ai-section opportunities">
        <h4>💡 仕入れチャンス</h4>
        <ul>
          ${data.opportunities.map(o => `<li><strong>${escapeHtml(o.name)}</strong>: ${escapeHtml(o.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 総合提案
  if (data.suggestion) {
    html += `
      <div class="ai-section suggestion">
        <h4>📝 総合提案</h4>
        <p>${escapeHtml(data.suggestion)}</p>
      </div>
    `;
  }

  return html;
}

/**
 * チャットメッセージ送信
 */
async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messagesEl = document.getElementById('chatMessages');

  if (!input || !messagesEl) return;

  const message = input.value.trim();
  if (!message) return;

  // ユーザーメッセージを表示
  addChatMessage('user', message);
  input.value = '';

  // プレースホルダーを削除
  const placeholder = messagesEl.querySelector('.chat-placeholder');
  if (placeholder) placeholder.remove();

  // AIに送信
  try {
    const selectedAI = document.querySelector('input[name="aiProvider"]:checked')?.value || 'openai';
    const settings = await chrome.storage.sync.get({
      openaiApiKey: '',
      claudeApiKey: '',
      geminiApiKey: ''
    });

    let apiKey;
    let action;

    switch (selectedAI) {
      case 'claude':
        apiKey = settings.claudeApiKey;
        action = 'chatWithClaude';
        break;
      case 'gemini':
        apiKey = settings.geminiApiKey;
        action = 'chatWithGemini';
        break;
      default:
        apiKey = settings.openaiApiKey;
        action = 'chatWithAI';
    }

    if (!apiKey) {
      addChatMessage('assistant', 'APIキーが設定されていません。設定画面で登録してください。');
      return;
    }

    // 分析データを準備
    const analysisData = {
      summary: analyzer.results?.summary || {},
      brandPerformance: analyzer.results?.brandPerformance?.slice(0, 20) || []
    };

    const response = await chrome.runtime.sendMessage({
      action,
      message,
      history: chatHistory,
      analysisData,
      apiKey
    });

    if (response.success) {
      addChatMessage('assistant', response.data);
      chatHistory.push({ role: 'user', content: message });
      chatHistory.push({ role: 'assistant', content: response.data });
    } else {
      addChatMessage('assistant', 'エラーが発生しました: ' + response.error);
    }
  } catch (error) {
    console.error('チャットエラー:', error);
    addChatMessage('assistant', 'エラーが発生しました: ' + error.message);
  }
}

/**
 * チャットメッセージを追加
 */
function addChatMessage(role, content) {
  const messagesEl = document.getElementById('chatMessages');
  if (!messagesEl) return;

  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${role}`;
  messageEl.innerHTML = `
    <div class="message-content">${escapeHtml(content)}</div>
  `;

  messagesEl.appendChild(messageEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// =====================================
// 設定
// =====================================

/**
 * 設定の初期化
 */
function initSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

// =====================================
// ユーティリティ関数
// =====================================

/**
 * ローディング表示
 */
function showLoading(message = '処理中...') {
  const overlay = document.getElementById('loadingOverlay');
  const messageEl = document.getElementById('loadingMessage');

  if (overlay) overlay.style.display = 'flex';
  if (messageEl) messageEl.textContent = message;
}

/**
 * ローディング非表示
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

/**
 * アラート表示
 */
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertContainer');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button class="alert-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(alert);

  // 自動削除
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

/**
 * 日付フォーマット
 */
function formatDate(date) {
  if (!date || !(date instanceof Date)) return '-';
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d}`;
}

/**
 * 日時フォーマット
 */
function formatDateTime(date) {
  if (!date || !(date instanceof Date)) return '-';
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${m}/${d} ${h}:${min}`;
}

/**
 * テキスト省略
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * ファイルをテキストとして読み込む
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file, 'UTF-8');
  });
}

/**
 * タイトルからブランドを抽出
 */
function extractBrandFromTitle(title) {
  if (!title) return '(不明)';

  const titleUpper = title.toUpperCase();

  // ブランドパターン
  const brandPatterns = [
    // ジュエリーブランド
    { pattern: /\b(TIFFANY)\b/i, brand: 'TIFFANY' },
    { pattern: /\b(CARTIER)\b/i, brand: 'CARTIER' },
    { pattern: /\b(BVLGARI|BULGARI)\b/i, brand: 'BVLGARI' },
    { pattern: /\b(VAN CLEEF|VCA)\b/i, brand: 'VAN CLEEF' },
    { pattern: /\b(HARRY WINSTON)\b/i, brand: 'HARRY WINSTON' },
    { pattern: /\b(DAVID YURMAN)\b/i, brand: 'DAVID YURMAN' },
    { pattern: /\b(MIKIMOTO)\b/i, brand: 'MIKIMOTO' },
    { pattern: /\b(PANDORA)\b/i, brand: 'PANDORA' },
    { pattern: /\b(SWAROVSKI)\b/i, brand: 'SWAROVSKI' },
    { pattern: /\b(CHOPARD)\b/i, brand: 'CHOPARD' },
    { pattern: /\b(PIAGET)\b/i, brand: 'PIAGET' },
    { pattern: /\b(BOUCHERON)\b/i, brand: 'BOUCHERON' },
    { pattern: /\b(GRAFF)\b/i, brand: 'GRAFF' },

    // 時計ブランド
    { pattern: /\b(ROLEX)\b/i, brand: 'ROLEX' },
    { pattern: /\b(OMEGA)\b/i, brand: 'OMEGA' },
    { pattern: /\b(TAG HEUER)\b/i, brand: 'TAG HEUER' },
    { pattern: /\b(BREITLING)\b/i, brand: 'BREITLING' },
    { pattern: /\b(PATEK PHILIPPE)\b/i, brand: 'PATEK PHILIPPE' },
    { pattern: /\b(AUDEMARS PIGUET|AP)\b/i, brand: 'AUDEMARS PIGUET' },
    { pattern: /\b(IWC)\b/i, brand: 'IWC' },
    { pattern: /\b(LONGINES)\b/i, brand: 'LONGINES' },
    { pattern: /\b(TISSOT)\b/i, brand: 'TISSOT' },
    { pattern: /\b(SEIKO)\b/i, brand: 'SEIKO' },
    { pattern: /\b(CITIZEN)\b/i, brand: 'CITIZEN' },
    { pattern: /\b(CASIO|G-SHOCK)\b/i, brand: 'CASIO' },
    { pattern: /\b(TUDOR)\b/i, brand: 'TUDOR' },

    // ファッションブランド
    { pattern: /\b(LOUIS VUITTON|LV)\b/i, brand: 'LOUIS VUITTON' },
    { pattern: /\b(GUCCI)\b/i, brand: 'GUCCI' },
    { pattern: /\b(CHANEL)\b/i, brand: 'CHANEL' },
    { pattern: /\b(HERMES|HERMÈS)\b/i, brand: 'HERMES' },
    { pattern: /\b(PRADA)\b/i, brand: 'PRADA' },
    { pattern: /\b(BURBERRY)\b/i, brand: 'BURBERRY' },
    { pattern: /\b(FENDI)\b/i, brand: 'FENDI' },
    { pattern: /\b(DIOR)\b/i, brand: 'DIOR' },
    { pattern: /\b(CELINE|CÉLINE)\b/i, brand: 'CELINE' },
    { pattern: /\b(BALENCIAGA)\b/i, brand: 'BALENCIAGA' },
    { pattern: /\b(BOTTEGA VENETA)\b/i, brand: 'BOTTEGA VENETA' },
    { pattern: /\b(LOEWE)\b/i, brand: 'LOEWE' },
    { pattern: /\b(SAINT LAURENT|YSL)\b/i, brand: 'SAINT LAURENT' },
    { pattern: /\b(GIVENCHY)\b/i, brand: 'GIVENCHY' },
    { pattern: /\b(VALENTINO)\b/i, brand: 'VALENTINO' },
    { pattern: /\b(MIU MIU)\b/i, brand: 'MIU MIU' },
    { pattern: /\b(COACH)\b/i, brand: 'COACH' },
    { pattern: /\b(MICHAEL KORS)\b/i, brand: 'MICHAEL KORS' },
    { pattern: /\b(KATE SPADE)\b/i, brand: 'KATE SPADE' },
    { pattern: /\b(TORY BURCH)\b/i, brand: 'TORY BURCH' },
    { pattern: /\b(MARC JACOBS)\b/i, brand: 'MARC JACOBS' },
    { pattern: /\b(VERSACE)\b/i, brand: 'VERSACE' },
    { pattern: /\b(DOLCE.*GABBANA|D&G)\b/i, brand: 'DOLCE & GABBANA' },
    { pattern: /\b(ARMANI)\b/i, brand: 'ARMANI' },
    { pattern: /\b(MOSCHINO)\b/i, brand: 'MOSCHINO' },
    { pattern: /\b(MCM)\b/i, brand: 'MCM' },
    { pattern: /\b(FERRAGAMO)\b/i, brand: 'FERRAGAMO' },
    { pattern: /\b(JIMMY CHOO)\b/i, brand: 'JIMMY CHOO' },

    // スポーツ・カジュアル
    { pattern: /\b(NIKE)\b/i, brand: 'NIKE' },
    { pattern: /\b(ADIDAS)\b/i, brand: 'ADIDAS' },
    { pattern: /\b(NEW BALANCE)\b/i, brand: 'NEW BALANCE' },
    { pattern: /\b(PUMA)\b/i, brand: 'PUMA' },
    { pattern: /\b(REEBOK)\b/i, brand: 'REEBOK' },
    { pattern: /\b(CONVERSE)\b/i, brand: 'CONVERSE' },
    { pattern: /\b(VANS)\b/i, brand: 'VANS' },
    { pattern: /\b(SUPREME)\b/i, brand: 'SUPREME' },
    { pattern: /\b(NORTH FACE)\b/i, brand: 'THE NORTH FACE' },
    { pattern: /\b(PATAGONIA)\b/i, brand: 'PATAGONIA' },
    { pattern: /\b(LEVI'?S)\b/i, brand: 'LEVIS' },
    { pattern: /\b(RALPH LAUREN|POLO)\b/i, brand: 'RALPH LAUREN' },
    { pattern: /\b(TOMMY HILFIGER)\b/i, brand: 'TOMMY HILFIGER' },
    { pattern: /\b(CALVIN KLEIN|CK)\b/i, brand: 'CALVIN KLEIN' }
  ];

  for (const { pattern, brand } of brandPatterns) {
    if (pattern.test(titleUpper)) {
      return brand;
    }
  }

  return '(不明)';
}

/**
 * タイトルからカテゴリを検出
 */
function detectCategoryFromTitle(title) {
  if (!title) return 'その他';

  const titleLower = title.toLowerCase();

  for (const [key, category] of Object.entries(ANALYSIS_CATEGORIES)) {
    for (const keyword of category.keywords) {
      if (titleLower.includes(keyword.toLowerCase())) {
        return category.nameJa;
      }
    }
  }

  return 'その他';
}

// =====================================
// グローバルエクスポート（互換性のため）
// =====================================

window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showAlert = showAlert;
