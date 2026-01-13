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

// 現在のシートID（sheet1〜sheet10）
let currentSheetId = 'sheet1';

/**
 * シート固有のストレージキーを生成
 */
function getSheetKey(baseKey) {
  return `${baseKey}_${currentSheetId}`;
}

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

// 分析用カテゴリ定義（細分類付き）
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
    ],
    subcategories: {
      bags: { nameJa: 'バッグ', keywords: ['bag', 'handbag', 'shoulder', 'tote', 'backpack', 'clutch', 'crossbody', 'satchel', 'hobo', 'bucket bag', 'messenger'] },
      wallets: { nameJa: '財布・小物', keywords: ['wallet', 'purse', 'pouch', 'card case', 'card holder', 'coin purse', 'coin case', 'key case', 'key holder', 'keyring', 'key ring', 'key chain'] },
      shoes: { nameJa: '靴', keywords: ['shoes', 'sneakers', 'boots', 'heels', 'pumps', 'sandals', 'loafers', 'flats', 'oxford', 'mules', 'slides', 'espadrilles', 'moccasin'] },
      tops: { nameJa: 'トップス', keywords: ['shirt', 'blouse', 'top', 'sweater', 'cardigan', 'hoodie', 't-shirt', 'tee', 'tank', 'polo shirt', 'knit'] },
      outerwear: { nameJa: 'アウター', keywords: ['jacket', 'coat', 'blazer', 'parka', 'down', 'trench', 'bomber', 'leather jacket', 'denim jacket'] },
      bottoms: { nameJa: 'ボトムス', keywords: ['pants', 'jeans', 'skirt', 'shorts', 'trousers', 'leggings', 'culottes'] },
      dresses: { nameJa: 'ドレス・ワンピース', keywords: ['dress', 'gown', 'maxi', 'midi', 'mini dress', 'cocktail'] },
      accessories: { nameJa: 'アクセサリー', keywords: ['scarf', 'belt', 'tie', 'hat', 'cap', 'gloves', 'sunglasses', 'beanie', 'headband', 'hair'] },
      other_clothing: { nameJa: 'その他衣類', keywords: [] }
    }
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
    ],
    subcategories: {
      watches: { nameJa: '時計', keywords: ['watch', 'watches', 'wristwatch', 'timepiece', 'chronograph', 'rolex', 'omega', 'tag heuer', 'breitling', 'patek', 'audemars', 'iwc', 'longines', 'tissot', 'seiko', 'citizen', 'casio', 'g-shock', 'tudor', 'hamilton', 'orient', 'movado', 'fossil'] },
      necklaces: { nameJa: 'ネックレス・ペンダント', keywords: ['necklace', 'pendant', 'chain', 'choker', 'lariat'] },
      bracelets: { nameJa: 'ブレスレット・バングル', keywords: ['bracelet', 'bangle', 'cuff', 'tennis bracelet', 'charm bracelet'] },
      rings: { nameJa: 'リング・指輪', keywords: ['engagement ring', 'wedding ring', 'cocktail ring', 'signet ring', 'diamond ring', 'gold ring', 'silver ring', 'platinum ring'] },
      earrings: { nameJa: 'ピアス・イヤリング', keywords: ['earring', 'earrings', 'stud earring', 'hoop earring', 'drop earring', 'dangle earring', 'clip-on earring', 'ear cuff'] },
      brooches: { nameJa: 'ブローチ・ピン', keywords: ['brooch', 'pin', 'lapel'] },
      fine_jewelry: { nameJa: 'ファインジュエリー', keywords: ['diamond', 'gold', 'platinum', 'pearl', 'ruby', 'sapphire', 'emerald', '18k', '14k', 'sterling', '925', 'tiffany', 'cartier', 'bvlgari', 'van cleef', 'harry winston'] },
      other_jewelry: { nameJa: 'その他ジュエリー', keywords: ['anklet', 'charm', 'body jewelry'] }
    }
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
  // ブランドマスターを初期化
  if (typeof brandMaster !== 'undefined') {
    await brandMaster.init();
    console.log('ブランドマスター初期化完了:', brandMaster.brands.length, '件');
  }

  // 認証状態を最初にチェック
  await initAuthCheck();

  // シート管理を初期化
  await initSheetManagement();

  initTabs();
  initDataInput();
  initAnalysisButtons();
  initMarketAnalysis();
  initAITab();
  // initSettings(); は削除 - initSettingsUI()で設定モーダルを使用

  // 保存データの復元
  await loadSavedData();
  await updateMarketDataInfo();
  await checkAPIStatus();

  // 学習済みルールを常に表示（手動入力用）
  updateLearnedRulesDisplay();

  // 前回の分析結果を表示
  await restoreAnalysisResults();

  // タブ制限を適用（認証状態に基づく）
  await applyTabRestrictions();

  // カード分析機能を初期化
  initPokemonCorrectionEvents();
  await loadCustomPokemonDict();
  await displayCustomDictList();
  updatePokemonCorrectionVisibility();

  // カード分析タブを初期化（市場分析用）
  initPokemonAnalysisTabs();
  updatePokemonAnalysisVisibility();

  // カード分析タブを初期化（自分の分析用）
  initMyPokemonAnalysisTabs();
  updateMyPokemonAnalysisVisibility();

  // プロファイルに応じたUIラベルを更新
  updateCardAnalysisLabels();
});

// =====================================
// シート管理（固定10シート方式）
// =====================================

// シートプロファイル定義
const SHEET_PROFILES = {
  general: {
    id: 'general',
    name: '汎用',
    icon: '📊',
    description: '全カテゴリ対応の標準分析',
    hasCardAnalysis: false
  },
  pokemon: {
    id: 'pokemon',
    name: 'ポケモンカード',
    icon: '⚡',
    description: 'ポケカ専用分析（キャラ/セット/グレーディング）',
    hasCardAnalysis: true,
    tabs: {
      character: 'カード名',
      set: 'シリーズ',
      grade: 'グレード',
      rarity: 'レアリティ'
    },
    analysisTitle: 'ポケモンカード分析',
    attributeTitle: 'ポケモン属性別内訳',
    correctionTitle: 'ポケモンカード辞書補正',
    characterLabel: 'カード名（ポケモン名）別の販売傾向を表示します',
    setLabel: 'セット（パック・拡張）別の販売傾向を表示します',
    gradeLabel: 'PSA/BGS/CGCなどのグレード別価格分布を表示します',
    rarityLabel: 'レアリティ（SAR、SR、UR等）別の販売傾向を表示します',
    emptyMessages: {
      character: 'カード名が認識されていません',
      set: 'セットが認識されていません',
      grade: 'グレード情報がありません',
      rarity: 'レアリティが認識されていません'
    }
  },
  yugioh: {
    id: 'yugioh',
    name: '遊戯王カード',
    icon: '🎴',
    description: '遊戯王専用分析（カード名/レアリティ/シリーズ）',
    hasCardAnalysis: true,
    tabs: {
      character: 'カード名',
      set: 'パック/シリーズ',
      grade: 'グレード',
      rarity: 'レアリティ'
    },
    analysisTitle: '遊戯王カード分析',
    attributeTitle: '遊戯王属性別内訳',
    correctionTitle: '遊戯王カード辞書補正',
    characterLabel: 'カード名別の販売傾向を表示します',
    setLabel: 'パック・シリーズ別の販売傾向を表示します',
    gradeLabel: 'PSA/BGS/CGCなどのグレード別価格分布を表示します',
    rarityLabel: 'レアリティ（Ghost、Starlight、Ultimate等）別の販売傾向を表示します',
    emptyMessages: {
      character: 'カード名が認識されていません',
      set: 'パック/シリーズが認識されていません',
      grade: 'グレード情報がありません',
      rarity: 'レアリティが認識されていません'
    }
  },
  onepiece: {
    id: 'onepiece',
    name: 'ワンピースカード',
    icon: '🏴‍☠️',
    description: 'ワンピカ専用分析（キャラ/シリーズ/レアリティ）',
    hasCardAnalysis: true,
    tabs: {
      character: 'キャラクター',
      set: 'ブースター/スターター',
      grade: 'グレード',
      rarity: 'レアリティ'
    },
    analysisTitle: 'ワンピースカード分析',
    attributeTitle: 'ワンピース属性別内訳',
    correctionTitle: 'ワンピースカード辞書補正',
    characterLabel: 'キャラクター別の販売傾向を表示します',
    setLabel: 'ブースター・スターター別の販売傾向を表示します',
    gradeLabel: 'PSA/BGS/CGCなどのグレード別価格分布を表示します',
    rarityLabel: 'レアリティ（SEC、SP、L、SR等）別の販売傾向を表示します',
    emptyMessages: {
      character: 'キャラクターが認識されていません',
      set: 'ブースター/スターターが認識されていません',
      grade: 'グレード情報がありません',
      rarity: 'レアリティが認識されていません'
    }
  },
  watch: {
    id: 'watch',
    name: '時計',
    icon: '⌚',
    description: '時計専用分析（ブランド/タイプ/ムーブメント/サイズ）',
    hasCardAnalysis: true,
    tabs: {
      character: 'ブランド',
      set: 'タイプ',
      grade: 'ムーブメント',
      rarity: 'サイズ'
    },
    analysisTitle: '時計分析',
    attributeTitle: '時計属性別内訳',
    correctionTitle: '時計辞書補正',
    characterLabel: 'ブランド別の販売傾向を表示します',
    setLabel: 'タイプ（ダイバー、クロノグラフ等）別の販売傾向を表示します',
    gradeLabel: 'ムーブメント（自動巻き、クォーツ等）別の販売傾向を表示します',
    rarityLabel: 'サイズ（メンズ、レディース等）別の販売傾向を表示します',
    emptyMessages: {
      character: 'ブランドが認識されていません',
      set: 'タイプが認識されていません',
      grade: 'ムーブメントが認識されていません',
      rarity: 'サイズが認識されていません'
    }
  }
};

// 現在のシートプロファイル
let currentSheetProfile = 'general';

/**
 * プロファイルに応じた属性抽出
 * @param {string} title - 商品タイトル
 * @param {string} profile - プロファイルID（省略時は現在のプロファイル）
 * @returns {object|null} - 抽出された属性
 */
function extractAttributesByProfile(title, profile = currentSheetProfile) {
  if (!title) return null;

  switch (profile) {
    case 'pokemon':
      if (typeof PokemonProfile !== 'undefined') {
        return PokemonProfile.extractAttributes(title);
      }
      break;
    case 'yugioh':
      if (typeof YugiohProfile !== 'undefined') {
        return YugiohProfile.extractAttributes(title);
      }
      break;
    case 'onepiece':
      if (typeof OnePieceProfile !== 'undefined') {
        return OnePieceProfile.extractAttributes(title);
      }
      break;
    case 'watch':
      if (typeof WatchProfile !== 'undefined') {
        return WatchProfile.extractAttributes(title);
      }
      break;
    case 'general':
    default:
      // 汎用プロファイルは属性抽出なし
      return null;
  }

  return null;
}

/**
 * 市場データに属性を付与
 * @param {Array} items - 市場データ配列
 * @returns {Array} - 属性付きデータ配列
 */
function enrichMarketDataWithAttributes(items) {
  if (!items || !Array.isArray(items)) return items;
  if (currentSheetProfile === 'general') return items;

  return items.map(item => {
    const attributes = extractAttributesByProfile(item.title);
    if (attributes) {
      return {
        ...item,
        attributes,
        profileExtracted: currentSheetProfile
      };
    }
    return item;
  });
}

// デフォルトのシート名
const DEFAULT_SHEET_NAMES = {
  sheet1: 'シート1',
  sheet2: 'シート2',
  sheet3: 'シート3',
  sheet4: 'シート4',
  sheet5: 'シート5',
  sheet6: 'シート6',
  sheet7: 'シート7',
  sheet8: 'シート8',
  sheet9: 'シート9',
  sheet10: 'シート10'
};

/**
 * シート管理の初期化
 */
async function initSheetManagement() {
  const sheetSelect = document.getElementById('sheetSelect');
  const renameSheetBtn = document.getElementById('renameSheetBtn');
  const renameSheetModal = document.getElementById('renameSheetModal');

  if (!sheetSelect) return;

  // 保存されたシート名を読み込んで適用
  await loadSheetNames();

  // 前回選択していたシートを復元
  const savedSheetId = localStorage.getItem('currentSheetId') || 'sheet1';
  if (sheetSelect.querySelector(`option[value="${savedSheetId}"]`)) {
    sheetSelect.value = savedSheetId;
    currentSheetId = savedSheetId;
  }

  // BunsekiDBにも設定
  if (typeof BunsekiDB !== 'undefined') {
    BunsekiDB.currentSheetId = currentSheetId;
  }

  // プロファイルを読み込んで表示
  currentSheetProfile = await getSheetProfile(currentSheetId);
  const profileSelect = document.getElementById('profileSelect');
  if (profileSelect) {
    profileSelect.value = currentSheetProfile;

    // プロファイル変更イベント
    profileSelect.addEventListener('change', async (e) => {
      const newProfile = e.target.value;
      await setSheetProfile(currentSheetId, newProfile);
      showAlert(`プロファイルを「${SHEET_PROFILES[newProfile]?.name || newProfile}」に変更しました`, 'success');

      // プロファイル変更後、自分のデータ表示を再描画
      await restoreMyDataDisplay();
    });
  }

  // シート選択変更
  sheetSelect.addEventListener('change', async (e) => {
    console.log('シート切替:', e.target.value);
    await switchSheet(e.target.value);
  });

  // シート名変更ボタン
  if (renameSheetBtn) {
    renameSheetBtn.addEventListener('click', () => {
      if (renameSheetModal) {
        const currentName = sheetSelect.options[sheetSelect.selectedIndex].textContent;
        const input = document.getElementById('newSheetName');
        if (input) {
          input.value = currentName;
          input.select();
        }
        renameSheetModal.classList.remove('hidden');
      }
    });
  }

  // シート名変更モーダルのイベント
  const confirmRenameSheet = document.getElementById('confirmRenameSheet');
  const cancelRenameSheet = document.getElementById('cancelRenameSheet');
  const closeRenameSheetModalBtn = document.getElementById('closeRenameSheetModalBtn');

  if (confirmRenameSheet) {
    confirmRenameSheet.addEventListener('click', async () => {
      const input = document.getElementById('newSheetName');
      const name = input?.value?.trim();
      if (name) {
        await renameSheet(currentSheetId, name);
        renameSheetModal.classList.add('hidden');
      }
    });
  }

  if (cancelRenameSheet) {
    cancelRenameSheet.addEventListener('click', () => {
      renameSheetModal.classList.add('hidden');
    });
  }

  if (closeRenameSheetModalBtn) {
    closeRenameSheetModalBtn.addEventListener('click', () => {
      renameSheetModal.classList.add('hidden');
    });
  }

  // Enterキーで確定
  const newSheetNameInput = document.getElementById('newSheetName');
  if (newSheetNameInput) {
    newSheetNameInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const name = newSheetNameInput.value?.trim();
        if (name) {
          await renameSheet(currentSheetId, name);
          renameSheetModal.classList.add('hidden');
        }
      }
    });
  }

  // モーダル背景クリックで閉じる
  if (renameSheetModal) {
    renameSheetModal.addEventListener('click', (e) => {
      if (e.target === renameSheetModal) {
        renameSheetModal.classList.add('hidden');
      }
    });
  }
}

/**
 * 保存されたシート名を読み込んで適用
 */
async function loadSheetNames() {
  const sheetSelect = document.getElementById('sheetSelect');
  if (!sheetSelect) return;

  // chrome.storage.localからシート名を取得
  const result = await chrome.storage.local.get('sheetNames');
  const sheetNames = result.sheetNames || {};

  // 各optionのテキストを更新
  for (let i = 1; i <= 10; i++) {
    const sheetId = `sheet${i}`;
    const option = sheetSelect.querySelector(`option[value="${sheetId}"]`);
    if (option) {
      option.textContent = sheetNames[sheetId] || DEFAULT_SHEET_NAMES[sheetId];
    }
  }
}

/**
 * シート名を変更
 */
async function renameSheet(sheetId, newName) {
  // 既存のシート名を取得
  const result = await chrome.storage.local.get('sheetNames');
  const sheetNames = result.sheetNames || {};

  // シート名を更新
  sheetNames[sheetId] = newName;
  await chrome.storage.local.set({ sheetNames });

  // セレクトボックスを更新
  const sheetSelect = document.getElementById('sheetSelect');
  if (sheetSelect) {
    const option = sheetSelect.querySelector(`option[value="${sheetId}"]`);
    if (option) {
      option.textContent = newName;
    }
  }

  console.log('シート名を変更:', sheetId, '->', newName);
}

/**
 * シートプロファイルを取得
 */
async function getSheetProfile(sheetId) {
  const result = await chrome.storage.local.get('sheetProfiles');
  const profiles = result.sheetProfiles || {};
  return profiles[sheetId] || 'general';
}

/**
 * シートプロファイルを保存
 */
async function setSheetProfile(sheetId, profileId) {
  const result = await chrome.storage.local.get('sheetProfiles');
  const profiles = result.sheetProfiles || {};
  profiles[sheetId] = profileId;
  await chrome.storage.local.set({ sheetProfiles: profiles });

  // 現在のシートなら変数も更新
  if (sheetId === currentSheetId) {
    currentSheetProfile = profileId;
    updateProfileDisplay();
  }

  console.log('シートプロファイルを変更:', sheetId, '->', profileId);
}

/**
 * プロファイル表示を更新
 */
function updateProfileDisplay() {
  const profileSelect = document.getElementById('profileSelect');
  if (profileSelect) {
    profileSelect.value = currentSheetProfile;
  }

  // プロファイルバッジを更新
  const profileBadge = document.getElementById('profileBadge');
  if (profileBadge) {
    const profile = SHEET_PROFILES[currentSheetProfile] || SHEET_PROFILES.general;
    profileBadge.innerHTML = `${profile.icon} ${profile.name}`;
    profileBadge.title = profile.description;
  }

  // カード分析セクションのラベルを動的に更新
  updateCardAnalysisLabels();

  // カード補正セクションの表示/非表示
  updatePokemonCorrectionVisibility();

  // カード分析タブの表示/非表示（市場分析・自分の分析両方）
  updatePokemonAnalysisVisibility();
  updateMyPokemonAnalysisVisibility();
}

/**
 * カード分析UIのラベルをプロファイルに応じて更新
 */
function updateCardAnalysisLabels() {
  const profile = SHEET_PROFILES[currentSheetProfile];
  if (!profile || !profile.hasCardAnalysis) return;

  // タブアイコン定義
  const tabIcons = {
    character: '🐾',
    set: '📦',
    grade: '🏅',
    rarity: '✨'
  };

  // 市場分析用ラベル更新
  // 分析タブのタイトル
  const tabsTitle = document.querySelector('#pokemonAnalysisTabs .pokemon-tabs-title');
  if (tabsTitle) {
    tabsTitle.textContent = profile.analysisTitle;
  }
  const tabsIcon = document.querySelector('#pokemonAnalysisTabs .pokemon-tabs-icon');
  if (tabsIcon) {
    tabsIcon.textContent = profile.icon;
  }

  // 属性別内訳のタイトル（h4直下）
  const attrTitle = document.querySelector('#pokemonAttributeColumn > h4');
  if (attrTitle) {
    attrTitle.textContent = profile.attributeTitle;
  }

  // タブボタンのラベル（span内を更新）
  document.querySelectorAll('#pokemonAnalysisTabs .pokemon-subtab').forEach(tab => {
    const tabId = tab.dataset.pokemonTab;
    const span = tab.querySelector('span');
    if (!span) return;
    if (tabId === 'character-ranking' && profile.tabs.character) {
      span.textContent = `${tabIcons.character} ${profile.tabs.character}`;
    } else if (tabId === 'set-ranking' && profile.tabs.set) {
      span.textContent = `${tabIcons.set} ${profile.tabs.set}`;
    } else if (tabId === 'grade-analysis' && profile.tabs.grade) {
      span.textContent = `${tabIcons.grade} ${profile.tabs.grade}`;
    } else if (tabId === 'rarity-analysis' && profile.tabs.rarity) {
      span.textContent = `${tabIcons.rarity} ${profile.tabs.rarity}`;
    }
  });

  // キャラクターランキングの説明文
  const charDesc = document.querySelector('#pokemon-character-ranking .analysis-description p');
  if (charDesc) {
    charDesc.textContent = profile.characterLabel;
  }

  // セットランキングの説明文
  const setDesc = document.querySelector('#pokemon-set-ranking .analysis-description p');
  if (setDesc && profile.setLabel) {
    setDesc.textContent = profile.setLabel;
  }

  // グレード分析の説明文
  const gradeDesc = document.querySelector('#pokemon-grade-analysis .analysis-description p');
  if (gradeDesc && profile.gradeLabel) {
    gradeDesc.textContent = profile.gradeLabel;
  }

  // レアリティ分析の説明文
  const rarityDesc = document.querySelector('#pokemon-rarity-analysis .analysis-description p');
  if (rarityDesc && profile.rarityLabel) {
    rarityDesc.textContent = profile.rarityLabel;
  }

  // 属性タブのラベル
  document.querySelectorAll('#pokemonAttributeColumn .attr-tab').forEach(tab => {
    const attr = tab.dataset.attr;
    if (attr === 'character' && profile.tabs.character) {
      tab.textContent = profile.tabs.character;
    } else if (attr === 'set' && profile.tabs.set) {
      tab.textContent = profile.tabs.set;
    } else if (attr === 'grade' && profile.tabs.grade) {
      tab.textContent = profile.tabs.grade;
    } else if (attr === 'rarity' && profile.tabs.rarity) {
      tab.textContent = profile.tabs.rarity;
    }
  });

  // 自分の分析用ラベル更新
  const myTabsTitle = document.querySelector('#myPokemonAnalysisTabs .pokemon-tabs-title');
  if (myTabsTitle) {
    myTabsTitle.textContent = profile.analysisTitle;
  }
  const myTabsIcon = document.querySelector('#myPokemonAnalysisTabs .pokemon-tabs-icon');
  if (myTabsIcon) {
    myTabsIcon.textContent = profile.icon;
  }

  // 自分の分析用 属性別内訳のタイトル
  const myAttrTitle = document.querySelector('#myPokemonAttributeColumn > h4');
  if (myAttrTitle) {
    myAttrTitle.textContent = profile.attributeTitle;
  }

  // 自分の分析用タブボタンのラベル（span内を更新）
  document.querySelectorAll('#myPokemonAnalysisTabs .pokemon-subtab').forEach(tab => {
    const tabId = tab.dataset.myPokemonTab;
    const span = tab.querySelector('span');
    if (!span) return;
    if (tabId === 'my-character-ranking' && profile.tabs.character) {
      span.textContent = `${tabIcons.character} ${profile.tabs.character}`;
    } else if (tabId === 'my-set-ranking' && profile.tabs.set) {
      span.textContent = `${tabIcons.set} ${profile.tabs.set}`;
    } else if (tabId === 'my-grade-analysis' && profile.tabs.grade) {
      span.textContent = `${tabIcons.grade} ${profile.tabs.grade}`;
    } else if (tabId === 'my-rarity-analysis' && profile.tabs.rarity) {
      span.textContent = `${tabIcons.rarity} ${profile.tabs.rarity}`;
    }
  });

  // 自分の分析用 キャラクターランキングの説明文
  const myCharDesc = document.querySelector('#my-pokemon-character-ranking .analysis-description p');
  if (myCharDesc) {
    myCharDesc.textContent = profile.characterLabel;
  }

  // 自分の分析用 セットランキングの説明文
  const mySetDesc = document.querySelector('#my-pokemon-set-ranking .analysis-description p');
  if (mySetDesc && profile.setLabel) {
    mySetDesc.textContent = profile.setLabel;
  }

  // 自分の分析用 グレード分析の説明文
  const myGradeDesc = document.querySelector('#my-pokemon-grade-analysis .analysis-description p');
  if (myGradeDesc && profile.gradeLabel) {
    myGradeDesc.textContent = profile.gradeLabel;
  }

  // 自分の分析用 レアリティ分析の説明文
  const myRarityDesc = document.querySelector('#my-pokemon-rarity-analysis .analysis-description p');
  if (myRarityDesc && profile.rarityLabel) {
    myRarityDesc.textContent = profile.rarityLabel;
  }

  // 自分の分析用 属性タブのラベル
  document.querySelectorAll('#myPokemonAttributeColumn .attr-tab').forEach(tab => {
    const attr = tab.dataset.attr;
    if (attr === 'character' && profile.tabs.character) {
      tab.textContent = profile.tabs.character;
    } else if (attr === 'set' && profile.tabs.set) {
      tab.textContent = profile.tabs.set;
    } else if (attr === 'grade' && profile.tabs.grade) {
      tab.textContent = profile.tabs.grade;
    } else if (attr === 'rarity' && profile.tabs.rarity) {
      tab.textContent = profile.tabs.rarity;
    }
  });

  // 辞書補正セクションのタイトル
  const correctionTitle = document.querySelector('#pokemonCorrectionSection .section-header h4');
  if (correctionTitle) {
    correctionTitle.innerHTML = `<span class="section-icon">✏️</span> ${profile.correctionTitle}`;
  }
}

/**
 * 全シートのプロファイルを読み込み
 */
async function loadSheetProfiles() {
  const result = await chrome.storage.local.get('sheetProfiles');
  return result.sheetProfiles || {};
}

// =====================================
// ポケモンカード辞書補正機能
// =====================================

/**
 * カスタム辞書を取得
 */
async function getCustomPokemonDict() {
  const result = await chrome.storage.local.get('customPokemonDict');
  return result.customPokemonDict || { cards: {}, sets: {} };
}

/**
 * カスタム辞書を保存
 */
async function saveCustomPokemonDict(dict) {
  await chrome.storage.local.set({ customPokemonDict: dict });
  // PokemonProfileに反映
  if (typeof PokemonProfile !== 'undefined') {
    Object.entries(dict.cards).forEach(([key, value]) => {
      PokemonProfile.addCustomCard(key, value);
    });
    Object.entries(dict.sets).forEach(([key, value]) => {
      PokemonProfile.addCustomSet(key, value);
    });
  }
}

/**
 * カスタム辞書を読み込んでPokemonProfileに反映
 */
async function loadCustomPokemonDict() {
  const dict = await getCustomPokemonDict();
  if (typeof PokemonProfile !== 'undefined') {
    Object.entries(dict.cards).forEach(([key, value]) => {
      PokemonProfile.addCustomCard(key, value);
    });
    Object.entries(dict.sets).forEach(([key, value]) => {
      PokemonProfile.addCustomSet(key, value);
    });
  }
  return dict;
}

/**
 * ポケモン補正セクションの表示/非表示
 */
function updatePokemonCorrectionVisibility() {
  const section = document.getElementById('pokemonCorrectionSection');
  if (section) {
    section.style.display = ['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) ? 'block' : 'none';
  }
}

/**
 * 未認識アイテムを表示
 */
function displayUnrecognizedItems(items) {
  const container = document.getElementById('pokemonUnrecognizedItems');
  if (!container) return;

  // 未認識（カード名またはセット名がない）のアイテムを抽出
  // cardName/setはオブジェクト形式なので、存在チェック＆中身のチェック
  const unrecognized = items.filter(item => {
    if (!item.attributes) return true;
    const hasCardName = item.attributes.cardName && item.attributes.cardName.name;
    const hasSet = item.attributes.set && item.attributes.set.name;
    return !hasCardName || !hasSet;
  }).slice(0, 20); // 最大20件

  if (unrecognized.length === 0) {
    container.innerHTML = '<p class="empty-message">すべてのアイテムが認識されました</p>';
    return;
  }

  container.innerHTML = unrecognized.map(item => {
    const attrs = item.attributes || {};
    const missing = [];
    if (!attrs.cardName || !attrs.cardName.name) missing.push('カード名');
    if (!attrs.set || !attrs.set.name) missing.push('セット');

    return `
      <div class="unrecognized-item" data-title="${escapeHtml(item.title || '')}">
        <span class="unrecognized-title" title="${escapeHtml(item.title || '')}">${escapeHtml(item.title || '(タイトルなし)')}</span>
        <span class="unrecognized-missing">${missing.join(', ')}不明</span>
        <div class="unrecognized-actions">
          <button class="copy-title-btn" title="タイトルをコピー">📋</button>
        </div>
      </div>
    `;
  }).join('');

  // コピーボタンのイベント
  container.querySelectorAll('.copy-title-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.closest('.unrecognized-item').dataset.title;
      navigator.clipboard.writeText(title);
      btn.textContent = '✓';
      setTimeout(() => btn.textContent = '📋', 1000);
    });
  });
}

/**
 * カスタム辞書一覧を表示
 */
async function displayCustomDictList() {
  const dict = await getCustomPokemonDict();
  const container = document.getElementById('customDictList');
  const countEl = document.getElementById('customDictCount');

  if (!container) return;

  const cardEntries = Object.entries(dict.cards);
  const setEntries = Object.entries(dict.sets);
  const total = cardEntries.length + setEntries.length;

  if (countEl) {
    countEl.textContent = `(${total}件)`;
  }

  if (total === 0) {
    container.innerHTML = '<p class="empty-message">まだカスタム辞書はありません</p>';
    return;
  }

  let html = '';

  // カード一覧
  cardEntries.forEach(([key, value]) => {
    html += `
      <div class="custom-dict-item" data-type="card" data-key="${escapeHtml(key)}">
        <span class="custom-dict-key">${escapeHtml(key)}</span>
        <span class="custom-dict-value">${escapeHtml(value.ja)}</span>
        <button class="custom-dict-delete" title="削除">×</button>
      </div>
    `;
  });

  // セット一覧
  setEntries.forEach(([key, value]) => {
    html += `
      <div class="custom-dict-item set-item" data-type="set" data-key="${escapeHtml(key)}">
        <span class="custom-dict-key">${escapeHtml(key)}</span>
        <span class="custom-dict-value">${escapeHtml(value.en || value.ja)}</span>
        <button class="custom-dict-delete" title="削除">×</button>
      </div>
    `;
  });

  container.innerHTML = html;

  // 削除ボタンのイベント
  container.querySelectorAll('.custom-dict-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const item = e.target.closest('.custom-dict-item');
      const type = item.dataset.type;
      const key = item.dataset.key;

      const dict = await getCustomPokemonDict();
      if (type === 'card') {
        delete dict.cards[key];
      } else {
        delete dict.sets[key];
      }
      await saveCustomPokemonDict(dict);
      await displayCustomDictList();
    });
  });
}

/**
 * カード追加処理
 */
async function addCustomCard() {
  const keyInput = document.getElementById('cardKeyInput');
  const jaInput = document.getElementById('cardJaInput');
  const idInput = document.getElementById('cardIdInput');

  const key = keyInput.value.trim().toLowerCase();
  const ja = jaInput.value.trim();
  const id = idInput.value.trim();

  if (!key || !ja) {
    alert('検索キーと日本語名は必須です');
    return;
  }

  const dict = await getCustomPokemonDict();
  dict.cards[key] = { ja, id: id || '', category: 'ポケモン' };

  // 日本語名でも検索できるように追加
  dict.cards[ja] = { ja, id: id || '', category: 'ポケモン' };

  await saveCustomPokemonDict(dict);

  // フォームクリア
  keyInput.value = '';
  jaInput.value = '';
  idInput.value = '';

  // 一覧更新
  await displayCustomDictList();

  // 成功メッセージ
  const btn = document.getElementById('addCardBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">✓</span> 追加完了';
  setTimeout(() => btn.innerHTML = originalText, 1500);
}

/**
 * セット追加処理
 */
async function addCustomSet() {
  const keyInput = document.getElementById('setKeyInput');
  const enInput = document.getElementById('setEnInput');
  const jaInput = document.getElementById('setJaInput');
  const seriesSelect = document.getElementById('setSeriesSelect');

  const key = keyInput.value.trim().toLowerCase();
  const en = enInput.value.trim();
  const ja = jaInput.value.trim();
  const series = seriesSelect.value;

  if (!key || (!en && !ja)) {
    alert('検索キーと、英語名または日本語名は必須です');
    return;
  }

  const dict = await getCustomPokemonDict();
  dict.sets[key] = { en: en || ja, ja: ja || en, series };

  // 日本語名でも検索できるように追加
  if (ja) {
    dict.sets[ja.toLowerCase()] = { en: en || ja, ja, series };
  }

  await saveCustomPokemonDict(dict);

  // フォームクリア
  keyInput.value = '';
  enInput.value = '';
  jaInput.value = '';

  // 一覧更新
  await displayCustomDictList();

  // 成功メッセージ
  const btn = document.getElementById('addSetBtn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">✓</span> 追加完了';
  setTimeout(() => btn.innerHTML = originalText, 1500);
}

/**
 * 補正セクションのイベントを初期化
 */
function initPokemonCorrectionEvents() {
  // トグルボタン
  const toggleBtn = document.getElementById('pokemonCorrectionToggle');
  const content = document.getElementById('pokemonCorrectionContent');
  if (toggleBtn && content) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'flex' : 'none';
      toggleBtn.textContent = isHidden ? '▲' : '▼';
    });
  }

  // タブ切り替え
  document.querySelectorAll('.correction-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.correctionTab;

      // タブのアクティブ状態
      document.querySelectorAll('.correction-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // フォーム表示切り替え
      document.getElementById('cardCorrectionForm').style.display = tabType === 'card' ? 'block' : 'none';
      document.getElementById('setCorrectionForm').style.display = tabType === 'set' ? 'block' : 'none';
    });
  });

  // カード追加ボタン
  const addCardBtn = document.getElementById('addCardBtn');
  if (addCardBtn) {
    addCardBtn.addEventListener('click', addCustomCard);
  }

  // セット追加ボタン
  const addSetBtn = document.getElementById('addSetBtn');
  if (addSetBtn) {
    addSetBtn.addEventListener('click', addCustomSet);
  }
}

// =====================================
// ポケモンカード分析機能
// =====================================

/**
 * ポケモン分析タブの表示/非表示を更新（市場分析用）
 */
function updatePokemonAnalysisVisibility() {
  const tabsSection = document.getElementById('pokemonAnalysisTabs');
  const contentSection = document.getElementById('pokemonAnalysisContent');

  if (tabsSection) {
    tabsSection.style.display = ['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) ? 'block' : 'none';
  }
  if (contentSection) {
    contentSection.style.display = ['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) ? 'block' : 'none';
  }
}

/**
 * 自分の分析用ポケモン分析タブの表示/非表示を更新
 */
function updateMyPokemonAnalysisVisibility() {
  const tabsSection = document.getElementById('myPokemonAnalysisTabs');
  const contentSection = document.getElementById('myPokemonAnalysisContent');

  if (tabsSection) {
    tabsSection.style.display = ['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) ? 'block' : 'none';
  }
  if (contentSection) {
    contentSection.style.display = ['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) ? 'block' : 'none';
  }
}

/**
 * ポケモン分析タブのイベントを初期化
 */
function initPokemonAnalysisTabs() {
  document.querySelectorAll('.pokemon-subtab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.pokemonTab;

      // タブのアクティブ状態
      document.querySelectorAll('.pokemon-subtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // コンテンツ表示切り替え
      document.querySelectorAll('.pokemon-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      const targetContent = document.getElementById(`pokemon-${tabId}`);
      if (targetContent) {
        targetContent.style.display = 'block';
      }

      // 分析データを読み込み
      loadPokemonAnalysisData(tabId);
    });
  });
}

/**
 * ポケモン分析データを読み込み・表示（市場分析用）
 */
async function loadPokemonAnalysisData(tabId) {
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
  if (!marketData || marketData.length === 0) return;

  // 属性付きのアイテムのみフィルタ
  const itemsWithAttrs = marketData.filter(item => item.attributes);

  switch (tabId) {
    case 'character-ranking':
      renderCharacterRanking(itemsWithAttrs);
      break;
    case 'set-ranking':
      renderSetRanking(itemsWithAttrs);
      break;
    case 'grade-analysis':
      renderGradeAnalysis(itemsWithAttrs);
      break;
    case 'rarity-analysis':
      renderRarityAnalysis(itemsWithAttrs);
      break;
  }
}

/**
 * 自分の分析用ポケモン分析タブのイベントを初期化
 */
function initMyPokemonAnalysisTabs() {
  document.querySelectorAll('[data-my-pokemon-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.myPokemonTab;

      // タブのアクティブ状態（自分の分析用のみ）
      document.querySelectorAll('#myPokemonAnalysisTabs .pokemon-subtab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // コンテンツ表示切り替え
      document.querySelectorAll('#myPokemonAnalysisContent .pokemon-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      const targetContent = document.getElementById(tabId);
      if (targetContent) {
        targetContent.style.display = 'block';
      }

      // 分析データを読み込み
      loadMyPokemonAnalysisData(tabId);
    });
  });
}

/**
 * 自分の分析用ポケモン分析データを読み込み・表示
 */
async function loadMyPokemonAnalysisData(tabId) {
  // 自分のデータを取得
  let allItems = [];
  if (analyzer.activeListings && analyzer.activeListings.length > 0) {
    allItems = [...analyzer.activeListings];
  }
  if (analyzer.soldItems && analyzer.soldItems.length > 0) {
    allItems = [...allItems, ...analyzer.soldItems];
  }

  if (allItems.length === 0) return;

  // ポケモン属性を付与
  allItems = allItems.map(item => {
    if (!item.attributes) {
      const attributes = extractAttributesByProfile(item.title);
      if (attributes) {
        return { ...item, attributes, profileExtracted: currentSheetProfile };
      }
    }
    return item;
  });

  // 属性付きのアイテムのみフィルタ
  const itemsWithAttrs = allItems.filter(item => item.attributes);

  switch (tabId) {
    case 'my-character-ranking':
      renderMyCharacterRanking(itemsWithAttrs);
      break;
    case 'my-set-ranking':
      renderMySetRanking(itemsWithAttrs);
      break;
    case 'my-grade-analysis':
      renderMyGradeAnalysis(itemsWithAttrs);
      break;
    case 'my-rarity-analysis':
      renderMyRarityAnalysis(itemsWithAttrs);
      break;
  }
}

/**
 * 自分のデータ用キャラ別ランキングを描画
 */
function renderMyCharacterRanking(items) {
  const container = document.getElementById('myCharacterRankingList');
  if (!container) return;

  const characterStats = {};
  items.forEach(item => {
    const cardNameObj = item.attributes?.cardName;
    if (!cardNameObj || !cardNameObj.name) return;

    const cardName = cardNameObj.name;
    if (!characterStats[cardName]) {
      characterStats[cardName] = { count: 0, totalPrice: 0, prices: [], nameEn: cardNameObj.nameEn };
    }
    characterStats[cardName].count++;
    const price = item.price || 0;
    characterStats[cardName].totalPrice += price;
    characterStats[cardName].prices.push(price);
  });

  const sorted = Object.entries(characterStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">認識されたカードがありません</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <div class="pokemon-ranking-item">
        <span class="pokemon-rank ${rankClass}">${index + 1}</span>
        <div class="pokemon-info">
          <span class="pokemon-name">${escapeHtml(name)}</span>
          ${stats.nameEn ? `<span class="pokemon-sub">${escapeHtml(stats.nameEn)}</span>` : ''}
        </div>
        <div class="pokemon-stats">
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">件数</span>
            <span class="pokemon-stat-value">${stats.count}</span>
          </div>
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">平均価格</span>
            <span class="pokemon-stat-value price">$${avgPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 自分のデータ用セット別ランキングを描画
 */
function renderMySetRanking(items) {
  const container = document.getElementById('mySetRankingList');
  if (!container) return;

  const setStats = {};
  items.forEach(item => {
    const setObj = item.attributes?.set;
    if (!setObj || !setObj.name) return;

    const setName = setObj.name;
    if (!setStats[setName]) {
      setStats[setName] = { count: 0, totalPrice: 0, era: setObj.era || '', code: setObj.code || '' };
    }
    setStats[setName].count++;
    setStats[setName].totalPrice += (item.price || 0);
  });

  const sorted = Object.entries(setStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">認識されたセットがありません</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <div class="pokemon-ranking-item">
        <span class="pokemon-rank ${rankClass}">${index + 1}</span>
        <div class="pokemon-info">
          <span class="pokemon-name">${escapeHtml(name)}</span>
          ${stats.era ? `<span class="pokemon-sub">${escapeHtml(stats.era)}</span>` : ''}
        </div>
        <div class="pokemon-stats">
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">件数</span>
            <span class="pokemon-stat-value">${stats.count}</span>
          </div>
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">平均価格</span>
            <span class="pokemon-stat-value price">$${avgPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 自分のデータ用グレード別分析を描画
 */
function renderMyGradeAnalysis(items) {
  const container = document.getElementById('myGradeAnalysisList');
  if (!container) return;

  const gradeStats = {};
  items.forEach(item => {
    const grading = item.attributes?.grading;
    if (!grading || !grading.company) return;

    const company = grading.company;
    const score = grading.score || 'N/A';

    if (!gradeStats[company]) {
      gradeStats[company] = {};
    }
    if (!gradeStats[company][score]) {
      gradeStats[company][score] = { count: 0, totalPrice: 0 };
    }
    gradeStats[company][score].count++;
    gradeStats[company][score].totalPrice += (item.price || 0);
  });

  if (Object.keys(gradeStats).length === 0) {
    container.innerHTML = '<p class="empty-message">グレード情報が認識されませんでした</p>';
    return;
  }

  let html = '';
  Object.entries(gradeStats).forEach(([company, scores]) => {
    const sortedScores = Object.entries(scores)
      .sort((a, b) => {
        const scoreA = parseFloat(a[0]) || 0;
        const scoreB = parseFloat(b[0]) || 0;
        return scoreB - scoreA;
      });

    html += `
      <div class="grade-company-section">
        <h4 class="grade-company-name">${escapeHtml(company)}</h4>
        <div class="grade-scores-list">
          ${sortedScores.map(([score, data]) => {
            const avgPrice = data.count > 0 ? data.totalPrice / data.count : 0;
            return `
              <div class="grade-score-item">
                <span class="grade-score">${escapeHtml(score)}</span>
                <span class="grade-count">${data.count}件</span>
                <span class="grade-avg-price">平均 $${avgPrice.toFixed(0)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * 自分のデータ用レアリティ別分析を描画
 */
function renderMyRarityAnalysis(items) {
  const container = document.getElementById('myRarityAnalysisList');
  if (!container) return;

  const rarityStats = {};
  items.forEach(item => {
    const rarityObj = item.attributes?.rarity;
    if (!rarityObj || !rarityObj.name) return;

    const rarityName = rarityObj.name;
    if (!rarityStats[rarityName]) {
      rarityStats[rarityName] = { count: 0, totalPrice: 0, code: rarityObj.code || '', tier: rarityObj.tier || 99 };
    }
    rarityStats[rarityName].count++;
    rarityStats[rarityName].totalPrice += (item.price || 0);
  });

  const sorted = Object.entries(rarityStats)
    .sort((a, b) => a[1].tier - b[1].tier)
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">レアリティ情報が認識されませんでした</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const tierClass = stats.tier <= 2 ? 'high-tier' : stats.tier <= 4 ? 'mid-tier' : 'low-tier';

    return `
      <div class="rarity-ranking-item ${tierClass}">
        <div class="rarity-info">
          <span class="rarity-name">${escapeHtml(name)}</span>
          ${stats.code ? `<span class="rarity-code">${escapeHtml(stats.code)}</span>` : ''}
        </div>
        <div class="rarity-stats">
          <span class="rarity-count">${stats.count}件</span>
          <span class="rarity-avg-price">平均 $${avgPrice.toFixed(0)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * ポケモン属性別内訳を描画（市場データ概要用）
 * @param {Array} items - 市場データ
 * @param {string} attrType - 表示する属性タイプ: 'character', 'set', 'grade', 'rarity'
 */
function renderPokemonAttributeBreakdown(items, attrType) {
  const container = document.getElementById('pokemonAttributeBreakdown');
  if (!container) return;

  let stats = {};

  // プロファイルごとに異なるキー名に対応
  // ポケモン/時計: cardName, 遊戯王: card, ワンピース: character
  const getCharacterObj = (attrs) => {
    if (!attrs) return null;
    return attrs.cardName || attrs.card || attrs.character || null;
  };

  switch (attrType) {
    case 'character':
      items.forEach(item => {
        const charObj = getCharacterObj(item.attributes);
        if (!charObj || !charObj.name) return;
        const name = charObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: charObj.nameEn || charObj.crew || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;

    case 'set':
      items.forEach(item => {
        const setObj = item.attributes?.set;
        if (!setObj || !setObj.name) return;
        const name = setObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: setObj.era || setObj.nameJp || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;

    case 'grade':
      items.forEach(item => {
        const grading = item.attributes?.grading;
        if (!grading) return;
        // カード: PSA 10 形式、時計: Automatic 形式
        const name = grading.isGraded && grading.company ?
          (grading.grade !== null ? `${grading.company} ${grading.grade}`.trim() : grading.company) :
          '未グレーディング';
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: grading.gradeStr || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      // 未グレーディングも含めてカウント
      const ungradedItems = items.filter(item => !item.attributes?.grading?.isGraded);
      if (ungradedItems.length > 0 && !stats['未グレーディング']) {
        stats['未グレーディング'] = { count: ungradedItems.length, totalPrice: 0, sub: '' };
        ungradedItems.forEach(item => {
          stats['未グレーディング'].totalPrice += (item.price || 0);
        });
      }
      break;

    case 'rarity':
      items.forEach(item => {
        const rarityObj = item.attributes?.rarity;
        if (!rarityObj || !rarityObj.name) return;
        const name = rarityObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: rarityObj.code || rarityObj.nameJp || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;
  }

  // ソート（件数順）
  const sorted = Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  if (sorted.length === 0) {
    const profile = SHEET_PROFILES[currentSheetProfile] || SHEET_PROFILES.pokemon;
    const emptyMessages = profile.emptyMessages || {
      'character': 'データがありません',
      'set': 'データがありません',
      'grade': 'データがありません',
      'rarity': 'データがありません'
    };
    container.innerHTML = `<p class="empty-message">${emptyMessages[attrType] || 'データがありません'}</p>`;
    return;
  }

  container.innerHTML = sorted.map(([name, data]) => {
    const avgPrice = data.count > 0 ? data.totalPrice / data.count : 0;
    return `
      <div class="attr-item">
        <span class="attr-name">${escapeHtml(name)}${data.sub ? `<span class="attr-sub">${escapeHtml(data.sub)}</span>` : ''}</span>
        <div class="attr-stats">
          <span class="attr-count">${data.count}件</span>
          <span class="attr-price">$${avgPrice.toFixed(0)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 自分のデータ用ポケモン属性別内訳を描画
 * @param {Array} items - 自分のデータ
 * @param {string} attrType - 表示する属性タイプ: 'character', 'set', 'grade', 'rarity'
 */
function renderMyPokemonAttributeBreakdown(items, attrType) {
  const container = document.getElementById('myPokemonAttributeBreakdown');
  if (!container) return;

  let stats = {};

  // プロファイルごとに異なるキー名に対応
  // ポケモン/時計: cardName, 遊戯王: card, ワンピース: character
  const getCharacterObj = (attrs) => {
    if (!attrs) return null;
    return attrs.cardName || attrs.card || attrs.character || null;
  };

  switch (attrType) {
    case 'character':
      items.forEach(item => {
        const charObj = getCharacterObj(item.attributes);
        if (!charObj || !charObj.name) return;
        const name = charObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: charObj.nameEn || charObj.crew || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;

    case 'set':
      items.forEach(item => {
        const setObj = item.attributes?.set;
        if (!setObj || !setObj.name) return;
        const name = setObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: setObj.era || setObj.nameJp || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;

    case 'grade':
      items.forEach(item => {
        const grading = item.attributes?.grading;
        if (!grading) return;
        // カード: PSA 10 形式、時計: Automatic 形式
        const name = grading.isGraded && grading.company ?
          (grading.grade !== null ? `${grading.company} ${grading.grade}`.trim() : grading.company) :
          '未グレーディング';
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: grading.gradeStr || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      const ungradedItems = items.filter(item => !item.attributes?.grading?.isGraded);
      if (ungradedItems.length > 0 && !stats['未グレーディング']) {
        stats['未グレーディング'] = { count: ungradedItems.length, totalPrice: 0, sub: '' };
        ungradedItems.forEach(item => {
          stats['未グレーディング'].totalPrice += (item.price || 0);
        });
      }
      break;

    case 'rarity':
      items.forEach(item => {
        const rarityObj = item.attributes?.rarity;
        if (!rarityObj || !rarityObj.name) return;
        const name = rarityObj.name;
        if (!stats[name]) {
          stats[name] = { count: 0, totalPrice: 0, sub: rarityObj.code || rarityObj.nameJp || '' };
        }
        stats[name].count++;
        stats[name].totalPrice += (item.price || 0);
      });
      break;
  }

  const sorted = Object.entries(stats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);

  if (sorted.length === 0) {
    const profile = SHEET_PROFILES[currentSheetProfile] || SHEET_PROFILES.pokemon;
    const emptyMessages = profile.emptyMessages || {
      'character': 'データがありません',
      'set': 'データがありません',
      'grade': 'データがありません',
      'rarity': 'データがありません'
    };
    container.innerHTML = `<p class="empty-message">${emptyMessages[attrType] || 'データがありません'}</p>`;
    return;
  }

  container.innerHTML = sorted.map(([name, data]) => {
    const avgPrice = data.count > 0 ? data.totalPrice / data.count : 0;
    return `
      <div class="attr-item">
        <span class="attr-name">${escapeHtml(name)}${data.sub ? `<span class="attr-sub">${escapeHtml(data.sub)}</span>` : ''}</span>
        <div class="attr-stats">
          <span class="attr-count">${data.count}件</span>
          <span class="attr-price">$${avgPrice.toFixed(0)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * キャラ別ランキングを描画
 */
function renderCharacterRanking(items) {
  const container = document.getElementById('characterRankingList');
  if (!container) return;

  // カード名でグループ化
  const characterStats = {};
  items.forEach(item => {
    // cardNameはオブジェクト: { name: '日本語名', nameEn: '英語名', id: '図鑑No', category: 'ポケモン' }
    const cardNameObj = item.attributes?.cardName;
    if (!cardNameObj || !cardNameObj.name) return;

    const cardName = cardNameObj.name;
    if (!characterStats[cardName]) {
      characterStats[cardName] = { count: 0, totalPrice: 0, prices: [], nameEn: cardNameObj.nameEn };
    }
    characterStats[cardName].count++;
    const price = item.price || 0;
    characterStats[cardName].totalPrice += price;
    characterStats[cardName].prices.push(price);
  });

  // ソート（件数順）
  const sorted = Object.entries(characterStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">認識されたカードがありません</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <div class="pokemon-ranking-item">
        <span class="pokemon-rank ${rankClass}">${index + 1}</span>
        <div class="pokemon-info">
          <span class="pokemon-name">${escapeHtml(name)}</span>
          ${stats.nameEn ? `<span class="pokemon-sub">${escapeHtml(stats.nameEn)}</span>` : ''}
        </div>
        <div class="pokemon-stats">
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">件数</span>
            <span class="pokemon-stat-value">${stats.count}</span>
          </div>
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">平均価格</span>
            <span class="pokemon-stat-value price">$${avgPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * セット別ランキングを描画
 */
function renderSetRanking(items) {
  const container = document.getElementById('setRankingList');
  if (!container) return;

  // セット名でグループ化（setは { name: '日本語名', code: 'コード', era: '時代' }）
  const setStats = {};
  items.forEach(item => {
    const setObj = item.attributes?.set;
    if (!setObj || !setObj.name) return;

    const setName = setObj.name;
    if (!setStats[setName]) {
      setStats[setName] = { count: 0, totalPrice: 0, era: setObj.era || '', code: setObj.code || '' };
    }
    setStats[setName].count++;
    setStats[setName].totalPrice += (item.price || 0);
  });

  // ソート（件数順）
  const sorted = Object.entries(setStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">認識されたセットがありません</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <div class="pokemon-ranking-item">
        <span class="pokemon-rank ${rankClass}">${index + 1}</span>
        <div class="pokemon-info">
          <span class="pokemon-name">${escapeHtml(name)}</span>
          ${stats.era ? `<span class="pokemon-sub">${escapeHtml(stats.era)}</span>` : ''}
        </div>
        <div class="pokemon-stats">
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">件数</span>
            <span class="pokemon-stat-value">${stats.count}</span>
          </div>
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">平均価格</span>
            <span class="pokemon-stat-value price">$${avgPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * グレード別分析を描画
 */
function renderGradeAnalysis(items) {
  const container = document.getElementById('gradeAnalysisList');
  if (!container) return;

  // グレーディング会社とスコアでグループ化
  const gradeStats = {};
  items.forEach(item => {
    const grading = item.attributes?.grading;
    if (!grading || !grading.company) return;

    const company = grading.company;
    const score = grading.score || 'N/A';

    if (!gradeStats[company]) {
      gradeStats[company] = {};
    }
    if (!gradeStats[company][score]) {
      gradeStats[company][score] = { count: 0, totalPrice: 0 };
    }
    gradeStats[company][score].count++;
    gradeStats[company][score].totalPrice += (item.price || 0);
  });

  if (Object.keys(gradeStats).length === 0) {
    container.innerHTML = '<p class="empty-message">グレード情報が認識されませんでした</p>';
    return;
  }

  // 各会社ごとにチャートを描画
  let html = '';
  Object.entries(gradeStats).forEach(([company, scores]) => {
    const sortedScores = Object.entries(scores)
      .sort((a, b) => {
        const scoreA = parseFloat(a[0]) || 0;
        const scoreB = parseFloat(b[0]) || 0;
        return scoreB - scoreA;
      });

    const totalCount = sortedScores.reduce((sum, [, s]) => sum + s.count, 0);
    const maxCount = Math.max(...sortedScores.map(([, s]) => s.count));

    html += `
      <div class="grade-chart-container">
        <div class="grade-company-header">
          <span class="grade-company-name">${escapeHtml(company)}</span>
          <span class="grade-company-count">${totalCount}件</span>
        </div>
        <div class="grade-bars">
          ${sortedScores.map(([score, stats]) => {
            const width = maxCount > 0 ? (stats.count / maxCount * 100) : 0;
            const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
            const companyClass = company.toLowerCase();
            return `
              <div class="grade-bar-row">
                <span class="grade-label">${escapeHtml(score)}</span>
                <div class="grade-bar">
                  <div class="grade-bar-fill ${companyClass}" style="width: ${width}%"></div>
                </div>
                <span class="grade-count">${stats.count}件</span>
                <span class="grade-avg-price">$${avgPrice.toFixed(0)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * レアリティ別分析を描画
 */
function renderRarityAnalysis(items) {
  const container = document.getElementById('rarityAnalysisList');
  if (!container) return;

  // レアリティでグループ化（rarityは { code: 'SAR', name: '日本語名', tier: 1 }）
  const rarityStats = {};
  items.forEach(item => {
    const rarityObj = item.attributes?.rarity;
    if (!rarityObj || !rarityObj.name) return;

    const rarityName = rarityObj.name;
    if (!rarityStats[rarityName]) {
      rarityStats[rarityName] = { count: 0, totalPrice: 0, code: rarityObj.code || '', tier: rarityObj.tier || 99 };
    }
    rarityStats[rarityName].count++;
    rarityStats[rarityName].totalPrice += (item.price || 0);
  });

  // ソート（平均価格順）
  const sorted = Object.entries(rarityStats)
    .sort((a, b) => {
      const avgA = a[1].count > 0 ? a[1].totalPrice / a[1].count : 0;
      const avgB = b[1].count > 0 ? b[1].totalPrice / b[1].count : 0;
      return avgB - avgA;
    })
    .slice(0, 20);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-message">レアリティ情報が認識されませんでした</p>';
    return;
  }

  container.innerHTML = sorted.map(([name, stats], index) => {
    const avgPrice = stats.count > 0 ? stats.totalPrice / stats.count : 0;
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <div class="pokemon-ranking-item">
        <span class="pokemon-rank ${rankClass}">${index + 1}</span>
        <div class="pokemon-info">
          <span class="pokemon-name">${escapeHtml(name)}</span>
        </div>
        <div class="pokemon-stats">
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">件数</span>
            <span class="pokemon-stat-value">${stats.count}</span>
          </div>
          <div class="pokemon-stat">
            <span class="pokemon-stat-label">平均価格</span>
            <span class="pokemon-stat-value price">$${avgPrice.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * シートを切り替え
 */
async function switchSheet(sheetId) {
  console.log('switchSheet開始:', sheetId);
  currentSheetId = sheetId;
  localStorage.setItem('currentSheetId', sheetId);

  // シートプロファイルを読み込み
  currentSheetProfile = await getSheetProfile(sheetId);
  updateProfileDisplay();
  console.log('シートプロファイル:', currentSheetProfile);

  // BunsekiDBにも設定
  if (typeof BunsekiDB !== 'undefined') {
    BunsekiDB.currentSheetId = sheetId;
  }

  // analyzerのデータをリセット
  analyzer.reset();
  window.aiClassificationResults = {};

  // チャートのみクリア（DOM表示は後で更新するのでリセットしない）
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });

  // AI関連をリセット
  chatHistory = [];
  currentAIResult = null;
  const aiChatMessages = document.getElementById('aiChatMessages');
  if (aiChatMessages) aiChatMessages.innerHTML = '';

  // AI提案タブをリセット
  const aiResultArea = document.getElementById('aiResultArea');
  if (aiResultArea) aiResultArea.style.display = 'none';
  const aiResultContent = document.getElementById('aiResultContent');
  if (aiResultContent) aiResultContent.innerHTML = '';

  // シート固有のデータを再読み込み
  await loadSavedData();
  await updateMarketDataInfo();

  // 全ての分析UIを復元
  await restoreAllAnalysisUI();

  console.log('switchSheet完了:', sheetId);
}

/**
 * シート切り替え時に全ての分析UIを復元
 */
async function restoreAllAnalysisUI() {
  const hasMyData = analyzer.activeListings.length > 0 || analyzer.soldItems.length > 0;

  // 市場データを取得（シートIDでフィルタ）
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
  const hasMarketData = marketData.length > 0;

  if (hasMyData) {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

    // analyzerの分析を実行
    analyzer.calculateBrandPerformance();
    analyzer.calculateCategoryStats();
    analyzer.calculateListingPace();
    analyzer.calculateSummary();

    // 自分のデータ（データ入力タブ）の表示を復元
    await restoreMyDataDisplay();

    // 自分の分析タブのコンテンツを生成
    const savedSubtab = localStorage.getItem('myAnalysisActiveSubtab') || 'listing-pace';
    await loadMyAnalysisTabContent(savedSubtab);
  } else {
    // データがない場合はリセット表示
    resetMyDataDisplay();
    resetMyAnalysisTabsDisplay();
  }

  if (hasMarketData) {
    // 市場分析（分析タブ）を復元
    await restoreMarketAnalysisDisplay(marketData);
    // 市場データ分析結果（データ入力タブ）を復元
    restoreMarketDataAnalysisResult(marketData);
  } else {
    // 市場分析をリセット
    resetMarketAnalysisDisplay();
    // 市場データ分析結果もリセット
    const marketDataAnalysisResult = document.getElementById('marketDataAnalysisResult');
    if (marketDataAnalysisResult) marketDataAnalysisResult.style.display = 'none';
  }

  // AI提案の復元
  await restoreAIResults();
}

/**
 * AI提案の結果を復元
 */
async function restoreAIResults() {
  try {
    const key = getSheetKey('savedAIResults');
    const data = await chrome.storage.local.get([key]);
    const savedResult = data[key];

    if (savedResult && savedResult.provider && savedResult.data) {
      currentAIResult = savedResult;
      if (savedResult.provider === 'compare') {
        displayCompareResults(savedResult.data);
      } else {
        displayAIResult(savedResult.provider, savedResult.data);
      }
      console.log('AI提案を復元しました');
    }
  } catch (error) {
    console.error('AI提案の復元に失敗:', error);
  }
}

/**
 * 市場データ分析結果（データ入力タブ）を復元
 */
async function restoreMarketDataAnalysisResult(marketData) {
  // marketDataが渡されなかった場合はDBから取得
  if (!marketData) {
    marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
  }

  if (!marketData || marketData.length === 0) {
    console.log('市場データがありません');
    return;
  }

  // ブランド分類を計算
  const brands = {};
  let classifiedCount = 0;
  let unclassifiedCount = 0;

  marketData.forEach(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    let brand;
    if (item.brandManual && item.brand) {
      brand = item.brand;
    } else if (item.brandCleared) {
      brand = null;
    } else {
      brand = extractBrandFromTitle(item.title);
    }

    if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null) {
      classifiedCount++;
      brands[brand] = (brands[brand] || 0) + 1;
    } else {
      unclassifiedCount++;
      brands['(未分類)'] = (brands['(未分類)'] || 0) + 1;
    }
  });

  // 分析結果を表示
  const resultEl = document.getElementById('marketDataAnalysisResult');
  if (resultEl) {
    resultEl.style.display = 'block';

    // 統計値を更新
    const marketClassifiedEl = document.getElementById('marketClassifiedCount');
    const marketUnclassifiedEl = document.getElementById('marketUnclassifiedCount');
    const marketBrandCountEl = document.getElementById('marketBrandCount');
    if (marketClassifiedEl) marketClassifiedEl.textContent = classifiedCount.toLocaleString();
    if (marketUnclassifiedEl) marketUnclassifiedEl.textContent = unclassifiedCount.toLocaleString();
    if (marketBrandCountEl) marketBrandCountEl.textContent = (Object.keys(brands).length - (brands['(未分類)'] ? 1 : 0)).toLocaleString();

    // AI再判定セクション
    const aiSection = document.getElementById('marketAiSection');
    if (aiSection) {
      aiSection.style.display = unclassifiedCount > 0 ? 'block' : 'none';
    }

    // ブランド内訳を表示
    const breakdownEl = document.getElementById('marketBrandBreakdown');
    const marketBrandToggle = document.getElementById('marketBrandToggle');
    if (breakdownEl) {
      const sortedBrands = Object.entries(brands)
        .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
        .sort((a, b) => b[1] - a[1]);
      const totalBrandCount = sortedBrands.length;

      // 現在のトグル状態を保持
      const isCurrentlyExpandedBrand = marketBrandToggle && marketBrandToggle.dataset.expanded === 'true';

      const renderMarketBrands = (showAll) => {
        const displayBrands = showAll ? sortedBrands : sortedBrands.slice(0, 10);
        breakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
          <div class="breakdown-item expandable" data-brand="${escapeHtml(brand)}">
            <div class="breakdown-header">
              <span class="expand-icon">▶</span>
              <span class="brand-name">${escapeHtml(brand)}</span>
              <span class="brand-count">${count}件</span>
            </div>
            <div class="breakdown-items" style="display: none;">
              <div class="loading-items">読み込み中...</div>
            </div>
          </div>
        `).join('');

        // 展開クリックイベント
        breakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
          item.querySelector('.breakdown-header').addEventListener('click', function() {
            const brand = item.dataset.brand;
            const itemsDiv = item.querySelector('.breakdown-items');
            const expandIcon = item.querySelector('.expand-icon');

            if (itemsDiv.style.display === 'none') {
              itemsDiv.style.display = 'block';
              expandIcon.textContent = '▼';
              item.classList.add('expanded');
              loadMarketBrandItems(brand, itemsDiv, marketData);
            } else {
              itemsDiv.style.display = 'none';
              expandIcon.textContent = '▶';
              item.classList.remove('expanded');
            }
          });
        });
      };

      renderMarketBrands(isCurrentlyExpandedBrand);

      // トグルボタン設定
      if (marketBrandToggle && totalBrandCount > 10) {
        marketBrandToggle.textContent = isCurrentlyExpandedBrand ? `(上位10件に戻す)` : `(上位10件 - 全${totalBrandCount}件表示)`;
        marketBrandToggle.style.display = 'inline';
        marketBrandToggle.onclick = () => {
          const isExpanded = marketBrandToggle.dataset.expanded === 'true';
          marketBrandToggle.dataset.expanded = isExpanded ? 'false' : 'true';
          marketBrandToggle.textContent = isExpanded ? `(上位10件 - 全${totalBrandCount}件表示)` : `(上位10件に戻す)`;
          breakdownEl.classList.toggle('expanded', !isExpanded);
          renderMarketBrands(!isExpanded);
        };
      } else if (marketBrandToggle) {
        marketBrandToggle.style.display = 'none';
      }
    }

    // カテゴリ分類を計算（階層構造）
    const marketCategories = {};  // { main: { count, subs: { sub: count } } }
    let categoryUnclassifiedCount = 0;

    marketData.forEach(item => {
      const { main, sub } = detectCategoryWithSub(item.title);
      if (main === '未分類' || main === '(未分類)' || main === '(不明)') {
        categoryUnclassifiedCount++;
      }
      if (!marketCategories[main]) {
        marketCategories[main] = { count: 0, subs: {} };
      }
      marketCategories[main].count++;
      if (!marketCategories[main].subs[sub]) {
        marketCategories[main].subs[sub] = 0;
      }
      marketCategories[main].subs[sub]++;
    });

    // カテゴリ内訳を表示（階層構造）
    const categoryBreakdownEl = document.getElementById('marketCategoryBreakdown');
    const marketCategoryToggle = document.getElementById('marketCategoryToggle');
    if (categoryBreakdownEl) {
      const sortedCategories = Object.entries(marketCategories)
        .filter(([category]) => category !== '(未分類)' && category !== '(不明)' && category !== 'その他' && category !== '未分類')
        .sort((a, b) => b[1].count - a[1].count);
      const totalCategoryCount = sortedCategories.length;

      // 現在のトグル状態を保持
      const isCurrentlyExpandedCat = marketCategoryToggle && marketCategoryToggle.dataset.expanded === 'true';

      const renderMarketCategories = (showAll) => {
        const displayCategories = showAll ? sortedCategories : sortedCategories.slice(0, 10);
        categoryBreakdownEl.innerHTML = displayCategories.map(([mainCategory, data]) => {
          // 細分類をソート（その他・未分類を除く）
          const sortedSubs = Object.entries(data.subs)
            .filter(([sub]) => sub !== 'その他' && sub !== '未分類')
            .sort((a, b) => b[1] - a[1]);
          const otherCount = data.subs['その他'] || 0;

          return `
            <div class="breakdown-item expandable category-main" data-category="${escapeHtml(mainCategory)}">
              <div class="breakdown-header">
                <span class="expand-icon">▶</span>
                <span class="brand-name">${escapeHtml(mainCategory)}</span>
                <span class="brand-count">${data.count}件</span>
              </div>
              <div class="breakdown-items subcategory-list" style="display: none;">
                ${sortedSubs.map(([subCategory, subCount]) => `
                  <div class="breakdown-item expandable subcategory-item" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="${escapeHtml(subCategory)}">
                    <div class="breakdown-header sub-header">
                      <span class="expand-icon">▶</span>
                      <span class="brand-name">${escapeHtml(subCategory)}</span>
                      <span class="brand-count">${subCount}件</span>
                    </div>
                    <div class="breakdown-items item-list" style="display: none;">
                      <div class="loading-items">読み込み中...</div>
                    </div>
                  </div>
                `).join('')}
                ${otherCount > 0 ? `
                  <div class="breakdown-item expandable subcategory-item other-sub" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="その他">
                    <div class="breakdown-header sub-header">
                      <span class="expand-icon">▶</span>
                      <span class="brand-name">その他</span>
                      <span class="brand-count">${otherCount}件</span>
                    </div>
                    <div class="breakdown-items item-list" style="display: none;">
                      <div class="loading-items">読み込み中...</div>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');

        // 大分類の展開クリックイベント
        categoryBreakdownEl.querySelectorAll('.category-main > .breakdown-header').forEach(header => {
          header.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = header.closest('.category-main');
            const itemsDiv = item.querySelector('.subcategory-list');
            const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

            if (itemsDiv.style.display === 'none') {
              itemsDiv.style.display = 'block';
              expandIcon.textContent = '▼';
              item.classList.add('expanded');
            } else {
              itemsDiv.style.display = 'none';
              expandIcon.textContent = '▶';
              item.classList.remove('expanded');
            }
          });
        });

        // 細分類の展開クリックイベント
        categoryBreakdownEl.querySelectorAll('.subcategory-item > .breakdown-header').forEach(header => {
          header.addEventListener('click', function(e) {
            e.stopPropagation();
            const item = header.closest('.subcategory-item');
            const mainCategory = item.dataset.mainCategory;
            const subCategory = item.dataset.subCategory;
            const itemsDiv = item.querySelector('.item-list');
            const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

            if (itemsDiv.style.display === 'none') {
              itemsDiv.style.display = 'block';
              expandIcon.textContent = '▼';
              item.classList.add('expanded');
              loadMarketCategorySubItems(mainCategory, subCategory, itemsDiv, marketData);
            } else {
              itemsDiv.style.display = 'none';
              expandIcon.textContent = '▶';
              item.classList.remove('expanded');
            }
          });
        });
      };

      renderMarketCategories(isCurrentlyExpandedCat);

      // トグルボタン設定
      if (marketCategoryToggle && totalCategoryCount > 10) {
        marketCategoryToggle.textContent = isCurrentlyExpandedCat ? `(上位10件に戻す)` : `(上位10件 - 全${totalCategoryCount}件表示)`;
        marketCategoryToggle.style.display = 'inline';
        marketCategoryToggle.onclick = () => {
          const isExpanded = marketCategoryToggle.dataset.expanded === 'true';
          marketCategoryToggle.dataset.expanded = isExpanded ? 'false' : 'true';
          marketCategoryToggle.textContent = isExpanded ? `(上位10件 - 全${totalCategoryCount}件表示)` : `(上位10件に戻す)`;
          categoryBreakdownEl.classList.toggle('expanded', !isExpanded);
          renderMarketCategories(!isExpanded);
        };
      } else if (marketCategoryToggle) {
        marketCategoryToggle.style.display = 'none';
      }
    }

    // カテゴリ未分類セクションを更新
    const categoryUnclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
    const categoryUnclassifiedCountEl = document.getElementById('marketCategoryUnclassifiedCount');
    const categoryUnclassifiedItemsEl = document.getElementById('marketCategoryUnclassifiedItems');
    const categoryUnclassifiedHeader = document.getElementById('marketCategoryUnclassifiedHeader');
    const categoryUnclassifiedList = document.getElementById('marketCategoryUnclassifiedList');

    if (categoryUnclassifiedSection) {
      if (categoryUnclassifiedCount > 0) {
        categoryUnclassifiedSection.style.display = 'block';
        if (categoryUnclassifiedCountEl) {
          categoryUnclassifiedCountEl.textContent = categoryUnclassifiedCount;
        }
        // 未分類アイテムをロード
        if (categoryUnclassifiedItemsEl) {
          loadMarketCategoryUnclassifiedItems(categoryUnclassifiedItemsEl, marketData);
        }
      } else {
        categoryUnclassifiedSection.style.display = 'none';
      }
    }

    // カテゴリ未分類ヘッダーの展開/折りたたみイベント
    if (categoryUnclassifiedHeader && categoryUnclassifiedList) {
      // 既存のイベントリスナーを削除するためにクローン
      const newHeader = categoryUnclassifiedHeader.cloneNode(true);
      categoryUnclassifiedHeader.parentNode.replaceChild(newHeader, categoryUnclassifiedHeader);

      newHeader.addEventListener('click', () => {
        const isExpanded = categoryUnclassifiedList.style.display !== 'none';
        categoryUnclassifiedList.style.display = isExpanded ? 'none' : 'block';
        const icon = newHeader.querySelector('.expand-icon');
        if (icon) icon.textContent = isExpanded ? '▶' : '▼';
      });
    }
  }
}

/**
 * 自分のデータ（データ入力タブ）の表示を復元
 */
async function restoreMyDataDisplay() {
  const activeListings = analyzer.activeListings || [];
  const soldItems = analyzer.soldItems || [];
  const allMyItems = [...activeListings, ...soldItems];

  if (allMyItems.length === 0) {
    resetMyDataDisplay();
    return;
  }

  // プロファイルに応じて属性を再抽出
  if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
    allMyItems.forEach(item => {
      if (item.title) {
        const attrs = extractAttributesByProfile(item.title, currentSheetProfile);
        item.attributes = attrs;
        item.profileExtracted = currentSheetProfile;
      }
    });
  }

  // ブランド分類を計算
  const myBrands = {};
  let myClassified = 0;
  let myUnclassified = 0;

  allMyItems.forEach(item => {
    const brand = extractBrandFromTitle(item.title);
    if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null) {
      myBrands[brand] = (myBrands[brand] || 0) + 1;
      myClassified++;
    } else {
      myBrands['(未分類)'] = (myBrands['(未分類)'] || 0) + 1;
      myUnclassified++;
    }
  });

  // 統計値を更新
  const myClassifiedEl = document.getElementById('myClassifiedCount');
  const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
  const myBrandCountEl = document.getElementById('myBrandCount');
  if (myClassifiedEl) myClassifiedEl.textContent = myClassified.toLocaleString();
  if (myUnclassifiedEl) myUnclassifiedEl.textContent = myUnclassified.toLocaleString();
  if (myBrandCountEl) myBrandCountEl.textContent = (Object.keys(myBrands).length - (myBrands['(未分類)'] ? 1 : 0)).toLocaleString();

  // 分析結果エリアを表示
  const resultEl = document.getElementById('myDataAnalysisResult');
  if (resultEl) resultEl.style.display = 'block';

  // ブランド内訳を表示
  const breakdownEl = document.getElementById('myBrandBreakdown');
  if (breakdownEl) {
    const sortedBrands = Object.entries(myBrands)
      .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    breakdownEl.innerHTML = sortedBrands.map(([brand, count]) => `
      <div class="breakdown-item expandable" data-brand="${escapeHtml(brand)}">
        <div class="breakdown-header">
          <span class="expand-icon">▶</span>
          <span class="brand-name">${escapeHtml(brand)}</span>
          <span class="brand-count">${count}件</span>
        </div>
        <div class="breakdown-items" style="display: none;">
          <div class="loading-items">読み込み中...</div>
        </div>
      </div>
    `).join('');

    // 展開クリックイベント
    breakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
      item.querySelector('.breakdown-header').addEventListener('click', function() {
        const brand = item.dataset.brand;
        const itemsDiv = item.querySelector('.breakdown-items');
        const expandIcon = item.querySelector('.expand-icon');

        if (itemsDiv.style.display === 'none') {
          itemsDiv.style.display = 'block';
          expandIcon.textContent = '▼';
          item.classList.add('expanded');
          loadMyBrandItems(brand, itemsDiv, allMyItems);
        } else {
          itemsDiv.style.display = 'none';
          expandIcon.textContent = '▶';
          item.classList.remove('expanded');
        }
      });
    });
  }

  // プロファイルに応じてカテゴリ列を切り替え（自分のデータ）
  const myGenericCategoryColumn = document.getElementById('myGenericCategoryColumn');
  const myPokemonAttributeColumn = document.getElementById('myPokemonAttributeColumn');

  if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
    // カード/時計プロファイル: 属性別内訳を表示
    if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'none';
    if (myPokemonAttributeColumn) {
      myPokemonAttributeColumn.style.display = 'block';
      renderMyPokemonAttributeBreakdown(allMyItems, 'character');

      // タブクリックイベントを再設定
      myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(tab => {
        // 既存のイベントリスナーを削除するためにクローンで置き換え
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        newTab.addEventListener('click', function() {
          myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          renderMyPokemonAttributeBreakdown(allMyItems, this.dataset.attr);
        });
      });

      // 最初のタブをアクティブに
      const firstTab = myPokemonAttributeColumn.querySelector('.attr-tab');
      if (firstTab) firstTab.classList.add('active');
    }

    // UIラベルを更新
    updateCardAnalysisLabels();
  } else {
    // 汎用プロファイル: カテゴリ別内訳を表示
    if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'block';
    if (myPokemonAttributeColumn) myPokemonAttributeColumn.style.display = 'none';
  }
}

/**
 * 自分のデータ表示をリセット
 */
function resetMyDataDisplay() {
  const myClassifiedEl = document.getElementById('myClassifiedCount');
  const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
  const myBrandCountEl = document.getElementById('myBrandCount');
  if (myClassifiedEl) myClassifiedEl.textContent = '0';
  if (myUnclassifiedEl) myUnclassifiedEl.textContent = '0';
  if (myBrandCountEl) myBrandCountEl.textContent = '0';

  const myBrandBreakdown = document.getElementById('myBrandBreakdown');
  if (myBrandBreakdown) myBrandBreakdown.innerHTML = '';

  const myDataAnalysisResult = document.getElementById('myDataAnalysisResult');
  if (myDataAnalysisResult) myDataAnalysisResult.style.display = 'none';
}

/**
 * 自分の分析タブをリセット
 */
function resetMyAnalysisTabsDisplay() {
  ['my-listing-pace', 'my-brand-performance', 'my-watch-analysis', 'my-category-performance'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<div class="my-analysis-placeholder"><p>データがありません。「自分のデータ」タブでCSVを読み込んでください。</p></div>';
    }
  });
}

/**
 * 市場分析表示を復元
 */
async function restoreMarketAnalysisDisplay(marketData) {
  try {
    const normalizedItems = analyzer.normalizeMarketData(marketData);
    const brandRanking = analyzer.getMarketBrandRanking(normalizedItems, 30);
    const categoryRanking = analyzer.getMarketCategoryRanking(normalizedItems, 20);
    const brandCategoryRanking = analyzer.getMarketBrandCategoryRanking(normalizedItems, 20);

    renderBrandRanking(brandRanking);
    renderCategoryRanking(categoryRanking);
    renderBrandCategoryRanking(brandCategoryRanking);

    if (analyzer.activeListings.length > 0) {
      const comparison = analyzer.compareWithMyListings(normalizedItems);
      renderComparison(comparison);
    }
  } catch (error) {
    console.error('市場分析の復元に失敗:', error);
  }
}

/**
 * 分析結果をリセット
 */
function resetAnalysisDisplay() {
  // チャートをクリア
  Object.keys(chartInstances).forEach(key => {
    if (chartInstances[key]) {
      chartInstances[key].destroy();
      chartInstances[key] = null;
    }
  });

  // 分析結果エリアをクリア
  const resultContainers = [
    'listingPaceResult',
    'watchPaceResult',
    'brandPerformanceResult',
    'categoryPerformanceResult',
    'marketComparisonResult',
    'brandCategoryResult'
  ];

  resultContainers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = '<p class="no-data">分析を実行してください</p>';
    }
  });

  // 自分の分析の統計値をリセット
  const myClassifiedEl = document.getElementById('myClassifiedCount');
  const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
  const myBrandCountEl = document.getElementById('myBrandCount');
  if (myClassifiedEl) myClassifiedEl.textContent = '0';
  if (myUnclassifiedEl) myUnclassifiedEl.textContent = '0';
  if (myBrandCountEl) myBrandCountEl.textContent = '0';

  // ブランド内訳をクリア
  const myBrandBreakdown = document.getElementById('myBrandBreakdown');
  if (myBrandBreakdown) {
    myBrandBreakdown.innerHTML = '';
  }

  // 自分のデータ分析結果エリアを非表示
  const myDataAnalysisResult = document.getElementById('myDataAnalysisResult');
  if (myDataAnalysisResult) {
    myDataAnalysisResult.style.display = 'none';
  }

  // AIチャットもクリア
  const aiChatMessages = document.getElementById('aiChatMessages');
  if (aiChatMessages) {
    aiChatMessages.innerHTML = '';
  }
  chatHistory = [];
  currentAIResult = null;
}

/**
 * 市場分析の表示をリセット
 */
function resetMarketAnalysisDisplay() {
  // ブランドランキング
  const brandList = document.getElementById('brandRankingList');
  if (brandList) {
    brandList.innerHTML = '<p class="no-data-message">市場データを取り込んで分析を実行してください</p>';
  }

  // カテゴリランキング
  const categoryList = document.getElementById('categoryRankingList');
  if (categoryList) {
    categoryList.innerHTML = '<p class="no-data-message">市場データを取り込んで分析を実行してください</p>';
  }

  // ブランド×カテゴリ
  const brandCategoryList = document.getElementById('brandCategoryList');
  if (brandCategoryList) {
    brandCategoryList.innerHTML = '<p class="no-data-message">市場データを取り込んで分析を実行してください</p>';
  }

  // 比較
  const comparisonContent = document.getElementById('comparisonContent');
  if (comparisonContent) {
    comparisonContent.innerHTML = '<p class="no-data-message">自分のデータと市場データを両方取り込んでください</p>';
  }

  // 市場データ分析結果
  const marketDataAnalysisResult = document.getElementById('marketDataAnalysisResult');
  if (marketDataAnalysisResult) {
    marketDataAnalysisResult.style.display = 'none';
  }
}

/**
 * メインタブ初期化
 */
function initTabs() {
  const tabs = document.querySelectorAll('.main-tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      // ロックされたタブの場合、アップグレード案内を表示
      if (tab.hasAttribute('data-locked')) {
        showUpgradePrompt();
        return;
      }

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

      // 「自分の分析」タブに戻った場合、保存されたサブタブ状態を復元
      if (targetId === 'my-analysis') {
        const savedSubtab = localStorage.getItem('myAnalysisActiveSubtab') || 'listing-pace';

        // サブタブのアクティブ状態を設定
        document.querySelectorAll('.my-analysis-subtab').forEach(subtab => {
          subtab.classList.toggle('active', subtab.dataset.myTab === savedSubtab);
        });

        // コンテンツの表示を設定
        document.querySelectorAll('.my-tab-content').forEach(content => {
          content.classList.toggle('active', content.id === `my-${savedSubtab}`);
        });

        // 展開リスナーを再設定（DOMが描画されてから）
        setTimeout(() => {
          if (savedSubtab === 'brand-performance') {
            setupBrandExpandListeners();
          } else if (savedSubtab === 'category-performance') {
            setupCategoryExpandListeners();
          }
        }, 150);
      }
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

  // 分析結果クリアボタン
  const clearMarketAnalysisBtn = document.getElementById('clearMarketAnalysisBtn');
  if (clearMarketAnalysisBtn) {
    clearMarketAnalysisBtn.addEventListener('click', clearAnalysisResults);
  }

  // CSV出力ボタン
  const exportMarketCsvBtn = document.getElementById('exportMarketCsvBtn');
  if (exportMarketCsvBtn) {
    exportMarketCsvBtn.addEventListener('click', exportMarketCsv);
  }

  // データ保存ボタン
  const saveAllDataBtn = document.getElementById('saveAllDataBtn');
  if (saveAllDataBtn) {
    saveAllDataBtn.addEventListener('click', saveAllData);
  }

  // AI分類ボタン（自分のデータ用）
  const classifyWithAIBtn = document.getElementById('classifyWithAIBtn');
  if (classifyWithAIBtn) {
    classifyWithAIBtn.addEventListener('click', () => classifyUnknownItemsWithAI(false));
  }

  // 自分のデータクリアボタン
  const clearMyDataBtn = document.getElementById('clearMyDataBtn');
  if (clearMyDataBtn) {
    clearMyDataBtn.addEventListener('click', clearMyData);
  }

  // 自分のデータ分析結果クリアボタン
  const clearMyAnalysisBtn = document.getElementById('clearMyAnalysisBtn');
  if (clearMyAnalysisBtn) {
    clearMyAnalysisBtn.addEventListener('click', clearMyAnalysisResults);
  }

  // 市場データAI分類ボタン
  const classifyMarketWithAIBtn = document.getElementById('classifyMarketWithAIBtn');
  if (classifyMarketWithAIBtn) {
    classifyMarketWithAIBtn.addEventListener('click', classifyMarketDataWithAI);
  }

  // 自分のデータ分析ボタン
  const analyzeMyDataBtn = document.getElementById('analyzeMyDataBtn');
  if (analyzeMyDataBtn) {
    analyzeMyDataBtn.addEventListener('click', analyzeMyData);
  }

  // 市場データ分析ボタン
  const analyzeMarketDataBtn = document.getElementById('analyzeMarketDataBtn');
  if (analyzeMarketDataBtn) {
    analyzeMarketDataBtn.addEventListener('click', analyzeMarketData);
  }

  // 自分のデータ保存ボタン（分析結果内）
  const saveMyDataBtn = document.getElementById('saveMyDataBtn');
  if (saveMyDataBtn) {
    saveMyDataBtn.addEventListener('click', () => saveMyDataToStorage());
  }

  // 市場データ保存ボタン（分析結果内）
  const saveMarketDataBtn = document.getElementById('saveMarketDataBtn');
  if (saveMarketDataBtn) {
    saveMarketDataBtn.addEventListener('click', () => saveMarketDataToStorage());
  }

  // 未分類ボックスクリック（自分のデータ）
  const myUnclassifiedBox = document.getElementById('myUnclassifiedBox');
  if (myUnclassifiedBox) {
    myUnclassifiedBox.addEventListener('click', () => toggleUnclassifiedList('my'));
  }

  // 未分類ボックスクリック（市場データ）
  const marketUnclassifiedBox = document.getElementById('marketUnclassifiedBox');
  if (marketUnclassifiedBox) {
    marketUnclassifiedBox.addEventListener('click', () => toggleUnclassifiedList('market'));
  }

  // 未分類リスト閉じるボタン
  const closeMyUnclassifiedList = document.getElementById('closeMyUnclassifiedList');
  if (closeMyUnclassifiedList) {
    closeMyUnclassifiedList.addEventListener('click', () => {
      document.getElementById('myUnclassifiedList').style.display = 'none';
    });
  }

  const closeMarketUnclassifiedList = document.getElementById('closeMarketUnclassifiedList');
  if (closeMarketUnclassifiedList) {
    closeMarketUnclassifiedList.addEventListener('click', () => {
      document.getElementById('marketUnclassifiedList').style.display = 'none';
    });
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
      // 新しいCSVを読み込んだら、analyzerのデータを更新
      const items = analyzer.parseActiveListingsCsv(content);
      analyzer.activeListings = items;
      updateDataStatus('activeListingsStatus', items.length, true);
      updateMyDataSummary();
    } else {
      ordersData = content;
      // 新しいCSVを読み込んだら、analyzerのデータを更新
      const items = analyzer.parseOrdersCsv(content);
      analyzer.soldItems = items;
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

  // 既存のanalyzerデータを優先（AI分類結果を保持）
  // CSVデータがあり、かつanalyzerにデータがない場合のみパース
  let activeItems = [];
  let soldItems = [];

  if (analyzer.activeListings && analyzer.activeListings.length > 0) {
    activeItems = analyzer.activeListings;
  } else if (activeListingsData) {
    activeItems = analyzer.parseActiveListingsCsv(activeListingsData);
    analyzer.activeListings = activeItems;
  }

  if (analyzer.soldItems && analyzer.soldItems.length > 0) {
    soldItems = analyzer.soldItems;
  } else if (ordersData) {
    soldItems = analyzer.parseOrdersCsv(ordersData);
    analyzer.soldItems = soldItems;
  }

  const myDataActions = document.getElementById('myDataActions');
  const analysisResult = document.getElementById('myDataAnalysisResult');

  if (activeItems.length > 0 || soldItems.length > 0) {
    summaryEl.style.display = 'flex';
    if (myDataActions) myDataActions.style.display = 'flex';

    document.getElementById('myActiveCount').textContent = activeItems.length.toLocaleString();
    document.getElementById('mySoldCount').textContent = soldItems.length.toLocaleString();
  } else {
    summaryEl.style.display = 'none';
    if (myDataActions) myDataActions.style.display = 'none';
    if (analysisResult) analysisResult.style.display = 'none';
  }
}

/**
 * 自分のデータを分析
 */
async function analyzeMyData() {
  // 既存のanalyzerデータを優先して使用（AI分類結果を保持するため）
  // CSVデータがあり、かつanalyzerにデータがない場合のみパース
  let activeItems = [];
  let soldItems = [];

  if (analyzer.activeListings && analyzer.activeListings.length > 0) {
    // 既存データがあればそれを使用（AI分類済みのブランド情報を保持）
    activeItems = analyzer.activeListings;
  } else if (activeListingsData) {
    // 既存データがない場合のみCSVをパース
    activeItems = analyzer.parseActiveListingsCsv(activeListingsData);
    analyzer.activeListings = activeItems;
  }

  if (analyzer.soldItems && analyzer.soldItems.length > 0) {
    // 既存データがあればそれを使用
    soldItems = analyzer.soldItems;
  } else if (ordersData) {
    // 既存データがない場合のみCSVをパース
    soldItems = analyzer.parseOrdersCsv(ordersData);
    analyzer.soldItems = soldItems;
  }

  let allItems = [...activeItems, ...soldItems];

  if (allItems.length === 0) {
    showAlert('分析するデータがありません', 'warning');
    return;
  }

  // ポケモンプロファイルの場合、属性を付与
  if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
    allItems = allItems.map(item => {
      const attributes = extractAttributesByProfile(item.title);
      if (attributes) {
        return { ...item, attributes, profileExtracted: currentSheetProfile };
      }
      return item;
    });
  }

  // ブランド分類を実行
  // 優先順位: 1. 手動設定(brandManual) 2. 未分類フラグ(brandCleared) 3. AI分類 4. タイトルから判定
  const brands = {};
  let classifiedCount = 0;
  let unclassifiedCount = 0;

  allItems.forEach(item => {
    let brand;

    // 優先順位に従ってブランドを決定
    if (item.brandManual && item.brand) {
      // 手動でブランドを設定した場合はそれを使用
      brand = item.brand;
    } else if (item.brandCleared) {
      // 明示的に未分類にした場合
      brand = null;
    } else if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
      // AI分類結果があればそれを使用
      brand = window.aiClassificationResults[item.title].brand;
    } else {
      // なければextractBrandFromTitle（customBrandRulesも参照）
      brand = extractBrandFromTitle(item.title);
    }
    item.brand = brand;

    if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null && brand !== '(未分類)') {
      classifiedCount++;
      brands[brand] = (brands[brand] || 0) + 1;
    } else {
      unclassifiedCount++;
      brands['(未分類)'] = (brands['(未分類)'] || 0) + 1;
    }

    // カテゴリも常に再判定
    if (window.aiClassificationResults && window.aiClassificationResults[item.title]?.category) {
      item.category = window.aiClassificationResults[item.title].category;
    } else {
      item.category = detectCategoryFromTitle(item.title);
    }
  });

  // analyzerの分析も実行（分析タブで使用）
  analyzer.calculateBrandPerformance();
  analyzer.calculateCategoryStats();
  analyzer.calculateListingPace();
  analyzer.calculateSummary();

  // IndexedDBに保存（10万件以上対応）
  let saveSuccess = false;
  try {
    await BunsekiDB.setActiveListings(analyzer.activeListings);
    await BunsekiDB.setSoldItems(analyzer.soldItems);

    // メタデータをChrome Storageに保存（シート固有）
    const metaData = {
      results: analyzer.results,
      savedAt: new Date().toISOString(),
      counts: {
        active: analyzer.activeListings.length,
        sold: analyzer.soldItems.length
      }
    };
    await chrome.storage.local.set({ [getSheetKey('savedAnalysisMeta')]: metaData });
    console.log('自分のデータをIndexedDBに保存しました (シート:', currentSheetId, ')');
    saveSuccess = true;
    updateLastSavedInfo();
  } catch (error) {
    console.error('データ保存エラー:', error);
  }

  // 分析結果を表示
  const resultEl = document.getElementById('myDataAnalysisResult');
  if (resultEl) {
    resultEl.style.display = 'block';

    // 統計値を更新
    document.getElementById('myClassifiedCount').textContent = classifiedCount.toLocaleString();
    document.getElementById('myUnclassifiedCount').textContent = unclassifiedCount.toLocaleString();
    document.getElementById('myBrandCount').textContent = (Object.keys(brands).length - (brands['(未分類)'] ? 1 : 0)).toLocaleString();

    // AI再判定セクション表示
    const aiSection = document.getElementById('myDataAiSection');
    const aiBtn = document.getElementById('classifyWithAIBtn');
    if (aiSection) {
      if (unclassifiedCount > 0) {
        aiSection.style.display = 'block';
        // ボタンをリセット（再チャレンジ可能に）
        if (aiBtn) {
          aiBtn.disabled = false;
          aiBtn.innerHTML = '<span class="btn-icon">🤖</span> AIで再判定する';
        }
        // プログレスを非表示
        const progressEl = document.getElementById('aiClassifyProgress');
        if (progressEl) progressEl.style.display = 'none';
      } else {
        aiSection.style.display = 'none';
      }
    }

    // ブランド内訳を表示（トグル機能付き）- 未分類を除外
    const breakdownEl = document.getElementById('myBrandBreakdown');
    const myBrandToggle = document.getElementById('myBrandToggle');
    if (breakdownEl) {
      const sortedBrands = Object.entries(brands)
        .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
        .sort((a, b) => b[1] - a[1]);
      const totalBrandCount = sortedBrands.length;

      let showAllBrands = false;

      const renderBrands = () => {
        const displayBrands = showAllBrands ? sortedBrands : sortedBrands.slice(0, 10);

        breakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
          <div class="breakdown-item expandable" data-brand="${escapeHtml(brand)}">
            <div class="breakdown-header">
              <span class="expand-icon">▶</span>
              <span class="brand-name">${escapeHtml(brand)}</span>
              <span class="brand-count">${count}件</span>
            </div>
            <div class="breakdown-items" style="display: none;">
              <div class="loading-items">読み込み中...</div>
            </div>
          </div>
        `).join('');

        // 展開クリックイベント
        breakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
          item.querySelector('.breakdown-header').addEventListener('click', function() {
            const brand = item.dataset.brand;
            const itemsDiv = item.querySelector('.breakdown-items');
            const expandIcon = item.querySelector('.expand-icon');

            if (itemsDiv.style.display === 'none') {
              itemsDiv.style.display = 'block';
              expandIcon.textContent = '▼';
              item.classList.add('expanded');
              loadMyBrandItems(brand, itemsDiv, allItems);
            } else {
              itemsDiv.style.display = 'none';
              expandIcon.textContent = '▶';
              item.classList.remove('expanded');
            }
          });
        });
      };

      renderBrands();

      // トグルボタンの設定
      if (myBrandToggle) {
        if (totalBrandCount > 10) {
          myBrandToggle.style.display = 'block';
          myBrandToggle.textContent = `全て表示 (${totalBrandCount}件)`;
          myBrandToggle.onclick = () => {
            showAllBrands = !showAllBrands;
            myBrandToggle.textContent = showAllBrands ? 'トップ10のみ表示' : `全て表示 (${totalBrandCount}件)`;
            renderBrands();
          };
        } else {
          myBrandToggle.style.display = 'none';
        }
      }
    }

    // プロファイルに応じてカテゴリ列を切り替え（自分のデータ）
    const myGenericCategoryColumn = document.getElementById('myGenericCategoryColumn');
    const myPokemonAttributeColumn = document.getElementById('myPokemonAttributeColumn');

    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
      // ポケモンプロファイル: 属性別内訳を表示
      if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'none';
      if (myPokemonAttributeColumn) {
        myPokemonAttributeColumn.style.display = 'block';
        renderMyPokemonAttributeBreakdown(allItems, 'character');

        // タブクリックイベント
        myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(tab => {
          tab.addEventListener('click', function() {
            myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderMyPokemonAttributeBreakdown(allItems, this.dataset.attr);
          });
        });
      }
    } else {
      // 汎用プロファイル: カテゴリ別内訳を表示
      if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'block';
      if (myPokemonAttributeColumn) myPokemonAttributeColumn.style.display = 'none';

      const categoryBreakdownEl = document.getElementById('myCategoryBreakdown');
      const myCategoryToggle = document.getElementById('myCategoryToggle');
      if (categoryBreakdownEl) {
        // カテゴリを階層構造で集計
        const categories = {};  // { main: { count, subs: { sub: count } } }
        allItems.forEach(item => {
          const { main, sub } = detectCategoryWithSub(item.title);
          if (!categories[main]) {
            categories[main] = { count: 0, subs: {} };
          }
          categories[main].count++;
          if (!categories[main].subs[sub]) {
            categories[main].subs[sub] = 0;
          }
          categories[main].subs[sub]++;
        });

        const sortedCategories = Object.entries(categories)
          .filter(([cat]) => cat !== '(その他)' && cat !== 'その他')
          .sort((a, b) => b[1].count - a[1].count);
        const totalCategoryCount = sortedCategories.length;

        let showAllCategories = false;

        const renderCategories = () => {
          const displayCategories = showAllCategories ? sortedCategories : sortedCategories.slice(0, 10);

          categoryBreakdownEl.innerHTML = displayCategories.map(([category, data]) => {
            const sortedSubs = Object.entries(data.subs)
              .filter(([sub]) => sub !== category)
              .sort((a, b) => b[1] - a[1]);

            const subHtml = sortedSubs.length > 0 ? `
              <div class="sub-categories" style="display: none;">
                ${sortedSubs.map(([sub, count]) => `
                  <div class="sub-category-item">
                    <span class="sub-category-name">${escapeHtml(sub)}</span>
                    <span class="sub-category-count">${count}件</span>
                  </div>
                `).join('')}
              </div>
            ` : '';

            return `
              <div class="breakdown-item ${sortedSubs.length > 0 ? 'has-subs' : ''}" data-category="${escapeHtml(category)}">
                <div class="breakdown-header">
                  ${sortedSubs.length > 0 ? '<span class="expand-icon">▶</span>' : '<span class="expand-icon" style="visibility:hidden">▶</span>'}
                  <span class="category-name">${escapeHtml(category)}</span>
                  <span class="category-count">${data.count}件</span>
                </div>
                ${subHtml}
              </div>
            `;
          }).join('');

          // サブカテゴリ展開イベント
          categoryBreakdownEl.querySelectorAll('.breakdown-item.has-subs').forEach(item => {
            item.querySelector('.breakdown-header').addEventListener('click', function() {
              const subsDiv = item.querySelector('.sub-categories');
              const expandIcon = item.querySelector('.expand-icon');
              if (subsDiv) {
                if (subsDiv.style.display === 'none') {
                  subsDiv.style.display = 'block';
                  expandIcon.textContent = '▼';
                  item.classList.add('expanded');
                } else {
                  subsDiv.style.display = 'none';
                  expandIcon.textContent = '▶';
                  item.classList.remove('expanded');
                }
              }
            });
          });
        };

        renderCategories();

        // トグルボタンの設定
        if (myCategoryToggle) {
          if (totalCategoryCount > 10) {
            myCategoryToggle.style.display = 'block';
            myCategoryToggle.textContent = `全て表示 (${totalCategoryCount}件)`;
            myCategoryToggle.onclick = () => {
              showAllCategories = !showAllCategories;
              myCategoryToggle.textContent = showAllCategories ? 'トップ10のみ表示' : `全て表示 (${totalCategoryCount}件)`;
              renderCategories();
            };
          } else {
            myCategoryToggle.style.display = 'none';
          }
        }
      }
    }

    // 保存ステータス表示
    const saveStatus = document.getElementById('myDataSaveStatus');
    const saveInfo = document.getElementById('myDataSaveInfo');
    if (saveStatus) {
      saveStatus.style.display = saveSuccess ? 'flex' : 'none';
    }
    if (saveInfo && saveSuccess) {
      saveInfo.textContent = `自動保存済み (${formatDateTime(new Date())})`;
      saveInfo.className = 'save-info success';
    }
  }

  showAlert(`${allItems.length}件のデータを分析しました（分析タブで詳細表示可能）`, 'success');
}

/**
 * 自分のデータのブランド別商品を読み込んで表示
 */
function loadMyBrandItems(brand, container, allItems) {
  const brandLower = brand.toLowerCase();
  const brandItems = allItems.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. AI分類 4. タイトルから判定
    let itemBrand;
    if (item.brandManual && item.brand) {
      itemBrand = item.brand;
    } else if (item.brandCleared) {
      itemBrand = '(未分類)';
    } else if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
      itemBrand = window.aiClassificationResults[item.title].brand || '(未分類)';
    } else {
      itemBrand = extractBrandFromTitle(item.title) || '(未分類)';
    }
    return itemBrand.toLowerCase() === brandLower;
  });

  if (brandItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox" data-brand="${escapeHtml(brand)}">
          全て選択
        </label>
        <button class="bulk-delete-btn" data-brand="${escapeHtml(brand)}" disabled>🗑️ 選択を削除</button>
        <button class="bulk-unclassify-btn" data-brand="${escapeHtml(brand)}" disabled>↩ 未分類に</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  brandItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const itemId = item.id;
    const source = item.saleDate ? 'sold' : 'active'; // sold or active
    html += `
      <tr data-item-id="${itemId}" data-source="${source}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
            <button class="item-action-btn unclassify" data-id="${itemId}" data-source="${source}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-brand" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="ブランド変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMyDataItemActions(container, brand, allItems);
}

/**
 * 自分のデータのアイテム操作イベントを設定
 */
function setupMyDataItemActions(container, brand, allItems) {
  // 全選択チェックボックス
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkUnclassifyBtn = container.querySelector('.bulk-unclassify-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkUnclassifyBtn) bulkUnclassifyBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const activeIds = [];
      const soldIds = [];
      checked.forEach(cb => {
        const id = parseInt(cb.dataset.id);
        if (cb.dataset.source === 'sold') {
          soldIds.push(id);
        } else {
          activeIds.push(id);
        }
      });

      try {
        if (activeIds.length > 0) await BunsekiDB.deleteActiveListingsByIds(activeIds);
        if (soldIds.length > 0) await BunsekiDB.deleteSoldItemsByIds(soldIds);
        showAlert(`${checked.length}件を削除しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括未分類に移動
  if (bulkUnclassifyBtn) {
    bulkUnclassifyBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件を未分類に移動しますか？`)) return;

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          if (cb.dataset.source === 'sold') {
            await BunsekiDB.updateSoldItemById(id, { brand: null, brandCleared: true });
          } else {
            await BunsekiDB.updateActiveListingById(id, { brand: null, brandCleared: true });
          }
        }
        showAlert(`${checked.length}件を未分類に移動しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        showAlert('移動に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      if (!confirm('このデータを削除しますか？')) return;

      try {
        if (source === 'sold') {
          await BunsekiDB.deleteSoldItemById(id);
        } else {
          await BunsekiDB.deleteActiveListingById(id);
        }
        showAlert('削除しました', 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別未分類ボタン
  container.querySelectorAll('.item-action-btn.unclassify').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { brand: null, brandCleared: true });
        } else {
          await BunsekiDB.updateActiveListingById(id, { brand: null, brandCleared: true });
        }
        showAlert('未分類に移動しました', 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        showAlert('移動に失敗しました', 'error');
      }
    });
  });

  // ブランド変更ボタン
  container.querySelectorAll('.item-action-btn.change-brand').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;
      const title = btn.dataset.title;

      const newBrand = prompt(`新しいブランド名を入力してください:\n\n${title}`, '');
      if (newBrand === null) return;
      if (newBrand.trim() === '') {
        showAlert('ブランド名を入力してください', 'warning');
        return;
      }

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { brand: newBrand.trim(), brandManual: true });
        } else {
          await BunsekiDB.updateActiveListingById(id, { brand: newBrand.trim(), brandManual: true });
        }
        showAlert(`ブランドを「${newBrand.trim()}」に変更しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        showAlert('変更に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 自分のデータの分析を再実行
 */
async function refreshMyDataAnalysis() {
  // IndexedDBから最新データを取得して再分析
  const activeListings = await BunsekiDB.getActiveListingsForSheet(BunsekiDB.currentSheetId);
  const soldItems = await BunsekiDB.getSoldItemsForSheet(BunsekiDB.currentSheetId);

  analyzer.activeListings = activeListings;
  analyzer.soldItems = soldItems;

  // 統計値（分類済み/未分類カウント）を更新
  const allItems = [...activeListings, ...soldItems];
  let classifiedCount = 0;
  let unclassifiedCount = 0;
  const brands = {};

  allItems.forEach(item => {
    let brand;

    // 優先順位: 1. 手動設定(brandManual) 2. 未分類フラグ(brandCleared) 3. AI分類 4. タイトルから判定
    if (item.brandManual && item.brand) {
      brand = item.brand;
    } else if (item.brandCleared) {
      brand = null; // 明示的に未分類
    } else if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
      brand = window.aiClassificationResults[item.title].brand;
    } else {
      brand = extractBrandFromTitle(item.title);
    }

    if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== '(未分類)' && brand !== null) {
      classifiedCount++;
      brands[brand] = (brands[brand] || 0) + 1;
    } else {
      unclassifiedCount++;
    }
  });

  // UIを更新
  const myClassifiedEl = document.getElementById('myClassifiedCount');
  const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
  const myBrandCountEl = document.getElementById('myBrandCount');
  if (myClassifiedEl) myClassifiedEl.textContent = classifiedCount.toLocaleString();
  if (myUnclassifiedEl) myUnclassifiedEl.textContent = unclassifiedCount.toLocaleString();
  if (myBrandCountEl) myBrandCountEl.textContent = Object.keys(brands).length.toLocaleString();

  // 展開中のブランドを記録
  const expandedBrands = [];
  document.querySelectorAll('#myBrandBreakdown .breakdown-item.expanded').forEach(item => {
    expandedBrands.push(item.dataset.brand);
  });

  // analyzerの分析を再実行
  analyzer.calculateBrandPerformance();

  // 「自分のデータ」タブのブランド内訳を更新
  const breakdownEl = document.getElementById('myBrandBreakdown');
  const myBrandToggle = document.getElementById('myBrandToggle');
  if (breakdownEl) {
    const sortedBrands = Object.entries(brands)
      .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
      .sort((a, b) => b[1] - a[1]);
    const totalBrandCount = sortedBrands.length;

    // 現在のトグル状態を保持
    const isCurrentlyExpanded = myBrandToggle && myBrandToggle.dataset.expanded === 'true';

    // 表示用関数
    const renderBrands = (showAll) => {
      const displayBrands = showAll ? sortedBrands : sortedBrands.slice(0, 10);
      breakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
        <div class="breakdown-item expandable" data-brand="${escapeHtml(brand)}">
          <div class="breakdown-header">
            <span class="expand-icon">▶</span>
            <span class="brand-name">${escapeHtml(brand)}</span>
            <span class="brand-count">${count}件</span>
          </div>
          <div class="breakdown-items" style="display: none;">
            <div class="loading-items">読み込み中...</div>
          </div>
        </div>
      `).join('');

      // 展開クリックイベント
      breakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
        item.querySelector('.breakdown-header').addEventListener('click', function() {
          const brand = item.dataset.brand;
          const itemsDiv = item.querySelector('.breakdown-items');
          const expandIcon = item.querySelector('.expand-icon');

          if (itemsDiv.style.display === 'none') {
            itemsDiv.style.display = 'block';
            expandIcon.textContent = '▼';
            item.classList.add('expanded');
            loadMyBrandItems(brand, itemsDiv, allItems);
          } else {
            itemsDiv.style.display = 'none';
            expandIcon.textContent = '▶';
            item.classList.remove('expanded');
          }
        });
      });

      // 展開状態を復元
      expandedBrands.forEach(brand => {
        const item = breakdownEl.querySelector(`.breakdown-item[data-brand="${brand}"]`);
        if (item) {
          const itemsDiv = item.querySelector('.breakdown-items');
          const expandIcon = item.querySelector('.expand-icon');
          if (itemsDiv && expandIcon) {
            itemsDiv.style.display = 'block';
            expandIcon.textContent = '▼';
            item.classList.add('expanded');
            loadMyBrandItems(brand, itemsDiv, allItems);
          }
        }
      });
    };

    // 現在の状態で表示
    renderBrands(isCurrentlyExpanded);

    // トグルボタン設定
    if (myBrandToggle && totalBrandCount > 10) {
      myBrandToggle.textContent = isCurrentlyExpanded ? `(上位10件に戻す)` : `(上位10件 - 全${totalBrandCount}件表示)`;
      myBrandToggle.style.display = 'inline';
      myBrandToggle.onclick = () => {
        const isExpanded = myBrandToggle.dataset.expanded === 'true';
        myBrandToggle.dataset.expanded = isExpanded ? 'false' : 'true';
        myBrandToggle.textContent = isExpanded ? `(上位10件 - 全${totalBrandCount}件表示)` : `(上位10件に戻す)`;
        breakdownEl.classList.toggle('expanded', !isExpanded);
        renderBrands(!isExpanded);
      };
    } else if (myBrandToggle) {
      myBrandToggle.style.display = totalBrandCount > 0 ? 'none' : 'none';
    }
  }

  // カテゴリ分類も計算（階層構造）
  const myCategories = {};  // { main: { count, subs: { sub: count } } }
  allItems.forEach(item => {
    const { main, sub } = detectCategoryWithSub(item.title);
    if (!myCategories[main]) {
      myCategories[main] = { count: 0, subs: {} };
    }
    myCategories[main].count++;
    if (!myCategories[main].subs[sub]) {
      myCategories[main].subs[sub] = 0;
    }
    myCategories[main].subs[sub]++;
  });

  // カテゴリ内訳を表示（階層構造） - 未分類を除外
  const myCategoryBreakdownEl = document.getElementById('myCategoryBreakdown');
  const myCategoryToggle = document.getElementById('myCategoryToggle');
  if (myCategoryBreakdownEl) {
    const sortedCategories = Object.entries(myCategories)
      .filter(([category]) => category !== '(未分類)' && category !== '(不明)' && category !== 'その他' && category !== '未分類')
      .sort((a, b) => b[1].count - a[1].count);
    const totalCategoryCount = sortedCategories.length;

    // 現在のトグル状態を保持
    const isCurrentlyExpandedCat = myCategoryToggle && myCategoryToggle.dataset.expanded === 'true';

    const renderMyCategories = (showAll) => {
      const displayCategories = showAll ? sortedCategories : sortedCategories.slice(0, 10);
      myCategoryBreakdownEl.innerHTML = displayCategories.map(([mainCategory, data]) => {
        // 細分類をソート（その他を除く）
        const sortedSubs = Object.entries(data.subs)
          .filter(([sub]) => sub !== 'その他' && sub !== '未分類')
          .sort((a, b) => b[1] - a[1]);
        const otherCount = data.subs['その他'] || 0;

        return `
          <div class="breakdown-item expandable category-main" data-category="${escapeHtml(mainCategory)}">
            <div class="breakdown-header">
              <span class="expand-icon">▶</span>
              <span class="brand-name">${escapeHtml(mainCategory)}</span>
              <span class="brand-count">${data.count}件</span>
            </div>
            <div class="breakdown-items subcategory-list" style="display: none;">
              ${sortedSubs.map(([subCategory, subCount]) => `
                <div class="breakdown-item expandable subcategory-item" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="${escapeHtml(subCategory)}">
                  <div class="breakdown-header sub-header">
                    <span class="expand-icon">▶</span>
                    <span class="brand-name">${escapeHtml(subCategory)}</span>
                    <span class="brand-count">${subCount}件</span>
                  </div>
                  <div class="breakdown-items item-list" style="display: none;">
                    <div class="loading-items">読み込み中...</div>
                  </div>
                </div>
              `).join('')}
              ${otherCount > 0 ? `
                <div class="breakdown-item expandable subcategory-item other-sub" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="その他">
                  <div class="breakdown-header sub-header">
                    <span class="expand-icon">▶</span>
                    <span class="brand-name">その他</span>
                    <span class="brand-count">${otherCount}件</span>
                  </div>
                  <div class="breakdown-items item-list" style="display: none;">
                    <div class="loading-items">読み込み中...</div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');

      // 大分類の展開クリックイベント
      myCategoryBreakdownEl.querySelectorAll('.category-main > .breakdown-header').forEach(header => {
        header.addEventListener('click', function(e) {
          e.stopPropagation();
          const item = header.closest('.category-main');
          const itemsDiv = item.querySelector('.subcategory-list');
          const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

          if (itemsDiv.style.display === 'none') {
            itemsDiv.style.display = 'block';
            expandIcon.textContent = '▼';
            item.classList.add('expanded');
          } else {
            itemsDiv.style.display = 'none';
            expandIcon.textContent = '▶';
            item.classList.remove('expanded');
          }
        });
      });

      // 細分類の展開クリックイベント
      myCategoryBreakdownEl.querySelectorAll('.subcategory-item > .breakdown-header').forEach(header => {
        header.addEventListener('click', function(e) {
          e.stopPropagation();
          const item = header.closest('.subcategory-item');
          const mainCategory = item.dataset.mainCategory;
          const subCategory = item.dataset.subCategory;
          const itemsDiv = item.querySelector('.item-list');
          const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

          if (itemsDiv.style.display === 'none') {
            itemsDiv.style.display = 'block';
            expandIcon.textContent = '▼';
            item.classList.add('expanded');
            loadMyCategorySubItems(mainCategory, subCategory, itemsDiv, allItems);
          } else {
            itemsDiv.style.display = 'none';
            expandIcon.textContent = '▶';
            item.classList.remove('expanded');
          }
        });
      });
    };

    renderMyCategories(isCurrentlyExpandedCat);

    if (myCategoryToggle && totalCategoryCount > 10) {
      myCategoryToggle.textContent = isCurrentlyExpandedCat ? `(上位10件に戻す)` : `(上位10件 - 全${totalCategoryCount}件表示)`;
      myCategoryToggle.style.display = 'inline';
      myCategoryToggle.onclick = () => {
        const isExpanded = myCategoryToggle.dataset.expanded === 'true';
        myCategoryToggle.dataset.expanded = isExpanded ? 'false' : 'true';
        myCategoryToggle.textContent = isExpanded ? `(上位10件 - 全${totalCategoryCount}件表示)` : `(上位10件に戻す)`;
        myCategoryBreakdownEl.classList.toggle('expanded', !isExpanded);
        renderMyCategories(!isExpanded);
      };
    } else if (myCategoryToggle) {
      myCategoryToggle.style.display = 'none';
    }
  }

  // ブランド分析タブを再読み込み
  await loadMyAnalysisTabContent('brand-performance');

  // カテゴリ分析タブも再読み込み
  await loadMyAnalysisTabContent('category-performance');
}

/**
 * 自分のデータのカテゴリ未分類アイテム一覧を読み込む（データ入力タブ用）
 */
function loadMyCategoryUnclassifiedItems(container, allItems) {
  // カテゴリ未分類アイテムをフィルタリング
  const uncategorizedItems = allItems.filter(item => {
    let itemCategory;
    if (item.categoryManual && item.category) {
      itemCategory = item.category;
    } else if (item.categoryCleared) {
      itemCategory = null;
    } else {
      itemCategory = detectCategoryFromTitle(item.title);
    }
    return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
  });

  // アルファベット順でソート
  uncategorizedItems.sort((a, b) => {
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();
    return titleA.localeCompare(titleB);
  });

  if (uncategorizedItems.length === 0) {
    container.innerHTML = '<p class="no-items">カテゴリ未分類のアイテムはありません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox">
          全て選択
        </label>
        <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
        <button class="bulk-assign-btn" disabled>📁 カテゴリ割当</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  uncategorizedItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const itemId = item.id;
    const source = item.saleDate ? 'sold' : 'active';
    html += `
      <tr data-item-id="${itemId}" data-source="${source}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
            <button class="item-action-btn assign-category" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="カテゴリ割当">📁</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMyCategoryUnclassifiedItemActions(container);
}

/**
 * 自分のデータのカテゴリ未分類アイテム操作イベントを設定（データ入力タブ用）
 */
function setupMyCategoryUnclassifiedItemActions(container) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkAssignBtn = container.querySelector('.bulk-assign-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkAssignBtn) bulkAssignBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const activeIds = [];
      const soldIds = [];
      checked.forEach(cb => {
        const id = parseInt(cb.dataset.id);
        if (cb.dataset.source === 'sold') {
          soldIds.push(id);
        } else {
          activeIds.push(id);
        }
      });

      try {
        if (activeIds.length > 0) await BunsekiDB.deleteActiveListingsByIds(activeIds);
        if (soldIds.length > 0) await BunsekiDB.deleteSoldItemsByIds(soldIds);
        showAlert(`${checked.length}件を削除しました`, 'success');
        await loadSavedData();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括カテゴリ割当
  if (bulkAssignBtn) {
    bulkAssignBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      const newCategory = prompt(`${checked.length}件のカテゴリを設定してください:`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          if (cb.dataset.source === 'sold') {
            await BunsekiDB.updateSoldItemById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
          } else {
            await BunsekiDB.updateActiveListingById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
          }
        }
        showAlert(`${checked.length}件を「${newCategory.trim()}」に設定しました`, 'success');
        await loadSavedData();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      if (!confirm('このデータを削除しますか？')) return;

      try {
        if (source === 'sold') {
          await BunsekiDB.deleteSoldItemById(id);
        } else {
          await BunsekiDB.deleteActiveListingById(id);
        }
        showAlert('削除しました', 'success');
        await loadSavedData();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別カテゴリ割当ボタン
  container.querySelectorAll('.item-action-btn.assign-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;
      const title = btn.dataset.title;

      const newCategory = prompt(`カテゴリを入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        } else {
          await BunsekiDB.updateActiveListingById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        }
        showAlert(`カテゴリを「${newCategory.trim()}」に設定しました`, 'success');
        await loadSavedData();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 自分のデータのカテゴリ別アイテム一覧を読み込む
 */
function loadMyCategoryItems(category, container, allItems) {
  const categoryLower = category.toLowerCase();
  const categoryItems = allItems.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    let itemCategory;
    if (item.categoryManual && item.category) {
      itemCategory = item.category;
    } else if (item.categoryCleared) {
      itemCategory = '(未分類)';
    } else {
      itemCategory = detectCategoryFromTitle(item.title) || '(未分類)';
    }
    return itemCategory.toLowerCase() === categoryLower;
  });

  if (categoryItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox" data-category="${escapeHtml(category)}">
          全て選択
        </label>
        <button class="bulk-delete-btn" data-category="${escapeHtml(category)}" disabled>🗑️ 選択を削除</button>
        <button class="bulk-uncategorize-btn" data-category="${escapeHtml(category)}" disabled>↩ 未分類に</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  categoryItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const itemId = item.id;
    const source = item.saleDate ? 'sold' : 'active';
    html += `
      <tr data-item-id="${itemId}" data-source="${source}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
            <button class="item-action-btn uncategorize" data-id="${itemId}" data-source="${source}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-category" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="カテゴリ変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMyCategoryItemActions(container, category, allItems);
}

/**
 * 自分のデータのカテゴリ別アイテム操作イベントを設定
 */
function setupMyCategoryItemActions(container, category, allItems) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkUncategorizeBtn = container.querySelector('.bulk-uncategorize-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkUncategorizeBtn) bulkUncategorizeBtn.disabled = checkedCount === 0;
  }

  // カテゴリカウント更新のヘルパー関数（階層構造対応）
  function updateCategoryCountBulk(containerEl, delta) {
    // 細分類（subcategory-item）のカウントを更新
    const subcategoryItem = containerEl.closest('.subcategory-item');
    if (subcategoryItem) {
      const subCountEl = subcategoryItem.querySelector(':scope > .breakdown-header .brand-count');
      if (subCountEl) {
        const currentCount = parseInt(subCountEl.textContent) || 0;
        subCountEl.textContent = `${currentCount + delta}件`;
      }
      // 大分類（category-main）のカウントも更新
      const mainCategoryItem = subcategoryItem.closest('.category-main');
      if (mainCategoryItem) {
        const mainCountEl = mainCategoryItem.querySelector(':scope > .breakdown-header .brand-count');
        if (mainCountEl) {
          const mainCurrentCount = parseInt(mainCountEl.textContent) || 0;
          mainCountEl.textContent = `${mainCurrentCount + delta}件`;
        }
      }
    } else {
      // 大分類直下の場合
      const breakdownItem = containerEl.closest('.breakdown-item');
      if (breakdownItem) {
        const countEl = breakdownItem.querySelector(':scope > .breakdown-header .brand-count');
        if (countEl) {
          const currentCount = parseInt(countEl.textContent) || 0;
          countEl.textContent = `${currentCount + delta}件`;
        }
      }
    }
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const activeIds = [];
      const soldIds = [];
      const deleteCount = checked.length;
      checked.forEach(cb => {
        const id = parseInt(cb.dataset.id);
        if (cb.dataset.source === 'sold') {
          soldIds.push(id);
        } else {
          activeIds.push(id);
        }
      });

      try {
        if (activeIds.length > 0) await BunsekiDB.deleteActiveListingsByIds(activeIds);
        if (soldIds.length > 0) await BunsekiDB.deleteSoldItemsByIds(soldIds);
        showAlert(`${deleteCount}件を削除しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateCategoryCountBulk(container, -deleteCount);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括未分類に移動
  if (bulkUncategorizeBtn) {
    bulkUncategorizeBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件を未分類に移動しますか？`)) return;

      const moveCount = checked.length;

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          if (cb.dataset.source === 'sold') {
            await BunsekiDB.updateSoldItemById(id, { category: null, categoryCleared: true, categoryManual: false });
          } else {
            await BunsekiDB.updateActiveListingById(id, { category: null, categoryCleared: true, categoryManual: false });
          }
        }
        showAlert(`${moveCount}件を未分類に移動しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateCategoryCountBulk(container, -moveCount);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('myCategoryUnclassifiedCount2');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + moveCount;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('myCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  }

  // カテゴリカウント更新のヘルパー関数（階層構造対応）- 個別用
  function updateCategoryCount(containerEl, delta) {
    // 細分類（subcategory-item）のカウントを更新
    const subcategoryItem = containerEl.closest('.subcategory-item');
    if (subcategoryItem) {
      const subCountEl = subcategoryItem.querySelector(':scope > .breakdown-header .brand-count');
      if (subCountEl) {
        const currentCount = parseInt(subCountEl.textContent) || 0;
        subCountEl.textContent = `${currentCount + delta}件`;
      }
      // 大分類（category-main）のカウントも更新
      const mainCategoryItem = subcategoryItem.closest('.category-main');
      if (mainCategoryItem) {
        const mainCountEl = mainCategoryItem.querySelector(':scope > .breakdown-header .brand-count');
        if (mainCountEl) {
          const mainCurrentCount = parseInt(mainCountEl.textContent) || 0;
          mainCountEl.textContent = `${mainCurrentCount + delta}件`;
        }
      }
    } else {
      // 大分類直下の場合
      const breakdownItem = containerEl.closest('.breakdown-item');
      if (breakdownItem) {
        const countEl = breakdownItem.querySelector(':scope > .breakdown-header .brand-count');
        if (countEl) {
          const currentCount = parseInt(countEl.textContent) || 0;
          countEl.textContent = `${currentCount + delta}件`;
        }
      }
    }
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      if (!confirm('このデータを削除しますか？')) return;

      try {
        if (source === 'sold') {
          await BunsekiDB.deleteSoldItemById(id);
        } else {
          await BunsekiDB.deleteActiveListingById(id);
        }
        showAlert('削除しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateCategoryCount(container, -1);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別未分類ボタン（カテゴリ）
  container.querySelectorAll('.item-action-btn.uncategorize').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { category: null, categoryCleared: true, categoryManual: false });
        } else {
          await BunsekiDB.updateActiveListingById(id, { category: null, categoryCleared: true, categoryManual: false });
        }
        showAlert('未分類に移動しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateCategoryCount(container, -1);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('myCategoryUnclassifiedCount2');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + 1;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('myCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  });

  // カテゴリ変更ボタン
  container.querySelectorAll('.item-action-btn.change-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;
      const title = btn.dataset.title;

      const newCategory = prompt(`新しいカテゴリ名を入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        } else {
          await BunsekiDB.updateActiveListingById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        }
        showAlert(`カテゴリを「${newCategory.trim()}」に変更しました`, 'success');
        // 該当行をDOMから削除（別カテゴリに移動したため）
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateCategoryCount(container, -1);
      } catch (e) {
        console.error('変更エラー:', e);
        showAlert('変更に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 自分のデータのカテゴリ→細分類別アイテム一覧を読み込む
 */
function loadMyCategorySubItems(mainCategory, subCategory, container, allItems) {
  const categoryItems = allItems.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    if (item.categoryManual && item.category) {
      return item.category === subCategory || item.category === mainCategory;
    } else if (item.categoryCleared) {
      return false;
    }
    const { main, sub } = detectCategoryWithSub(item.title);
    return main === mainCategory && sub === subCategory;
  });

  if (categoryItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox">
          全て選択
        </label>
        <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
        <button class="bulk-uncategorize-btn" disabled>↩ 未分類に</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  categoryItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const itemId = item.id;
    const source = item.saleDate ? 'sold' : 'active';
    html += `
      <tr data-item-id="${itemId}" data-source="${source}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
            <button class="item-action-btn uncategorize" data-id="${itemId}" data-source="${source}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-category" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="カテゴリ変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMyCategoryItemActions(container, subCategory, allItems);
}

/**
 * 市場データのカテゴリ→細分類別アイテム一覧を読み込む
 */
function loadMarketCategorySubItems(mainCategory, subCategory, container, allItems) {
  const categoryItems = allItems.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    if (item.categoryManual && item.category) {
      return item.category === subCategory || item.category === mainCategory;
    } else if (item.categoryCleared) {
      return false;
    }
    const { main, sub } = detectCategoryWithSub(item.title);
    return main === mainCategory && sub === subCategory;
  });

  if (categoryItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox">
          全て選択
        </label>
        <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
        <button class="bulk-uncategorize-btn" disabled>↩ 未分類に</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th>売上</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  categoryItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const sold = item.sold || '-';
    const itemId = item.id;
    html += `
      <tr data-item-id="${itemId}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="item-sold">${sold}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" title="削除">🗑️</button>
            <button class="item-action-btn uncategorize" data-id="${itemId}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-category" data-id="${itemId}" data-title="${escapeHtml(title)}" title="カテゴリ変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMarketCategorySubItemActions(container, mainCategory, subCategory, allItems);
}

/**
 * 市場データのカテゴリ細分類アイテム操作イベントを設定
 */
function setupMarketCategorySubItemActions(container, mainCategory, subCategory, allItems) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkUncategorizeBtn = container.querySelector('.bulk-uncategorize-btn');

  // カテゴリカウント更新のヘルパー関数（階層構造対応）
  function updateMarketCategoryCount(containerEl, delta) {
    // 細分類（subcategory-item）のカウントを更新
    const subcategoryItem = containerEl.closest('.subcategory-item');
    if (subcategoryItem) {
      const subCountEl = subcategoryItem.querySelector(':scope > .breakdown-header .brand-count');
      if (subCountEl) {
        const currentCount = parseInt(subCountEl.textContent) || 0;
        subCountEl.textContent = `${currentCount + delta}件`;
      }
      // 大分類（category-main）のカウントも更新
      const mainCategoryItem = subcategoryItem.closest('.category-main');
      if (mainCategoryItem) {
        const mainCountEl = mainCategoryItem.querySelector(':scope > .breakdown-header .brand-count');
        if (mainCountEl) {
          const mainCurrentCount = parseInt(mainCountEl.textContent) || 0;
          mainCountEl.textContent = `${mainCurrentCount + delta}件`;
        }
      }
    } else {
      // 大分類直下の場合
      const breakdownItem = containerEl.closest('.breakdown-item');
      if (breakdownItem) {
        const countEl = breakdownItem.querySelector(':scope > .breakdown-header .brand-count');
        if (countEl) {
          const currentCount = parseInt(countEl.textContent) || 0;
          countEl.textContent = `${currentCount + delta}件`;
        }
      }
    }
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkUncategorizeBtn) bulkUncategorizeBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
      const deleteCount = checked.length;

      try {
        await BunsekiDB.deleteMarketDataByIds(ids);
        showAlert(`${deleteCount}件を削除しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -deleteCount);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括未分類に移動
  if (bulkUncategorizeBtn) {
    bulkUncategorizeBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件を未分類に移動しますか？`)) return;

      const moveCount = checked.length;

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          await BunsekiDB.updateMarketDataById(id, { category: null, categoryCleared: true });
        }
        showAlert(`${moveCount}件を未分類に移動しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -moveCount);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('marketCategoryUnclassifiedCount');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + moveCount;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      if (!confirm('このデータを削除しますか？')) return;

      try {
        await BunsekiDB.deleteMarketDataById(id);
        showAlert('削除しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別未分類ボタン
  container.querySelectorAll('.item-action-btn.uncategorize').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      try {
        await BunsekiDB.updateMarketDataById(id, { category: null, categoryCleared: true });
        showAlert('未分類に移動しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('marketCategoryUnclassifiedCount');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + 1;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  });

  // カテゴリ変更ボタン
  container.querySelectorAll('.item-action-btn.change-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const title = btn.dataset.title;

      const newCategory = prompt(`新しいカテゴリ名を入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        await BunsekiDB.updateMarketDataById(id, { category: newCategory.trim(), categoryManual: true });
        showAlert(`カテゴリを「${newCategory.trim()}」に変更しました`, 'success');
        // 該当行をDOMから削除（別カテゴリに移動したため）
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
      } catch (e) {
        console.error('変更エラー:', e);
        showAlert('変更に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 未分類リストの表示/非表示を切り替え
 * @param {string} type - 'my' または 'market'
 */
async function toggleUnclassifiedList(type) {
  const listEl = document.getElementById(type === 'my' ? 'myUnclassifiedList' : 'marketUnclassifiedList');
  const itemsEl = document.getElementById(type === 'my' ? 'myUnclassifiedItems' : 'marketUnclassifiedItems');

  if (!listEl || !itemsEl) return;

  // 表示/非表示をトグル
  if (listEl.style.display === 'none' || listEl.style.display === '') {
    // 未分類アイテムを取得
    let unclassifiedItems = [];

    if (type === 'my') {
      const allItems = [...(analyzer.activeListings || []), ...(analyzer.soldItems || [])];
      unclassifiedItems = allItems.filter(item => {
        // 優先順位: 1. 手動設定 2. 未分類フラグ 3. AI分類 4. タイトルから判定
        let brand;
        if (item.brandManual && item.brand) {
          brand = item.brand;
        } else if (item.brandCleared) {
          brand = null;
        } else if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
          brand = window.aiClassificationResults[item.title].brand;
        } else {
          brand = extractBrandFromTitle(item.title);
        }
        return !brand || brand === '(不明)' || brand === 'その他' || brand === '(未分類)' || brand === null;
      });
    } else {
      const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
      unclassifiedItems = (marketData || []).filter(item => {
        // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
        let brand;
        if (item.brandManual && item.brand) {
          brand = item.brand;
        } else if (item.brandCleared) {
          brand = null;
        } else {
          brand = extractBrandFromTitle(item.title);
        }
        return !brand || brand === '(不明)' || brand === 'その他' || brand === '(未分類)' || brand === null;
      });
    }

    if (unclassifiedItems.length === 0) {
      itemsEl.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">未分類のアイテムはありません</p>';
    } else {
      // アルファベット順にソート
      unclassifiedItems.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });

      // テーブル形式で表示（操作機能付き）
      let html = `
        <div class="unclassified-items-list">
          <div class="items-bulk-actions">
            <label class="select-all-label">
              <input type="checkbox" class="select-all-checkbox">
              全て選択
            </label>
            <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
            <button class="bulk-assign-btn" disabled>✏️ ブランド設定</button>
            <span class="items-count">${unclassifiedItems.length}件</span>
          </div>
          <table class="items-table with-actions">
            <thead>
              <tr>
                <th class="col-checkbox"></th>
                <th>タイトル</th>
                <th class="col-price">価格</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
      `;

      unclassifiedItems.forEach(item => {
        const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
        const title = item.title || '(タイトルなし)';
        const itemId = item.id;
        const source = type === 'my' ? (item.saleDate ? 'sold' : 'active') : 'market';
        html += `
          <tr data-item-id="${itemId}" data-source="${source}">
            <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
            <td class="item-title">${escapeHtml(title)}</td>
            <td class="col-price">${price}</td>
            <td class="col-actions">
              <div class="action-buttons">
                <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
                <button class="item-action-btn assign-brand" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="ブランド設定">✏️</button>
              </div>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table></div>';
      itemsEl.innerHTML = html;

      // イベントリスナー設定
      setupUnclassifiedItemActions(itemsEl, type);
    }

    listEl.style.display = 'flex';
  } else {
    listEl.style.display = 'none';
  }
}

/**
 * 未分類リストのアイテム操作イベントを設定
 */
function setupUnclassifiedItemActions(container, type) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkAssignBtn = container.querySelector('.bulk-assign-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkAssignBtn) bulkAssignBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      try {
        if (type === 'my') {
          const activeIds = [];
          const soldIds = [];
          checked.forEach(cb => {
            const id = parseInt(cb.dataset.id);
            if (cb.dataset.source === 'sold') {
              soldIds.push(id);
            } else {
              activeIds.push(id);
            }
          });
          if (activeIds.length > 0) await BunsekiDB.deleteActiveListingsByIds(activeIds);
          if (soldIds.length > 0) await BunsekiDB.deleteSoldItemsByIds(soldIds);
          showAlert(`${checked.length}件を削除しました`, 'success');
          await refreshMyDataAnalysis();
        } else {
          const marketIds = Array.from(checked).map(cb => parseInt(cb.dataset.id));
          await BunsekiDB.deleteMarketDataByIds(marketIds);
          showAlert(`${checked.length}件を削除しました`, 'success');
          await refreshMarketDataAnalysis();
        }
        // リストを更新
        const listEl = document.getElementById(type === 'my' ? 'myUnclassifiedList' : 'marketUnclassifiedList');
        if (listEl) listEl.style.display = 'none';
        toggleUnclassifiedList(type);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括ブランド設定
  if (bulkAssignBtn) {
    bulkAssignBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      const newBrand = prompt(`${checked.length}件にブランドを設定します。\nブランド名を入力してください:`, '');
      if (newBrand === null) return;
      if (newBrand.trim() === '') {
        showAlert('ブランド名を入力してください', 'warning');
        return;
      }

      try {
        if (type === 'my') {
          for (const cb of checked) {
            const id = parseInt(cb.dataset.id);
            if (cb.dataset.source === 'sold') {
              await BunsekiDB.updateSoldItemById(id, { brand: newBrand.trim(), brandManual: true });
            } else {
              await BunsekiDB.updateActiveListingById(id, { brand: newBrand.trim(), brandManual: true });
            }
          }
          showAlert(`${checked.length}件に「${newBrand.trim()}」を設定しました`, 'success');
          await refreshMyDataAnalysis();
        } else {
          for (const cb of checked) {
            const id = parseInt(cb.dataset.id);
            await BunsekiDB.updateMarketDataById(id, { brand: newBrand.trim(), brandManual: true });
          }
          showAlert(`${checked.length}件に「${newBrand.trim()}」を設定しました`, 'success');
          await refreshMarketDataAnalysis();
        }
        // リストを更新
        const listEl = document.getElementById(type === 'my' ? 'myUnclassifiedList' : 'marketUnclassifiedList');
        if (listEl) listEl.style.display = 'none';
        toggleUnclassifiedList(type);
      } catch (e) {
        console.error('ブランド設定エラー:', e);
        showAlert('ブランド設定に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      if (!confirm('このデータを削除しますか？')) return;

      try {
        if (source === 'sold') {
          await BunsekiDB.deleteSoldItemById(id);
        } else if (source === 'active') {
          await BunsekiDB.deleteActiveListingById(id);
        } else {
          await BunsekiDB.deleteMarketDataById(id);
        }
        showAlert('削除しました', 'success');
        if (type === 'my') {
          await refreshMyDataAnalysis();
        } else {
          await refreshMarketDataAnalysis();
        }
        // リストを更新
        const listEl = document.getElementById(type === 'my' ? 'myUnclassifiedList' : 'marketUnclassifiedList');
        if (listEl) listEl.style.display = 'none';
        toggleUnclassifiedList(type);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別ブランド設定ボタン
  container.querySelectorAll('.item-action-btn.assign-brand').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;
      const title = btn.dataset.title;

      const newBrand = prompt(`ブランド名を入力してください:\n\n${title}`, '');
      if (newBrand === null) return;
      if (newBrand.trim() === '') {
        showAlert('ブランド名を入力してください', 'warning');
        return;
      }

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { brand: newBrand.trim(), brandManual: true });
        } else if (source === 'active') {
          await BunsekiDB.updateActiveListingById(id, { brand: newBrand.trim(), brandManual: true });
        } else {
          await BunsekiDB.updateMarketDataById(id, { brand: newBrand.trim(), brandManual: true });
        }
        showAlert(`ブランドを「${newBrand.trim()}」に設定しました`, 'success');
        if (type === 'my') {
          await refreshMyDataAnalysis();
        } else {
          await refreshMarketDataAnalysis();
        }
        // リストを更新
        const listEl = document.getElementById(type === 'my' ? 'myUnclassifiedList' : 'marketUnclassifiedList');
        if (listEl) listEl.style.display = 'none';
        toggleUnclassifiedList(type);
      } catch (e) {
        console.error('ブランド設定エラー:', e);
        showAlert('ブランド設定に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 未分類アイテム警告の更新
 */
function updateUnknownAlert(unknownCount, allItems) {
  const unknownAlert = document.getElementById('unknownAlert');
  const unknownCountEl = document.getElementById('unknownCount');
  const aiClassifySummary = document.getElementById('aiClassifySummary');
  const aiClassifyProgress = document.getElementById('aiClassifyProgress');

  if (!unknownAlert) return;

  // 保存されたAI分類データがあるかチェック
  const savedClassifications = window.aiClassificationResults || {};
  const hasClassifications = Object.keys(savedClassifications).length > 0;

  if (unknownCount > 0 && !hasClassifications) {
    unknownAlert.style.display = 'block';
    unknownCountEl.textContent = unknownCount.toLocaleString();
    // プログレスとサマリーはリセット
    if (aiClassifyProgress) aiClassifyProgress.style.display = 'none';
    if (aiClassifySummary) aiClassifySummary.style.display = 'none';
  } else if (hasClassifications) {
    // AI分類済みの場合は結果を表示
    unknownAlert.style.display = 'block';
    unknownCountEl.textContent = '0';
    document.querySelector('.unknown-alert-header span:last-child').textContent = 'AI分類済み';
    document.querySelector('.unknown-hint').textContent = 'ブランド・カテゴリは自動判定されています';
    document.getElementById('classifyWithAIBtn').style.display = 'none';
  } else {
    unknownAlert.style.display = 'none';
  }
}

/**
 * 自分のデータをクリア
 */
function clearMyData() {
  if (!confirm('自分のデータ（Active Listings・Orders）をクリアしますか？')) {
    return;
  }

  // データをクリア
  activeListingsData = null;
  ordersData = null;

  // analyzerのデータもクリア
  analyzer.activeListings = [];
  analyzer.soldItems = [];
  analyzer.results = {
    summary: {},
    listingPace: [],
    brandPerformance: [],
    categoryStats: [],
    watchRanking: [],
    alerts: []
  };

  // AI分類結果もクリア
  window.aiClassificationResults = {};

  // IndexedDBからも削除
  BunsekiDB.clearActiveListings();
  BunsekiDB.clearSoldItems();
  // シート固有のメタデータを削除
  chrome.storage.local.remove([
    getSheetKey('savedAnalysisMeta'),
    getSheetKey('customBrandRules'),
    getSheetKey('aiClassificationResults')
  ]);

  // ステータス表示をリセット
  updateDataStatus('activeListingsStatus', 0, false);
  updateDataStatus('ordersStatus', 0, false);

  // ファイル入力をリセット
  const activeListingsFile = document.getElementById('activeListingsFile');
  const ordersFile = document.getElementById('ordersFile');
  if (activeListingsFile) activeListingsFile.value = '';
  if (ordersFile) ordersFile.value = '';

  // サマリーを更新（非表示になる）
  updateMyDataSummary();

  // AI分類UIもリセット
  const unknownAlert = document.getElementById('unknownAlert');
  const classifyBtn = document.getElementById('classifyWithAIBtn');
  const aiClassifySummary = document.getElementById('aiClassifySummary');
  const aiClassifyProgress = document.getElementById('aiClassifyProgress');

  if (unknownAlert) {
    unknownAlert.style.display = 'none';
    // テキストをデフォルトに戻す
    const headerSpan = document.querySelector('.unknown-alert-header span:last-child');
    if (headerSpan) headerSpan.innerHTML = '<span id="unknownCount">0</span>件の商品が「未分類」です';
    const hint = document.querySelector('.unknown-hint');
    if (hint) hint.textContent = 'ブランド・カテゴリを判定できなかった商品があります';
  }
  if (classifyBtn) {
    classifyBtn.style.display = 'flex';
    classifyBtn.disabled = false;
    classifyBtn.innerHTML = '<span class="btn-icon">🤖</span> AIで自動判定する';
  }
  if (aiClassifySummary) aiClassifySummary.style.display = 'none';
  if (aiClassifyProgress) aiClassifyProgress.style.display = 'none';

  showAlert('自分のデータをクリアしました', 'success');
}

/**
 * 市場データ情報更新
 */
async function updateMarketDataInfo() {
  try {
    // 市場データを取得（シートIDでフィルタ）
    const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

    console.log(`シート ${currentSheetId}: 市場データ${marketData.length}件`);

    const summaryEl = document.getElementById('marketDataSummary');
    const actionsEl = document.getElementById('marketDataActions');
    const totalCountEl = document.getElementById('marketTotalCount');
    const lastUpdateEl = document.getElementById('marketLastUpdate');
    const analysisResultEl = document.getElementById('marketDataAnalysisResult');

    if (marketData && marketData.length > 0) {
      // サマリーと操作ボタンを表示
      if (summaryEl) summaryEl.style.display = 'flex';
      if (actionsEl) actionsEl.style.display = 'flex';

      if (totalCountEl) totalCountEl.textContent = marketData.length.toLocaleString();

      // 最終更新日
      const latestDate = marketData.reduce((latest, item) => {
        const date = item.capturedAt ? new Date(item.capturedAt) : null;
        return date && (!latest || date > latest) ? date : latest;
      }, null);

      if (lastUpdateEl && latestDate) {
        lastUpdateEl.textContent = formatDate(latestDate);
      }
    } else {
      if (summaryEl) summaryEl.style.display = 'none';
      if (actionsEl) actionsEl.style.display = 'none';
      if (analysisResultEl) analysisResultEl.style.display = 'none';
      if (totalCountEl) totalCountEl.textContent = '0';
      if (lastUpdateEl) lastUpdateEl.textContent = '-';
    }
  } catch (error) {
    console.error('市場データ情報の取得に失敗:', error);
  }
}

/**
 * 市場データを分析
 */
async function analyzeMarketData() {
  // 市場データを取得（シートIDでフィルタ）
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

  if (!marketData || marketData.length === 0) {
    showAlert('分析する市場データがありません', 'warning');
    return;
  }

  // ブランド分類を実行（AI分類結果とcustomBrandRulesを使用）
  const brands = {};
  let classifiedCount = 0;
  let unclassifiedCount = 0;

  marketData.forEach(item => {
    // 既存のbrand値を信頼せず、常にタイトルから再判定
    // （あり得ないブランドが上位に来る問題を防ぐため）
    let brand = extractBrandFromTitle(item.title);
    item.brand = brand;

    if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null) {
      classifiedCount++;
      brands[brand] = (brands[brand] || 0) + 1;
    } else {
      unclassifiedCount++;
      brands['(未分類)'] = (brands['(未分類)'] || 0) + 1;
    }

    // カテゴリも常に再判定
    item.category = detectCategoryFromTitle(item.title);

    // プロファイル別の属性抽出
    if (currentSheetProfile !== 'general') {
      const attributes = extractAttributesByProfile(item.title);
      if (attributes) {
        item.attributes = attributes;
        item.profileExtracted = currentSheetProfile;
      }
    }
  });

  // 更新した市場データをIndexedDBに保存（現在のシートのみクリアして追加）
  let saveSuccess = false;
  try {
    await BunsekiDB.clearMarketDataForCurrentSheet();
    await BunsekiDB.addMarketData(marketData);
    await chrome.storage.local.set({ marketDataSavedAt: new Date().toISOString() });
    saveSuccess = true;
  } catch (error) {
    console.error('市場データ保存エラー:', error);
  }

  // 分析結果を表示
  const resultEl = document.getElementById('marketDataAnalysisResult');
  if (resultEl) {
    resultEl.style.display = 'block';

    // 統計値を更新（保存後のデータで）
    document.getElementById('marketClassifiedCount').textContent = classifiedCount.toLocaleString();
    document.getElementById('marketUnclassifiedCount').textContent = unclassifiedCount.toLocaleString();
    document.getElementById('marketBrandCount').textContent = (Object.keys(brands).length - (brands['(未分類)'] ? 1 : 0)).toLocaleString();

    // AI再判定セクション表示
    const aiSection = document.getElementById('marketAiSection');
    const aiBtn = document.getElementById('classifyMarketWithAIBtn');
    if (aiSection) {
      if (unclassifiedCount > 0) {
        aiSection.style.display = 'block';
        // ボタンをリセット（再チャレンジ可能に）
        if (aiBtn) {
          aiBtn.disabled = false;
          aiBtn.innerHTML = '<span class="btn-icon">🤖</span> AIで再判定する';
        }
        // プログレスを非表示
        const progressEl = document.getElementById('marketAiProgress');
        if (progressEl) progressEl.style.display = 'none';
      } else {
        aiSection.style.display = 'none';
      }
    }

    // ブランド内訳を表示（トグル機能付き）
    const breakdownEl = document.getElementById('marketBrandBreakdown');
    const marketBrandToggle = document.getElementById('marketBrandToggle');
    if (breakdownEl) {
      const sortedBrands = Object.entries(brands)
        .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
        .sort((a, b) => b[1] - a[1]);
      const totalBrandCount = sortedBrands.length;

      // トグル機能の初期化
      let showAllBrands = false;

      const renderBrands = () => {
        const displayBrands = showAllBrands ? sortedBrands : sortedBrands.slice(0, 10);

        breakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
          <div class="breakdown-item expandable" data-brand="${escapeHtml(brand)}">
            <div class="breakdown-header">
              <span class="expand-icon">▶</span>
              <span class="brand-name">${escapeHtml(brand)}</span>
              <span class="brand-count">${count}件</span>
            </div>
            <div class="breakdown-items" style="display: none;">
              <div class="loading-items">読み込み中...</div>
            </div>
          </div>
        `).join('');

        // 展開クリックイベント
        breakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
          item.querySelector('.breakdown-header').addEventListener('click', function() {
            const brand = item.dataset.brand;
            const itemsDiv = item.querySelector('.breakdown-items');
            const expandIcon = item.querySelector('.expand-icon');

            if (itemsDiv.style.display === 'none') {
              itemsDiv.style.display = 'block';
              expandIcon.textContent = '▼';
              item.classList.add('expanded');
              loadMarketBrandItems(brand, itemsDiv, marketData);
            } else {
              itemsDiv.style.display = 'none';
              expandIcon.textContent = '▶';
              item.classList.remove('expanded');
            }
          });
        });
      };

      renderBrands();

      // トグルボタンの設定
      if (marketBrandToggle) {
        if (totalBrandCount > 10) {
          marketBrandToggle.style.display = 'block';
          marketBrandToggle.textContent = `全て表示 (${totalBrandCount}件)`;
          marketBrandToggle.onclick = () => {
            showAllBrands = !showAllBrands;
            marketBrandToggle.textContent = showAllBrands ? 'トップ10のみ表示' : `全て表示 (${totalBrandCount}件)`;
            renderBrands();
          };
        } else {
          marketBrandToggle.style.display = 'none';
        }
      }
    }

    // プロファイルに応じてカテゴリ列を切り替え
    const genericCategoryColumn = document.getElementById('genericCategoryColumn');
    const pokemonAttributeColumn = document.getElementById('pokemonAttributeColumn');

    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
      // ポケモンプロファイル: 属性別内訳を表示
      if (genericCategoryColumn) genericCategoryColumn.style.display = 'none';
      if (pokemonAttributeColumn) {
        pokemonAttributeColumn.style.display = 'block';
        renderPokemonAttributeBreakdown(marketData, 'character');

        // タブクリックイベント
        pokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(tab => {
          tab.addEventListener('click', function() {
            pokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            renderPokemonAttributeBreakdown(marketData, this.dataset.attr);
          });
        });
      }
    } else {
      // 汎用プロファイル: カテゴリ別内訳を表示
      if (genericCategoryColumn) genericCategoryColumn.style.display = 'block';
      if (pokemonAttributeColumn) pokemonAttributeColumn.style.display = 'none';

      const categoryBreakdownEl = document.getElementById('marketCategoryBreakdown');
      const marketCategoryToggle = document.getElementById('marketCategoryToggle');
      if (categoryBreakdownEl) {
        // カテゴリを階層構造で集計
        const categories = {};  // { main: { count, subs: { sub: count } } }
        marketData.forEach(item => {
          const { main, sub } = detectCategoryWithSub(item.title);
          if (!categories[main]) {
            categories[main] = { count: 0, subs: {} };
          }
          categories[main].count++;
          if (!categories[main].subs[sub]) {
            categories[main].subs[sub] = 0;
          }
          categories[main].subs[sub]++;
        });

        const sortedCategories = Object.entries(categories)
          .filter(([cat]) => cat !== '(その他)' && cat !== 'その他')
          .sort((a, b) => b[1].count - a[1].count);
        const totalCategoryCount = sortedCategories.length;

        let showAllCategories = false;

        const renderCategories = () => {
          const displayCategories = showAllCategories ? sortedCategories : sortedCategories.slice(0, 10);

          categoryBreakdownEl.innerHTML = displayCategories.map(([category, data]) => {
            const sortedSubs = Object.entries(data.subs)
              .filter(([sub]) => sub !== category)
              .sort((a, b) => b[1] - a[1]);

            const subHtml = sortedSubs.length > 0 ? `
              <div class="sub-categories" style="display: none;">
                ${sortedSubs.map(([sub, count]) => `
                  <div class="sub-category-item">
                    <span class="sub-category-name">${escapeHtml(sub)}</span>
                    <span class="sub-category-count">${count}件</span>
                  </div>
                `).join('')}
              </div>
            ` : '';

            return `
              <div class="breakdown-item ${sortedSubs.length > 0 ? 'has-subs' : ''}" data-category="${escapeHtml(category)}">
                <div class="breakdown-header">
                  ${sortedSubs.length > 0 ? '<span class="expand-icon">▶</span>' : '<span class="expand-icon" style="visibility:hidden">▶</span>'}
                  <span class="category-name">${escapeHtml(category)}</span>
                  <span class="category-count">${data.count}件</span>
                </div>
                ${subHtml}
              </div>
            `;
          }).join('');

          // サブカテゴリ展開イベント
          categoryBreakdownEl.querySelectorAll('.breakdown-item.has-subs').forEach(item => {
            item.querySelector('.breakdown-header').addEventListener('click', function() {
              const subsDiv = item.querySelector('.sub-categories');
              const expandIcon = item.querySelector('.expand-icon');
              if (subsDiv) {
                if (subsDiv.style.display === 'none') {
                  subsDiv.style.display = 'block';
                  expandIcon.textContent = '▼';
                  item.classList.add('expanded');
                } else {
                  subsDiv.style.display = 'none';
                  expandIcon.textContent = '▶';
                  item.classList.remove('expanded');
                }
              }
            });
          });
        };

        renderCategories();

        // トグルボタンの設定
        if (marketCategoryToggle) {
          if (totalCategoryCount > 10) {
            marketCategoryToggle.style.display = 'block';
            marketCategoryToggle.textContent = `全て表示 (${totalCategoryCount}件)`;
            marketCategoryToggle.onclick = () => {
              showAllCategories = !showAllCategories;
              marketCategoryToggle.textContent = showAllCategories ? 'トップ10のみ表示' : `全て表示 (${totalCategoryCount}件)`;
              renderCategories();
            };
          } else {
            marketCategoryToggle.style.display = 'none';
          }
        }
      }
    }

    // 保存ステータス表示
    const saveStatus = document.getElementById('marketDataSaveStatus');
    const saveInfo = document.getElementById('marketDataSaveInfo');
    if (saveStatus) {
      saveStatus.style.display = saveSuccess ? 'flex' : 'none';
    }
    if (saveInfo && saveSuccess) {
      saveInfo.textContent = `自動保存済み (${formatDateTime(new Date())})`;
      saveInfo.className = 'save-info success';
    }
  }

  // ポケモンプロファイルの場合、未認識アイテムを表示＆分析データ読み込み
  if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
    displayUnrecognizedItems(marketData);
    updatePokemonCorrectionVisibility();
    updatePokemonAnalysisVisibility();
    // デフォルトでキャラ別ランキングを表示
    loadPokemonAnalysisData('character-ranking');
  }

  showAlert(`${marketData.length}件の市場データを分析しました`, 'success');
}

/**
 * 市場データのブランド別商品を読み込んで表示
 */
function loadMarketBrandItems(brand, container, marketData) {
  const brandLower = brand.toLowerCase();
  const brandItems = marketData.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    let itemBrand;
    if (item.brandManual && item.brand) {
      itemBrand = item.brand;
    } else if (item.brandCleared) {
      itemBrand = '(未分類)';
    } else {
      itemBrand = extractBrandFromTitle(item.title) || '(未分類)';
    }
    return itemBrand.toLowerCase() === brandLower;
  });

  if (brandItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  // 売上数順でソート
  brandItems.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox" data-brand="${escapeHtml(brand)}">
          全て選択
        </label>
        <button class="bulk-delete-btn" data-brand="${escapeHtml(brand)}" disabled>🗑️ 選択を削除</button>
        <button class="bulk-unclassify-btn" data-brand="${escapeHtml(brand)}" disabled>↩ 未分類に</button>
        <span class="items-count">${brandItems.length}件</span>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th class="col-sold">売上</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  brandItems.forEach(item => {
    const title = item.title || '';
    const itemId = item.id;
    html += `
      <tr data-item-id="${itemId}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">$${(item.price || 0).toLocaleString()}</td>
        <td class="col-sold">${item.sold || 0}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" title="削除">🗑️</button>
            <button class="item-action-btn unclassify" data-id="${itemId}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-brand" data-id="${itemId}" data-title="${escapeHtml(title)}" title="ブランド変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // イベントリスナー設定
  setupMarketDataItemActions(container, brand);
}

/**
 * 市場データのアイテム操作イベントを設定
 */
function setupMarketDataItemActions(container, brand) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkUnclassifyBtn = container.querySelector('.bulk-unclassify-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkUnclassifyBtn) bulkUnclassifyBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));

      try {
        await BunsekiDB.deleteMarketDataByIds(ids);
        showAlert(`${checked.length}件を削除しました`, 'success');
        await refreshMarketDataAnalysis();
      } catch (e) {
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括未分類に移動
  if (bulkUnclassifyBtn) {
    bulkUnclassifyBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件を未分類に移動しますか？`)) return;

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          await BunsekiDB.updateMarketDataById(id, { brand: null, brandCleared: true });
        }
        showAlert(`${checked.length}件を未分類に移動しました`, 'success');
        await refreshMarketDataAnalysis();
      } catch (e) {
        showAlert('移動に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      if (!confirm('このデータを削除しますか？')) return;

      try {
        await BunsekiDB.deleteMarketDataById(id);
        showAlert('削除しました', 'success');
        await refreshMarketDataAnalysis();
      } catch (e) {
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別未分類ボタン
  container.querySelectorAll('.item-action-btn.unclassify').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      try {
        await BunsekiDB.updateMarketDataById(id, { brand: null, brandCleared: true });
        showAlert('未分類に移動しました', 'success');
        await refreshMarketDataAnalysis();
      } catch (e) {
        showAlert('移動に失敗しました', 'error');
      }
    });
  });

  // ブランド変更ボタン
  container.querySelectorAll('.item-action-btn.change-brand').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const title = btn.dataset.title;

      const newBrand = prompt(`新しいブランド名を入力してください:\n\n${title}`, '');
      if (newBrand === null) return;
      if (newBrand.trim() === '') {
        showAlert('ブランド名を入力してください', 'warning');
        return;
      }

      try {
        await BunsekiDB.updateMarketDataById(id, { brand: newBrand.trim(), brandManual: true });
        showAlert(`ブランドを「${newBrand.trim()}」に変更しました`, 'success');
        await refreshMarketDataAnalysis();
      } catch (e) {
        showAlert('変更に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 市場データの分析を再実行
 */
async function refreshMarketDataAnalysis() {
  // 展開中のブランドを記録
  const expandedBrands = [];
  document.querySelectorAll('#marketBrandBreakdown .breakdown-item.expanded').forEach(item => {
    expandedBrands.push(item.dataset.brand);
  });

  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
  restoreMarketDataAnalysisResult(marketData);

  // 展開状態を復元
  expandedBrands.forEach(brand => {
    const item = document.querySelector(`#marketBrandBreakdown .breakdown-item[data-brand="${brand}"]`);
    if (item) {
      const itemsDiv = item.querySelector('.breakdown-items');
      const expandIcon = item.querySelector('.expand-icon');
      if (itemsDiv && expandIcon) {
        itemsDiv.style.display = 'block';
        expandIcon.textContent = '▼';
        item.classList.add('expanded');
        loadMarketBrandItems(brand, itemsDiv, marketData);
      }
    }
  });
}

/**
 * 市場データのカテゴリ別アイテム一覧を読み込む
 */
function loadMarketCategoryItems(category, container, marketData) {
  const categoryLower = category.toLowerCase();
  const categoryItems = marketData.filter(item => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. タイトルから判定
    let itemCategory;
    if (item.categoryManual && item.category) {
      itemCategory = item.category;
    } else if (item.categoryCleared) {
      itemCategory = '(未分類)';
    } else {
      itemCategory = detectCategoryFromTitle(item.title) || '(未分類)';
    }
    return itemCategory.toLowerCase() === categoryLower;
  });

  if (categoryItems.length === 0) {
    container.innerHTML = '<p class="no-items">商品が見つかりません</p>';
    return;
  }

  // 売上数順でソート
  categoryItems.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox" data-category="${escapeHtml(category)}">
          全て選択
        </label>
        <button class="bulk-delete-btn" data-category="${escapeHtml(category)}" disabled>🗑️ 選択を削除</button>
        <button class="bulk-uncategorize-btn" data-category="${escapeHtml(category)}" disabled>↩ 未分類に</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th>売上数</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  categoryItems.forEach(item => {
    const title = item.title || '';
    const itemId = item.id;
    html += `
      <tr data-item-id="${itemId}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">$${(item.price || 0).toLocaleString()}</td>
        <td class="item-sold">${item.sold || 0}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" title="削除">🗑️</button>
            <button class="item-action-btn uncategorize" data-id="${itemId}" title="未分類に移動">↩</button>
            <button class="item-action-btn change-category" data-id="${itemId}" data-title="${escapeHtml(title)}" title="カテゴリ変更">✏️</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMarketCategoryItemActions(container, category, marketData);
}

/**
 * 市場データのカテゴリ別アイテム操作イベントを設定
 */
function setupMarketCategoryItemActions(container, category, marketData) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkUncategorizeBtn = container.querySelector('.bulk-uncategorize-btn');

  // カテゴリカウント更新のヘルパー関数（階層構造対応）
  function updateMarketCategoryCount(containerEl, delta) {
    // 細分類（subcategory-item）のカウントを更新
    const subcategoryItem = containerEl.closest('.subcategory-item');
    if (subcategoryItem) {
      const subCountEl = subcategoryItem.querySelector(':scope > .breakdown-header .brand-count');
      if (subCountEl) {
        const currentCount = parseInt(subCountEl.textContent) || 0;
        subCountEl.textContent = `${currentCount + delta}件`;
      }
      // 大分類（category-main）のカウントも更新
      const mainCategoryItem = subcategoryItem.closest('.category-main');
      if (mainCategoryItem) {
        const mainCountEl = mainCategoryItem.querySelector(':scope > .breakdown-header .brand-count');
        if (mainCountEl) {
          const mainCurrentCount = parseInt(mainCountEl.textContent) || 0;
          mainCountEl.textContent = `${mainCurrentCount + delta}件`;
        }
      }
    } else {
      // 大分類直下の場合
      const breakdownItem = containerEl.closest('.breakdown-item');
      if (breakdownItem) {
        const countEl = breakdownItem.querySelector(':scope > .breakdown-header .brand-count');
        if (countEl) {
          const currentCount = parseInt(countEl.textContent) || 0;
          countEl.textContent = `${currentCount + delta}件`;
        }
      }
    }
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkUncategorizeBtn) bulkUncategorizeBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
      const deleteCount = checked.length;

      try {
        await BunsekiDB.deleteMarketDataByIds(ids);
        showAlert(`${deleteCount}件を削除しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -deleteCount);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括未分類に移動
  if (bulkUncategorizeBtn) {
    bulkUncategorizeBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件を未分類に移動しますか？`)) return;

      const moveCount = checked.length;

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          await BunsekiDB.updateMarketDataById(id, { category: null, categoryCleared: true });
        }
        showAlert(`${moveCount}件を未分類に移動しました`, 'success');
        // 該当行をDOMから削除
        checked.forEach(cb => {
          const row = cb.closest('tr');
          if (row) row.remove();
        });
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -moveCount);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('marketCategoryUnclassifiedCount');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + moveCount;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      if (!confirm('このデータを削除しますか？')) return;

      try {
        await BunsekiDB.deleteMarketDataById(id);
        showAlert('削除しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別未分類ボタン
  container.querySelectorAll('.item-action-btn.uncategorize').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      try {
        await BunsekiDB.updateMarketDataById(id, { category: null, categoryCleared: true });
        showAlert('未分類に移動しました', 'success');
        // 該当行をDOMから削除
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
        // カテゴリ未分類カウントを更新
        const categoryUnclassifiedCount = document.getElementById('marketCategoryUnclassifiedCount');
        if (categoryUnclassifiedCount) {
          const count = parseInt(categoryUnclassifiedCount.textContent) || 0;
          categoryUnclassifiedCount.textContent = count + 1;
        }
        // 未分類セクションを表示
        const unclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
        if (unclassifiedSection) unclassifiedSection.style.display = 'block';
      } catch (e) {
        console.error('移動エラー:', e);
        showAlert('移動に失敗しました', 'error');
      }
    });
  });

  // カテゴリ変更ボタン
  container.querySelectorAll('.item-action-btn.change-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const title = btn.dataset.title;

      const newCategory = prompt(`新しいカテゴリ名を入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        await BunsekiDB.updateMarketDataById(id, { category: newCategory.trim(), categoryManual: true });
        showAlert(`カテゴリを「${newCategory.trim()}」に変更しました`, 'success');
        // 該当行をDOMから削除（別カテゴリに移動したため）
        const row = btn.closest('tr');
        if (row) row.remove();
        // カウントを更新（階層構造対応）
        updateMarketCategoryCount(container, -1);
      } catch (e) {
        console.error('変更エラー:', e);
        showAlert('変更に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
}

/**
 * 市場データのカテゴリ未分類アイテムを表示（データ入力タブ用）
 */
function loadMarketCategoryUnclassifiedItems(container, marketData) {
  // カテゴリ未分類アイテムをフィルタリング
  const uncategorizedItems = marketData.filter(item => {
    let itemCategory;
    if (item.categoryManual && item.category) {
      itemCategory = item.category;
    } else if (item.categoryCleared) {
      itemCategory = null;
    } else {
      itemCategory = detectCategoryFromTitle(item.title);
    }
    return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
  });

  // 売上数順でソート
  uncategorizedItems.sort((a, b) => (b.sold || 0) - (a.sold || 0));

  if (uncategorizedItems.length === 0) {
    container.innerHTML = '<p class="no-items">カテゴリ未分類のアイテムはありません</p>';
    return;
  }

  let html = `
    <div class="brand-items-list">
      <div class="items-bulk-actions">
        <label class="select-all-label">
          <input type="checkbox" class="select-all-checkbox">
          全て選択
        </label>
        <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
        <button class="bulk-assign-btn" disabled>📁 カテゴリ割当</button>
      </div>
      <table class="items-table with-actions">
        <thead>
          <tr>
            <th class="col-checkbox"></th>
            <th>タイトル</th>
            <th class="col-price">価格</th>
            <th>売上数</th>
            <th class="col-actions">操作</th>
          </tr>
        </thead>
        <tbody>
  `;

  uncategorizedItems.forEach(item => {
    const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
    const title = item.title || '(タイトルなし)';
    const itemId = item.id;
    html += `
      <tr data-item-id="${itemId}">
        <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}"></td>
        <td class="item-title">${escapeHtml(title)}</td>
        <td class="col-price">${price}</td>
        <td class="item-sold">${item.sold || 0}</td>
        <td class="col-actions">
          <div class="action-buttons">
            <button class="item-action-btn delete" data-id="${itemId}" title="削除">🗑️</button>
            <button class="item-action-btn assign-category" data-id="${itemId}" data-title="${escapeHtml(title)}" title="カテゴリ割当">📁</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // イベントリスナー設定
  setupMarketCategoryUnclassifiedItemActions(container);
}

/**
 * 市場データのカテゴリ未分類アイテム操作イベントを設定（データ入力タブ用）
 */
function setupMarketCategoryUnclassifiedItemActions(container) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkAssignBtn = container.querySelector('.bulk-assign-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkAssignBtn) bulkAssignBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));

      try {
        await BunsekiDB.deleteMarketDataByIds(ids);
        showAlert(`${checked.length}件を削除しました`, 'success');
        await restoreMarketDataAnalysisResult();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括カテゴリ割当
  if (bulkAssignBtn) {
    bulkAssignBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      const newCategory = prompt(`${checked.length}件のカテゴリを設定してください:`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          await BunsekiDB.updateMarketDataById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        }
        showAlert(`${checked.length}件を「${newCategory.trim()}」に設定しました`, 'success');
        await restoreMarketDataAnalysisResult();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);

      if (!confirm('このデータを削除しますか？')) return;

      try {
        await BunsekiDB.deleteMarketDataById(id);
        showAlert('削除しました', 'success');
        await restoreMarketDataAnalysisResult();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別カテゴリ割当ボタン
  container.querySelectorAll('.item-action-btn.assign-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const title = btn.dataset.title;

      const newCategory = prompt(`カテゴリを入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        await BunsekiDB.updateMarketDataById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        showAlert(`カテゴリを「${newCategory.trim()}」に設定しました`, 'success');
        await restoreMarketDataAnalysisResult();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  });

  // タイトルクリックで展開/折りたたみ
  container.querySelectorAll('.item-title').forEach(titleEl => {
    titleEl.addEventListener('click', (e) => {
      e.stopPropagation();
      titleEl.classList.toggle('expanded');
    });
  });
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
          console.log('[popup.js] captureMarketDataFromUrl sending sheetId:', currentSheetId);
          response = await chrome.tabs.sendMessage(tab.id, {
            action: 'captureMarketData',
            sheetId: currentSheetId
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

    console.log('[popup.js] fetchMarketDataFromCurrentTab sending sheetId:', currentSheetId);
    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'captureMarketData',
      sheetId: currentSheetId
    });
    console.log('[popup.js] fetchMarketDataFromCurrentTab response:', response);

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

    // プロファイルに応じて属性を抽出
    const enrichedItems = enrichMarketDataWithAttributes(items);

    // IndexedDBに保存
    await BunsekiDB.addMarketData(enrichedItems);

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
 * 市場データCSV出力
 */
async function exportMarketCsv() {
  try {
    showLoading('CSVを作成中...');

    // 全市場データを取得
    const allData = await BunsekiDB.getMarketData();

    // 現在のシートのデータのみフィルタリング
    const sheetData = allData.filter(item => item.sheetId === currentSheetId);

    if (sheetData.length === 0) {
      showAlert('出力するデータがありません', 'warning');
      return;
    }

    // CSVヘッダー
    const headers = ['タイトル', '価格', 'ブランド', 'カテゴリ', '取得日時'];

    // CSVデータ行を作成
    const rows = sheetData.map(item => {
      return [
        escapeCSVField(item.title || ''),
        item.price || 0,
        escapeCSVField(item.brand || ''),
        escapeCSVField(item.category || ''),
        item.capturedAt || ''
      ].join(',');
    });

    // CSV文字列を作成（BOM付きでExcel対応）
    const csvContent = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

    // ダウンロード
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // ファイル名にシート名と日付を含める
    const date = new Date().toISOString().split('T')[0];
    const sheetName = document.querySelector(`[data-sheet-id="${currentSheetId}"] .sheet-name`)?.textContent || currentSheetId;
    link.download = `市場データ_${sheetName}_${date}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert(`${sheetData.length}件のデータをCSV出力しました`, 'success');
  } catch (error) {
    console.error('CSV出力エラー:', error);
    showAlert('CSV出力に失敗しました: ' + error.message, 'danger');
  } finally {
    hideLoading();
  }
}

/**
 * CSVフィールドのエスケープ
 */
function escapeCSVField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // カンマ、ダブルクォート、改行を含む場合はダブルクォートで囲む
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
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
 * 分析結果をクリア（データは残す）
 */
async function clearAnalysisResults() {
  if (!confirm('分析結果をクリアしますか？\n取得したデータは残ります。\n（カテゴリ・ブランド判定もリセットされます）')) return;

  try {
    await BunsekiDB.clearAnalysisCache();
    // 市場データのカテゴリ・ブランド判定をリセット
    await BunsekiDB.resetMarketDataClassification();

    // メモリ上の分析結果もクリア
    analyzer.results = {
      summary: {},
      brandPerformance: [],
      categoryStats: [],
      watchRanking: [],
      alerts: []
    };
    analyzer.customBrandRules = {};
    window.aiClassificationResults = {};

    // UI更新
    const analysisResultEl = document.getElementById('marketDataAnalysisResult');
    if (analysisResultEl) {
      analysisResultEl.style.display = 'none';
    }
    const myDataResultEl = document.getElementById('myDataAnalysisResult');
    if (myDataResultEl) {
      myDataResultEl.style.display = 'none';
    }

    showAlert('分析結果をクリアしました', 'success');
  } catch (error) {
    console.error('分析結果クリアエラー:', error);
    showAlert('分析結果のクリアに失敗しました', 'danger');
  }
}

/**
 * 自分のデータの分析結果のみクリア（データは残す）
 */
async function clearMyAnalysisResults() {
  if (!confirm('自分のデータの分析結果をクリアしますか？\nCSVデータは残ります。\n（カテゴリ・ブランド判定もリセットされます）')) return;

  try {
    // 出品中・販売済データのカテゴリ・ブランド判定をリセット
    await BunsekiDB.resetActiveListingsClassification();
    await BunsekiDB.resetSoldItemsClassification();

    // メモリ上の分析結果をクリア
    analyzer.results = {
      summary: {},
      brandPerformance: [],
      categoryStats: [],
      watchRanking: [],
      alerts: []
    };
    window.aiClassificationResults = {};

    // UI非表示
    const myDataResultEl = document.getElementById('myDataAnalysisResult');
    if (myDataResultEl) {
      myDataResultEl.style.display = 'none';
    }

    showAlert('分析結果をクリアしました。再度「分析する」を押してください。', 'success');
  } catch (error) {
    console.error('分析結果クリアエラー:', error);
    showAlert('分析結果のクリアに失敗しました', 'danger');
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
      await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

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

      await chrome.storage.local.set({ [getSheetKey('savedAnalysisMeta')]: metaData });
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
 * 自分のデータを保存（分析結果内のボタン用）
 */
async function saveMyDataToStorage() {
  const saveBtn = document.getElementById('saveMyDataBtn');
  const saveInfo = document.getElementById('myDataSaveInfo');
  const saveStatus = document.getElementById('myDataSaveStatus');

  try {
    // ボタンを無効化
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="btn-icon">⏳</span> 保存中...';
    }

    // IndexedDBに保存
    await BunsekiDB.setActiveListings(analyzer.activeListings);
    await BunsekiDB.setSoldItems(analyzer.soldItems);

    // メタデータをChrome Storageに保存（シート固有）
    const metaData = {
      results: analyzer.results,
      savedAt: new Date().toISOString(),
      counts: {
        active: analyzer.activeListings.length,
        sold: analyzer.soldItems.length
      }
    };
    await chrome.storage.local.set({ [getSheetKey('savedAnalysisMeta')]: metaData });

    // UI更新
    if (saveInfo) {
      saveInfo.textContent = `保存完了 (${formatDateTime(new Date())})`;
      saveInfo.className = 'save-info success';
    }
    if (saveStatus) {
      saveStatus.style.display = 'flex';
    }
    updateLastSavedInfo();
    showAlert('自分のデータを保存しました', 'success');

  } catch (error) {
    console.error('自分のデータ保存エラー:', error);
    if (saveInfo) {
      saveInfo.textContent = '保存に失敗しました';
      saveInfo.className = 'save-info';
    }
    showAlert('データの保存に失敗しました', 'danger');
  } finally {
    // ボタンを復元
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span class="btn-icon">💾</span> データを保存';
    }
  }
}

/**
 * 市場データを保存（分析結果内のボタン用）
 */
async function saveMarketDataToStorage() {
  const saveBtn = document.getElementById('saveMarketDataBtn');
  const saveInfo = document.getElementById('marketDataSaveInfo');
  const saveStatus = document.getElementById('marketDataSaveStatus');

  try {
    // ボタンを無効化
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="btn-icon">⏳</span> 保存中...';
    }

    // 市場データはIndexedDBに既に保存されているので、
    // AI分類結果とカスタムルールを保存
    await chrome.storage.local.set({
      [getSheetKey('aiClassificationResults')]: window.aiClassificationResults || {},
      [getSheetKey('marketDataSavedAt')]: new Date().toISOString()
    });

    // カスタムブランドルールも保存（シート固有）
    if (analyzer.customBrandRules && Object.keys(analyzer.customBrandRules).length > 0) {
      await chrome.storage.local.set({ [getSheetKey('customBrandRules')]: analyzer.customBrandRules });
    }

    // UI更新
    if (saveInfo) {
      saveInfo.textContent = `保存完了 (${formatDateTime(new Date())})`;
      saveInfo.className = 'save-info success';
    }
    if (saveStatus) {
      saveStatus.style.display = 'flex';
    }
    showAlert('市場データを保存しました', 'success');

  } catch (error) {
    console.error('市場データ保存エラー:', error);
    if (saveInfo) {
      saveInfo.textContent = '保存に失敗しました';
      saveInfo.className = 'save-info';
    }
    showAlert('データの保存に失敗しました', 'danger');
  } finally {
    // ボタンを復元
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span class="btn-icon">💾</span> データを保存';
    }
  }
}

/**
 * 保存済みデータの読み込み
 */
async function loadSavedData() {
  try {
    // IndexedDBからデータを復元（現在のシートでフィルタ）
    const allActiveListings = await BunsekiDB.getActiveListings();
    const allSoldItems = await BunsekiDB.getSoldItems();

    // 現在のシートIDでフィルタ（完全一致のみ）
    const activeListings = allActiveListings.filter(item => item.sheetId === currentSheetId);
    const soldItems = allSoldItems.filter(item => item.sheetId === currentSheetId);

    console.log(`シート ${currentSheetId}: 出品${activeListings.length}件, 販売${soldItems.length}件`);

    // シート固有のキーでメタデータを取得
    const metaKeys = [
      getSheetKey('savedAnalysisMeta'),
      getSheetKey('customBrandRules'),
      getSheetKey('aiClassificationResults')
    ];
    const metaData = await chrome.storage.local.get(metaKeys);

    // ポケモンプロファイルの場合、属性が付与されていないアイテムに属性を再抽出
    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
      activeListings.forEach(item => {
        if (!item.attributes && item.title) {
          const attributes = extractAttributesByProfile(item.title);
          if (attributes) {
            item.attributes = attributes;
            item.profileExtracted = currentSheetProfile;
          }
        }
      });
      soldItems.forEach(item => {
        if (!item.attributes && item.title) {
          const attributes = extractAttributesByProfile(item.title);
          if (attributes) {
            item.attributes = attributes;
            item.profileExtracted = currentSheetProfile;
          }
        }
      });
    }

    // analyzerにデータをセット（0件でもセット）
    analyzer.activeListings = activeListings;
    analyzer.soldItems = soldItems;

    // シート固有のデータを復元
    const savedMeta = metaData[getSheetKey('savedAnalysisMeta')];
    const savedRules = metaData[getSheetKey('customBrandRules')];
    const savedClassifications = metaData[getSheetKey('aiClassificationResults')];

    if (activeListings.length > 0 || soldItems.length > 0) {
      if (savedMeta?.results) {
        analyzer.results = savedMeta.results;
      }

      // 再計算
      analyzer.results.listingPace = [];
      analyzer.calculateListingPace();
      analyzer.calculateSummary();

      console.log('保存データを復元しました:', activeListings.length + soldItems.length, '件');
    }

    // UI更新（0件でも更新）
    updateDataStatus('activeListingsStatus', activeListings.length, activeListings.length > 0);
    updateDataStatus('ordersStatus', soldItems.length, soldItems.length > 0);
    updateMyDataSummary();
    updateLastSavedInfo();

    // AI学習ルールの復元（シート固有）
    if (savedRules) {
      analyzer.customBrandRules = savedRules;
      console.log('AI学習ルールを復元しました:', Object.keys(analyzer.customBrandRules).length, '件');
    } else {
      analyzer.customBrandRules = {};
    }

    // AI分類結果の復元（シート固有）
    if (savedClassifications) {
      window.aiClassificationResults = savedClassifications;
      console.log('AI分類結果を復元しました:', Object.keys(window.aiClassificationResults).length, '件');
    } else {
      window.aiClassificationResults = {};
    }

    // 学習済みルール表示を更新
    updateLearnedRulesDisplay();

    // ポケモンプロファイルの場合、ポケモン分析タブを復元
    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) && (activeListings.length > 0 || soldItems.length > 0)) {
      updateMyPokemonAnalysisVisibility();
      loadMyPokemonAnalysisData('my-character-ranking');
    }

  } catch (error) {
    console.error('保存データの読み込みに失敗:', error);
  }
}

/**
 * 前回の分析結果を復元して表示
 */
async function restoreAnalysisResults() {
  try {
    // 自分のデータの分析結果を復元
    const activeListings = analyzer.activeListings || [];
    const soldItems = analyzer.soldItems || [];
    const allMyItems = [...activeListings, ...soldItems];

    // データがない場合は初期状態に戻す
    if (allMyItems.length === 0) {
      // 統計値をリセット
      const myClassifiedEl = document.getElementById('myClassifiedCount');
      const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
      const myBrandCountEl = document.getElementById('myBrandCount');
      if (myClassifiedEl) myClassifiedEl.textContent = '0';
      if (myUnclassifiedEl) myUnclassifiedEl.textContent = '0';
      if (myBrandCountEl) myBrandCountEl.textContent = '0';

      // ブランド・カテゴリ内訳をクリア
      const myBreakdownEl = document.getElementById('myBrandBreakdown');
      const myCategoryBreakdownEl = document.getElementById('myCategoryBreakdown');
      if (myBreakdownEl) myBreakdownEl.innerHTML = '';
      if (myCategoryBreakdownEl) myCategoryBreakdownEl.innerHTML = '';

      // 分析タブのコンテンツをリセット
      ['my-listing-pace', 'my-brand-performance', 'my-watch-analysis', 'my-category-performance'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.innerHTML = '<div class="my-analysis-placeholder"><p>データがありません。「自分のデータ」タブでCSVを読み込んでください。</p></div>';
        }
      });

      console.log('分析結果をリセットしました（データなし）');
      return;
    }

    if (allMyItems.length > 0) {
      // プロファイルに応じて属性を付与（プロファイルが変わった場合も再抽出）
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
        allMyItems.forEach(item => {
          if (item.title && item.profileExtracted !== currentSheetProfile) {
            const attributes = extractAttributesByProfile(item.title);
            if (attributes) {
              item.attributes = attributes;
              item.profileExtracted = currentSheetProfile;
            }
          }
        });
      }

      // ブランド分類を再計算
      const myBrands = {};
      let myClassified = 0;
      let myUnclassified = 0;

      allMyItems.forEach(item => {
        const brand = extractBrandFromTitle(item.title);
        if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null) {
          myBrands[brand] = (myBrands[brand] || 0) + 1;
          myClassified++;
        } else {
          myBrands['(未分類)'] = (myBrands['(未分類)'] || 0) + 1;
          myUnclassified++;
        }
      });

      // 統計値を更新
      const myClassifiedEl = document.getElementById('myClassifiedCount');
      const myUnclassifiedEl = document.getElementById('myUnclassifiedCount');
      const myBrandCountEl = document.getElementById('myBrandCount');

      if (myClassifiedEl) myClassifiedEl.textContent = myClassified.toLocaleString();
      if (myUnclassifiedEl) myUnclassifiedEl.textContent = myUnclassified.toLocaleString();
      if (myBrandCountEl) myBrandCountEl.textContent = (Object.keys(myBrands).length - (myBrands['(未分類)'] ? 1 : 0)).toLocaleString();

      // カテゴリ分類も計算（階層構造）
      const myCategories = {};  // { main: { count, subs: { sub: count } } }
      allMyItems.forEach(item => {
        const { main, sub } = detectCategoryWithSub(item.title);
        if (!myCategories[main]) {
          myCategories[main] = { count: 0, subs: {} };
        }
        myCategories[main].count++;
        if (!myCategories[main].subs[sub]) {
          myCategories[main].subs[sub] = 0;
        }
        myCategories[main].subs[sub]++;
      });

      // ブランド内訳を表示 - 未分類を除外
      const myBreakdownEl = document.getElementById('myBrandBreakdown');
      const myBrandToggle = document.getElementById('myBrandToggle');
      if (myBreakdownEl) {
        const sortedBrands = Object.entries(myBrands)
          .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
          .sort((a, b) => b[1] - a[1]);
        const totalBrandCount = sortedBrands.length;

        // 表示用関数
        const renderMyBrands = (showAll) => {
          const displayBrands = showAll ? sortedBrands : sortedBrands.slice(0, 10);
          myBreakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
            <div class="breakdown-item expandable ${brand === '(未分類)' ? 'unknown' : ''}" data-brand="${escapeHtml(brand)}">
              <div class="breakdown-header">
                <span class="expand-icon">▶</span>
                <span class="brand-name">${escapeHtml(brand)}</span>
                <span class="brand-count">${count}件</span>
              </div>
              <div class="breakdown-items" style="display: none;">
                <div class="loading-items">読み込み中...</div>
              </div>
            </div>
          `).join('');

          // 展開クリックイベント
          myBreakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
            item.querySelector('.breakdown-header').addEventListener('click', function() {
              const brand = item.dataset.brand;
              const itemsDiv = item.querySelector('.breakdown-items');
              const expandIcon = item.querySelector('.expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
                loadMyBrandItems(brand, itemsDiv, allMyItems);
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });
        };

        // 初期表示
        renderMyBrands(false);

        // トグルボタン設定
        if (myBrandToggle && totalBrandCount > 10) {
          myBrandToggle.textContent = `(上位10件 - 全${totalBrandCount}件表示)`;
          myBrandToggle.style.display = 'inline';
          myBrandToggle.onclick = () => {
            const isExpanded = myBrandToggle.dataset.expanded === 'true';
            myBrandToggle.dataset.expanded = isExpanded ? 'false' : 'true';
            myBrandToggle.textContent = isExpanded ? `(上位10件 - 全${totalBrandCount}件表示)` : `(上位10件に戻す)`;
            myBreakdownEl.classList.toggle('expanded', !isExpanded);
            renderMyBrands(!isExpanded);
          };
        } else if (myBrandToggle) {
          myBrandToggle.style.display = 'none';
        }
      }

      // カテゴリ内訳を表示（階層構造） - 未分類を除外
      const myCategoryBreakdownEl = document.getElementById('myCategoryBreakdown');
      const myCategoryToggle = document.getElementById('myCategoryToggle');
      if (myCategoryBreakdownEl) {
        const sortedCategories = Object.entries(myCategories)
          .filter(([category]) => category !== '(未分類)' && category !== '(不明)' && category !== 'その他')
          .sort((a, b) => b[1].count - a[1].count);
        const totalCategoryCount = sortedCategories.length;

        const renderMyCategories = (showAll) => {
          const displayCategories = showAll ? sortedCategories : sortedCategories.slice(0, 10);
          myCategoryBreakdownEl.innerHTML = displayCategories.map(([mainCategory, data]) => {
            // 細分類をソート（その他を除く）
            const sortedSubs = Object.entries(data.subs)
              .filter(([sub]) => sub !== 'その他')
              .sort((a, b) => b[1] - a[1]);
            const otherCount = data.subs['その他'] || 0;

            return `
              <div class="breakdown-item expandable category-main" data-category="${escapeHtml(mainCategory)}">
                <div class="breakdown-header">
                  <span class="expand-icon">▶</span>
                  <span class="brand-name">${escapeHtml(mainCategory)}</span>
                  <span class="brand-count">${data.count}件</span>
                </div>
                <div class="breakdown-items subcategory-list" style="display: none;">
                  ${sortedSubs.map(([subCategory, subCount]) => `
                    <div class="breakdown-item expandable subcategory-item" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="${escapeHtml(subCategory)}">
                      <div class="breakdown-header sub-header">
                        <span class="expand-icon">▶</span>
                        <span class="brand-name">${escapeHtml(subCategory)}</span>
                        <span class="brand-count">${subCount}件</span>
                      </div>
                      <div class="breakdown-items item-list" style="display: none;">
                        <div class="loading-items">読み込み中...</div>
                      </div>
                    </div>
                  `).join('')}
                  ${otherCount > 0 ? `
                    <div class="breakdown-item expandable subcategory-item other-sub" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="その他">
                      <div class="breakdown-header sub-header">
                        <span class="expand-icon">▶</span>
                        <span class="brand-name">その他</span>
                        <span class="brand-count">${otherCount}件</span>
                      </div>
                      <div class="breakdown-items item-list" style="display: none;">
                        <div class="loading-items">読み込み中...</div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');

          // 大分類の展開クリックイベント
          myCategoryBreakdownEl.querySelectorAll('.category-main > .breakdown-header').forEach(header => {
            header.addEventListener('click', function(e) {
              e.stopPropagation();
              const item = header.closest('.category-main');
              const itemsDiv = item.querySelector('.subcategory-list');
              const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });

          // 細分類の展開クリックイベント
          myCategoryBreakdownEl.querySelectorAll('.subcategory-item > .breakdown-header').forEach(header => {
            header.addEventListener('click', function(e) {
              e.stopPropagation();
              const item = header.closest('.subcategory-item');
              const mainCategory = item.dataset.mainCategory;
              const subCategory = item.dataset.subCategory;
              const itemsDiv = item.querySelector('.item-list');
              const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
                loadMyCategorySubItems(mainCategory, subCategory, itemsDiv, allMyItems);
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });
        };

        renderMyCategories(false);

        if (myCategoryToggle && totalCategoryCount > 10) {
          myCategoryToggle.textContent = `(上位10件 - 全${totalCategoryCount}件表示)`;
          myCategoryToggle.style.display = 'inline';
          myCategoryToggle.onclick = () => {
            const isExpanded = myCategoryToggle.dataset.expanded === 'true';
            myCategoryToggle.dataset.expanded = isExpanded ? 'false' : 'true';
            myCategoryToggle.textContent = isExpanded ? `(上位10件 - 全${totalCategoryCount}件表示)` : `(上位10件に戻す)`;
            myCategoryBreakdownEl.classList.toggle('expanded', !isExpanded);
            renderMyCategories(!isExpanded);
          };
        } else if (myCategoryToggle) {
          myCategoryToggle.style.display = 'none';
        }
      }

      // カテゴリ未分類セクションを更新
      const categoryUncategorizedItems = allMyItems.filter(item => {
        let itemCategory;
        if (item.categoryManual && item.category) {
          itemCategory = item.category;
        } else if (item.categoryCleared) {
          itemCategory = null;
        } else {
          itemCategory = detectCategoryFromTitle(item.title);
        }
        return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
      });

      const categoryUnclassifiedSection = document.getElementById('myCategoryUnclassifiedSection');
      const categoryUnclassifiedCount2 = document.getElementById('myCategoryUnclassifiedCount2');
      const categoryUnclassifiedHeader = document.getElementById('myCategoryUnclassifiedHeader');
      const categoryUnclassifiedList2 = document.getElementById('myCategoryUnclassifiedList2');
      const categoryUnclassifiedItems2 = document.getElementById('myCategoryUnclassifiedItems2');

      if (categoryUnclassifiedSection && categoryUnclassifiedCount2) {
        categoryUnclassifiedCount2.textContent = categoryUncategorizedItems.length;
        categoryUnclassifiedSection.style.display = categoryUncategorizedItems.length > 0 ? 'block' : 'none';

        // ヘッダークリックでトグル
        if (categoryUnclassifiedHeader && categoryUnclassifiedList2 && categoryUnclassifiedItems2) {
          categoryUnclassifiedHeader.onclick = () => {
            const isHidden = categoryUnclassifiedList2.style.display === 'none';
            categoryUnclassifiedList2.style.display = isHidden ? 'block' : 'none';
            const icon = categoryUnclassifiedHeader.querySelector('.expand-icon');
            if (icon) icon.textContent = isHidden ? '▼' : '▶';

            if (isHidden) {
              // アイテム一覧を読み込み
              loadMyCategoryUnclassifiedItems(categoryUnclassifiedItems2, allMyItems);
            }
          };
        }
      }

      // AI再判定セクション
      const myAiSection = document.getElementById('myDataAiSection');
      if (myAiSection) {
        myAiSection.style.display = myUnclassified > 0 ? 'block' : 'none';
      }

      // プロファイルに応じてカテゴリ列を切り替え（自分のデータ）
      const myGenericCategoryColumn = document.getElementById('myGenericCategoryColumn');
      const myPokemonAttributeColumn = document.getElementById('myPokemonAttributeColumn');

      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
        // ポケモンプロファイル: 属性別内訳を表示
        if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'none';
        if (myPokemonAttributeColumn) {
          myPokemonAttributeColumn.style.display = 'block';
          renderMyPokemonAttributeBreakdown(allMyItems, 'character');

          // タブクリックイベント
          myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(tab => {
            tab.addEventListener('click', function() {
              myPokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(t => t.classList.remove('active'));
              this.classList.add('active');
              renderMyPokemonAttributeBreakdown(allMyItems, this.dataset.attr);
            });
          });
        }
      } else {
        // 汎用プロファイル: カテゴリ別内訳を表示
        if (myGenericCategoryColumn) myGenericCategoryColumn.style.display = 'block';
        if (myPokemonAttributeColumn) myPokemonAttributeColumn.style.display = 'none';
      }
    }

    // 市場データの分析結果を復元（シートIDでフィルタ）
    const marketItems = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

    if (marketItems && marketItems.length > 0) {
      // プロファイルに応じて属性を付与（プロファイルが変わった場合も再抽出）
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
        marketItems.forEach(item => {
          if (item.title && item.profileExtracted !== currentSheetProfile) {
            const attributes = extractAttributesByProfile(item.title);
            if (attributes) {
              item.attributes = attributes;
              item.profileExtracted = currentSheetProfile;
            }
          }
        });
      }

      const marketBrands = {};
      let marketClassified = 0;
      let marketUnclassified = 0;

      marketItems.forEach(item => {
        const brand = extractBrandFromTitle(item.title);
        if (brand && brand !== '(不明)' && brand !== 'その他' && brand !== null) {
          marketBrands[brand] = (marketBrands[brand] || 0) + 1;
          marketClassified++;
        } else {
          marketBrands['(未分類)'] = (marketBrands['(未分類)'] || 0) + 1;
          marketUnclassified++;
        }
      });

      // 統計値を更新
      const marketClassifiedEl = document.getElementById('marketClassifiedCount');
      const marketUnclassifiedEl = document.getElementById('marketUnclassifiedCount');
      const marketBrandCountEl = document.getElementById('marketBrandCount');

      if (marketClassifiedEl) marketClassifiedEl.textContent = marketClassified.toLocaleString();
      if (marketUnclassifiedEl) marketUnclassifiedEl.textContent = marketUnclassified.toLocaleString();
      if (marketBrandCountEl) marketBrandCountEl.textContent = (Object.keys(marketBrands).length - (marketBrands['(未分類)'] ? 1 : 0)).toLocaleString();

      // カテゴリ分類も計算（階層構造）
      const marketCategories = {};  // { main: { count, subs: { sub: count } } }
      marketItems.forEach(item => {
        const { main, sub } = detectCategoryWithSub(item.title);
        if (!marketCategories[main]) {
          marketCategories[main] = { count: 0, subs: {} };
        }
        marketCategories[main].count++;
        if (!marketCategories[main].subs[sub]) {
          marketCategories[main].subs[sub] = 0;
        }
        marketCategories[main].subs[sub]++;
      });

      // ブランド内訳を表示 - 未分類を除外
      const marketBreakdownEl = document.getElementById('marketBrandBreakdown');
      const marketBrandToggle = document.getElementById('marketBrandToggle');
      if (marketBreakdownEl) {
        const sortedBrands = Object.entries(marketBrands)
          .filter(([brand]) => brand !== '(未分類)' && brand !== '(不明)' && brand !== 'その他')
          .sort((a, b) => b[1] - a[1]);
        const totalBrandCount = sortedBrands.length;

        const renderMarketBrands = (showAll) => {
          const displayBrands = showAll ? sortedBrands : sortedBrands.slice(0, 10);
          marketBreakdownEl.innerHTML = displayBrands.map(([brand, count]) => `
            <div class="breakdown-item expandable ${brand === '(未分類)' ? 'unknown' : ''}" data-brand="${escapeHtml(brand)}">
              <div class="breakdown-header">
                <span class="expand-icon">▶</span>
                <span class="brand-name">${escapeHtml(brand)}</span>
                <span class="brand-count">${count}件</span>
              </div>
              <div class="breakdown-items" style="display: none;">
                <div class="loading-items">読み込み中...</div>
              </div>
            </div>
          `).join('');

          // 展開クリックイベント
          marketBreakdownEl.querySelectorAll('.breakdown-item.expandable').forEach(item => {
            item.querySelector('.breakdown-header').addEventListener('click', function() {
              const brand = item.dataset.brand;
              const itemsDiv = item.querySelector('.breakdown-items');
              const expandIcon = item.querySelector('.expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
                loadMarketBrandItems(brand, itemsDiv, marketItems);
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });
        };

        renderMarketBrands(false);

        if (marketBrandToggle && totalBrandCount > 10) {
          marketBrandToggle.textContent = `(上位10件 - 全${totalBrandCount}件表示)`;
          marketBrandToggle.style.display = 'inline';
          marketBrandToggle.onclick = () => {
            const isExpanded = marketBrandToggle.dataset.expanded === 'true';
            marketBrandToggle.dataset.expanded = isExpanded ? 'false' : 'true';
            marketBrandToggle.textContent = isExpanded ? `(上位10件 - 全${totalBrandCount}件表示)` : `(上位10件に戻す)`;
            marketBreakdownEl.classList.toggle('expanded', !isExpanded);
            renderMarketBrands(!isExpanded);
          };
        } else if (marketBrandToggle) {
          marketBrandToggle.style.display = 'none';
        }
      }

      // カテゴリ内訳を表示（階層構造） - 未分類を除外
      const marketCategoryBreakdownEl = document.getElementById('marketCategoryBreakdown');
      const marketCategoryToggle = document.getElementById('marketCategoryToggle');
      if (marketCategoryBreakdownEl) {
        const sortedCategories = Object.entries(marketCategories)
          .filter(([category]) => category !== '(未分類)' && category !== '(不明)' && category !== 'その他')
          .sort((a, b) => b[1].count - a[1].count);
        const totalCategoryCount = sortedCategories.length;

        const renderMarketCategories = (showAll) => {
          const displayCategories = showAll ? sortedCategories : sortedCategories.slice(0, 10);
          marketCategoryBreakdownEl.innerHTML = displayCategories.map(([mainCategory, data]) => {
            // 細分類をソート（その他を除く）
            const sortedSubs = Object.entries(data.subs)
              .filter(([sub]) => sub !== 'その他')
              .sort((a, b) => b[1] - a[1]);
            const otherCount = data.subs['その他'] || 0;

            return `
              <div class="breakdown-item expandable category-main" data-category="${escapeHtml(mainCategory)}">
                <div class="breakdown-header">
                  <span class="expand-icon">▶</span>
                  <span class="brand-name">${escapeHtml(mainCategory)}</span>
                  <span class="brand-count">${data.count}件</span>
                </div>
                <div class="breakdown-items subcategory-list" style="display: none;">
                  ${sortedSubs.map(([subCategory, subCount]) => `
                    <div class="breakdown-item expandable subcategory-item" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="${escapeHtml(subCategory)}">
                      <div class="breakdown-header sub-header">
                        <span class="expand-icon">▶</span>
                        <span class="brand-name">${escapeHtml(subCategory)}</span>
                        <span class="brand-count">${subCount}件</span>
                      </div>
                      <div class="breakdown-items item-list" style="display: none;">
                        <div class="loading-items">読み込み中...</div>
                      </div>
                    </div>
                  `).join('')}
                  ${otherCount > 0 ? `
                    <div class="breakdown-item expandable subcategory-item other-sub" data-main-category="${escapeHtml(mainCategory)}" data-sub-category="その他">
                      <div class="breakdown-header sub-header">
                        <span class="expand-icon">▶</span>
                        <span class="brand-name">その他</span>
                        <span class="brand-count">${otherCount}件</span>
                      </div>
                      <div class="breakdown-items item-list" style="display: none;">
                        <div class="loading-items">読み込み中...</div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('');

          // 大分類の展開クリックイベント
          marketCategoryBreakdownEl.querySelectorAll('.category-main > .breakdown-header').forEach(header => {
            header.addEventListener('click', function(e) {
              e.stopPropagation();
              const item = header.closest('.category-main');
              const itemsDiv = item.querySelector('.subcategory-list');
              const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });

          // 細分類の展開クリックイベント
          marketCategoryBreakdownEl.querySelectorAll('.subcategory-item > .breakdown-header').forEach(header => {
            header.addEventListener('click', function(e) {
              e.stopPropagation();
              const item = header.closest('.subcategory-item');
              const mainCategory = item.dataset.mainCategory;
              const subCategory = item.dataset.subCategory;
              const itemsDiv = item.querySelector('.item-list');
              const expandIcon = item.querySelector(':scope > .breakdown-header > .expand-icon');

              if (itemsDiv.style.display === 'none') {
                itemsDiv.style.display = 'block';
                expandIcon.textContent = '▼';
                item.classList.add('expanded');
                loadMarketCategorySubItems(mainCategory, subCategory, itemsDiv, marketItems);
              } else {
                itemsDiv.style.display = 'none';
                expandIcon.textContent = '▶';
                item.classList.remove('expanded');
              }
            });
          });
        };

        renderMarketCategories(false);

        if (marketCategoryToggle && totalCategoryCount > 10) {
          marketCategoryToggle.textContent = `(上位10件 - 全${totalCategoryCount}件表示)`;
          marketCategoryToggle.style.display = 'inline';
          marketCategoryToggle.onclick = () => {
            const isExpanded = marketCategoryToggle.dataset.expanded === 'true';
            marketCategoryToggle.dataset.expanded = isExpanded ? 'false' : 'true';
            marketCategoryToggle.textContent = isExpanded ? `(上位10件 - 全${totalCategoryCount}件表示)` : `(上位10件に戻す)`;
            marketCategoryBreakdownEl.classList.toggle('expanded', !isExpanded);
            renderMarketCategories(!isExpanded);
          };
        } else if (marketCategoryToggle) {
          marketCategoryToggle.style.display = 'none';
        }
      }

      // 市場データのカテゴリ未分類セクションを更新
      const marketCategoryUncategorizedItems = marketItems.filter(item => {
        let itemCategory;
        if (item.categoryManual && item.category) {
          itemCategory = item.category;
        } else if (item.categoryCleared) {
          itemCategory = null;
        } else {
          itemCategory = detectCategoryFromTitle(item.title);
        }
        return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
      });

      const marketCategoryUnclassifiedSection = document.getElementById('marketCategoryUnclassifiedSection');
      const marketCategoryUnclassifiedCount = document.getElementById('marketCategoryUnclassifiedCount');
      const marketCategoryUnclassifiedHeader = document.getElementById('marketCategoryUnclassifiedHeader');
      const marketCategoryUnclassifiedList = document.getElementById('marketCategoryUnclassifiedList');
      const marketCategoryUnclassifiedItems = document.getElementById('marketCategoryUnclassifiedItems');

      if (marketCategoryUnclassifiedSection && marketCategoryUnclassifiedCount) {
        marketCategoryUnclassifiedCount.textContent = marketCategoryUncategorizedItems.length;
        marketCategoryUnclassifiedSection.style.display = marketCategoryUncategorizedItems.length > 0 ? 'block' : 'none';

        // ヘッダークリックでトグル
        if (marketCategoryUnclassifiedHeader && marketCategoryUnclassifiedList && marketCategoryUnclassifiedItems) {
          marketCategoryUnclassifiedHeader.onclick = () => {
            const isHidden = marketCategoryUnclassifiedList.style.display === 'none';
            marketCategoryUnclassifiedList.style.display = isHidden ? 'block' : 'none';
            const icon = marketCategoryUnclassifiedHeader.querySelector('.expand-icon');
            if (icon) icon.textContent = isHidden ? '▼' : '▶';

            if (isHidden) {
              // アイテム一覧を読み込み
              loadMarketCategoryUnclassifiedItems(marketCategoryUnclassifiedItems, marketItems);
            }
          };
        }
      }

      // AI再判定セクション
      const marketAiSection = document.getElementById('marketAiSection');
      if (marketAiSection) {
        marketAiSection.style.display = marketUnclassified > 0 ? 'block' : 'none';
      }

      // プロファイルに応じてカテゴリ列を切り替え（市場データ）
      const genericCategoryColumn = document.getElementById('genericCategoryColumn');
      const pokemonAttributeColumn = document.getElementById('pokemonAttributeColumn');

      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
        // ポケモンプロファイル: 属性別内訳を表示
        if (genericCategoryColumn) genericCategoryColumn.style.display = 'none';
        if (pokemonAttributeColumn) {
          pokemonAttributeColumn.style.display = 'block';
          renderPokemonAttributeBreakdown(marketItems, 'character');

          // タブクリックイベント
          pokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(tab => {
            tab.addEventListener('click', function() {
              pokemonAttributeColumn.querySelectorAll('.attr-tab').forEach(t => t.classList.remove('active'));
              this.classList.add('active');
              renderPokemonAttributeBreakdown(marketItems, this.dataset.attr);
            });
          });
        }
      } else {
        // 汎用プロファイル: カテゴリ別内訳を表示
        if (genericCategoryColumn) genericCategoryColumn.style.display = 'block';
        if (pokemonAttributeColumn) pokemonAttributeColumn.style.display = 'none';
      }
    }

    console.log('分析結果を復元しました');
  } catch (error) {
    console.error('分析結果の復元に失敗:', error);
  }
}

/**
 * 最終保存日時を更新
 */
async function updateLastSavedInfo() {
  const infoEl = document.getElementById('lastSavedInfo');
  if (!infoEl) return;

  try {
    const key = getSheetKey('savedAnalysisMeta');
    const data = await chrome.storage.local.get([key]);
    if (data[key]?.savedAt) {
      const date = new Date(data[key].savedAt);
      infoEl.textContent = `最終保存: ${formatDateTime(date)}`;
    } else {
      infoEl.textContent = '';
    }
  } catch (error) {
    console.error('保存日時の取得に失敗:', error);
  }
}

// =====================================
// 分析タブ
// =====================================

/**
 * 分析ボタンの初期化（サブタブ形式）
 */
function initAnalysisButtons() {
  // 自分の分析サブタブの切り替え
  const mySubtabs = document.querySelectorAll('.my-analysis-subtab');
  mySubtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.myTab;
      switchMyAnalysisTab(tabId);
    });
  });

  // 自分の分析実行ボタン
  const loadMyBtn = document.getElementById('loadMyAnalysisBtn');
  if (loadMyBtn) {
    loadMyBtn.addEventListener('click', loadMyAnalysis);
  }

  // 自分のデータ再判定ボタン
  const reanalyzeMyBtn = document.getElementById('reanalyzeMyDataBtn');
  if (reanalyzeMyBtn) {
    reanalyzeMyBtn.addEventListener('click', reanalyzeMyData);
  }

  // 初回読み込み時に最初のタブを表示
  initMyAnalysisTabs();

  // 自分のデータ件数表示
  updateMyDataCount();
}

/**
 * 自分の分析サブタブを切り替え
 */
function switchMyAnalysisTab(tabId) {
  // タブのアクティブ状態を切り替え
  document.querySelectorAll('.my-analysis-subtab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.myTab === tabId);
  });

  // コンテンツの表示を切り替え
  document.querySelectorAll('.my-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `my-${tabId}`);
  });

  // 現在のサブタブをlocalStorageに保存（状態保持用）
  localStorage.setItem('myAnalysisActiveSubtab', tabId);

  // タブに応じたデータを読み込む
  loadMyAnalysisTabContent(tabId);
}

/**
 * 自分の分析タブの初期化
 */
async function initMyAnalysisTabs() {
  // 保存されたサブタブを復元、なければデフォルト（listing-pace）
  const savedSubtab = localStorage.getItem('myAnalysisActiveSubtab') || 'listing-pace';

  // タブのアクティブ状態を設定
  document.querySelectorAll('.my-analysis-subtab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.myTab === savedSubtab);
  });

  // コンテンツの表示を設定
  document.querySelectorAll('.my-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `my-${savedSubtab}`);
  });

  // 保存されたサブタブのコンテンツを読み込む
  await loadMyAnalysisTabContent(savedSubtab);

  // 展開リスナーを設定（DOMが描画されてから）
  setTimeout(() => {
    if (savedSubtab === 'brand-performance') {
      setupBrandExpandListeners();
    } else if (savedSubtab === 'category-performance') {
      setupCategoryExpandListeners();
    }
  }, 200);
}

/**
 * 自分の分析タブのコンテンツを読み込む
 */
async function loadMyAnalysisTabContent(tabId) {
  const contentEl = document.getElementById(`my-${tabId}`);
  if (!contentEl) return;

  // データ確認 - なければIndexedDBから読み込み試行
  if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
    // IndexedDBからデータを読み込む
    try {
      await loadSavedData();
    } catch (e) {
      console.error('データ読み込みエラー:', e);
    }

    // それでもデータがなければメッセージ表示
    if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
      contentEl.innerHTML = `
        <div class="my-analysis-placeholder">
          <p>データがありません。「自分のデータ」タブでCSVを読み込んでください。</p>
        </div>
      `;
      return;
    }
  }

  // 学習済みルールを読み込む
  try {
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));
  } catch (e) {
    // スキップ
  }

  let html = '';
  try {
    switch (tabId) {
      case 'listing-pace':
        html = generateListingPaceAnalysis(30);
        break;
      case 'brand-performance':
        html = generateBrandPerformanceAnalysis();
        break;
      case 'watch-analysis':
        html = generateWatchAnalysis();
        break;
      case 'category-performance':
        html = generateCategoryPerformanceAnalysis();
        break;
    }
  } catch (e) {
    console.error('Error generating content:', e);
    html = `<div class="error">エラーが発生しました: ${e.message}</div>`;
  }

  contentEl.innerHTML = html;

  // ブランド別タブの場合、展開イベントリスナーを設定
  if (tabId === 'brand-performance') {
    // DOMが更新された後にイベントリスナーを設定
    setTimeout(() => {
      setupBrandExpandListeners();
    }, 50);
  }

  // カテゴリ別タブの場合、展開イベントリスナーを設定
  if (tabId === 'category-performance') {
    setTimeout(() => {
      setupCategoryExpandListeners();
    }, 50);
  }
}

/**
 * 自分のデータ件数を更新
 */
async function updateMyDataCount() {
  try {
    const activeCount = analyzer.activeListings?.length || 0;
    const soldCount = analyzer.soldItems?.length || 0;
    const totalCount = activeCount + soldCount;
    const countEl = document.getElementById('myDataCount');
    if (countEl) {
      countEl.textContent = `自分のデータ: ${totalCount.toLocaleString()}件`;
    }
  } catch (error) {
    console.error('自分のデータ件数取得エラー:', error);
  }
}

/**
 * 自分の分析を実行
 */
async function loadMyAnalysis() {
  showLoading('自分のデータを分析中...');

  try {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

    // データ確認
    if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
      // 保存データの復元を試行
      await loadSavedData();

      if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
        showAlert('データがありません。「自分のデータ」タブでCSVを読み込んでください。', 'warning');
        hideLoading();
        return;
      }
    }

    // 現在のアクティブタブを取得
    const activeTab = document.querySelector('.my-analysis-subtab.active');
    const tabId = activeTab ? activeTab.dataset.myTab : 'listing-pace';

    // すべてのタブコンテンツを更新
    await Promise.all([
      loadMyAnalysisTabContent('listing-pace'),
      loadMyAnalysisTabContent('brand-performance'),
      loadMyAnalysisTabContent('watch-analysis'),
      loadMyAnalysisTabContent('category-performance')
    ]);

    // ポケモンプロファイルの場合、ポケモン分析も読み込み
    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
      updateMyPokemonAnalysisVisibility();
      loadMyPokemonAnalysisData('my-character-ranking');
    }

    // データ件数を更新
    updateMyDataCount();

    hideLoading();
    showAlert('自分のデータ分析が完了しました', 'success');

  } catch (error) {
    console.error('分析エラー:', error);
    hideLoading();
    showAlert('分析中にエラーが発生しました: ' + error.message, 'error');
  }
}

/**
 * 自分のデータを再判定
 */
async function reanalyzeMyData() {
  showLoading('自分のデータを再判定中...');

  try {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

    // データ確認
    if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
      await loadSavedData();
      if (analyzer.activeListings.length === 0 && analyzer.soldItems.length === 0) {
        showAlert('データがありません。「自分のデータ」タブでCSVを読み込んでください。', 'warning');
        hideLoading();
        return;
      }
    }

    // 出品中データを再判定
    const activeListings = analyzer.activeListings.map(item => {
      const brand = analyzer.extractBrand(item.title) || '(不明)';
      const updated = {
        ...item,
        brand: brand
      };
      // ポケモンプロファイルの場合は属性も再抽出
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) && item.title) {
        const attributes = extractAttributesByProfile(item.title);
        if (attributes) {
          updated.attributes = attributes;
          updated.profileExtracted = currentSheetProfile;
        }
      }
      return updated;
    });

    // 販売済みデータを再判定
    const soldItems = analyzer.soldItems.map(item => {
      const brand = analyzer.extractBrand(item.title) || '(不明)';
      const updated = {
        ...item,
        brand: brand
      };
      // ポケモンプロファイルの場合は属性も再抽出
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) && item.title) {
        const attributes = extractAttributesByProfile(item.title);
        if (attributes) {
          updated.attributes = attributes;
          updated.profileExtracted = currentSheetProfile;
        }
      }
      return updated;
    });

    // 更新されたデータを再度分析
    analyzer.analyze(activeListings, soldItems);

    // DBを更新
    if (activeListings.length > 0) {
      await BunsekiDB.setActiveListings(activeListings);
    }
    if (soldItems.length > 0) {
      await BunsekiDB.setSoldItems(soldItems);
    }

    // UIを更新
    await loadMyAnalysis();

    hideLoading();
    showAlert('自分のデータの再判定が完了しました', 'success');

  } catch (error) {
    console.error('再判定エラー:', error);
    hideLoading();
    showAlert('再判定中にエラーが発生しました: ' + error.message, 'error');
  }
}

/**
 * 分析実行
 */
async function runAnalysis(type) {
  showLoading('分析中...');

  try {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

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
  // brandPerformanceがない場合は分析を実行
  if (!analyzer.results.brandPerformance || analyzer.results.brandPerformance.length === 0) {
    if (analyzer.activeListings.length > 0 || analyzer.soldItems.length > 0) {
      analyzer.analyze();
    }
  }

  const brands = analyzer.results.brandPerformance || [];

  // 未分類を除外したリスト（最後に追加するため）
  const knownBrands = brands.filter(b => b.brand !== '(不明)' && b.brand !== 'その他' && b.brand !== null);
  const unknownBrands = brands.filter(b => b.brand === '(不明)' || b.brand === 'その他' || b.brand === null);

  // 未分類を最後に追加した全ブランドリスト
  const sortedBrands = [...knownBrands, ...unknownBrands];

  // 最大値を取得（バーの幅計算用）
  const maxCount = Math.max(...sortedBrands.map(b => b.active + b.sold), 1);

  // AI分類結果を取得
  const aiClassifications = window.aiClassificationResults || {};

  // ブランドごとのカテゴリ内訳を計算（細分類を使用）
  const brandsWithCategories = sortedBrands.map(brand => {
    // 常にアイテムから直接カテゴリを再計算（細分類を使うため）
    const categoryStats = {};
    const brandNameLower = (brand.brand || '').toLowerCase().trim();
    // スペースを除去したバージョンも用意
    const brandNameNoSpace = brandNameLower.replace(/\s+/g, '');
    let matchCount = 0;

    // ブランド判定関数（手動設定 > 未分類フラグ > AI分類 > タイトル判定）
    const getItemBrand = (item) => {
      if (item.brandManual && item.brand) {
        return item.brand;
      }
      if (item.brandCleared) {
        return '(不明)';
      }
      if (aiClassifications[item.title] && aiClassifications[item.title].brand) {
        return aiClassifications[item.title].brand;
      }
      return analyzer.extractBrand(item.title) || '(不明)';
    };

    // 出品中アイテムからカテゴリを集計
    (analyzer.activeListings || []).forEach(item => {
      const itemBrand = getItemBrand(item);
      const itemBrandLower = itemBrand.toLowerCase().trim();
      const itemBrandNoSpace = itemBrandLower.replace(/\s+/g, '');
      const titleLower = (item.title || '').toLowerCase();

      // ブランド名の比較（大文字小文字を無視、部分一致も許容、スペース揺れも対応、タイトル内検索も追加）
      const isMatch = itemBrandLower === brandNameLower ||
                      itemBrandNoSpace === brandNameNoSpace ||
                      itemBrand === brand.brand ||
                      (brandNameLower.length >= 4 && itemBrandLower.includes(brandNameLower)) ||
                      (itemBrandLower.length >= 4 && brandNameLower.includes(itemBrandLower)) ||
                      (brandNameNoSpace.length >= 4 && itemBrandNoSpace.includes(brandNameNoSpace)) ||
                      (itemBrandNoSpace.length >= 4 && brandNameNoSpace.includes(itemBrandNoSpace)) ||
                      // タイトルにブランド名が含まれているかチェック（最終手段）
                      (brandNameLower.length >= 4 && titleLower.includes(brandNameLower)) ||
                      (brandNameNoSpace.length >= 4 && titleLower.replace(/\s+/g, '').includes(brandNameNoSpace));

      if (isMatch) {
        matchCount++;
        // 細分類(categorySub)を優先、なければ大分類(categoryMain)
        let cat = item.categorySub || item.categoryMain || item.category;
        if (!cat) {
          const extracted = analyzer.extractCategoryFromTitle ? analyzer.extractCategoryFromTitle(item.title) : null;
          if (extracted && analyzer.normalizeCategory) {
            const normalized = analyzer.normalizeCategory(extracted);
            cat = normalized.sub || normalized.main || '(不明)';
          } else {
            cat = '(不明)';
          }
        }
        if (!categoryStats[cat]) {
          categoryStats[cat] = { category: cat, active: 0, sold: 0, totalPrice: 0 };
        }
        categoryStats[cat].active++;
        categoryStats[cat].totalPrice += item.price || 0;
      }
    });

    // 販売済みアイテムからカテゴリを集計
    (analyzer.soldItems || []).forEach(item => {
      const itemBrand = getItemBrand(item);
      const itemBrandLower = itemBrand.toLowerCase().trim();
      const itemBrandNoSpace = itemBrandLower.replace(/\s+/g, '');
      const titleLower = (item.title || '').toLowerCase();

      // ブランド名の比較（大文字小文字を無視、部分一致も許容、スペース揺れも対応、タイトル内検索も追加）
      const isMatch = itemBrandLower === brandNameLower ||
                      itemBrandNoSpace === brandNameNoSpace ||
                      itemBrand === brand.brand ||
                      (brandNameLower.length >= 4 && itemBrandLower.includes(brandNameLower)) ||
                      (itemBrandLower.length >= 4 && brandNameLower.includes(itemBrandLower)) ||
                      (brandNameNoSpace.length >= 4 && itemBrandNoSpace.includes(brandNameNoSpace)) ||
                      (itemBrandNoSpace.length >= 4 && brandNameNoSpace.includes(itemBrandNoSpace)) ||
                      // タイトルにブランド名が含まれているかチェック（最終手段）
                      (brandNameLower.length >= 4 && titleLower.includes(brandNameLower)) ||
                      (brandNameNoSpace.length >= 4 && titleLower.replace(/\s+/g, '').includes(brandNameNoSpace));

      if (isMatch) {
        matchCount++;
        // 細分類(categorySub)を優先、なければ大分類(categoryMain)
        let cat = item.categorySub || item.categoryMain || item.category;
        if (!cat) {
          const extracted = analyzer.extractCategoryFromTitle ? analyzer.extractCategoryFromTitle(item.title) : null;
          if (extracted && analyzer.normalizeCategory) {
            const normalized = analyzer.normalizeCategory(extracted);
            cat = normalized.sub || normalized.main || '(不明)';
          } else {
            cat = '(不明)';
          }
        }
        if (!categoryStats[cat]) {
          categoryStats[cat] = { category: cat, active: 0, sold: 0, totalPrice: 0 };
        }
        categoryStats[cat].sold += item.quantity || 1;
        categoryStats[cat].totalPrice += item.soldFor || 0;
      }
    });

    const categories = Object.values(categoryStats)
      .map(cat => ({
        ...cat,
        avgPrice: (cat.active + cat.sold) > 0 ? cat.totalPrice / (cat.active + cat.sold) : 0
      }))
      .sort((a, b) => (b.active + b.sold) - (a.active + a.sold));

    return { ...brand, categories };
  });

  let html = `
    <div class="analysis-detail">
      <h4>ブランド別パフォーマンス（全${sortedBrands.length}件）</h4>
      <table class="data-table brand-expandable-table">
        <thead>
          <tr>
            <th class="col-bar">件数</th>
            <th>ブランド</th>
            <th>出品中</th>
            <th>販売済</th>
            <th>売上率</th>
            <th>平均価格</th>
          </tr>
        </thead>
        <tbody>
          ${brandsWithCategories.map((brand, idx) => {
            const total = brand.active + brand.sold;
            const sellRate = total > 0 ? Math.round((brand.sold / total) * 100) : 0;
            const isUnknown = brand.brand === '(不明)' || brand.brand === 'その他' || brand.brand === null;
            const barWidth = maxCount > 0 ? (total / maxCount * 100).toFixed(1) : 0;
            const hasCategories = brand.categories && brand.categories.length > 0;

            let rowHtml = `
              <tr class="brand-main-row ${isUnknown ? 'unknown-row' : ''} ${hasCategories ? 'expandable' : ''}" data-brand-idx="${idx}">
                <td class="col-bar">
                  <div class="table-bar-container">
                    <div class="table-bar ${isUnknown ? 'table-bar-warning' : ''}" style="width: ${barWidth}%"></div>
                  </div>
                </td>
                <td class="col-name">
                  ${hasCategories ? '<span class="row-expand-icon">▶</span>' : ''}
                  ${escapeHtml(brand.brand || '(不明)')}${isUnknown ? ' <span class="unknown-badge">未分類</span>' : ''}
                </td>
                <td>${brand.active}</td>
                <td>${brand.sold}</td>
                <td>${sellRate}%</td>
                <td>$${brand.avgPrice ? brand.avgPrice.toFixed(2) : '-'}</td>
              </tr>
            `;

            // カテゴリ別内訳行（展開時に表示）
            if (hasCategories) {
              brand.categories.forEach(cat => {
                const catTotal = cat.active + cat.sold;
                const catSellRate = catTotal > 0 ? Math.round((cat.sold / catTotal) * 100) : 0;
                const catBarWidth = maxCount > 0 ? (catTotal / maxCount * 100).toFixed(1) : 0;
                rowHtml += `
                  <tr class="brand-category-row" data-parent-idx="${idx}" style="display: none;">
                    <td class="col-bar">
                      <div class="table-bar-container">
                        <div class="table-bar table-bar-light" style="width: ${catBarWidth}%"></div>
                      </div>
                    </td>
                    <td class="col-name subcategory-name">└ ${escapeHtml(cat.category)}</td>
                    <td>${cat.active}</td>
                    <td>${cat.sold}</td>
                    <td>${catSellRate}%</td>
                    <td>$${cat.avgPrice ? cat.avgPrice.toFixed(2) : '-'}</td>
                  </tr>
                `;
              });
            }

            return rowHtml;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // グラフは即座に描画予約（setTimeoutで）- 既存のチャートを破棄
  // 展開リスナーも設定
  setTimeout(() => {
    destroyExistingChart('analysisChart');
    drawBrandChart(sortedBrands.slice(0, 20));
    setupBrandExpandListeners();
  }, 100);

  return html;
}

/**
 * 既存のChartを破棄
 */
function destroyExistingChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }
  }
}

/**
 * ブランド展開/折りたたみのイベントリスナーを設定
 * （HTMLがDOMに反映された後に呼び出す必要あり）
 */
function setupBrandExpandListeners() {
  const mainRows = document.querySelectorAll('.brand-expandable-table .brand-main-row.expandable');
  console.log('setupBrandExpandListeners: 展開可能な行数:', mainRows.length);

  mainRows.forEach(row => {
    // イベントリスナーが既に設定されているか確認
    if (row.dataset.listenerAttached) return;
    row.dataset.listenerAttached = 'true';

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = row.dataset.brandIdx;
      const subRows = document.querySelectorAll(`.brand-category-row[data-parent-idx="${idx}"]`);
      const icon = row.querySelector('.row-expand-icon');
      const isExpanded = row.classList.contains('expanded');

      console.log('クリック:', idx, '展開状態:', isExpanded, 'サブ行数:', subRows.length);

      if (isExpanded) {
        row.classList.remove('expanded');
        if (icon) icon.textContent = '▶';
        subRows.forEach(subRow => subRow.style.display = 'none');
      } else {
        row.classList.add('expanded');
        if (icon) icon.textContent = '▼';
        subRows.forEach(subRow => subRow.style.display = 'table-row');
      }
    });
  });

  // カテゴリ行のクリックイベントも設定
  setupCategoryClickListeners();
}

/**
 * カテゴリ行クリックで商品一覧を表示するリスナーを設定
 */
function setupCategoryClickListeners() {
  const categoryRows = document.querySelectorAll('.brand-expandable-table .brand-category-row');
  console.log('setupCategoryClickListeners: カテゴリ行数:', categoryRows.length);

  categoryRows.forEach(row => {
    // イベントリスナーが既に設定されているか確認
    if (row.dataset.categoryListenerAttached) return;
    row.dataset.categoryListenerAttached = 'true';

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentIdx = row.dataset.parentIdx;
      const categoryName = row.querySelector('.subcategory-name')?.textContent?.replace('└ ', '').trim();

      // 親ブランドを取得
      const parentRow = document.querySelector(`.brand-main-row[data-brand-idx="${parentIdx}"]`);
      const brandName = parentRow?.querySelector('.col-name')?.textContent?.replace('▶', '').replace('▼', '').replace('未分類', '').trim();

      console.log('カテゴリクリック:', brandName, categoryName);

      if (brandName && categoryName) {
        showItemListForBrandCategory(brandName, categoryName, 'my-data');
      }
    });
  });
}

/**
 * ブランド×カテゴリの商品一覧を表示（自分のデータ用）
 */
function showItemListForBrandCategory(brand, category, source = 'my-data') {
  const modal = document.getElementById('itemListModal');
  const titleEl = document.getElementById('itemListTitle');
  const container = document.getElementById('itemListContainer');

  if (!modal || !container) return;

  // タイトル設定
  titleEl.textContent = `${brand} - ${category}`;

  let items = [];

  if (source === 'my-data') {
    // 自分のデータから該当商品を抽出
    const aiClassifications = window.aiClassificationResults || {};

    const getItemBrand = (item) => {
      if (aiClassifications[item.title] && aiClassifications[item.title].brand) {
        return aiClassifications[item.title].brand;
      }
      return analyzer.extractBrand(item.title) || '(不明)';
    };

    const getItemCategory = (item) => {
      let cat = item.categorySub || item.categoryMain || item.category;
      if (!cat) {
        const extracted = analyzer.extractCategoryFromTitle ? analyzer.extractCategoryFromTitle(item.title) : null;
        if (extracted && analyzer.normalizeCategory) {
          const normalized = analyzer.normalizeCategory(extracted);
          cat = normalized.sub || normalized.main || '(不明)';
        } else {
          cat = '(不明)';
        }
      }
      return cat;
    };

    const brandLower = brand.toLowerCase().trim();
    const brandNoSpace = brandLower.replace(/\s+/g, '');

    // マッチング関数
    const matchesBrand = (item) => {
      const itemBrand = getItemBrand(item);
      const itemBrandLower = itemBrand.toLowerCase().trim();
      const itemBrandNoSpace = itemBrandLower.replace(/\s+/g, '');
      const titleLower = (item.title || '').toLowerCase();

      return itemBrandLower === brandLower ||
             itemBrandNoSpace === brandNoSpace ||
             itemBrand === brand ||
             (brandLower.length >= 4 && itemBrandLower.includes(brandLower)) ||
             (itemBrandLower.length >= 4 && brandLower.includes(itemBrandLower)) ||
             (brandNoSpace.length >= 4 && itemBrandNoSpace.includes(brandNoSpace)) ||
             (itemBrandNoSpace.length >= 4 && brandNoSpace.includes(itemBrandNoSpace)) ||
             (brandLower.length >= 4 && titleLower.includes(brandLower)) ||
             (brandNoSpace.length >= 4 && titleLower.replace(/\s+/g, '').includes(brandNoSpace));
    };

    // 出品中から抽出
    (analyzer.activeListings || []).forEach(item => {
      if (matchesBrand(item) && getItemCategory(item) === category) {
        items.push({
          title: item.title,
          price: item.price,
          status: 'active'
        });
      }
    });

    // 販売済みから抽出
    (analyzer.soldItems || []).forEach(item => {
      if (matchesBrand(item) && getItemCategory(item) === category) {
        items.push({
          title: item.title,
          price: item.soldFor || item.price,
          status: 'sold'
        });
      }
    });
  } else if (source === 'market') {
    // 市場データから該当商品を抽出（後で実装）
    items = getMarketItemsForBrandCategory(brand, category);
  }

  // 価格で降順ソート
  items.sort((a, b) => (b.price || 0) - (a.price || 0));

  // HTML生成
  if (items.length === 0) {
    container.innerHTML = `
      <div class="item-list-empty">
        <p>該当する商品がありません</p>
      </div>
    `;
  } else {
    const prices = items.map(i => i.price || 0).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // 売れ筋価格帯を計算（最頻出価格帯）
    const getPriceRange = (price) => {
      if (price < 50) return '~$50';
      if (price < 100) return '$50-100';
      if (price < 200) return '$100-200';
      if (price < 500) return '$200-500';
      if (price < 1000) return '$500-1000';
      return '$1000+';
    };
    const priceRangeCounts = {};
    prices.forEach(p => {
      const range = getPriceRange(p);
      priceRangeCounts[range] = (priceRangeCounts[range] || 0) + 1;
    });
    const topPriceRange = Object.entries(priceRangeCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    container.innerHTML = `
      <div class="item-list-summary">
        <div class="item-list-summary-item">
          <span class="item-list-summary-label">件数:</span>
          <span class="item-list-summary-value">${items.length}件</span>
        </div>
        <div class="item-list-summary-item">
          <span class="item-list-summary-label">平均:</span>
          <span class="item-list-summary-value highlight">$${avgPrice.toFixed(0)}</span>
        </div>
        <div class="item-list-summary-item">
          <span class="item-list-summary-label">最低:</span>
          <span class="item-list-summary-value">$${minPrice.toFixed(0)}</span>
        </div>
        <div class="item-list-summary-item">
          <span class="item-list-summary-label">最高:</span>
          <span class="item-list-summary-value">$${maxPrice.toFixed(0)}</span>
        </div>
        <div class="item-list-summary-item">
          <span class="item-list-summary-label">売れ筋:</span>
          <span class="item-list-summary-value highlight">${topPriceRange}</span>
        </div>
      </div>
      ${items.map(item => `
        <div class="item-list-item">
          <span class="item-title">${escapeHtml(item.title)}</span>
          <span class="item-price">$${(item.price || 0).toFixed(0)}</span>
        </div>
      `).join('')}
    `;
  }

  // モーダル表示
  modal.style.display = 'flex';

  // 閉じるボタン
  const closeBtn = document.getElementById('closeItemListModal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };
  }

  // オーバーレイクリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

/**
 * 市場データからブランド×カテゴリの商品を取得
 */
function getMarketItemsForBrandCategory(brand, category) {
  const items = [];
  const marketData = window.currentMarketData || [];

  const brandLower = brand.toLowerCase().trim();
  const brandNoSpace = brandLower.replace(/\s+/g, '');

  marketData.forEach(item => {
    const itemBrand = (item.brand || item.detectedBrand || '').toLowerCase().trim();
    const itemBrandNoSpace = itemBrand.replace(/\s+/g, '');
    const titleLower = (item.title || '').toLowerCase();

    // ブランドマッチ
    const brandMatch = itemBrand === brandLower ||
                       itemBrandNoSpace === brandNoSpace ||
                       (brandLower.length >= 4 && itemBrand.includes(brandLower)) ||
                       (itemBrand.length >= 4 && brandLower.includes(itemBrand)) ||
                       (brandLower.length >= 4 && titleLower.includes(brandLower));

    // カテゴリマッチ
    const itemCategory = item.categorySub || item.categoryMain || item.category || '(不明)';
    const categoryMatch = itemCategory === category;

    if (brandMatch && categoryMatch) {
      items.push({
        title: item.title,
        price: item.soldPrice || item.price || 0,
        status: item.status === 'sold' ? 'sold' : 'active'
      });
    }
  });

  return items;
}

// Watch数分析のフィルター設定
let watchFilterSettings = {
  minWatch: 1,
  limit: 50
};

/**
 * Watch数分析を生成
 */
function generateWatchAnalysis(minWatch = null, limit = null) {
  // パラメータが指定されていれば更新
  if (minWatch !== null) watchFilterSettings.minWatch = minWatch;
  if (limit !== null) watchFilterSettings.limit = limit;

  const allItems = analyzer.activeListings || [];
  const summary = analyzer.results.summary || {};

  // フィルタリング
  const filteredItems = allItems
    .filter(item => (item.watchers || 0) >= watchFilterSettings.minWatch)
    .sort((a, b) => (b.watchers || 0) - (a.watchers || 0));

  const displayItems = watchFilterSettings.limit === 'all'
    ? filteredItems
    : filteredItems.slice(0, parseInt(watchFilterSettings.limit));

  // Watch数の分布を計算
  const watchDistribution = {
    high: allItems.filter(i => i.watchers >= 10).length,
    medium: allItems.filter(i => i.watchers >= 5 && i.watchers < 10).length,
    low: allItems.filter(i => i.watchers >= 1 && i.watchers < 5).length,
    zero: allItems.filter(i => !i.watchers || i.watchers === 0).length
  };

  if (!allItems || allItems.length === 0) {
    return `
      <div class="no-data-message">
        <p>Watch数データがありません。</p>
        <p>CSVファイルを読み込んでください。</p>
      </div>
    `;
  }

  let html = `
    <div class="watch-filter-bar">
      <div class="filter-group">
        <label>最低Watch数:</label>
        <select id="watchMinFilter">
          <option value="1" ${watchFilterSettings.minWatch == 1 ? 'selected' : ''}>1以上</option>
          <option value="2" ${watchFilterSettings.minWatch == 2 ? 'selected' : ''}>2以上</option>
          <option value="3" ${watchFilterSettings.minWatch == 3 ? 'selected' : ''}>3以上</option>
          <option value="5" ${watchFilterSettings.minWatch == 5 ? 'selected' : ''}>5以上</option>
          <option value="10" ${watchFilterSettings.minWatch == 10 ? 'selected' : ''}>10以上</option>
        </select>
      </div>
      <div class="filter-group">
        <label>表示件数:</label>
        <select id="watchLimitFilter">
          <option value="10" ${watchFilterSettings.limit == 10 ? 'selected' : ''}>10件</option>
          <option value="20" ${watchFilterSettings.limit == 20 ? 'selected' : ''}>20件</option>
          <option value="50" ${watchFilterSettings.limit == 50 ? 'selected' : ''}>50件</option>
          <option value="100" ${watchFilterSettings.limit == 100 ? 'selected' : ''}>100件</option>
          <option value="all" ${watchFilterSettings.limit == 'all' ? 'selected' : ''}>全て</option>
        </select>
      </div>
      <span class="filter-result">${filteredItems.length}件該当</span>
    </div>

    <div class="analysis-summary">
      <div class="summary-row">
        <span class="label">総Watch数</span>
        <span class="value">${summary.totalWatchers || 0}</span>
      </div>
      <div class="summary-row">
        <span class="label">10+Watch</span>
        <span class="value">${watchDistribution.high}件</span>
      </div>
      <div class="summary-row">
        <span class="label">5-9Watch</span>
        <span class="value">${watchDistribution.medium}件</span>
      </div>
      <div class="summary-row">
        <span class="label">1-4Watch</span>
        <span class="value">${watchDistribution.low}件</span>
      </div>
    </div>

    <div class="watch-insight">
      ${watchDistribution.high >= 5 ? `
        <div class="insight-card warning">
          <span class="icon">⚠️</span>
          <span>Watch数10以上の商品が${watchDistribution.high}件あります。価格見直しを検討してください。</span>
        </div>
      ` : ''}
      ${watchDistribution.zero > (summary.totalActive || 0) * 0.7 ? `
        <div class="insight-card info">
          <span class="icon">💡</span>
          <span>Watch数0の商品が多いです。タイトルや価格の最適化を検討してください。</span>
        </div>
      ` : ''}
    </div>

    <div class="analysis-detail">
      <h4>Watch数ランキング（${displayItems.length}件表示）</h4>
      <div class="watch-table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>Watch数</th>
              <th>価格</th>
              <th>ブランド</th>
            </tr>
          </thead>
          <tbody>
            ${displayItems.map(item => {
              // 常にタイトルから再判定して表示
              let displayBrand;
              if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
                displayBrand = window.aiClassificationResults[item.title].brand;
              } else {
                displayBrand = extractBrandFromTitle(item.title);
              }
              return `
              <tr>
                <td class="title-cell" title="${escapeHtml(item.title)}">${truncateText(item.title, 35)}</td>
                <td class="watch-count">${item.watchers || 0}</td>
                <td>$${item.price ? item.price.toFixed(2) : '-'}</td>
                <td>${displayBrand || '-'}</td>
              </tr>
            `;}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // フィルター変更時のイベント設定
  setTimeout(() => {
    setupWatchFilterEvents();
  }, 100);

  return html;
}

/**
 * Watch数フィルターのイベント設定
 */
function setupWatchFilterEvents() {
  const minFilter = document.getElementById('watchMinFilter');
  const limitFilter = document.getElementById('watchLimitFilter');

  if (minFilter) {
    minFilter.addEventListener('change', () => {
      const resultHtml = generateWatchAnalysis(parseInt(minFilter.value), null);
      displayAnalysisResult('👁️ Watch数分析', resultHtml);
    });
  }

  if (limitFilter) {
    limitFilter.addEventListener('change', () => {
      const value = limitFilter.value === 'all' ? 'all' : parseInt(limitFilter.value);
      const resultHtml = generateWatchAnalysis(null, value);
      displayAnalysisResult('👁️ Watch数分析', resultHtml);
    });
  }
}

/**
 * カテゴリ別パフォーマンス分析を生成（階層構造対応）
 * 大分類と細分類を別々のセクションで表示
 */
function generateCategoryPerformanceAnalysis() {
  // カテゴリ統計を手動フラグを考慮して再計算
  const categoryStats = {};

  // アイテムのカテゴリを取得するヘルパー関数
  const getItemCategory = (item) => {
    // 優先順位: 1. 手動設定 2. 未分類フラグ 3. 既存カテゴリ 4. タイトル判定
    if (item.categoryManual && item.category) {
      return item.category;
    } else if (item.categoryCleared) {
      return null; // 未分類
    } else if (item.categoryMain || item.category) {
      return item.categoryMain || item.category;
    } else {
      return detectCategoryFromTitle(item.title) || null;
    }
  };

  // 出品中アイテムからカテゴリを集計
  analyzer.activeListings.forEach(item => {
    const category = getItemCategory(item);
    if (category && category !== '(不明)' && category !== '(未分類)') {
      if (!categoryStats[category]) {
        categoryStats[category] = { category, active: 0, sold: 0 };
      }
      categoryStats[category].active++;
    }
  });

  // 販売済みアイテムからカテゴリを集計
  analyzer.soldItems.forEach(item => {
    const category = getItemCategory(item);
    if (category && category !== '(不明)' && category !== '(未分類)') {
      if (!categoryStats[category]) {
        categoryStats[category] = { category, active: 0, sold: 0 };
      }
      categoryStats[category].sold += item.quantity || 1;
    }
  });

  const categories = Object.values(categoryStats).sort((a, b) => (b.active + b.sold) - (a.active + a.sold));

  if (!categories || categories.length === 0) {
    return `
      <div class="no-data-message">
        <p>カテゴリデータがありません。</p>
        <p>CSVファイルを読み込んでください。</p>
      </div>
    `;
  }

  // カテゴリごとのブランド内訳と細分類を計算
  const categoriesWithDetails = categories.map(cat => {
    const brandStats = {};
    const subCategoryStats = {};
    let totalActivePrice = 0;
    let totalSoldPrice = 0;
    let activeCount = 0;
    let soldCount = 0;

    // 出品中アイテムからブランドと細分類を集計
    analyzer.activeListings.forEach(item => {
      const itemCatMain = getItemCategory(item);
      if (itemCatMain === cat.category) {
        // カテゴリ全体の出品価格
        totalActivePrice += item.price || 0;
        activeCount++;

        // ブランド内訳
        const brand = analyzer.extractBrand(item.title) || '(不明)';
        if (!brandStats[brand]) {
          brandStats[brand] = { brand, active: 0, sold: 0, totalActivePrice: 0, totalSoldPrice: 0 };
        }
        brandStats[brand].active++;
        brandStats[brand].totalActivePrice += item.price || 0;

        // 細分類内訳
        const subCat = item.categorySub || '(不明)';
        if (!subCategoryStats[subCat]) {
          subCategoryStats[subCat] = {
            category: subCat,
            active: 0,
            sold: 0,
            totalActivePrice: 0,
            totalSoldPrice: 0,
            brands: {}
          };
        }
        subCategoryStats[subCat].active++;
        subCategoryStats[subCat].totalActivePrice += item.price || 0;

        // 細分類内のブランド
        if (!subCategoryStats[subCat].brands[brand]) {
          subCategoryStats[subCat].brands[brand] = { brand, count: 0 };
        }
        subCategoryStats[subCat].brands[brand].count++;
      }
    });

    // 販売済みアイテムからブランドと細分類を集計
    analyzer.soldItems.forEach(item => {
      const itemCatMain = getItemCategory(item);
      if (itemCatMain === cat.category) {
        // カテゴリ全体の販売価格
        const qty = item.quantity || 1;
        totalSoldPrice += item.soldFor || 0;
        soldCount += qty;

        // ブランド内訳
        const brand = analyzer.extractBrand(item.title) || '(不明)';
        if (!brandStats[brand]) {
          brandStats[brand] = { brand, active: 0, sold: 0, totalActivePrice: 0, totalSoldPrice: 0 };
        }
        brandStats[brand].sold += qty;
        brandStats[brand].totalSoldPrice += item.soldFor || 0;

        // 細分類内訳
        const subCat = item.categorySub || '(不明)';
        if (!subCategoryStats[subCat]) {
          subCategoryStats[subCat] = {
            category: subCat,
            active: 0,
            sold: 0,
            totalActivePrice: 0,
            totalSoldPrice: 0,
            brands: {}
          };
        }
        subCategoryStats[subCat].sold += qty;
        subCategoryStats[subCat].totalSoldPrice += item.soldFor || 0;

        // 細分類内のブランド
        if (!subCategoryStats[subCat].brands[brand]) {
          subCategoryStats[subCat].brands[brand] = { brand, count: 0 };
        }
        subCategoryStats[subCat].brands[brand].count += qty;
      }
    });

    // 配列に変換してソート
    const topBrands = Object.values(brandStats)
      .map(b => ({ ...b, count: b.active + b.sold }))
      .sort((a, b) => b.count - a.count);

    const subcategories = Object.values(subCategoryStats)
      .map(s => ({
        ...s,
        avgActivePrice: s.active > 0 ? s.totalActivePrice / s.active : 0,
        avgSoldPrice: s.sold > 0 ? s.totalSoldPrice / s.sold : 0,
        topBrands: Object.values(s.brands).sort((a, b) => b.count - a.count).slice(0, 3)
      }))
      .sort((a, b) => (b.active + b.sold) - (a.active + a.sold));

    // 平均価格を計算（直接計算した値を使用）
    const avgActivePrice = activeCount > 0 ? totalActivePrice / activeCount : 0;
    const avgSoldPrice = soldCount > 0 ? totalSoldPrice / soldCount : 0;

    return {
      ...cat,
      topBrands,
      subcategories,
      avgActivePrice,
      avgSoldPrice
    };
  });

  // 最大値を取得（バーの幅計算用）
  const maxCount = Math.max(...categoriesWithDetails.map(c => c.active + c.sold), 1);

  let html = `
    <div class="analysis-detail">
      <h4>カテゴリ別パフォーマンス（全${categoriesWithDetails.length}件）</h4>
      <table class="data-table category-expandable-table">
        <thead>
          <tr>
            <th class="col-bar">件数</th>
            <th>カテゴリ</th>
            <th>出品中</th>
            <th>販売済</th>
            <th>売上率</th>
            <th>平均出品単価</th>
            <th>平均販売単価</th>
            <th>ブランド内訳</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesWithDetails.map((cat, idx) => {
            const total = cat.active + cat.sold;
            const sellRate = total > 0 ? Math.round((cat.sold / total) * 100) : 0;
            const barWidth = maxCount > 0 ? (total / maxCount * 100).toFixed(1) : 0;
            const hasSubcategories = cat.subcategories && cat.subcategories.length > 0;
            const top3Brands = cat.topBrands.slice(0, 3);

            let rowHtml = `
              <tr class="category-main-row ${hasSubcategories ? 'expandable' : ''}" data-cat-idx="${idx}" style="cursor: pointer;">
                <td class="col-bar">
                  <div class="table-bar-container">
                    <div class="table-bar table-bar-green" style="width: ${barWidth}%"></div>
                  </div>
                </td>
                <td class="col-name">
                  <span class="row-expand-icon">▶</span>
                  ${escapeHtml(cat.category)}
                </td>
                <td>${cat.active}</td>
                <td>${cat.sold}</td>
                <td>${sellRate}%</td>
                <td>$${cat.avgActivePrice ? cat.avgActivePrice.toFixed(0) : '-'}</td>
                <td>$${cat.avgSoldPrice ? cat.avgSoldPrice.toFixed(0) : '-'}</td>
                <td class="col-brands">
                  ${top3Brands.map(b =>
                    `<span class="cat-mini-tag">${escapeHtml(b.brand)} (${b.count})</span>`
                  ).join('')}
                </td>
              </tr>
            `;

            // 細分類内訳行（展開時に表示）
            if (hasSubcategories) {
              cat.subcategories.forEach(sub => {
                const subTotal = sub.active + sub.sold;
                const subSellRate = subTotal > 0 ? Math.round((sub.sold / subTotal) * 100) : 0;
                const subBarWidth = maxCount > 0 ? (subTotal / maxCount * 100).toFixed(1) : 0;
                rowHtml += `
                  <tr class="category-sub-row" data-parent-cat-idx="${idx}" style="display: none;">
                    <td class="col-bar">
                      <div class="table-bar-container">
                        <div class="table-bar table-bar-light" style="width: ${subBarWidth}%"></div>
                      </div>
                    </td>
                    <td class="col-name subcategory-name">└ ${escapeHtml(sub.category)}</td>
                    <td>${sub.active}</td>
                    <td>${sub.sold}</td>
                    <td>${subSellRate}%</td>
                    <td>$${sub.avgActivePrice ? sub.avgActivePrice.toFixed(0) : '-'}</td>
                    <td>$${sub.avgSoldPrice ? sub.avgSoldPrice.toFixed(0) : '-'}</td>
                    <td class="col-brands">
                      ${sub.topBrands.map(b =>
                        `<span class="cat-mini-tag">${escapeHtml(b.brand)} (${b.count})</span>`
                      ).join('')}
                    </td>
                  </tr>
                `;
              });
            }

            // アイテム詳細行（展開時にアイテム一覧を表示）
            rowHtml += `
              <tr class="category-items-row" data-cat-idx="${idx}" data-category="${escapeHtml(cat.category)}" style="display: none;">
                <td colspan="8">
                  <div class="category-items-container">
                    <div class="loading-items">読み込み中...</div>
                  </div>
                </td>
              </tr>
            `;

            return rowHtml;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // カテゴリ未分類アイテムを計算
  const allItems = [...(analyzer.activeListings || []), ...(analyzer.soldItems || [])];
  const uncategorizedItems = allItems.filter(item => {
    let itemCategory;
    if (item.categoryManual && item.category) {
      itemCategory = item.category;
    } else if (item.categoryCleared) {
      itemCategory = null;
    } else {
      itemCategory = detectCategoryFromTitle(item.title);
    }
    return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
  });

  console.log('[カテゴリ分析] 全アイテム数:', allItems.length, 'カテゴリ未分類数:', uncategorizedItems.length);
  // categoryCleared=trueのアイテム数をログ
  const clearedItems = allItems.filter(item => item.categoryCleared === true);
  console.log('[カテゴリ分析] categoryCleared=trueのアイテム数:', clearedItems.length);

  // 未分類セクションを追加
  html += `
    <div class="unclassified-section" style="margin-top: 20px;">
      <h4>
        <span class="unclassified-toggle" id="myCategoryUnclassifiedToggle" style="cursor: pointer;">
          ▶ カテゴリ未分類 (<span id="myCategoryUnclassifiedCount">${uncategorizedItems.length}</span>件)
        </span>
      </h4>
      <div id="myCategoryUnclassifiedList" style="display: none;">
        <div id="myCategoryUnclassifiedItems">
          <div class="loading-items">読み込み中...</div>
        </div>
      </div>
    </div>
  `;

  // 展開イベントリスナーを設定
  setTimeout(() => {
    setupCategoryExpandListeners();
    setupCategoryUnclassifiedToggle();
  }, 50);

  return html;
}

/**
 * カテゴリ未分類トグルのイベントリスナーを設定
 */
function setupCategoryUnclassifiedToggle() {
  const toggleEl = document.getElementById('myCategoryUnclassifiedToggle');
  const listEl = document.getElementById('myCategoryUnclassifiedList');
  const itemsEl = document.getElementById('myCategoryUnclassifiedItems');

  console.log('[setupCategoryUnclassifiedToggle] toggleEl:', !!toggleEl, 'listEl:', !!listEl, 'itemsEl:', !!itemsEl);

  if (!toggleEl || !listEl || !itemsEl) {
    console.log('[setupCategoryUnclassifiedToggle] 要素が見つかりません');
    return;
  }

  toggleEl.addEventListener('click', async () => {
    if (listEl.style.display === 'none') {
      listEl.style.display = 'block';
      toggleEl.textContent = toggleEl.textContent.replace('▶', '▼');

      // 未分類アイテムを読み込み
      const allItems = [...(analyzer.activeListings || []), ...(analyzer.soldItems || [])];
      const uncategorizedItems = allItems.filter(item => {
        let itemCategory;
        if (item.categoryManual && item.category) {
          itemCategory = item.category;
        } else if (item.categoryCleared) {
          itemCategory = null;
        } else {
          itemCategory = detectCategoryFromTitle(item.title);
        }
        return !itemCategory || itemCategory === '(不明)' || itemCategory === '(未分類)' || itemCategory === null;
      });

      // アルファベット順でソート
      uncategorizedItems.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });

      if (uncategorizedItems.length === 0) {
        itemsEl.innerHTML = '<p class="no-items">未分類のアイテムはありません</p>';
        return;
      }

      let html = `
        <div class="brand-items-list">
          <div class="items-bulk-actions">
            <label class="select-all-label">
              <input type="checkbox" class="select-all-checkbox">
              全て選択
            </label>
            <button class="bulk-delete-btn" disabled>🗑️ 選択を削除</button>
            <button class="bulk-assign-btn" disabled>📁 カテゴリ割当</button>
          </div>
          <table class="items-table with-actions">
            <thead>
              <tr>
                <th class="col-checkbox"></th>
                <th>タイトル</th>
                <th class="col-price">価格</th>
                <th class="col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
      `;

      uncategorizedItems.forEach(item => {
        const price = item.price ? '$' + Number(item.price).toLocaleString() : '-';
        const title = item.title || '(タイトルなし)';
        const itemId = item.id;
        const source = item.saleDate ? 'sold' : 'active';
        html += `
          <tr data-item-id="${itemId}" data-source="${source}">
            <td class="col-checkbox"><input type="checkbox" class="item-checkbox" data-id="${itemId}" data-source="${source}"></td>
            <td class="item-title">${escapeHtml(title)}</td>
            <td class="col-price">${price}</td>
            <td class="col-actions">
              <div class="action-buttons">
                <button class="item-action-btn delete" data-id="${itemId}" data-source="${source}" title="削除">🗑️</button>
                <button class="item-action-btn assign-category" data-id="${itemId}" data-source="${source}" data-title="${escapeHtml(title)}" title="カテゴリ割当">📁</button>
              </div>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table></div>';
      itemsEl.innerHTML = html;

      // イベントリスナー設定
      setupMyCategoryUnclassifiedActions(itemsEl);
    } else {
      listEl.style.display = 'none';
      toggleEl.textContent = toggleEl.textContent.replace('▼', '▶');
    }
  });
}

/**
 * 自分のデータのカテゴリ未分類アイテム操作イベントを設定
 */
function setupMyCategoryUnclassifiedActions(container) {
  const selectAllCheckbox = container.querySelector('.select-all-checkbox');
  const itemCheckboxes = container.querySelectorAll('.item-checkbox');
  const bulkDeleteBtn = container.querySelector('.bulk-delete-btn');
  const bulkAssignBtn = container.querySelector('.bulk-assign-btn');

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      itemCheckboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
      updateBulkButtonState();
    });
  }

  itemCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateBulkButtonState);
  });

  function updateBulkButtonState() {
    const checkedCount = container.querySelectorAll('.item-checkbox:checked').length;
    if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedCount === 0;
    if (bulkAssignBtn) bulkAssignBtn.disabled = checkedCount === 0;
  }

  // 一括削除
  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      if (!confirm(`${checked.length}件のデータを削除しますか？`)) return;

      const activeIds = [];
      const soldIds = [];
      checked.forEach(cb => {
        const id = parseInt(cb.dataset.id);
        if (cb.dataset.source === 'sold') {
          soldIds.push(id);
        } else {
          activeIds.push(id);
        }
      });

      try {
        if (activeIds.length > 0) await BunsekiDB.deleteActiveListingsByIds(activeIds);
        if (soldIds.length > 0) await BunsekiDB.deleteSoldItemsByIds(soldIds);
        showAlert(`${checked.length}件を削除しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  }

  // 一括カテゴリ割当
  if (bulkAssignBtn) {
    bulkAssignBtn.addEventListener('click', async () => {
      const checked = container.querySelectorAll('.item-checkbox:checked');
      if (checked.length === 0) return;

      const newCategory = prompt(`${checked.length}件のカテゴリを設定してください:`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        for (const cb of checked) {
          const id = parseInt(cb.dataset.id);
          if (cb.dataset.source === 'sold') {
            await BunsekiDB.updateSoldItemById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
          } else {
            await BunsekiDB.updateActiveListingById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
          }
        }
        showAlert(`${checked.length}件を「${newCategory.trim()}」に設定しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  }

  // 個別削除ボタン
  container.querySelectorAll('.item-action-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;

      if (!confirm('このデータを削除しますか？')) return;

      try {
        if (source === 'sold') {
          await BunsekiDB.deleteSoldItemById(id);
        } else {
          await BunsekiDB.deleteActiveListingById(id);
        }
        showAlert('削除しました', 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        console.error('削除エラー:', e);
        showAlert('削除に失敗しました', 'error');
      }
    });
  });

  // 個別カテゴリ割当ボタン
  container.querySelectorAll('.item-action-btn.assign-category').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      const source = btn.dataset.source;
      const title = btn.dataset.title;

      const newCategory = prompt(`カテゴリを入力してください:\n\n${title}`, '');
      if (newCategory === null) return;
      if (newCategory.trim() === '') {
        showAlert('カテゴリ名を入力してください', 'warning');
        return;
      }

      try {
        if (source === 'sold') {
          await BunsekiDB.updateSoldItemById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        } else {
          await BunsekiDB.updateActiveListingById(id, { category: newCategory.trim(), categoryManual: true, categoryCleared: false });
        }
        showAlert(`カテゴリを「${newCategory.trim()}」に設定しました`, 'success');
        await refreshMyDataAnalysis();
      } catch (e) {
        console.error('割当エラー:', e);
        showAlert('割当に失敗しました', 'error');
      }
    });
  });
}

/**
 * カテゴリ展開/折りたたみのイベントリスナーを設定
 */
function setupCategoryExpandListeners() {
  const mainRows = document.querySelectorAll('.category-expandable-table .category-main-row');
  console.log('setupCategoryExpandListeners: カテゴリ行数:', mainRows.length);

  mainRows.forEach(row => {
    // イベントリスナーが既に設定されているか確認
    if (row.dataset.listenerAttached) return;
    row.dataset.listenerAttached = 'true';

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = row.dataset.catIdx;
      const hasSubcategories = row.classList.contains('expandable');
      const subRows = document.querySelectorAll(`.category-sub-row[data-parent-cat-idx="${idx}"]`);
      const itemsRow = document.querySelector(`.category-items-row[data-cat-idx="${idx}"]`);
      const icon = row.querySelector('.row-expand-icon');
      const isExpanded = row.classList.contains('expanded');

      if (isExpanded) {
        row.classList.remove('expanded');
        if (icon) icon.textContent = '▶';
        subRows.forEach(subRow => subRow.style.display = 'none');
        if (itemsRow) itemsRow.style.display = 'none';
      } else {
        row.classList.add('expanded');
        if (icon) icon.textContent = '▼';
        if (hasSubcategories) {
          subRows.forEach(subRow => subRow.style.display = 'table-row');
        }
        // アイテム一覧を表示
        if (itemsRow) {
          itemsRow.style.display = 'table-row';
          const container = itemsRow.querySelector('.category-items-container');
          const category = itemsRow.dataset.category;
          if (container && category) {
            const allItems = [...(analyzer.activeListings || []), ...(analyzer.soldItems || [])];
            loadMyCategoryItems(category, container, allItems);
          }
        }
      }
    });
  });

  // カテゴリ詳細行のクリックイベント（ブランド別グラフ表示）
  setupCategorySubRowClickListeners();
}

/**
 * カテゴリ詳細行クリックでブランド別グラフを表示するリスナー
 */
function setupCategorySubRowClickListeners() {
  const subRows = document.querySelectorAll('.category-expandable-table .category-sub-row');
  console.log('setupCategorySubRowClickListeners: 詳細行数:', subRows.length);

  subRows.forEach(row => {
    if (row.dataset.subClickListenerAttached) return;
    row.dataset.subClickListenerAttached = 'true';

    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentIdx = row.dataset.parentCatIdx;
      const subCategoryName = row.querySelector('.subcategory-name')?.textContent?.replace('└', '').trim();

      // 親カテゴリを取得
      const parentRow = document.querySelector(`.category-main-row[data-cat-idx="${parentIdx}"]`);
      const mainCategoryName = parentRow?.querySelector('.col-name')?.textContent?.replace('▶', '').replace('▼', '').trim();

      console.log('カテゴリ詳細クリック:', mainCategoryName, subCategoryName);

      if (mainCategoryName && subCategoryName) {
        showBrandChartForCategory(mainCategoryName, subCategoryName, 'my-data');
      }
    });
  });
}

// グローバル変数でチャートインスタンスを管理
let categoryBrandChartInstance = null;

/**
 * カテゴリ内のブランド別グラフを表示
 */
function showBrandChartForCategory(mainCategory, subCategory, source = 'my-data') {
  const modal = document.getElementById('brandChartModal');
  const titleEl = document.getElementById('brandChartTitle');
  const summaryEl = document.getElementById('brandChartSummary');
  const listEl = document.getElementById('brandChartList');
  const canvas = document.getElementById('categoryBrandChart');

  if (!modal || !canvas) return;

  // タイトル設定
  titleEl.textContent = `${subCategory} - ブランド別内訳`;

  // ブランド別データを集計
  let brandData = {};
  let totalCount = 0;
  let totalPrice = 0;

  if (source === 'my-data') {
    // 自分のデータから該当カテゴリのブランドを集計
    const allItems = [...(analyzer.activeListings || []), ...(analyzer.soldItems || [])];

    allItems.forEach(item => {
      const itemMainCat = item.categoryMain || item.category || '(不明)';
      const itemSubCat = item.categorySub || '(不明)';

      if (itemMainCat === mainCategory && itemSubCat === subCategory) {
        const brand = analyzer.extractBrand(item.title) || '(不明)';
        const price = item.soldFor || item.price || 0;

        if (!brandData[brand]) {
          brandData[brand] = { brand, count: 0, totalPrice: 0 };
        }
        brandData[brand].count++;
        brandData[brand].totalPrice += price;
        totalCount++;
        totalPrice += price;
      }
    });
  } else if (source === 'market') {
    // 市場データから集計
    const marketData = window.currentMarketData || [];

    marketData.forEach(item => {
      const itemMainCat = item.categoryMain || item.category || '(不明)';
      const itemSubCat = item.categorySub || '(不明)';

      if (itemMainCat === mainCategory && itemSubCat === subCategory) {
        const brand = item.brand || item.detectedBrand || '(不明)';
        const price = item.soldPrice || item.price || 0;

        if (!brandData[brand]) {
          brandData[brand] = { brand, count: 0, totalPrice: 0 };
        }
        brandData[brand].count++;
        brandData[brand].totalPrice += price;
        totalCount++;
        totalPrice += price;
      }
    });
  }

  // 配列に変換してソート
  const brands = Object.values(brandData)
    .map(b => ({
      ...b,
      avgPrice: b.count > 0 ? b.totalPrice / b.count : 0
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = brands.length > 0 ? brands[0].count : 1;
  const avgPrice = totalCount > 0 ? totalPrice / totalCount : 0;

  // サマリー表示
  summaryEl.innerHTML = `
    <div class="brand-chart-summary-item">
      <span class="brand-chart-summary-label">合計:</span>
      <span class="brand-chart-summary-value">${totalCount}件</span>
    </div>
    <div class="brand-chart-summary-item">
      <span class="brand-chart-summary-label">ブランド数:</span>
      <span class="brand-chart-summary-value highlight">${brands.length}</span>
    </div>
    <div class="brand-chart-summary-item">
      <span class="brand-chart-summary-label">平均価格:</span>
      <span class="brand-chart-summary-value highlight">$${avgPrice.toFixed(0)}</span>
    </div>
  `;

  // リスト表示（上位20件）
  const displayBrands = brands.slice(0, 20);
  listEl.innerHTML = displayBrands.map((b, idx) => {
    const barWidth = (b.count / maxCount * 100).toFixed(1);
    return `
      <div class="brand-chart-item" data-brand="${escapeHtml(b.brand)}" data-category="${escapeHtml(subCategory)}">
        <span class="brand-chart-rank ${idx < 3 ? 'top' : ''}">${idx + 1}</span>
        <span class="brand-chart-name">${escapeHtml(b.brand)}</span>
        <div class="brand-chart-bar-container">
          <div class="brand-chart-bar" style="width: ${barWidth}%"></div>
        </div>
        <span class="brand-chart-count">${b.count}件</span>
        <span class="brand-chart-avg-price">$${b.avgPrice.toFixed(0)}</span>
      </div>
    `;
  }).join('');

  // 棒グラフを描画（Chart.js）
  if (categoryBrandChartInstance) {
    categoryBrandChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  const chartBrands = displayBrands.slice(0, 10); // グラフは上位10件

  categoryBrandChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartBrands.map(b => b.brand.length > 12 ? b.brand.substring(0, 12) + '...' : b.brand),
      datasets: [{
        label: '件数',
        data: chartBrands.map(b => b.count),
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
        borderColor: 'rgba(255, 152, 0, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const brand = chartBrands[context.dataIndex];
              return `${brand.count}件 (平均: $${brand.avgPrice.toFixed(0)})`;
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        y: {
          ticks: {
            font: {
              size: 11
            }
          }
        }
      }
    }
  });

  // ブランドリストのクリックで商品一覧表示
  listEl.querySelectorAll('.brand-chart-item').forEach(item => {
    item.addEventListener('click', () => {
      const brand = item.dataset.brand;
      const category = item.dataset.category;
      modal.style.display = 'none';
      showItemListForBrandCategory(brand, category, source);
    });
  });

  // モーダル表示
  modal.style.display = 'flex';

  // 閉じるボタン
  const closeBtn = document.getElementById('closeBrandChartModal');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
    };
  }

  // オーバーレイクリックで閉じる
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

/**
 * 市場カテゴリ比較分析を生成
 */
async function generateCategoryComparisonAnalysis() {
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

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
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

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
    // 常にタイトルから再判定（item.brandは信頼しない）
    const brand = extractBrandFromTitle(item.title);
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
    const settings = await chrome.storage.local.get({
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
    const settings = await chrome.storage.local.get({
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

  // 市場データを追加（シートIDでフィルタ）
  try {
    const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
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
    // 常にタイトルから再判定（item.brandは信頼しない）
    const brand = extractBrandFromTitle(item.title) || '(不明)';
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
    currentAIResult = { provider, data: response.data };
    displayAIResult(provider, response.data);
    // シート固有のキーで保存
    await chrome.storage.local.set({ [getSheetKey('savedAIResults')]: currentAIResult });
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

  // シート固有のキーで保存
  currentAIResult = { provider: 'compare', data: results };
  await chrome.storage.local.set({ [getSheetKey('savedAIResults')]: currentAIResult });

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
 * AI結果をHTMLにフォーマット（新形式対応・後方互換あり）
 */
function formatAIResultHTML(data, provider) {
  const providerName = {
    openai: 'OpenAI GPT-4',
    claude: 'Claude 3.5',
    gemini: 'Gemini Pro'
  }[provider] || provider;

  let html = `<div class="ai-result-header"><span>📊 ${providerName} の分析結果</span></div>`;

  // 新形式: 今週の最優先アクション
  if (data.weeklyFocus) {
    html += `
      <div class="ai-section weekly-focus">
        <h4>🎯 今週の最優先アクション</h4>
        <p class="focus-action">${escapeHtml(data.weeklyFocus)}</p>
      </div>
    `;
  }

  // 新形式: 緊急アラート
  if (data.urgentAlerts && data.urgentAlerts.length > 0) {
    html += `
      <div class="ai-section alerts">
        <h4>🚨 緊急アラート</h4>
        <ul>
          ${data.urgentAlerts.map(a => `
            <li class="alert-${a.severity || 'medium'}">
              <strong>${escapeHtml(a.name)}</strong>: ${escapeHtml(a.reason)}
              ${a.action ? `<br><span class="action-tag">→ ${escapeHtml(a.action)}</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  // 旧形式: アラート（後方互換）
  else if (data.alerts && data.alerts.length > 0) {
    html += `
      <div class="ai-section alerts">
        <h4>⚠️ アラート</h4>
        <ul>
          ${data.alerts.map(a => `<li><strong>${escapeHtml(a.name)}</strong>: ${escapeHtml(a.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 新形式: 価格最適化
  if (data.priceOptimization && data.priceOptimization.length > 0) {
    html += `
      <div class="ai-section price-optimization">
        <h4>💰 価格調整の提案</h4>
        <ul>
          ${data.priceOptimization.map(p => {
            const arrow = p.direction === 'up' ? '↑値上げ' : p.direction === 'down' ? '↓値下げ' : '→維持';
            const arrowClass = p.direction === 'up' ? 'price-up' : p.direction === 'down' ? 'price-down' : 'price-hold';
            return `
              <li>
                <strong>${escapeHtml(p.brand)}</strong>
                <span class="price-direction ${arrowClass}">${arrow}</span>
                : ${escapeHtml(p.reason)}
                ${p.potential ? `<span class="potential">(${escapeHtml(p.potential)})</span>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `;
  }

  // 新形式: 在庫戦略
  if (data.inventoryStrategy) {
    // 仕入れ強化
    if (data.inventoryStrategy.increase && data.inventoryStrategy.increase.length > 0) {
      html += `
        <div class="ai-section strengths">
          <h4>📈 仕入れ強化</h4>
          <ul>
            ${data.inventoryStrategy.increase.map(s => `
              <li>
                <strong>${escapeHtml(s.brand)}</strong>: ${escapeHtml(s.reason)}
                ${s.priority === 'high' ? '<span class="priority-high">優先度高</span>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    // 在庫縮小
    if (data.inventoryStrategy.decrease && data.inventoryStrategy.decrease.length > 0) {
      html += `
        <div class="ai-section reviews">
          <h4>📉 在庫見直し</h4>
          <ul>
            ${data.inventoryStrategy.decrease.map(d => `
              <li>
                <strong>${escapeHtml(d.brand)}</strong>: ${escapeHtml(d.reason)}
                ${d.action ? `<span class="action-tag">→ ${escapeHtml(d.action)}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
  }
  // 旧形式: 強化推奨（後方互換）
  else if (data.strengthen && data.strengthen.length > 0) {
    html += `
      <div class="ai-section strengths">
        <h4>💪 強化推奨</h4>
        <ul>
          ${data.strengthen.map(s => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 旧形式: 見直し推奨（後方互換）
  if (!data.inventoryStrategy && data.review && data.review.length > 0) {
    html += `
      <div class="ai-section reviews">
        <h4>🔍 見直し推奨</h4>
        <ul>
          ${data.review.map(r => `<li><strong>${escapeHtml(r.name)}</strong>: ${escapeHtml(r.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 新形式: 市場参入機会
  if (data.marketOpportunities && data.marketOpportunities.length > 0) {
    html += `
      <div class="ai-section opportunities">
        <h4>🌟 市場参入チャンス</h4>
        <ul>
          ${data.marketOpportunities.map(o => `
            <li>
              <strong>${escapeHtml(o.brand)}</strong>
              <span class="market-info">市場規模:${o.marketSize} / 競合:${o.competition}</span>
              <br>${escapeHtml(o.recommendation)}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
  // 旧形式: 売れ筋・チャンス（後方互換）
  else if (data.opportunities && data.opportunities.length > 0) {
    html += `
      <div class="ai-section opportunities">
        <h4>💡 仕入れチャンス</h4>
        <ul>
          ${data.opportunities.map(o => `<li><strong>${escapeHtml(o.name)}</strong>: ${escapeHtml(o.reason)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  // 新形式: インサイト
  if (data.insight) {
    html += `
      <div class="ai-section insight">
        <h4>💡 データからの気づき</h4>
        <p>${escapeHtml(data.insight)}</p>
      </div>
    `;
  }

  // 旧形式: 総合提案（後方互換）
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
    const settings = await chrome.storage.local.get({
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
 * 設定の初期化（設定モーダルはinitSettingsUI()で処理）
 */
function initSettings() {
  // 設定ボタンのイベントはinitSettingsUI()で設定するため、ここでは何もしない
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

  // 除外ワードリスト（これらはブランド名ではない）
  const EXCLUDED_WORDS = new Set([
    'vintage', 'antique', 'rare', 'limited', 'auth', 'authentic', 'genuine', 'original',
    'japan', 'japanese', 'usa', 'american', 'italy', 'italian', 'france', 'french', 'swiss',
    'gold', 'silver', 'platinum', 'diamond', 'pearl', 'crystal',
    'men', 'mens', "men's", 'women', 'womens', "women's", 'ladies', 'unisex', 'boys', 'girls',
    'new', 'used', 'mint', 'excellent', 'good', 'fair', 'pre-owned', 'preowned',
    'watch', 'watches', 'jewelry', 'jewellery', 'necklace', 'bracelet', 'ring', 'bag', 'wallet',
    'size', 'color', 'style', 'type', 'set', 'lot', 'bundle',
    'box', 'case', 'strap', 'band', 'chain', 'pendant', 'earring', 'brooch',
    'free', 'shipping', 'fast', 'sale', 'deal', 'offer'
  ]);

  // ブランド名自体が除外ワードかチェック
  const isExcludedWord = (word) => {
    if (!word) return true;
    return EXCLUDED_WORDS.has(word.toLowerCase().trim());
  };

  // 1. まずAI学習済みルール（customBrandRules）をチェック
  if (analyzer.customBrandRules && Object.keys(analyzer.customBrandRules).length > 0) {
    for (const [brandKey, rule] of Object.entries(analyzer.customBrandRules)) {
      const brandName = rule.brand || brandKey;

      // ブランド名自体が除外ワードの場合はスキップ
      if (isExcludedWord(brandName)) {
        continue;
      }

      // ブランド名自体がタイトルに含まれているか（単語境界でマッチ）
      const brandRegex = new RegExp(`\\b${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (brandRegex.test(title)) {
        return brandName;
      }

      // 学習済みキーワードがタイトルに含まれているか
      if (rule.keywords && rule.keywords.length > 0) {
        for (const keyword of rule.keywords) {
          if (keyword && !isExcludedWord(keyword)) {
            const keywordRegex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            const partialRegex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            if (keywordRegex.test(title) || partialRegex.test(title)) {
              return brandName;
            }
          }
        }
      }
    }
  }

  // 2. ブランドマスターを使用（545ブランド対応）
  if (typeof brandMaster !== 'undefined' && brandMaster.initialized) {
    // 現在のシートIDを取得
    const sheetSelect = document.getElementById('sheetSelect');
    const currentSheetId = sheetSelect ? sheetSelect.value : null;

    const result = brandMaster.detectBrand(title, currentSheetId);
    if (result && result.name) {
      return result.name;
    }
  }

  return '(不明)';
}

// グローバルに公開（analyzer.jsから参照するため）
window.extractBrandFromTitle = extractBrandFromTitle;

/**
 * タイトルから大分類カテゴリのみを取得
 * detectCategoryWithSubを内部で使用し、大分類のみを返す
 * @param {string} title - 商品タイトル
 * @returns {string} - 大分類カテゴリ名
 */
function detectCategoryFromTitle(title) {
  const result = detectCategoryWithSub(title);
  return result.main;
}

/**
 * 単語境界でキーワードがマッチするかチェック
 * @param {string} text - 検索対象テキスト
 * @param {string} keyword - キーワード
 * @returns {boolean}
 */
function matchKeywordWithBoundary(text, keyword) {
  if (!text || !keyword) return false;
  // 特殊文字をエスケープ
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // 単語境界または文字列境界でマッチ
  const regex = new RegExp(`(^|[\\s,\\-\\/\\(\\)])${escaped}($|[\\s,\\-\\/\\(\\)s])`, 'i');
  return regex.test(text);
}

/**
 * タイトルからカテゴリと細分類を検出（v4.5.0 - 体系的なルールベース判定）
 *
 * 設計方針:
 * 1. 確信度の高いアイテムキーワードから判定
 * 2. ブランドのみでの判定は補助的に使用
 * 3. 細分類が特定できない場合は「未分類」へ（各カテゴリの「その他」ではなく）
 * 4. 単語境界を使った厳密なマッチング
 *
 * @param {string} title - 商品タイトル
 * @returns {{ main: string, sub: string }} - 大分類と細分類
 */
function detectCategoryWithSub(title) {
  if (!title) return { main: '未分類', sub: '未分類' };

  const titleLower = title.toLowerCase();

  // 単語境界でマッチするかチェックするヘルパー
  const wordMatch = (text, word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  };

  // 複数キーワードのいずれかにマッチするかチェック
  const anyWordMatch = (text, words) => words.some(w => wordMatch(text, w));

  // 除外キーワードを含むかチェック
  const hasExclude = (text, excludes) => excludes && excludes.some(e => text.includes(e.toLowerCase()));

  // =====================================
  // カテゴリ判定ルール（確信度順）
  // =====================================

  // --------------------------------------------------
  // 1. 時計（高確信度キーワード）
  // --------------------------------------------------
  const watchKeywords = ['watch', 'watches', 'wristwatch', 'timepiece', 'chronograph', 'chronometer'];
  const watchMechanisms = ['quartz', 'automatic', 'self-winding', 'manual wind', 'mechanical'];
  const watchBrands = [
    'rolex', 'omega', 'tag heuer', 'breitling', 'patek philippe', 'audemars piguet',
    'seiko', 'citizen', 'casio', 'g-shock', 'tudor', 'longines', 'tissot', 'orient',
    'rado', 'hamilton', 'movado', 'fossil', 'bulova', 'invicta', 'iwc', 'zenith',
    'hublot', 'panerai', 'jaeger-lecoultre', 'vacheron constantin', 'breguet',
    'blancpain', 'oris', 'mido', 'certina', 'doxa', 'frederique constant',
    'montblanc', 'bell & ross', 'glashutte', 'ulysse nardin', 'girard perregaux',
    'franck muller', 'a. lange & sohne', 'grand seiko', 'sinn', 'nomos'
  ];

  // 時計キーワードがあれば時計
  if (anyWordMatch(titleLower, watchKeywords)) {
    return { main: '時計・ジュエリー', sub: '時計' };
  }

  // 時計ブランド + メカニズムキーワード（quartz, automatic等）
  if (anyWordMatch(titleLower, watchBrands) && anyWordMatch(titleLower, watchMechanisms)) {
    return { main: '時計・ジュエリー', sub: '時計' };
  }

  // 時計ブランド + サイズ表記（XXmm）
  if (anyWordMatch(titleLower, watchBrands) && /\b\d{2}mm\b/i.test(titleLower)) {
    return { main: '時計・ジュエリー', sub: '時計' };
  }

  // --------------------------------------------------
  // 2. ジュエリー（高確信度アイテムキーワード）
  // --------------------------------------------------
  // ネックレス・ペンダント
  if (anyWordMatch(titleLower, ['necklace', 'pendant', 'choker', 'lariat'])) {
    return { main: '時計・ジュエリー', sub: 'ネックレス・ペンダント' };
  }
  // チェーン（キーチェーン除外）
  if (wordMatch(titleLower, 'chain') && !hasExclude(titleLower, ['key chain', 'keychain', 'wallet chain', 'chain saw'])) {
    return { main: '時計・ジュエリー', sub: 'ネックレス・ペンダント' };
  }

  // ブレスレット・バングル
  if (anyWordMatch(titleLower, ['bracelet', 'bangle'])) {
    return { main: '時計・ジュエリー', sub: 'ブレスレット・バングル' };
  }

  // ピアス・イヤリング
  if (anyWordMatch(titleLower, ['earring', 'earrings', 'ear ring', 'stud earring', 'hoop earring', 'drop earring'])) {
    return { main: '時計・ジュエリー', sub: 'ピアス・イヤリング' };
  }

  // ブローチ
  if (anyWordMatch(titleLower, ['brooch', 'lapel pin'])) {
    return { main: '時計・ジュエリー', sub: 'ブローチ・ピン' };
  }

  // リング（earring, keyring等を除外）
  if (wordMatch(titleLower, 'ring') && !hasExclude(titleLower, ['earring', 'keyring', 'key ring', 'spring', 'string', 'o-ring', 'boxing ring'])) {
    return { main: '時計・ジュエリー', sub: 'リング・指輪' };
  }

  // ジュエリーブランド + ジュエリー素材
  const jewelryBrands = ['tiffany', 'cartier', 'bvlgari', 'bulgari', 'van cleef', 'harry winston', 'mikimoto', 'pandora', 'swarovski', 'chopard', 'david yurman'];
  const jewelryMaterials = ['18k', '14k', '10k', 'sterling silver', '925', 'gold', 'platinum', 'diamond', 'pearl', 'ruby', 'sapphire', 'emerald'];
  if (anyWordMatch(titleLower, jewelryBrands)) {
    return { main: '時計・ジュエリー', sub: 'ファインジュエリー' };
  }

  // 素材キーワード + ジュエリーアイテム暗示
  if (anyWordMatch(titleLower, ['18k', '14k', '10k']) ||
      (wordMatch(titleLower, 'sterling') && wordMatch(titleLower, 'silver')) ||
      wordMatch(titleLower, '925')) {
    return { main: '時計・ジュエリー', sub: 'ファインジュエリー' };
  }

  // --------------------------------------------------
  // 3. バッグ・財布（高確信度）
  // --------------------------------------------------
  const bagKeywords = ['bag', 'handbag', 'shoulder bag', 'tote bag', 'backpack', 'clutch', 'crossbody', 'satchel', 'hobo bag', 'messenger bag', 'duffle', 'briefcase'];
  if (anyWordMatch(titleLower, bagKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: 'バッグ' };
  }

  const walletKeywords = ['wallet', 'billfold', 'card case', 'card holder', 'coin purse', 'coin case', 'money clip'];
  if (anyWordMatch(titleLower, walletKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: '財布・小物' };
  }

  // キーケース・キーリング
  if (anyWordMatch(titleLower, ['keyring', 'key ring', 'keychain', 'key chain', 'key holder', 'key case'])) {
    return { main: '衣類・靴・アクセサリー', sub: '財布・小物' };
  }

  // --------------------------------------------------
  // 4. 靴（高確信度）
  // --------------------------------------------------
  const shoeKeywords = ['shoes', 'sneakers', 'boots', 'heels', 'pumps', 'sandals', 'loafers', 'flats', 'oxford', 'mules', 'slides', 'espadrilles', 'moccasin', 'derby', 'brogue'];
  if (anyWordMatch(titleLower, shoeKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: '靴' };
  }

  // --------------------------------------------------
  // 5. 衣類（高確信度）
  // --------------------------------------------------
  // トップス
  const topKeywords = ['shirt', 'blouse', 'sweater', 'cardigan', 'hoodie', 't-shirt', 'tee', 'tank top', 'polo', 'knit', 'pullover', 'turtleneck'];
  if (anyWordMatch(titleLower, topKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: 'トップス' };
  }

  // アウター
  const outerKeywords = ['jacket', 'coat', 'blazer', 'parka', 'trench', 'bomber', 'leather jacket', 'denim jacket', 'down jacket', 'windbreaker', 'peacoat'];
  if (anyWordMatch(titleLower, outerKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: 'アウター' };
  }

  // ボトムス
  const bottomKeywords = ['pants', 'jeans', 'skirt', 'shorts', 'trousers', 'leggings', 'culottes', 'chinos', 'slacks'];
  if (anyWordMatch(titleLower, bottomKeywords)) {
    return { main: '衣類・靴・アクセサリー', sub: 'ボトムス' };
  }

  // ドレス（dress watchを除外済みなので安全）
  if (anyWordMatch(titleLower, ['dress', 'gown', 'maxi dress', 'midi dress', 'cocktail dress', 'evening dress'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'ドレス・ワンピース' };
  }

  // --------------------------------------------------
  // 6. 衣類アクセサリー（ジュエリーではないアクセサリー）
  // --------------------------------------------------
  // ネクタイ
  if (anyWordMatch(titleLower, ['necktie', 'bow tie', 'bowtie']) ||
      (wordMatch(titleLower, 'tie') && !hasExclude(titleLower, ['tiered', 'tied']))) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // スカーフ・ストール
  if (anyWordMatch(titleLower, ['scarf', 'scarves', 'stole', 'shawl', 'muffler'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // ベルト
  if (wordMatch(titleLower, 'belt') && !hasExclude(titleLower, ['seat belt', 'belt sander', 'conveyor belt'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // 帽子
  if (anyWordMatch(titleLower, ['hat', 'cap', 'beanie', 'beret', 'fedora', 'bucket hat'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // サングラス・メガネ
  if (anyWordMatch(titleLower, ['sunglasses', 'eyeglasses', 'eyewear'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // 手袋
  if (wordMatch(titleLower, 'gloves') && !hasExclude(titleLower, ['boxing gloves', 'work gloves', 'gardening gloves'])) {
    return { main: '衣類・靴・アクセサリー', sub: 'アクセサリー' };
  }

  // --------------------------------------------------
  // 7. 電子機器・ガジェット
  // --------------------------------------------------
  // スマートフォン
  if (anyWordMatch(titleLower, ['iphone', 'smartphone', 'cell phone', 'android phone', 'galaxy'])) {
    return { main: '携帯電話・アクセサリー', sub: '携帯電話' };
  }
  if (anyWordMatch(titleLower, ['phone case', 'screen protector', 'phone charger', 'phone holder'])) {
    return { main: '携帯電話・アクセサリー', sub: 'アクセサリー' };
  }

  // PC・タブレット
  if (anyWordMatch(titleLower, ['laptop', 'macbook', 'ipad', 'tablet', 'chromebook', 'surface pro'])) {
    return { main: 'PC・タブレット', sub: 'PC・タブレット' };
  }

  // カメラ
  if (anyWordMatch(titleLower, ['camera', 'dslr', 'mirrorless', 'lens', 'tripod'])) {
    return { main: 'カメラ・写真', sub: 'カメラ・写真' };
  }

  // ゲーム
  if (anyWordMatch(titleLower, ['playstation', 'xbox', 'nintendo', 'switch', 'ps5', 'ps4', 'game console', 'video game'])) {
    return { main: 'ゲーム', sub: 'ゲーム' };
  }

  // オーディオ
  if (anyWordMatch(titleLower, ['headphones', 'earbuds', 'airpods', 'speaker', 'amplifier'])) {
    return { main: '家電・電子機器', sub: 'オーディオ' };
  }

  // --------------------------------------------------
  // 8. コレクティブル・アート
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['vintage', 'antique', 'collectible', 'memorabilia', 'autograph', 'signed'])) {
    return { main: 'コレクティブル', sub: 'コレクティブル' };
  }

  if (anyWordMatch(titleLower, ['painting', 'sculpture', 'art print', 'lithograph', 'artwork'])) {
    return { main: 'アート', sub: 'アート' };
  }

  // --------------------------------------------------
  // 9. トイ・ホビー
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['action figure', 'lego', 'model kit', 'diecast', 'plush', 'board game', 'puzzle', 'rc car', 'drone'])) {
    return { main: 'トイ・ホビー', sub: 'トイ・ホビー' };
  }

  // --------------------------------------------------
  // 10. 書籍・音楽
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['book', 'novel', 'textbook', 'comic', 'manga', 'magazine'])) {
    return { main: '書籍・雑誌', sub: '書籍・雑誌' };
  }

  if (anyWordMatch(titleLower, ['vinyl', 'record', 'cd', 'cassette', 'album', 'lp'])) {
    return { main: '音楽', sub: '音楽' };
  }

  // --------------------------------------------------
  // 11. ホーム・キッチン（plateはここ）
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['plate', 'dish', 'bowl', 'cup', 'mug', 'glass', 'vase', 'dinnerware', 'tableware', 'kitchenware', 'cookware', 'cutlery'])) {
    return { main: 'ホーム＆ガーデン', sub: 'キッチン・食器' };
  }

  if (anyWordMatch(titleLower, ['furniture', 'chair', 'table', 'sofa', 'bed', 'desk', 'shelf', 'cabinet', 'lamp', 'rug', 'curtain', 'pillow', 'blanket'])) {
    return { main: 'ホーム＆ガーデン', sub: '家具・インテリア' };
  }

  // --------------------------------------------------
  // 12. スポーツ用品
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['golf', 'tennis', 'basketball', 'baseball', 'football', 'soccer', 'cycling', 'fishing', 'camping', 'hiking', 'yoga', 'fitness', 'gym'])) {
    return { main: 'スポーツ用品', sub: 'スポーツ用品' };
  }

  // --------------------------------------------------
  // 13. ヘルス＆ビューティー
  // --------------------------------------------------
  if (anyWordMatch(titleLower, ['perfume', 'fragrance', 'cologne', 'makeup', 'lipstick', 'mascara', 'skincare', 'serum', 'cream', 'lotion'])) {
    return { main: 'ヘルス＆ビューティー', sub: 'ヘルス＆ビューティー' };
  }

  // --------------------------------------------------
  // 14. ファッションブランドのみの場合（補助的判定）
  // 確信度が低いため、ブランドだけでは細分類を「未分類」にする
  // --------------------------------------------------
  const fashionBrands = [
    'louis vuitton', 'lv', 'gucci', 'chanel', 'hermes', 'prada', 'burberry', 'fendi', 'dior',
    'celine', 'balenciaga', 'bottega', 'loewe', 'saint laurent', 'ysl', 'givenchy', 'valentino',
    'miu miu', 'coach', 'michael kors', 'kate spade', 'tory burch', 'marc jacobs', 'versace',
    'dolce & gabbana', 'armani', 'moschino', 'mcm', 'ferragamo', 'jimmy choo', 'louboutin',
    'vivienne westwood'
  ];

  if (anyWordMatch(titleLower, fashionBrands)) {
    // ブランドはあるが、具体的なアイテムが判別できない
    // バッグ・財布・服・靴・ジュエリーのいずれか不明
    return { main: '衣類・靴・アクセサリー', sub: '未分類（要確認）' };
  }

  // --------------------------------------------------
  // 判定できない場合は「未分類」
  // --------------------------------------------------
  return { main: '未分類', sub: '未分類' };
}

// グローバルに公開（analyzer.jsから参照するため）
window.detectCategoryWithSub = detectCategoryWithSub;

// =====================================
// AI分類機能
// =====================================

// AI分類結果を保持
window.aiClassificationResults = {};

/**
 * 未分類アイテムをAIで分類
 * @param {boolean} inline - 分析結果内のインラインボタンから呼ばれた場合true
 */
async function classifyUnknownItemsWithAI(inline = false) {
  // APIキーの取得（localストレージから）
  const settings = await chrome.storage.local.get(['openaiApiKey']);
  const apiKey = settings.openaiApiKey;

  if (!apiKey) {
    showAlert('OpenAI APIキーが設定されていません。設定画面から登録してください。', 'warning');
    return;
  }

  // analyzerのデータから未分類アイテムを抽出
  const activeItems = analyzer.activeListings || [];
  const soldItems = analyzer.soldItems || [];
  const allItems = [...activeItems, ...soldItems];

  // 未分類 = brand が null, (不明), その他 のもの
  const unknownItems = allItems.filter(item => {
    // 常にタイトルから再判定（item.brandは信頼しない）
    let brand;
    if (window.aiClassificationResults && window.aiClassificationResults[item.title]) {
      brand = window.aiClassificationResults[item.title].brand;
    } else {
      brand = extractBrandFromTitle(item.title);
    }
    return !brand || brand === '(不明)' || brand === 'その他' || brand === null;
  });

  if (unknownItems.length === 0) {
    showAlert('未分類の商品はありません', 'info');
    return;
  }

  // UI要素（インラインかデータ入力タブか）
  const suffix = inline ? 'Inline' : '';
  const btn = document.getElementById(inline ? 'classifyWithAIBtnInline' : 'classifyWithAIBtn');
  const progressEl = document.getElementById(`aiClassifyProgress${suffix}`);
  const progressFill = document.getElementById(`aiProgressFill${suffix}`);
  const progressText = document.getElementById(`aiProgressText${suffix}`);

  if (!btn) {
    showAlert('AI分類ボタンが見つかりません', 'error');
    return;
  }

  // ボタンを無効化
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span> 判定中...';

  // プログレス表示
  if (progressEl) {
    progressEl.style.display = 'block';
    if (progressFill) progressFill.style.width = '0%';
  }

  try {
    const titles = unknownItems.map(item => item.title);
    const batchSize = 50;
    const results = [];
    let processed = 0;

    // バッチ処理（進捗表示あり）
    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      if (progressText) progressText.textContent = `${processed}/${titles.length} 判定中...`;

      // background.jsにAI分類リクエスト
      const response = await chrome.runtime.sendMessage({
        action: 'classifyWithAI',
        titles: batch,
        apiKey: apiKey
      });

      if (response.success) {
        results.push(...response.data);
      } else {
        console.error('バッチ失敗:', response.error);
        // 失敗してもスキップして続行
        batch.forEach(() => {
          results.push({ brand: null, category: 'その他' });
        });
      }

      processed += batch.length;
      const progress = (processed / titles.length) * 100;
      if (progressFill) progressFill.style.width = `${progress}%`;

      // 次のバッチまで少し待つ（レート制限対策）
      if (i + batchSize < titles.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (progressText) progressText.textContent = `${titles.length}/${titles.length} 完了`;

    // 結果を保存
    const classificationMap = {};
    results.forEach((result, idx) => {
      if (result && unknownItems[idx]) {
        const title = unknownItems[idx].title;
        classificationMap[title] = {
          brand: result.brand,
          category: result.category
        };
      }
    });

    window.aiClassificationResults = classificationMap;

    // AI分類結果をanalyzerのcustomBrandRulesに反映
    const brandCounts = {};
    let classifiedCount = 0;
    results.forEach((result, idx) => {
      if (result && result.brand && unknownItems[idx]) {
        const brand = result.brand;
        brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        classifiedCount++;

        // customBrandRulesに追加（タイトルの一部をキーワードとして登録）
        const title = unknownItems[idx].title;
        if (!analyzer.customBrandRules[brand]) {
          analyzer.customBrandRules[brand] = {
            brand: brand,
            keywords: [],
            source: 'ai'  // AI判定で追加されたルール
          };
        }
        // タイトルから特徴的なキーワードを抽出して追加
        const titleWords = title.split(/[\s,\-\/]+/).filter(w => w.length > 3);
        const brandKeyword = titleWords.find(w =>
          w.toLowerCase().includes(brand.toLowerCase().split(' ')[0]) ||
          brand.toLowerCase().includes(w.toLowerCase())
        );
        if (brandKeyword && !analyzer.customBrandRules[brand].keywords.includes(brandKeyword)) {
          analyzer.customBrandRules[brand].keywords.push(brandKeyword);
        }
      }
    });

    // カスタムブランドルールを永続保存
    await saveCustomBrandRules();

    // activeListingsとsoldItemsのブランドを更新
    for (const item of analyzer.activeListings) {
      if (classificationMap[item.title] && classificationMap[item.title].brand) {
        item.brand = classificationMap[item.title].brand;
      }
      if (classificationMap[item.title] && classificationMap[item.title].category) {
        item.category = classificationMap[item.title].category;
      }
    }
    for (const item of analyzer.soldItems) {
      if (classificationMap[item.title] && classificationMap[item.title].brand) {
        item.brand = classificationMap[item.title].brand;
      }
      if (classificationMap[item.title] && classificationMap[item.title].category) {
        item.category = classificationMap[item.title].category;
      }
    }

    // 分析を再実行
    analyzer.calculateBrandPerformance();
    analyzer.calculateCategoryStats();

    // 上位ブランドを表示
    const sortedBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let resultHtml = '';
    sortedBrands.forEach(([brand, count]) => {
      resultHtml += `
        <div class="result-item">
          <span class="result-brand">${brand || '不明'}</span>
          <span class="result-count">${count}件</span>
        </div>
      `;
    });

    // 分類できなかったものも表示
    const unclassifiedCount = results.length - classifiedCount;
    if (unclassifiedCount > 0) {
      resultHtml += `
        <div class="result-item">
          <span class="result-brand" style="color: #999;">分類不可</span>
          <span class="result-count">${unclassifiedCount}件</span>
        </div>
      `;
    }

    // ボタンを更新
    btn.innerHTML = '<span class="btn-icon">✅</span> 分類完了';
    btn.disabled = true;

    showAlert(`${classifiedCount}件の商品を分類しました`, 'success');

    // AI分類結果をローカルストレージに保存（シート固有）
    await chrome.storage.local.set({ [getSheetKey('aiClassificationResults')]: window.aiClassificationResults });

    // 学習済みルール表示を更新
    updateLearnedRulesDisplay();

    // 分析結果を再表示（AI判定後に分類済み/未分類の数が変わるため）
    // IndexedDBへの保存も含む
    await analyzeMyData();

  } catch (error) {
    console.error('AI分類エラー:', error);
    showAlert('AI分類でエラーが発生しました: ' + error.message, 'error');

    // ボタンをリセット
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🤖</span> AIで自動判定する';
    if (progressEl) progressEl.style.display = 'none';
  }
}

/**
 * 市場データのAI再分類
 */
async function classifyMarketDataWithAI() {
  // APIキーの取得（localストレージから）
  const settings = await chrome.storage.local.get(['openaiApiKey']);
  const apiKey = settings.openaiApiKey;

  if (!apiKey) {
    showAlert('OpenAI APIキーが設定されていません。設定画面から登録してください。', 'warning');
    return;
  }

  // 市場データを取得（シートIDでフィルタ）
  const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);

  if (!marketData || marketData.length === 0) {
    showAlert('市場データがありません', 'info');
    return;
  }

  // 未分類のアイテムを抽出
  const unknownItems = marketData.filter(item => {
    // 常にタイトルから再判定（item.brandは信頼しない）
    const brand = extractBrandFromTitle(item.title);
    return !brand || brand === '(不明)' || brand === 'その他' || brand === null;
  });

  if (unknownItems.length === 0) {
    showAlert('未分類の市場データはありません', 'info');
    return;
  }

  // UI要素
  const btn = document.getElementById('classifyMarketWithAIBtn');
  const progressEl = document.getElementById('marketAiProgress');
  const progressFill = document.getElementById('marketAiProgressFill');
  const progressText = document.getElementById('marketAiProgressText');

  if (!btn) {
    showAlert('AI分類ボタンが見つかりません', 'error');
    return;
  }

  // ボタンを無効化
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-icon">⏳</span> 判定中...';

  // プログレス表示
  if (progressEl) {
    progressEl.style.display = 'block';
    if (progressFill) progressFill.style.width = '0%';
  }

  try {
    const titles = unknownItems.map(item => item.title);
    const batchSize = 50;
    const results = [];
    let processed = 0;

    // バッチ処理（進捗表示あり）
    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      if (progressText) progressText.textContent = `${processed}/${titles.length} 判定中...`;

      // background.jsにAI分類リクエスト
      const response = await chrome.runtime.sendMessage({
        action: 'classifyWithAI',
        titles: batch,
        apiKey: apiKey
      });

      if (response.success) {
        results.push(...response.data);
      } else {
        console.error('バッチ失敗:', response.error);
        // 失敗してもスキップして続行
        batch.forEach(() => {
          results.push({ brand: null, category: 'その他' });
        });
      }

      processed += batch.length;
      const progress = (processed / titles.length) * 100;
      if (progressFill) progressFill.style.width = `${progress}%`;

      // 次のバッチまで少し待つ（レート制限対策）
      if (i + batchSize < titles.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (progressText) progressText.textContent = `${titles.length}/${titles.length} 完了`;

    // 結果を市場データに反映
    let classifiedCount = 0;
    const brandCounts = {};

    for (let idx = 0; idx < results.length; idx++) {
      const result = results[idx];
      if (result && result.brand && unknownItems[idx]) {
        const item = unknownItems[idx];
        item.brand = result.brand;
        if (result.category) item.category = result.category;
        classifiedCount++;

        brandCounts[result.brand] = (brandCounts[result.brand] || 0) + 1;

        // customBrandRulesに追加
        if (!analyzer.customBrandRules[result.brand]) {
          analyzer.customBrandRules[result.brand] = {
            brand: result.brand,
            keywords: [],
            source: 'ai'  // AI判定で追加されたルール
          };
        }

        // タイトルから特徴的なキーワードを抽出して追加
        const titleWords = item.title.split(/[\s,\-\/]+/).filter(w => w.length > 3);
        const brandKeyword = titleWords.find(w =>
          w.toLowerCase().includes(result.brand.toLowerCase().split(' ')[0]) ||
          result.brand.toLowerCase().includes(w.toLowerCase())
        );
        if (brandKeyword && !analyzer.customBrandRules[result.brand].keywords.includes(brandKeyword)) {
          analyzer.customBrandRules[result.brand].keywords.push(brandKeyword);
        }
      }
    }

    // IndexedDBの市場データを更新（現在のシートのみクリアして追加）
    await BunsekiDB.clearMarketDataForCurrentSheet();
    await BunsekiDB.addMarketData(marketData);

    // カスタムブランドルールを永続保存
    await saveCustomBrandRules();

    // 学習済みルール表示を更新
    updateLearnedRulesDisplay();

    // ボタンを更新
    btn.innerHTML = '<span class="btn-icon">✅</span> 分類完了';
    btn.disabled = true;

    showAlert(`${classifiedCount}件の市場データを分類しました`, 'success');

    // 市場データ情報を更新
    await updateMarketDataInfo();

    // 分析結果を再表示（AI判定後に分類済み/未分類の数が変わるため）
    await analyzeMarketData();

  } catch (error) {
    console.error('市場データAI分類エラー:', error);
    showAlert('市場データAI分類でエラーが発生しました: ' + error.message, 'error');

    // ボタンをリセット
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">🧠</span> 市場データをAI分類';
    if (progressEl) progressEl.style.display = 'none';
  }
}

/**
 * AI分類結果を考慮したブランド抽出
 */
function getClassifiedBrand(title) {
  // まずAI分類結果をチェック
  if (window.aiClassificationResults && window.aiClassificationResults[title]) {
    return window.aiClassificationResults[title].brand;
  }
  // 通常のブランド抽出
  return extractBrandFromTitle(title);
}

/**
 * AI分類結果を考慮したカテゴリ抽出
 */
function getClassifiedCategory(title) {
  // まずAI分類結果をチェック
  if (window.aiClassificationResults && window.aiClassificationResults[title]) {
    return window.aiClassificationResults[title].category;
  }
  // 通常のカテゴリ検出
  return detectCategoryFromTitle(title);
}

// =====================================
// AI学習ルール管理
// =====================================

/**
 * カスタムブランドルールを永続保存（シート固有）
 */
async function saveCustomBrandRules() {
  try {
    await chrome.storage.local.set({
      [getSheetKey('customBrandRules')]: analyzer.customBrandRules
    });
    console.log('カスタムブランドルール保存:', Object.keys(analyzer.customBrandRules).length, '件 (シート:', currentSheetId, ')');
  } catch (error) {
    console.error('カスタムブランドルール保存エラー:', error);
  }
}

/**
 * 学習済みルールの件数を取得
 */
function getLearnedRulesCount() {
  return Object.keys(analyzer.customBrandRules || {}).length;
}

/**
 * 学習済みルールの一覧を取得（アルファベット順、手動/AI別）
 */
function getLearnedRulesList() {
  const rules = analyzer.customBrandRules || {};
  const allRules = Object.entries(rules).map(([brand, rule]) => ({
    brand: rule.brand || brand,
    keywords: rule.keywords || [],
    keywordCount: (rule.keywords || []).length,
    source: rule.source || 'manual'  // 古いルールは手動扱い
  })).sort((a, b) => a.brand.localeCompare(b.brand));

  return {
    manual: allRules.filter(r => r.source === 'manual'),
    ai: allRules.filter(r => r.source === 'ai'),
    all: allRules
  };
}

/**
 * 学習済みルールをクリア
 */
async function clearLearnedRules() {
  if (!confirm('AI学習済みのブランドルールをすべてクリアしますか？\n次回のAI判定から再学習が必要になります。')) {
    return false;
  }
  analyzer.customBrandRules = {};
  await chrome.storage.local.remove([getSheetKey('customBrandRules')]);
  showAlert('学習済みルールをクリアしました', 'success');
  return true;
}

/**
 * 学習済みルール表示用HTMLを生成
 */
function generateLearnedRulesHtml() {
  const rules = getLearnedRulesList();
  const manualRules = rules.manual;
  const aiRules = rules.ai;
  const totalCount = rules.all.length;
  const totalKeywords = rules.all.reduce((sum, r) => sum + r.keywordCount, 0);

  // マニュアル入力フォーム（推奨）
  const manualInputHtml = `
    <div class="manual-rule-section">
      <div class="section-header recommended">
        <span class="section-icon">✏️</span>
        <span class="section-title">手動登録</span>
        <span class="recommended-badge">おすすめ</span>
      </div>
      <div class="manual-rule-input">
        <div class="manual-input-row">
          <input type="text" class="manual-brand-input" placeholder="ブランド名">
          <input type="text" class="manual-keyword-input" placeholder="キーワード（カンマ区切り）">
          <button class="add-rule-btn" title="ルールを追加">＋</button>
        </div>
        <p class="manual-input-hint">例: ブランド名「TIFFANY」、キーワード「ティファニー, tiffany&co」</p>
      </div>
    </div>
  `;

  // ルール一覧を生成する関数
  const generateRuleList = (ruleList, isManual) => {
    if (ruleList.length === 0) return '';
    const sourceClass = isManual ? 'manual-rule' : 'ai-rule';
    return ruleList.map(rule => `
      <div class="learned-rule-item ${sourceClass}" data-brand="${escapeHtml(rule.brand)}">
        <div class="rule-actions">
          <button class="edit-rule-btn" title="このルールを編集">✎</button>
          <button class="delete-rule-btn" title="このルールを削除">×</button>
        </div>
        <span class="rule-brand">${escapeHtml(rule.brand)}</span>
        <span class="rule-keywords">${rule.keywords.map(k => escapeHtml(k)).join(', ')}</span>
        <span class="rule-count">${rule.keywordCount}件</span>
      </div>
    `).join('');
  };

  if (totalCount === 0) {
    return `
      ${manualInputHtml}
      <div class="learned-rules-empty">
        <p>ルールはありません</p>
        <p class="hint">上のフォームから手動でルールを追加してください（推奨）</p>
      </div>
    `;
  }

  // 手動ルールセクション
  const manualRulesSection = manualRules.length > 0 ? `
    <div class="rules-category manual-rules-category">
      <div class="rules-category-header">
        <span class="category-icon">✅</span>
        <span class="category-title">手動登録ルール</span>
        <span class="category-count">${manualRules.length}件</span>
      </div>
      <div class="learned-rules-list">
        ${generateRuleList(manualRules, true)}
      </div>
    </div>
  ` : '';

  // AIルールセクション
  const aiRulesSection = aiRules.length > 0 ? `
    <div class="rules-category ai-rules-category">
      <div class="rules-category-header">
        <span class="category-icon">🤖</span>
        <span class="category-title">AI判定ルール</span>
        <span class="category-count">${aiRules.length}件</span>
        <span class="ai-warning">（精度にばらつきあり）</span>
      </div>
      <div class="learned-rules-list">
        ${generateRuleList(aiRules, false)}
      </div>
    </div>
  ` : '';

  return `
    ${manualInputHtml}
    <div class="learned-rules-summary">
      <div class="summary-stat">
        <span class="stat-value">${manualRules.length}</span>
        <span class="stat-label">手動</span>
      </div>
      <div class="summary-stat">
        <span class="stat-value">${aiRules.length}</span>
        <span class="stat-label">AI</span>
      </div>
      <div class="summary-stat">
        <span class="stat-value">${totalKeywords}</span>
        <span class="stat-label">キーワード</span>
      </div>
      <button class="clear-all-rules-btn action-btn danger small">
        <span class="btn-icon">🗑️</span> 全クリア
      </button>
    </div>
    ${manualRulesSection}
    ${aiRulesSection}
  `;
}

/**
 * 手動でブランドルールを追加
 */
async function addManualBrandRule(brand, keywords) {
  if (!brand || !brand.trim()) {
    showAlert('ブランド名を入力してください', 'warning');
    return false;
  }

  brand = brand.trim().toUpperCase();
  const keywordList = keywords
    ? keywords.split(',').map(k => k.trim()).filter(k => k)
    : [];

  if (!analyzer.customBrandRules) {
    analyzer.customBrandRules = {};
  }

  if (!analyzer.customBrandRules[brand]) {
    analyzer.customBrandRules[brand] = {
      brand: brand,
      keywords: [],
      source: 'manual'  // 手動で追加されたルール
    };
  } else {
    // 既存のルールを手動に昇格（AIルールを手動で編集した場合）
    analyzer.customBrandRules[brand].source = 'manual';
  }

  // キーワードを追加（重複除外）
  keywordList.forEach(kw => {
    if (!analyzer.customBrandRules[brand].keywords.includes(kw)) {
      analyzer.customBrandRules[brand].keywords.push(kw);
    }
  });

  // ブランド名自体もキーワードに追加
  const brandLower = brand.toLowerCase();
  if (!analyzer.customBrandRules[brand].keywords.includes(brandLower)) {
    analyzer.customBrandRules[brand].keywords.push(brandLower);
  }

  await chrome.storage.local.set({ [getSheetKey('customBrandRules')]: analyzer.customBrandRules });
  showAlert(`「${brand}」を追加しました`, 'success');

  // ルール追加後に分析結果を自動更新（自分のデータ + 市場データ）
  await restoreAnalysisResults();
  await restoreMarketAnalysis();

  return true;
}

/**
 * 個別の学習済みルールを削除
 */
async function deleteLearnedRule(brand) {
  if (!analyzer.customBrandRules || !analyzer.customBrandRules[brand]) {
    return false;
  }

  delete analyzer.customBrandRules[brand];
  await chrome.storage.local.set({ [getSheetKey('customBrandRules')]: analyzer.customBrandRules });

  // 分析結果も自動更新（自分のデータ + 市場データ）
  await restoreAnalysisResults();
  await restoreMarketAnalysis();

  return true;
}

/**
 * ルール編集モーダルを開く
 */
function openEditRuleModal(brand) {
  const rule = analyzer.customBrandRules?.[brand];
  if (!rule) {
    showAlert('ルールが見つかりません', 'warning');
    return;
  }

  const keywords = rule.keywords || [];
  const keywordsText = keywords.join(', ');

  // モーダルHTMLを作成
  const modalHtml = `
    <div class="edit-rule-modal-overlay" id="editRuleModalOverlay">
      <div class="edit-rule-modal">
        <div class="modal-header">
          <h3>ルールを編集</h3>
          <button class="modal-close-btn" id="closeEditRuleModal">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>ブランド名</label>
            <input type="text" id="editRuleBrand" value="${escapeHtml(brand)}" readonly class="readonly-input">
          </div>
          <div class="form-group">
            <label>キーワード（カンマ区切り）</label>
            <textarea id="editRuleKeywords" rows="4" placeholder="キーワードをカンマで区切って入力">${escapeHtml(keywordsText)}</textarea>
            <p class="form-hint">例: tiffany, ティファニー, tiffany&co</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn secondary" id="cancelEditRule">キャンセル</button>
          <button class="action-btn primary" id="saveEditRule">保存</button>
        </div>
      </div>
    </div>
  `;

  // モーダルをDOMに追加
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // イベント設定
  const overlay = document.getElementById('editRuleModalOverlay');
  const closeBtn = document.getElementById('closeEditRuleModal');
  const cancelBtn = document.getElementById('cancelEditRule');
  const saveBtn = document.getElementById('saveEditRule');

  const closeModal = () => {
    overlay.remove();
  };

  closeBtn.onclick = closeModal;
  cancelBtn.onclick = closeModal;
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  saveBtn.onclick = async () => {
    const newKeywords = document.getElementById('editRuleKeywords').value;
    await saveEditedRule(brand, newKeywords);
    closeModal();
  };
}

/**
 * 編集されたルールを保存
 */
async function saveEditedRule(brand, keywordsText) {
  if (!analyzer.customBrandRules || !analyzer.customBrandRules[brand]) {
    showAlert('ルールが見つかりません', 'warning');
    return false;
  }

  // キーワードをパース
  const keywords = keywordsText
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  // ルールを更新（編集されたルールは手動扱いに変更）
  analyzer.customBrandRules[brand].keywords = keywords;
  analyzer.customBrandRules[brand].source = 'manual';

  // 保存（シート固有）
  await chrome.storage.local.set({ [getSheetKey('customBrandRules')]: analyzer.customBrandRules });
  showAlert(`「${brand}」のルールを更新しました`, 'success');

  // 表示を更新
  updateLearnedRulesDisplay();

  // 分析結果も自動更新（自分のデータ + 市場データ）
  await restoreAnalysisResults();
  await restoreMarketAnalysis();

  return true;
}

/**
 * 学習済みルール表示を更新（スクロール位置を保持）
 */
function updateLearnedRulesDisplay() {
  // 自分のデータセクション
  const section = document.getElementById('learnedRulesSection');
  const content = document.getElementById('learnedRulesContent');

  // 市場データセクション
  const marketSection = document.getElementById('marketLearnedRulesSection');
  const marketContent = document.getElementById('marketLearnedRulesContent');

  const html = generateLearnedRulesHtml();

  // スクロール位置を保存
  const scrollPositions = {};

  // 自分のデータセクションに表示（常に表示）
  if (section && content) {
    // 各リストのスクロール位置を保存
    content.querySelectorAll('.learned-rules-list').forEach((list, idx) => {
      scrollPositions[`my-${idx}`] = list.scrollTop;
    });

    section.style.display = 'block';
    content.innerHTML = html;
    setupLearnedRulesEvents(content);

    // スクロール位置を復元
    content.querySelectorAll('.learned-rules-list').forEach((list, idx) => {
      if (scrollPositions[`my-${idx}`]) {
        list.scrollTop = scrollPositions[`my-${idx}`];
      }
    });
  }

  // 市場データセクションにも表示（常に表示）
  if (marketSection && marketContent) {
    // 各リストのスクロール位置を保存
    marketContent.querySelectorAll('.learned-rules-list').forEach((list, idx) => {
      scrollPositions[`market-${idx}`] = list.scrollTop;
    });

    marketSection.style.display = 'block';
    marketContent.innerHTML = html;
    setupLearnedRulesEvents(marketContent);

    // スクロール位置を復元
    marketContent.querySelectorAll('.learned-rules-list').forEach((list, idx) => {
      if (scrollPositions[`market-${idx}`]) {
        list.scrollTop = scrollPositions[`market-${idx}`];
      }
    });
  }
}

/**
 * 学習済みルールのイベントを設定
 */
function setupLearnedRulesEvents(container) {
  // 全クリアボタン
  const clearBtn = container.querySelector('#clearLearnedRulesBtn, .clear-all-rules-btn');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      const cleared = await clearLearnedRules();
      if (cleared) {
        updateLearnedRulesDisplay();
      }
    };
  }

  // 個別削除ボタン
  container.querySelectorAll('.delete-rule-btn').forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const item = btn.closest('.learned-rule-item');
      const brand = item?.dataset.brand;
      if (brand) {
        await deleteLearnedRule(brand);
        updateLearnedRulesDisplay();
      }
    };
  });

  // 編集ボタン
  container.querySelectorAll('.edit-rule-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const item = btn.closest('.learned-rule-item');
      const brand = item?.dataset.brand;
      if (brand) {
        openEditRuleModal(brand);
      }
    };
  });

  // マニュアル入力ボタン
  const addBtn = container.querySelector('.add-rule-btn');
  if (addBtn) {
    addBtn.onclick = async () => {
      const brandInput = container.querySelector('.manual-brand-input');
      const keywordInput = container.querySelector('.manual-keyword-input');
      const brand = brandInput?.value;
      const keywords = keywordInput?.value;

      const added = await addManualBrandRule(brand, keywords);
      if (added) {
        brandInput.value = '';
        keywordInput.value = '';
        updateLearnedRulesDisplay();
      }
    };
  }

  // Enterキーでも追加できるように
  const brandInput = container.querySelector('.manual-brand-input');
  const keywordInput = container.querySelector('.manual-keyword-input');

  [brandInput, keywordInput].forEach(input => {
    if (input) {
      input.onkeypress = async (e) => {
        if (e.key === 'Enter') {
          const brand = container.querySelector('.manual-brand-input')?.value;
          const keywords = container.querySelector('.manual-keyword-input')?.value;
          const added = await addManualBrandRule(brand, keywords);
          if (added) {
            container.querySelector('.manual-brand-input').value = '';
            container.querySelector('.manual-keyword-input').value = '';
            updateLearnedRulesDisplay();
          }
        }
      };
    }
  });
}

// =====================================
// 市場分析機能
// =====================================

/**
 * 市場分析の初期化
 */
function initMarketAnalysis() {
  // サブタブ切り替え
  const subtabs = document.querySelectorAll('.market-subtab');
  subtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.marketTab;
      switchMarketTab(targetTab);
    });
  });

  // 市場分析実行ボタン
  const loadBtn = document.getElementById('loadMarketAnalysisBtn');
  if (loadBtn) {
    loadBtn.addEventListener('click', loadMarketAnalysis);
  }

  // 再判定ボタン
  const reanalyzeBtn = document.getElementById('reanalyzeMarketDataBtn');
  if (reanalyzeBtn) {
    reanalyzeBtn.addEventListener('click', reanalyzeMarketData);
  }

  // 初期データ件数表示
  updateMarketDataCount();

  // 初期表示（データがあれば表示）
  restoreMarketAnalysis();
}

/**
 * 市場タブの切り替え
 */
function switchMarketTab(tabId) {
  // サブタブのアクティブ状態
  document.querySelectorAll('.market-subtab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.marketTab === tabId);
  });

  // コンテンツの表示切り替え
  document.querySelectorAll('.market-tab-content').forEach(content => {
    content.style.display = content.id === `market-${tabId}` ? 'block' : 'none';
  });
}

/**
 * 市場データ件数を更新
 */
async function updateMarketDataCount() {
  try {
    const marketItems = await analyzer.getMarketDataFromDB();
    const countEl = document.getElementById('marketDataCount');
    if (countEl) {
      countEl.textContent = `市場データ: ${marketItems.length.toLocaleString()}件`;
    }
  } catch (error) {
    console.error('市場データ件数取得エラー:', error);
  }
}

/**
 * 市場分析を実行
 */
async function loadMarketAnalysis() {
  showLoading('市場データを分析中...');

  try {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

    const allMarketItems = await analyzer.getMarketDataFromDB();
    // 現在のシートでフィルタ
    const marketItems = allMarketItems.filter(item => item.sheetId === currentSheetId);

    if (!marketItems || marketItems.length === 0) {
      showAlert('このシートには市場データがありません。eBayリサーチページでデータを取り込んでください。', 'warning');
      hideLoading();
      return;
    }

    // プロファイルに応じて属性を付与（プロファイルが変わった場合も再抽出）
    if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
      marketItems.forEach(item => {
        if (item.title && item.profileExtracted !== currentSheetProfile) {
          const attributes = extractAttributesByProfile(item.title);
          if (attributes) {
            item.attributes = attributes;
            item.profileExtracted = currentSheetProfile;
          }
        }
      });
    }

    // 市場データを正規化
    const normalizedItems = analyzer.normalizeMarketData(marketItems);

    // 商品一覧表示用にグローバルに保存
    window.currentMarketData = normalizedItems;

    // 各種ランキングを取得
    const brandRanking = analyzer.getMarketBrandRanking(normalizedItems, 30);
    const categoryRanking = analyzer.getMarketCategoryRanking(normalizedItems, 20);
    const brandCategoryRanking = analyzer.getMarketBrandCategoryRanking(normalizedItems, 20);

    // 各タブにレンダリング
    renderBrandRanking(brandRanking);
    renderCategoryRanking(categoryRanking);
    renderBrandCategoryRanking(brandCategoryRanking);

    // 自分のデータとの比較（シートでフィルタ）
    const allActiveListings = await BunsekiDB.getActiveListings();
    const allSoldItems = await BunsekiDB.getSoldItems();
    const activeListings = allActiveListings.filter(item => item.sheetId === currentSheetId);
    const soldItems = allSoldItems.filter(item => item.sheetId === currentSheetId);

    if (activeListings && activeListings.length > 0) {
      // analyzerに自分のデータをセットして分析
      analyzer.analyze(activeListings, soldItems || []);
      const comparison = analyzer.compareWithMyListings(normalizedItems);
      renderComparison(comparison);
    }

    hideLoading();
    showAlert('市場分析が完了しました', 'success');

  } catch (error) {
    console.error('市場分析エラー:', error);
    hideLoading();
    showAlert('市場分析中にエラーが発生しました: ' + error.message, 'error');
  }
}

/**
 * 市場分析の初期表示を復元（ページ読み込み時）
 */
async function restoreMarketAnalysis() {
  try {
    const allMarketItems = await analyzer.getMarketDataFromDB();
    // 現在のシートでフィルタ
    const marketItems = allMarketItems.filter(item => item.sheetId === currentSheetId);

    if (marketItems && marketItems.length > 0) {
      // プロファイルに応じて属性を付与（プロファイルが変わった場合も再抽出）
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile)) {
        marketItems.forEach(item => {
          if (item.title && item.profileExtracted !== currentSheetProfile) {
            const attributes = extractAttributesByProfile(item.title);
            if (attributes) {
              item.attributes = attributes;
              item.profileExtracted = currentSheetProfile;
            }
          }
        });
      }

      // 市場データを正規化
      const normalizedItems = analyzer.normalizeMarketData(marketItems);

      // 商品一覧表示用にグローバルに保存
      window.currentMarketData = normalizedItems;

      // 各種ランキングを取得
      const brandRanking = analyzer.getMarketBrandRanking(normalizedItems, 30);
      const categoryRanking = analyzer.getMarketCategoryRanking(normalizedItems, 20);
      const brandCategoryRanking = analyzer.getMarketBrandCategoryRanking(normalizedItems, 20);

      // 各タブにレンダリング
      renderBrandRanking(brandRanking);
      renderCategoryRanking(categoryRanking);
      renderBrandCategoryRanking(brandCategoryRanking);

      // 自分のデータとの比較（シートでフィルタ）
      const allActiveListings = await BunsekiDB.getActiveListings();
      const allSoldItems = await BunsekiDB.getSoldItems();
      const activeListings = allActiveListings.filter(item => item.sheetId === currentSheetId);
      const soldItems = allSoldItems.filter(item => item.sheetId === currentSheetId);

      if (activeListings && activeListings.length > 0) {
        analyzer.analyze(activeListings, soldItems || []);
        const comparison = analyzer.compareWithMyListings(normalizedItems);
        renderComparison(comparison);
      } else {
        renderEmptyComparison();
      }
    } else {
      // データがない場合は空の状態を表示
      renderEmptyRankings();
    }
  } catch (error) {
    console.error('市場分析の復元エラー:', error);
    renderEmptyRankings();
  }
}

/**
 * 空のランキング表示
 */
function renderEmptyRankings() {
  const brandList = document.getElementById('brandRankingList');
  const categoryList = document.getElementById('categoryRankingList');
  const brandCategoryList = document.getElementById('brandCategoryList');

  if (brandList) {
    brandList.innerHTML = '<p class="empty-message">データなし（0件）</p>';
  }
  if (categoryList) {
    categoryList.innerHTML = '<p class="empty-message">データなし（0件）</p>';
  }
  if (brandCategoryList) {
    brandCategoryList.innerHTML = '<p class="empty-message">データなし（0件）</p>';
  }
  renderEmptyComparison();
}

/**
 * 空の比較表示
 */
function renderEmptyComparison() {
  const comparisonContent = document.getElementById('comparisonContent');
  if (comparisonContent) {
    comparisonContent.innerHTML = '<p class="empty-message">自分のデータと市場データが必要です</p>';
  }
}

/**
 * 市場データを再判定
 */
async function reanalyzeMarketData() {
  if (!confirm('保存済みの市場データのブランド・カテゴリを再判定しますか？\n（ブランド・カテゴリ判定ロジックを更新した場合に使用）')) {
    return;
  }

  showLoading('市場データを再判定中...');

  try {
    // 学習済みルールを読み込む
    await analyzer.loadCustomBrandRules(getSheetKey('customBrandRules'));

    const marketItems = await analyzer.getMarketDataFromDB();

    if (!marketItems || marketItems.length === 0) {
      showAlert('市場データがありません', 'warning');
      hideLoading();
      return;
    }

    // 各アイテムのブランド・カテゴリを再判定（extractBrandFromTitleを使用）
    const reclassifiedItems = marketItems.map(item => {
      const brand = extractBrandFromTitle(item.title || '');
      const category = analyzer.extractCategoryFromTitle(item.title || '');
      const updated = {
        ...item,
        brand: brand,
        category: category
      };
      // ポケモンプロファイルの場合は属性も再抽出
      if (['pokemon', 'onepiece', 'yugioh', 'watch'].includes(currentSheetProfile) && item.title) {
        const attributes = extractAttributesByProfile(item.title);
        if (attributes) {
          updated.attributes = attributes;
          updated.profileExtracted = currentSheetProfile;
        }
      }
      return updated;
    });

    // IndexedDBを更新
    await updateMarketDataInDB(reclassifiedItems);

    hideLoading();
    showAlert(`${reclassifiedItems.length}件のデータを再判定しました`, 'success');

    // 分析を再実行
    await loadMarketAnalysis();

  } catch (error) {
    console.error('再判定エラー:', error);
    hideLoading();
    showAlert('再判定中にエラーが発生しました: ' + error.message, 'error');
  }
}

/**
 * IndexedDBの市場データを更新
 */
async function updateMarketDataInDB(items) {
  await BunsekiDB.init();

  return new Promise((resolve, reject) => {
    const tx = BunsekiDB.getTransaction('marketData', 'readwrite');
    const store = tx.objectStore('marketData');

    // 既存データをクリア
    store.clear();

    // 更新されたデータを追加
    items.forEach(item => {
      store.add(item);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * ブランドランキングを表示（テーブル形式）
 */
function renderBrandRanking(ranking) {
  const container = document.getElementById('brandRankingList');
  if (!container) return;

  if (!ranking || ranking.length === 0) {
    container.innerHTML = '<p class="no-data-message">データがありません</p>';
    return;
  }

  // 最大値を取得（バーの幅計算用）
  const maxCount = Math.max(...ranking.map(r => r.count));

  // ランキングデータをグローバルに保存（詳細ポップアップ用）
  window.brandRankingData = ranking;

  let html = `
    <div class="ranking-table-container">
      <table class="ranking-table brand-ranking-table">
        <thead>
          <tr>
            <th class="col-bar">件数</th>
            <th class="col-rank">#</th>
            <th class="col-name">ブランド</th>
            <th class="col-count">件数</th>
            <th class="col-share">シェア</th>
            <th class="col-price">平均価格</th>
            <th class="col-price-range">売れ筋価格帯</th>
            <th class="col-categories">カテゴリ内訳（TOP3）</th>
          </tr>
        </thead>
        <tbody>
  `;

  ranking.forEach((item, idx) => {
    const barWidth = (item.count / maxCount * 100).toFixed(1);
    const top3Categories = item.topCategories.slice(0, 3);
    const hasSubcategories = item.subcategories && item.subcategories.length > 0;
    const hasPriceDistribution = item.priceDistribution && item.priceDistribution.length > 0;

    html += `
      <tr class="${item.rank <= 3 ? 'top-rank' : ''} brand-main-row ${hasSubcategories ? 'expandable' : ''}" data-brand="${escapeHtml(item.brand)}">
        <td class="col-bar">
          <div class="table-bar-container">
            <div class="table-bar" style="width: ${barWidth}%"></div>
          </div>
        </td>
        <td class="col-rank">
          <span class="rank-badge ${item.rank <= 3 ? 'gold' : ''}">${item.rank}</span>
        </td>
        <td class="col-name">
          ${hasSubcategories ? '<span class="row-expand-icon">▶</span>' : ''}
          ${escapeHtml(item.brand)}
        </td>
        <td class="col-count">${item.count.toLocaleString()}</td>
        <td class="col-share">${item.share}%</td>
        <td class="col-price">$${item.avgPrice.toLocaleString()}</td>
        <td class="col-price-range">
          <span class="price-range-badge">${item.topPriceRange || '-'}</span>
        </td>
        <td class="col-categories">
          ${top3Categories.map(cat =>
            `<span class="cat-mini-tag">${escapeHtml(cat.category)} (${cat.count})</span>`
          ).join('')}
        </td>
      </tr>
    `;

    // 細分類カテゴリの展開行（初期は非表示）
    if (hasSubcategories) {
      // 細分類カテゴリ一覧
      const subCats = item.subcategories.slice(0, 10); // 上位10件
      subCats.forEach(sub => {
        const subBarWidth = (sub.count / maxCount * 100).toFixed(1);
        html += `
          <tr class="brand-subcategory-row" data-parent-brand="${escapeHtml(item.brand)}" style="display: none;">
            <td class="col-bar">
              <div class="table-bar-container">
                <div class="table-bar table-bar-light" style="width: ${subBarWidth}%"></div>
              </div>
            </td>
            <td class="col-rank"></td>
            <td class="col-name subcategory-name">
              <span class="subcategory-indent">└</span>
              ${escapeHtml(sub.category)}
            </td>
            <td class="col-count">${sub.count.toLocaleString()}</td>
            <td class="col-share">${sub.share || 0}%</td>
            <td class="col-price">$${(sub.avgPrice || 0).toLocaleString()}</td>
            <td class="col-price-range">
              <span class="price-range-badge sub-badge">${sub.topPriceRange || '-'}</span>
            </td>
            <td class="col-categories"></td>
          </tr>
        `;
      });

      // 価格帯分布行
      if (hasPriceDistribution) {
        const nonZeroPrices = item.priceDistribution.filter(p => p.count > 0);
        if (nonZeroPrices.length > 0) {
          html += `
            <tr class="brand-subcategory-row brand-price-dist-row" data-parent-brand="${escapeHtml(item.brand)}" style="display: none;">
              <td colspan="8" class="price-distribution-cell">
                <div class="price-distribution-container">
                  <span class="price-dist-label">💰 価格帯分布:</span>
                  ${nonZeroPrices.map((p, i) => `
                    <span class="price-dist-item ${i === 0 ? 'top-range' : ''}">
                      ${p.range}: ${p.count}件
                    </span>
                  `).join('')}
                </div>
              </td>
            </tr>
          `;
        }
      }
    }
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // ブランド行のクリックイベント
  container.querySelectorAll('.brand-main-row.expandable').forEach(row => {
    row.addEventListener('click', function() {
      const brand = row.dataset.brand;
      const expandIcon = row.querySelector('.row-expand-icon');
      const subRows = container.querySelectorAll(`.brand-subcategory-row[data-parent-brand="${brand}"]`);
      const isExpanded = row.classList.contains('expanded');

      if (isExpanded) {
        row.classList.remove('expanded');
        if (expandIcon) expandIcon.textContent = '▶';
        subRows.forEach(sr => sr.style.display = 'none');
      } else {
        row.classList.add('expanded');
        if (expandIcon) expandIcon.textContent = '▼';
        subRows.forEach(sr => sr.style.display = '');
      }
    });
  });

  // カテゴリ行のクリックイベント（商品一覧表示）
  container.querySelectorAll('.brand-subcategory-row:not(.brand-price-dist-row)').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const brand = row.dataset.parentBrand;
      const categoryEl = row.querySelector('.subcategory-name');
      const category = categoryEl?.textContent?.replace('└', '').trim();

      if (brand && category) {
        showItemListForBrandCategory(brand, category, 'market');
      }
    });
  });
}

/**
 * カテゴリランキングを表示（テーブル形式 + 細分類展開）
 */
function renderCategoryRanking(ranking) {
  const container = document.getElementById('categoryRankingList');
  if (!container) return;

  if (!ranking || ranking.length === 0) {
    container.innerHTML = '<p class="no-data-message">データがありません</p>';
    return;
  }

  // 最大値を取得（バーの幅計算用）
  const maxCount = Math.max(...ranking.map(r => r.count));

  // ランキングデータをグローバルに保存
  window.categoryRankingData = ranking;

  let html = `
    <div class="ranking-table-container">
      <table class="ranking-table category-ranking-table">
        <thead>
          <tr>
            <th class="col-bar">件数</th>
            <th class="col-rank">#</th>
            <th class="col-name">カテゴリ</th>
            <th class="col-count">件数</th>
            <th class="col-share">シェア</th>
            <th class="col-price">平均価格</th>
            <th class="col-price-range">売れ筋価格帯</th>
            <th class="col-categories">ブランド内訳（TOP3）</th>
          </tr>
        </thead>
        <tbody>
  `;

  ranking.forEach((item, idx) => {
    const barWidth = (item.count / maxCount * 100).toFixed(1);
    const top3Brands = item.topBrands.slice(0, 3);
    const hasSubcategories = item.subcategories && item.subcategories.length > 0;
    const hasPriceDistribution = item.priceDistribution && item.priceDistribution.length > 0;
    // 「その他」を除いた細分類
    const filteredSubs = (item.subcategories || []).filter(s => s.subcategory !== 'その他');
    const otherSub = (item.subcategories || []).find(s => s.subcategory === 'その他');

    html += `
      <tr class="${item.rank <= 3 ? 'top-rank' : ''} category-main-row ${hasSubcategories ? 'expandable' : ''}" data-category="${escapeHtml(item.category)}">
        <td class="col-bar">
          <div class="table-bar-container">
            <div class="table-bar table-bar-green" style="width: ${barWidth}%"></div>
          </div>
        </td>
        <td class="col-rank">
          <span class="rank-badge ${item.rank <= 3 ? 'gold' : ''}">${item.rank}</span>
        </td>
        <td class="col-name">
          ${hasSubcategories ? '<span class="row-expand-icon">▶</span>' : ''}
          ${escapeHtml(item.category)}
        </td>
        <td class="col-count">${item.count.toLocaleString()}</td>
        <td class="col-share">${item.share}%</td>
        <td class="col-price">$${item.avgPrice.toLocaleString()}</td>
        <td class="col-price-range">
          <span class="price-range-badge">${item.topPriceRange || '-'}</span>
        </td>
        <td class="col-categories">
          ${top3Brands.map(b =>
            `<span class="cat-mini-tag">${escapeHtml(b.brand)} (${b.count})</span>`
          ).join('')}
        </td>
      </tr>
    `;

    // 細分類の行（初期は非表示）
    if (hasSubcategories) {
      filteredSubs.forEach(sub => {
        const subBarWidth = (sub.count / maxCount * 100).toFixed(1);
        const subTopBrands = (sub.topBrands || []).slice(0, 3);
        html += `
          <tr class="subcategory-row" data-parent-category="${escapeHtml(item.category)}" style="display: none;">
            <td class="col-bar">
              <div class="table-bar-container">
                <div class="table-bar table-bar-light" style="width: ${subBarWidth}%"></div>
              </div>
            </td>
            <td class="col-rank"></td>
            <td class="col-name subcategory-name">
              <span class="subcategory-indent">└</span>
              ${escapeHtml(sub.subcategory)}
            </td>
            <td class="col-count">${sub.count.toLocaleString()}</td>
            <td class="col-share">${sub.share || 0}%</td>
            <td class="col-price">$${(sub.avgPrice || 0).toLocaleString()}</td>
            <td class="col-price-range">
              <span class="price-range-badge sub-badge">${sub.topPriceRange || '-'}</span>
            </td>
            <td class="col-categories">
              ${subTopBrands.map(b =>
                `<span class="cat-mini-tag">${escapeHtml(b.brand)} (${b.count})</span>`
              ).join('')}
            </td>
          </tr>
        `;
      });
      // 「その他」があれば最後に追加
      if (otherSub && otherSub.count > 0) {
        const otherBarWidth = (otherSub.count / maxCount * 100).toFixed(1);
        const otherTopBrands = (otherSub.topBrands || []).slice(0, 3);
        html += `
          <tr class="subcategory-row other-subcategory" data-parent-category="${escapeHtml(item.category)}" style="display: none;">
            <td class="col-bar">
              <div class="table-bar-container">
                <div class="table-bar table-bar-light" style="width: ${otherBarWidth}%"></div>
              </div>
            </td>
            <td class="col-rank"></td>
            <td class="col-name subcategory-name">
              <span class="subcategory-indent">└</span>
              <span class="other-label">その他</span>
            </td>
            <td class="col-count">${otherSub.count.toLocaleString()}</td>
            <td class="col-share">${otherSub.share || 0}%</td>
            <td class="col-price">$${(otherSub.avgPrice || 0).toLocaleString()}</td>
            <td class="col-price-range">
              <span class="price-range-badge sub-badge">${otherSub.topPriceRange || '-'}</span>
            </td>
            <td class="col-categories">
              ${otherTopBrands.map(b =>
                `<span class="cat-mini-tag">${escapeHtml(b.brand)} (${b.count})</span>`
              ).join('')}
            </td>
          </tr>
        `;
      }

      // 価格帯分布行
      if (hasPriceDistribution) {
        const nonZeroPrices = item.priceDistribution.filter(p => p.count > 0);
        if (nonZeroPrices.length > 0) {
          html += `
            <tr class="subcategory-row category-price-dist-row" data-parent-category="${escapeHtml(item.category)}" style="display: none;">
              <td colspan="8" class="price-distribution-cell">
                <div class="price-distribution-container">
                  <span class="price-dist-label">💰 価格帯分布:</span>
                  ${nonZeroPrices.map((p, i) => `
                    <span class="price-dist-item ${i === 0 ? 'top-range' : ''}">
                      ${p.range}: ${p.count}件
                    </span>
                  `).join('')}
                </div>
              </td>
            </tr>
          `;
        }
      }
    }
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;

  // 大分類行のクリックイベント
  container.querySelectorAll('.category-main-row.expandable').forEach(row => {
    row.addEventListener('click', function() {
      const category = row.dataset.category;
      const expandIcon = row.querySelector('.row-expand-icon');
      const subRows = container.querySelectorAll(`.subcategory-row[data-parent-category="${category}"]`);
      const isExpanded = row.classList.contains('expanded');

      if (isExpanded) {
        row.classList.remove('expanded');
        if (expandIcon) expandIcon.textContent = '▶';
        subRows.forEach(sr => sr.style.display = 'none');
      } else {
        row.classList.add('expanded');
        if (expandIcon) expandIcon.textContent = '▼';
        subRows.forEach(sr => sr.style.display = '');
      }
    });
  });

  // 細分類行のクリックイベント（ブランド別グラフ表示）
  container.querySelectorAll('.subcategory-row:not(.category-price-dist-row)').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function(e) {
      e.stopPropagation();
      const mainCategory = row.dataset.parentCategory;
      const subCategoryEl = row.querySelector('.subcategory-name');
      const subCategory = subCategoryEl?.textContent?.replace('└', '').replace('その他', '').trim() || 'その他';

      if (mainCategory && subCategory) {
        showBrandChartForCategory(mainCategory, subCategory, 'market');
      }
    });
  });
}

/**
 * ブランド×カテゴリランキングを表示（ヒートマップ/マトリクス）
 */
function renderBrandCategoryRanking(ranking) {
  const container = document.getElementById('brandCategoryList');
  if (!container) return;

  if (!ranking || ranking.length === 0) {
    container.innerHTML = '<p class="no-data-message">データがありません</p>';
    return;
  }

  // ランキングデータをグローバルに保存（ポップアップ用）
  window.brandCategoryRankingData = ranking;

  // 全カテゴリを収集（上位カテゴリのみ、最大8つ）
  const allCategories = new Map();
  ranking.forEach(brand => {
    brand.categoryRanking.forEach(cat => {
      const current = allCategories.get(cat.category) || 0;
      allCategories.set(cat.category, current + cat.count);
    });
  });

  // カテゴリを件数順にソートして上位8つを取得
  const topCategories = Array.from(allCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cat]) => cat);

  // 最大値を取得（ヒートマップの色計算用）
  let maxCount = 0;
  ranking.forEach(brand => {
    brand.categoryRanking.forEach(cat => {
      if (cat.count > maxCount) maxCount = cat.count;
    });
  });

  // ブランドごとのカテゴリ別詳細データをマップ化
  const brandCategoryMap = {};
  ranking.forEach(brand => {
    brandCategoryMap[brand.brand] = {};
    brand.categoryRanking.forEach(cat => {
      brandCategoryMap[brand.brand][cat.category] = cat;
    });
  });

  // ヒートマップの色を計算する関数（薄い紫 → 濃い紫のグラデーション）
  const getHeatColor = (count) => {
    if (count === 0) return 'transparent';
    const intensity = Math.min(count / maxCount, 1);
    const r = Math.round(102 + (1 - intensity) * 153);
    const g = Math.round(126 - intensity * 80);
    const b = Math.round(234 - intensity * 30);
    const alpha = 0.2 + intensity * 0.8;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  let html = `
    <div class="matrix-container">
      <div class="matrix-legend">
        <span class="legend-label">少</span>
        <div class="legend-gradient"></div>
        <span class="legend-label">多</span>
      </div>
      <div class="matrix-scroll">
        <table class="matrix-table">
          <thead>
            <tr>
              <th class="matrix-corner"></th>
              ${topCategories.map(cat => `<th class="matrix-category-header" title="${escapeHtml(cat)}">${escapeHtml(cat)}</th>`).join('')}
              <th class="matrix-total-header">合計</th>
            </tr>
          </thead>
          <tbody>
  `;

  // 各ブランドの行を生成（上位15ブランド）
  ranking.slice(0, 15).forEach(brand => {
    const catData = brandCategoryMap[brand.brand] || {};

    html += `
      <tr>
        <td class="matrix-brand-cell">
          <span class="matrix-rank">${brand.rank}</span>
          <span class="matrix-brand-name">${escapeHtml(brand.brand)}</span>
        </td>`;

    topCategories.forEach(cat => {
      const data = catData[cat] || { count: 0 };
      const count = data.count || 0;
      const bgColor = getHeatColor(count);
      html += `<td class="matrix-cell ${count > 0 ? 'clickable' : ''}"
        style="background: ${bgColor};"
        data-brand="${escapeHtml(brand.brand)}"
        data-category="${escapeHtml(cat)}"
        title="${escapeHtml(brand.brand)} × ${escapeHtml(cat)}: ${count}件">
        ${count > 0 ? count : '-'}
      </td>`;
    });

    html += `<td class="matrix-total-cell">${brand.totalCount}</td></tr>`;
  });

  html += '</tbody></table></div></div>';

  // ポップアップHTML追加
  html += `
    <div id="matrixCellPopup" class="matrix-cell-popup" style="display: none;">
      <div class="popup-header">
        <span class="popup-title"></span>
        <button class="popup-close">&times;</button>
      </div>
      <div class="popup-content"></div>
    </div>
  `;

  container.innerHTML = html;

  // セルクリックイベント
  container.querySelectorAll('.matrix-cell.clickable').forEach(cell => {
    cell.addEventListener('click', function(e) {
      e.stopPropagation();
      const brand = cell.dataset.brand;
      const category = cell.dataset.category;
      showMatrixCellPopup(brand, category, brandCategoryMap, cell);
    });
  });

  // ポップアップ閉じるボタン
  const popup = document.getElementById('matrixCellPopup');
  if (popup) {
    const closeBtn = popup.querySelector('.popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        popup.style.display = 'none';
      });
    }
  }

  // 外部クリックでポップアップを閉じる
  document.addEventListener('click', function(e) {
    const popup = document.getElementById('matrixCellPopup');
    if (popup && !popup.contains(e.target) && !e.target.classList.contains('matrix-cell')) {
      popup.style.display = 'none';
    }
  });
}

/**
 * マトリクスセルのポップアップを表示
 */
function showMatrixCellPopup(brand, category, brandCategoryMap, cellElement) {
  const popup = document.getElementById('matrixCellPopup');
  if (!popup) return;

  const data = brandCategoryMap[brand]?.[category];
  if (!data || data.count === 0) {
    popup.style.display = 'none';
    return;
  }

  // タイトル設定
  popup.querySelector('.popup-title').textContent = `${brand} × ${category}`;

  // コンテンツ生成
  const priceDistHtml = data.priceDistribution
    ? data.priceDistribution
        .filter(p => p.count > 0)
        .map((p, i) => `<span class="popup-price-item ${i === 0 ? 'top' : ''}">${p.range}: ${p.count}件</span>`)
        .join('')
    : '';

  popup.querySelector('.popup-content').innerHTML = `
    <div class="popup-stats">
      <div class="popup-stat-item">
        <span class="stat-label">件数</span>
        <span class="stat-value">${data.count.toLocaleString()}件</span>
      </div>
      <div class="popup-stat-item">
        <span class="stat-label">シェア</span>
        <span class="stat-value">${data.share}%</span>
      </div>
      <div class="popup-stat-item">
        <span class="stat-label">平均価格</span>
        <span class="stat-value">$${(data.avgPrice || 0).toLocaleString()}</span>
      </div>
      <div class="popup-stat-item">
        <span class="stat-label">売れ筋価格帯</span>
        <span class="stat-value price-badge">${data.topPriceRange || '-'}</span>
      </div>
    </div>
    ${priceDistHtml ? `
      <div class="popup-price-dist">
        <div class="price-dist-title">💰 価格帯分布</div>
        <div class="price-dist-items">${priceDistHtml}</div>
      </div>
    ` : ''}
  `;

  // ポップアップ位置を設定（セルの近くに表示）
  const cellRect = cellElement.getBoundingClientRect();
  const containerRect = document.getElementById('brandCategoryList').getBoundingClientRect();

  let left = cellRect.left - containerRect.left + cellRect.width / 2;
  let top = cellRect.bottom - containerRect.top + 5;

  // 右端に近い場合は左寄せ
  if (left + 200 > containerRect.width) {
    left = containerRect.width - 220;
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
  popup.style.display = 'block';
}

/**
 * 比較結果を表示
 */
function renderComparison(comparison) {
  const container = document.getElementById('comparisonContent');
  if (!container) return;

  if (!comparison) {
    container.innerHTML = '<p class="no-data-message">自分のデータと市場データを両方取り込んでください</p>';
    return;
  }

  const { brandComparison, categoryComparison, trendScore, purchaseRecommendations, summary } = comparison;

  // トレンドスコアの評価
  let scoreDesc = '';
  if (trendScore >= 80) {
    scoreDesc = '素晴らしい！トレンドに合った出品構成です';
  } else if (trendScore >= 60) {
    scoreDesc = '良好です。いくつかのブランドを強化しましょう';
  } else if (trendScore >= 40) {
    scoreDesc = '改善の余地があります。推奨ブランドを参考にしてください';
  } else {
    scoreDesc = 'トレンドとの乖離が大きいです。戦略の見直しを検討してください';
  }

  let html = `
    <!-- トレンドスコア -->
    <div class="trend-score-card">
      <div class="trend-score-value">${trendScore}</div>
      <div class="trend-score-label">トレンド適合度</div>
      <div class="trend-score-desc">${scoreDesc}</div>
    </div>

    <!-- サマリー -->
    <div class="comparison-summary">
      <div class="comparison-summary-card">
        <div class="comparison-summary-value">${summary.totalMarketItems.toLocaleString()}</div>
        <div class="comparison-summary-label">市場データ</div>
      </div>
      <div class="comparison-summary-card">
        <div class="comparison-summary-value">${summary.myActiveItems.toLocaleString()}</div>
        <div class="comparison-summary-label">自分の出品</div>
      </div>
      <div class="comparison-summary-card">
        <div class="comparison-summary-value" style="color: #f44336;">${summary.missingBrands}</div>
        <div class="comparison-summary-label">未出品ブランド</div>
      </div>
      <div class="comparison-summary-card">
        <div class="comparison-summary-value" style="color: #ff9800;">${summary.shortageBrands}</div>
        <div class="comparison-summary-label">出品不足</div>
      </div>
    </div>

    <!-- 仕入れ推奨 -->
    ${purchaseRecommendations.length > 0 ? `
      <h4 style="margin: 16px 0 12px; font-size: 13px;">📌 仕入れ推奨</h4>
      <div class="recommendation-list">
        ${purchaseRecommendations.map(rec => `
          <div class="recommendation-item ${rec.priority}">
            <span class="recommendation-priority ${rec.priority}">${rec.priority === 'high' ? '高' : '中'}</span>
            <div class="recommendation-content">
              <div class="recommendation-name">${escapeHtml(rec.name)}</div>
              <div class="recommendation-reason">${escapeHtml(rec.reason)}</div>
              <div class="recommendation-action">${escapeHtml(rec.action)}${rec.avgPrice ? ` (平均$${rec.avgPrice})` : ''}</div>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;

  // 比較スタイルを追加
  html += `
    <style>
      .trend-score-card {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: var(--border-radius);
        color: white;
        margin-bottom: 16px;
      }
      .trend-score-value {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        color: #ffd700;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      .trend-score-label {
        font-size: 14px;
        margin-top: 8px;
        color: #fff;
        font-weight: 600;
      }
      .trend-score-desc {
        font-size: 12px;
        margin-top: 8px;
        color: #e0e0ff;
        font-weight: 500;
      }
      .comparison-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 16px;
      }
      .comparison-summary-card {
        background: var(--bg-secondary);
        padding: 12px;
        border-radius: var(--border-radius-sm);
        text-align: center;
      }
      .comparison-summary-value {
        font-size: 20px;
        font-weight: 700;
        color: var(--primary-color);
      }
      .comparison-summary-label {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .recommendation-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .recommendation-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        background: var(--bg-secondary);
        border-radius: var(--border-radius-sm);
        border-left: 3px solid var(--warning-color);
      }
      .recommendation-item.high {
        border-left-color: var(--danger-color);
      }
      .recommendation-priority {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-size: 10px;
        font-weight: 600;
        color: white;
        background: var(--warning-color);
        flex-shrink: 0;
      }
      .recommendation-priority.high {
        background: var(--danger-color);
      }
      .recommendation-content {
        flex: 1;
      }
      .recommendation-name {
        font-weight: 600;
        font-size: 13px;
        margin-bottom: 2px;
      }
      .recommendation-reason {
        font-size: 11px;
        color: var(--text-secondary);
        margin-bottom: 2px;
      }
      .recommendation-action {
        font-size: 11px;
        color: var(--primary-color);
      }
    </style>
  `;

  container.innerHTML = html;
}

// =====================================
// 認証・ライセンス管理
// =====================================

// 現在のユーザータイプをキャッシュ
let currentUserType = 'free';

/**
 * 認証状態を初期化
 */
async function initAuthCheck() {
  try {
    if (typeof BunsekiAuth !== 'undefined') {
      currentUserType = await BunsekiAuth.getUserType();
      console.log('[Auth] User type:', currentUserType);
    }
  } catch (error) {
    console.error('[Auth] Init error:', error);
    currentUserType = 'free';
  }
}

/**
 * プレミアムユーザーか確認
 */
function isPremiumUser() {
  return currentUserType === 'member' || currentUserType === 'paid';
}

/**
 * タブ制限を適用
 */
async function applyTabRestrictions() {
  const isPremium = isPremiumUser();

  // 制限対象のタブ（無料ユーザーはアクセス不可）
  const restrictedTabs = ['market-data', 'market-analysis', 'ai-suggestions'];

  restrictedTabs.forEach(tabId => {
    const tabButton = document.querySelector(`.main-tab[data-tab="${tabId}"]`);
    if (tabButton) {
      if (isPremium) {
        // プレミアムユーザー: 制限解除
        tabButton.classList.remove('locked');
        tabButton.removeAttribute('data-locked');
      } else {
        // 無料ユーザー: ロック状態に
        tabButton.classList.add('locked');
        tabButton.setAttribute('data-locked', 'true');
      }
    }
  });

  // シート制限を適用
  await applySheetRestrictions();

  // ロック中のタブにいる場合、自分のデータタブに移動
  if (!isPremium) {
    const activeTab = document.querySelector('.main-tab.active');
    if (activeTab && restrictedTabs.includes(activeTab.dataset.tab)) {
      switchMainTab('my-data');
    }
  }
}

/**
 * シート制限を適用
 */
async function applySheetRestrictions() {
  const maxSheets = isPremiumUser() ? 10 : 1;
  const sheetSelect = document.getElementById('sheetSelect');

  if (!sheetSelect) return;

  // シートオプションの有効/無効を設定
  const options = sheetSelect.querySelectorAll('option');
  options.forEach((option, index) => {
    if (index >= maxSheets) {
      option.disabled = true;
      option.textContent = option.textContent.replace(' 🔒', '') + ' 🔒';
    } else {
      option.disabled = false;
      option.textContent = option.textContent.replace(' 🔒', '');
    }
  });

  // 無料ユーザーがロックされたシートを選択している場合、シート1に戻す
  if (!isPremiumUser() && currentSheetId !== 'sheet1') {
    await switchSheet('sheet1');
    sheetSelect.value = 'sheet1';
  }
}

/**
 * ロックされたタブをクリックした時の処理
 */
function showUpgradePrompt() {
  const modalHtml = `
    <div class="upgrade-modal-content">
      <div class="upgrade-icon">🔒</div>
      <h3>この機能はフルバージョン限定です</h3>
      <p>市場分析、AI提案、複数シートなどの機能を使うには、フルバージョンが必要です。</p>
      <div class="upgrade-options">
        <div class="upgrade-option">
          <span class="option-icon">🎫</span>
          <span class="option-text">スクール会員の方はシークレットコードを入力</span>
        </div>
        <div class="upgrade-option">
          <span class="option-icon">💳</span>
          <span class="option-text">1,000円で全機能を永久解放</span>
        </div>
      </div>
      <button id="goToSettingsBtn" class="action-btn primary">
        <span class="btn-icon">⚙️</span>
        設定画面へ
      </button>
    </div>
  `;

  const modal = document.getElementById('analysisModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.getElementById('modalContent');

  if (modal && modalContent) {
    modalTitle.textContent = 'アップグレード';
    modalContent.innerHTML = modalHtml;
    modal.style.display = 'flex';

    // 設定画面へボタン（設定ページを開く）
    const goToSettingsBtn = document.getElementById('goToSettingsBtn');
    if (goToSettingsBtn) {
      goToSettingsBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        chrome.runtime.openOptionsPage();
      });
    }
  }
}

// =====================================
// ブランドマスター管理UI
// =====================================

let brandMasterModalState = {
  currentEditBrand: null,
  searchQuery: '',
  filteredBrands: []
};

/**
 * ブランドマスター管理モーダルを初期化
 */
function initBrandMasterUI() {
  const brandMasterBtn = document.getElementById('brandMasterBtn');
  const brandMasterModal = document.getElementById('brandMasterModal');
  const closeBrandMasterModal = document.getElementById('closeBrandMasterModal');
  const brandSearchInput = document.getElementById('brandSearchInput');
  const addBrandBtn = document.getElementById('addBrandBtn');
  const resetBrandMasterBtn = document.getElementById('resetBrandMasterBtn');
  const brandEditModal = document.getElementById('brandEditModal');
  const closeBrandEditModal = document.getElementById('closeBrandEditModal');
  const saveBrandBtn = document.getElementById('saveBrandBtn');
  const cancelBrandBtn = document.getElementById('cancelBrandBtn');
  const addPatternBtn = document.getElementById('addPatternBtn');

  // ブランド管理ボタン
  if (brandMasterBtn) {
    brandMasterBtn.addEventListener('click', () => {
      openBrandMasterModal();
    });
  }

  // モーダルを閉じる
  if (closeBrandMasterModal) {
    closeBrandMasterModal.addEventListener('click', () => {
      brandMasterModal.style.display = 'none';
    });
  }

  // 検索入力
  if (brandSearchInput) {
    brandSearchInput.addEventListener('input', (e) => {
      brandMasterModalState.searchQuery = e.target.value;
      renderBrandList();
    });
  }

  // ブランド追加ボタン
  if (addBrandBtn) {
    addBrandBtn.addEventListener('click', () => {
      openBrandEditModal(null);
    });
  }

  // 初期化ボタン
  if (resetBrandMasterBtn) {
    resetBrandMasterBtn.addEventListener('click', async () => {
      if (confirm('ブランドマスターを初期状態に戻しますか？\nカスタム追加したブランドは削除されます。')) {
        if (typeof brandMaster !== 'undefined') {
          await brandMaster.resetToDefault();
          renderBrandList();
          showAlert('ブランドマスターを初期化しました', 'success');
        }
      }
    });
  }

  // ブランド編集モーダルを閉じる
  if (closeBrandEditModal) {
    closeBrandEditModal.addEventListener('click', () => {
      brandEditModal.style.display = 'none';
    });
  }

  if (cancelBrandBtn) {
    cancelBrandBtn.addEventListener('click', () => {
      brandEditModal.style.display = 'none';
    });
  }

  // パターン追加ボタン
  if (addPatternBtn) {
    addPatternBtn.addEventListener('click', () => {
      addPatternInputRow();
    });
  }

  // ブランド保存ボタン
  if (saveBrandBtn) {
    saveBrandBtn.addEventListener('click', async () => {
      await saveBrandFromModal();
    });
  }

  // シート別設定のラジオボタン
  const sheetBrandModeRadios = document.querySelectorAll('input[name="sheetBrandMode"]');
  sheetBrandModeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const sheetBrandsContainer = document.getElementById('sheetBrandsContainer');
      if (e.target.value === 'custom') {
        sheetBrandsContainer.style.display = 'block';
      } else {
        sheetBrandsContainer.style.display = 'none';
      }
    });
  });
}

/**
 * ブランドマスター管理モーダルを開く
 */
async function openBrandMasterModal() {
  const modal = document.getElementById('brandMasterModal');
  if (!modal) return;

  // ブランドマスターが初期化されていなければ初期化
  if (typeof brandMaster !== 'undefined' && !brandMaster.initialized) {
    await brandMaster.init();
  }

  // ブランドリストを描画
  renderBrandList();

  modal.style.display = 'flex';
}

/**
 * ブランドリストを描画
 */
function renderBrandList() {
  const container = document.getElementById('brandListContainer');
  const countBadge = document.getElementById('brandCountBadge');
  if (!container) return;

  // ブランドマスターがない場合
  if (typeof brandMaster === 'undefined' || !brandMaster.brands) {
    container.innerHTML = `
      <div class="brand-list-empty">
        <div class="empty-icon">🏷️</div>
        <p>ブランドマスターが読み込まれていません</p>
      </div>
    `;
    return;
  }

  const searchQuery = brandMasterModalState.searchQuery.toLowerCase();
  let brands = brandMaster.brands;

  // 検索フィルタ
  if (searchQuery) {
    brands = brands.filter(b =>
      b.name.toLowerCase().includes(searchQuery) ||
      (b.patterns && b.patterns.some(p => p.toLowerCase().includes(searchQuery)))
    );
  }

  // 件数表示
  if (countBadge) {
    countBadge.textContent = `${brands.length}件`;
  }

  // リストが空の場合
  if (brands.length === 0) {
    container.innerHTML = `
      <div class="brand-list-empty">
        <div class="empty-icon">🔍</div>
        <p>該当するブランドがありません</p>
      </div>
    `;
    return;
  }

  // ブランドリストを全件生成
  container.innerHTML = brands.map(brand => `
    <div class="brand-list-item ${brand.enabled === false ? 'disabled' : ''}" data-brand-id="${brand.id}">
      <input type="checkbox" class="brand-list-checkbox"
        ${brand.enabled !== false ? 'checked' : ''}
        data-brand-id="${brand.id}">
      <span class="brand-list-name">${escapeHtml(brand.name)}</span>
      <span class="brand-list-patterns" title="${escapeHtml((brand.patterns || []).join(', '))}">
        ${escapeHtml((brand.patterns || []).slice(0, 3).join(', '))}${(brand.patterns || []).length > 3 ? '...' : ''}
      </span>
      <div class="brand-list-actions">
        <button class="brand-list-btn edit" data-brand-id="${brand.id}">編集</button>
        ${!brand.isDefault ? `<button class="brand-list-btn delete" data-brand-id="${brand.id}">削除</button>` : ''}
      </div>
    </div>
  `).join('');

  // イベントリスナーを設定
  setupBrandListEvents();
}

/**
 * ブランドリストのイベントリスナーを設定
 */
function setupBrandListEvents() {
  const container = document.getElementById('brandListContainer');
  if (!container) return;

  // 有効/無効チェックボックス
  container.querySelectorAll('.brand-list-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async (e) => {
      const brandId = e.target.dataset.brandId;
      const enabled = e.target.checked;
      await toggleBrandEnabled(brandId, enabled);
    });
  });

  // 編集ボタン
  container.querySelectorAll('.brand-list-btn.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const brandId = e.target.dataset.brandId;
      const brand = brandMaster.brands.find(b => b.id === brandId);
      if (brand) {
        openBrandEditModal(brand);
      }
    });
  });

  // 削除ボタン
  container.querySelectorAll('.brand-list-btn.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const brandId = e.target.dataset.brandId;
      if (confirm('このブランドを削除しますか？')) {
        await deleteBrand(brandId);
      }
    });
  });
}

/**
 * ブランドの有効/無効を切り替え
 */
async function toggleBrandEnabled(brandId, enabled) {
  if (typeof brandMaster === 'undefined') return;

  const brand = brandMaster.brands.find(b => b.id === brandId);
  if (brand) {
    brand.enabled = enabled;
    await brandMaster.saveBrands();

    // リストアイテムのスタイルを更新
    const item = document.querySelector(`.brand-list-item[data-brand-id="${brandId}"]`);
    if (item) {
      item.classList.toggle('disabled', !enabled);
    }
  }
}

/**
 * ブランドを削除
 */
async function deleteBrand(brandId) {
  if (typeof brandMaster === 'undefined') return;

  const index = brandMaster.brands.findIndex(b => b.id === brandId);
  if (index > -1) {
    brandMaster.brands.splice(index, 1);
    await brandMaster.saveBrands();
    renderBrandList();
    showAlert('ブランドを削除しました', 'success');
  }
}

/**
 * ブランド編集モーダルを開く
 */
function openBrandEditModal(brand) {
  const modal = document.getElementById('brandEditModal');
  const title = document.getElementById('brandEditTitle');
  const nameInput = document.getElementById('brandNameInput');
  const patternsContainer = document.getElementById('brandPatternsContainer');
  const enabledCheck = document.getElementById('brandEnabledCheck');

  if (!modal) return;

  brandMasterModalState.currentEditBrand = brand;

  // タイトル設定
  title.textContent = brand ? 'ブランド編集' : 'ブランド追加';

  // フォームをリセット
  nameInput.value = brand ? brand.name : '';
  enabledCheck.checked = brand ? brand.enabled !== false : true;

  // マッチタイプ
  const matchType = brand ? (brand.matchType || 'word') : 'word';
  document.querySelector(`input[name="matchType"][value="${matchType}"]`).checked = true;

  // パターン入力欄
  patternsContainer.innerHTML = '';
  const patterns = brand ? (brand.patterns || [brand.name]) : [''];
  patterns.forEach(pattern => {
    addPatternInputRow(pattern);
  });

  modal.style.display = 'flex';
}

/**
 * パターン入力行を追加
 */
function addPatternInputRow(value = '') {
  const container = document.getElementById('brandPatternsContainer');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'pattern-input-row';
  row.innerHTML = `
    <input type="text" value="${escapeHtml(value)}" placeholder="マッチパターン">
    <button type="button" class="remove-pattern-btn">✕</button>
  `;

  // 削除ボタンのイベント
  row.querySelector('.remove-pattern-btn').addEventListener('click', () => {
    row.remove();
  });

  container.appendChild(row);
}

/**
 * モーダルからブランドを保存
 */
async function saveBrandFromModal() {
  const nameInput = document.getElementById('brandNameInput');
  const patternsContainer = document.getElementById('brandPatternsContainer');
  const enabledCheck = document.getElementById('brandEnabledCheck');
  const matchTypeRadio = document.querySelector('input[name="matchType"]:checked');

  const name = nameInput.value.trim();
  if (!name) {
    showAlert('ブランド名を入力してください', 'warning');
    return;
  }

  // パターンを収集
  const patterns = [];
  patternsContainer.querySelectorAll('input').forEach(input => {
    const val = input.value.trim();
    if (val) patterns.push(val);
  });

  if (patterns.length === 0) {
    patterns.push(name); // 名前をデフォルトパターンとして追加
  }

  const matchType = matchTypeRadio ? matchTypeRadio.value : 'word';
  const enabled = enabledCheck.checked;

  if (typeof brandMaster === 'undefined') {
    showAlert('ブランドマスターが初期化されていません', 'error');
    return;
  }

  const editBrand = brandMasterModalState.currentEditBrand;

  if (editBrand) {
    // 既存ブランドを更新
    editBrand.name = name;
    editBrand.patterns = patterns;
    editBrand.matchType = matchType;
    editBrand.enabled = enabled;
    await brandMaster.saveBrands();
    showAlert('ブランドを更新しました', 'success');
  } else {
    // 新規ブランドを追加
    const newBrand = {
      id: 'custom_' + Date.now(),
      name,
      patterns,
      matchType,
      enabled,
      isDefault: false
    };
    await brandMaster.addBrand(newBrand);
    showAlert('ブランドを追加しました', 'success');
  }

  // モーダルを閉じてリストを更新
  document.getElementById('brandEditModal').style.display = 'none';
  renderBrandList();
}

/**
 * HTMLエスケープ
 */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

// DOMContentLoaded時にブランドマスターUIと設定UIを初期化
document.addEventListener('DOMContentLoaded', () => {
  initBrandMasterUI();
  initSettingsUI();
});

// =====================================
// 設定モーダルUI
// =====================================

/**
 * 設定モーダルUIを初期化
 */
function initSettingsUI() {
  const settingsBtn = document.getElementById('settingsBtn');

  // 設定ボタン - 設定ページを開く（設定変更後にポップアップを再読み込みすると反映される）
  if (settingsBtn) {
    settingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }

  // 以下はモーダル用（将来削除予定だが互換性のため残す）
  const settingsModal = document.getElementById('settingsModal');
  const closeSettingsModal = document.getElementById('closeSettingsModal');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const activateCodeBtn = document.getElementById('settingsActivateCodeBtn');

  // モーダルを閉じる
  if (closeSettingsModal) {
    closeSettingsModal.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });
  }

  // 保存ボタン
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      await saveSettings();
    });
  }

  // シークレットコード認証
  if (activateCodeBtn) {
    activateCodeBtn.addEventListener('click', async () => {
      await activateSecretCode();
    });
  }

  // パスワード表示/非表示トグル
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁';
        }
      }
    });
  });

  // API接続テストボタン
  document.querySelectorAll('[data-test-api]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.testApi;
      await testApiConnection(provider);
    });
  });
}

/**
 * 設定モーダルを開く
 */
async function openSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (!modal) return;

  // 保存されている設定を読み込み
  await loadSettingsToModal();

  modal.style.display = 'flex';
}

/**
 * 設定をモーダルに読み込み
 */
async function loadSettingsToModal() {
  const data = await chrome.storage.local.get([
    'openaiApiKey',
    'claudeApiKey',
    'geminiApiKey',
    'secretCode',
    'isPremium',
    'premiumType'
  ]);

  // APIキーを入力欄にセット
  const openaiInput = document.getElementById('settingsOpenaiKey');
  const claudeInput = document.getElementById('settingsClaudeKey');
  const geminiInput = document.getElementById('settingsGeminiKey');
  const secretCodeInput = document.getElementById('settingsSecretCode');

  if (openaiInput) openaiInput.value = data.openaiApiKey || '';
  if (claudeInput) claudeInput.value = data.claudeApiKey || '';
  if (geminiInput) geminiInput.value = data.geminiApiKey || '';
  if (secretCodeInput) secretCodeInput.value = data.secretCode || '';

  // ステータス表示を更新
  updateApiStatusBadge('openai', data.openaiApiKey);
  updateApiStatusBadge('claude', data.claudeApiKey);
  updateApiStatusBadge('gemini', data.geminiApiKey);

  // アカウントステータス表示
  updateAccountStatus(data.isPremium, data.premiumType);
}

/**
 * APIステータスバッジを更新
 */
function updateApiStatusBadge(provider, apiKey) {
  const badgeId = `settings${provider.charAt(0).toUpperCase() + provider.slice(1)}Status`;
  const badge = document.getElementById(badgeId);
  if (!badge) return;

  if (apiKey && apiKey.trim()) {
    badge.textContent = '設定済み';
    badge.className = 'status-badge success';
  } else {
    badge.textContent = '未設定';
    badge.className = 'status-badge pending';
  }
}

/**
 * アカウントステータスを更新
 */
function updateAccountStatus(isPremium, premiumType) {
  const statusBox = document.getElementById('settingsAccountStatusBox');
  const icon = document.getElementById('settingsAccountIcon');
  const type = document.getElementById('settingsAccountType');
  const desc = document.getElementById('settingsAccountDesc');
  const badge = document.getElementById('settingsAccountBadge');

  if (isPremium) {
    statusBox.classList.add('premium');
    icon.textContent = '👑';
    type.textContent = premiumType === 'school' ? 'スクール会員' : 'フルバージョン';
    desc.textContent = '全機能が利用可能です';
    badge.textContent = 'Premium';
    badge.className = 'status-badge success';
  } else {
    statusBox.classList.remove('premium');
    icon.textContent = '🔒';
    type.textContent = '無料プラン';
    desc.textContent = '一部機能のみ利用可能';
    badge.textContent = 'Free';
    badge.className = 'status-badge pending';
  }
}

/**
 * 設定を保存
 */
async function saveSettings() {
  const openaiKey = document.getElementById('settingsOpenaiKey')?.value.trim() || '';
  const claudeKey = document.getElementById('settingsClaudeKey')?.value.trim() || '';
  const geminiKey = document.getElementById('settingsGeminiKey')?.value.trim() || '';

  await chrome.storage.local.set({
    openaiApiKey: openaiKey,
    claudeApiKey: claudeKey,
    geminiApiKey: geminiKey
  });

  // ステータスバッジを更新
  updateApiStatusBadge('openai', openaiKey);
  updateApiStatusBadge('claude', claudeKey);
  updateApiStatusBadge('gemini', geminiKey);

  // 設定モーダルを閉じる
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'none';

  // UIを即時反映
  await refreshUIAfterSettingsChange();

  showAlert('設定を保存しました', 'success');
}

/**
 * シークレットコードで認証
 */
async function activateSecretCode() {
  const codeInput = document.getElementById('settingsSecretCode');
  const code = codeInput?.value.trim();

  if (!code) {
    showAlert('コードを入力してください', 'warning');
    return;
  }

  // BunsekiAuthを使用してシークレットコードを検証
  const result = await BunsekiAuth.activateWithSecretCode(code);

  if (result.success) {
    await chrome.storage.local.set({
      secretCode: code.toUpperCase(),
      isPremium: true,
      premiumType: 'school'
    });

    updateAccountStatus(true, 'school');

    // 設定モーダルを閉じる
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';

    // UIを即時反映（プレミアム機能の解放など）
    await refreshUIAfterSettingsChange();

    showAlert(result.message, 'success');
  } else {
    showAlert(result.message || '無効なコードです', 'error');
  }
}

/**
 * API接続テスト
 */
async function testApiConnection(provider) {
  const keyInputId = `settings${provider.charAt(0).toUpperCase() + provider.slice(1)}Key`;
  const keyInput = document.getElementById(keyInputId);
  const apiKey = keyInput?.value.trim();

  if (!apiKey) {
    showAlert('APIキーを入力してください', 'warning');
    return;
  }

  showLoading(`${provider} 接続テスト中...`);

  try {
    let success = false;
    let message = '';

    switch (provider) {
      case 'openai':
        success = await testOpenAI(apiKey);
        break;
      case 'claude':
        success = await testClaude(apiKey);
        break;
      case 'gemini':
        success = await testGemini(apiKey);
        break;
    }

    hideLoading();

    if (success) {
      updateApiStatusBadge(provider, apiKey);
      showAlert(`${provider} 接続成功！`, 'success');
    } else {
      showAlert(`${provider} 接続失敗。APIキーを確認してください`, 'error');
    }
  } catch (error) {
    hideLoading();
    showAlert(`接続エラー: ${error.message}`, 'error');
  }
}

/**
 * OpenAI接続テスト
 */
async function testOpenAI(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * Claude接続テスト
 */
async function testClaude(apiKey) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });
    return response.ok || response.status === 400; // 400はAPIキーは有効だがリクエストエラー
  } catch (e) {
    return false;
  }
}

/**
 * Gemini接続テスト
 */
async function testGemini(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    return response.ok;
  } catch (e) {
    return false;
  }
}

/**
 * 設定変更後にUIを即時反映
 */
async function refreshUIAfterSettingsChange() {
  try {
    // プレミアム状態を再チェック
    const data = await chrome.storage.local.get(['isPremium', 'premiumType']);

    // プレミアム機能の表示/非表示を更新
    const premiumElements = document.querySelectorAll('.premium-only');
    premiumElements.forEach(el => {
      if (data.isPremium) {
        el.classList.remove('locked');
      } else {
        el.classList.add('locked');
      }
    });

    // ヘッダーのプレミアムバッジを更新
    const headerBadge = document.querySelector('.header-badge');
    if (headerBadge) {
      if (data.isPremium) {
        headerBadge.textContent = data.premiumType === 'school' ? 'スクール会員' : 'フル版';
        headerBadge.className = 'header-badge premium';
      } else {
        headerBadge.textContent = 'Free';
        headerBadge.className = 'header-badge free';
      }
    }

    // 既存の分析結果があれば再表示（データ入力タブ）
    if (analyzer.activeListings.length > 0 || analyzer.soldItems.length > 0) {
      await refreshMyDataAnalysis();
    }

    // 市場データがあれば再表示
    const marketData = await BunsekiDB.getMarketDataForSheet(BunsekiDB.currentSheetId);
    if (marketData && marketData.length > 0) {
      await restoreMarketDataAnalysisResult();
    }

    console.log('設定変更後のUI更新完了');
  } catch (error) {
    console.error('UI更新エラー:', error);
  }
}

// =====================================
// グローバルエクスポート（互換性のため）
// =====================================

window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showAlert = showAlert;
window.getClassifiedBrand = getClassifiedBrand;
window.getClassifiedCategory = getClassifiedCategory;
window.saveCustomBrandRules = saveCustomBrandRules;
window.clearLearnedRules = clearLearnedRules;
window.switchMarketTab = switchMarketTab;
window.loadMarketAnalysis = loadMarketAnalysis;
window.isPremiumUser = isPremiumUser;
window.showUpgradePrompt = showUpgradePrompt;
window.openBrandMasterModal = openBrandMasterModal;
window.openSettingsModal = openSettingsModal;

// =====================================
// キーワード管理機能
// =====================================

/**
 * キーワードモーダルを開く
 */
function openKeywordModal() {
  const modal = document.getElementById('keywordModal');
  modal.style.display = 'flex';
  loadKeywordLists();
}

/**
 * キーワードモーダルを閉じる
 */
function closeKeywordModal() {
  const modal = document.getElementById('keywordModal');
  modal.style.display = 'none';
}

/**
 * キーワードリストを読み込み表示
 */
async function loadKeywordLists() {
  const data = await chrome.storage.local.get(['watchedKeywords', 'excludedKeywords']);
  const watchedKeywords = data.watchedKeywords || [];
  const excludedKeywords = data.excludedKeywords || [];

  // カウントバッジ更新
  document.getElementById('watchedCountBadge').textContent = watchedKeywords.length;
  document.getElementById('excludedCountBadge').textContent = excludedKeywords.length;

  // 注目キーワードリスト
  renderKeywordList('watchedKeywordList', watchedKeywords, 'watchedKeywords');

  // 除外キーワードリスト
  renderKeywordList('excludedKeywordList', excludedKeywords, 'excludedKeywords');
}

/**
 * キーワードリストをレンダリング
 */
function renderKeywordList(containerId, keywords, listName) {
  const container = document.getElementById(containerId);

  if (keywords.length === 0) {
    container.innerHTML = '<div class="keyword-empty">キーワードがありません</div>';
    return;
  }

  container.innerHTML = keywords.map(keyword => {
    const escaped = escapeHtmlKeyword(keyword);
    return '<div class="keyword-item">' +
      '<span class="keyword-item-text">' + escaped + '</span>' +
      '<button class="keyword-item-delete" data-keyword="' + escaped + '" data-list="' + listName + '" title="削除">×</button>' +
    '</div>';
  }).join('');

  // 削除ボタンイベント
  container.querySelectorAll('.keyword-item-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      removeKeywordFromList(btn.dataset.list, btn.dataset.keyword);
    });
  });
}

/**
 * HTMLエスケープ（キーワード用）
 */
function escapeHtmlKeyword(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * キーワードを追加
 */
async function addKeywordToList(listName, keyword) {
  if (!keyword || keyword.trim() === '') return;

  const data = await chrome.storage.local.get([listName]);
  const list = data[listName] || [];

  if (!list.map(k => k.toLowerCase()).includes(keyword.toLowerCase())) {
    list.push(keyword.trim());
    await chrome.storage.local.set({ [listName]: list });
    loadKeywordLists();
    showAlert('キーワードを追加しました', 'success');
  } else {
    showAlert('すでに登録されています', 'warning');
  }
}

/**
 * キーワードを削除
 */
async function removeKeywordFromList(listName, keyword) {
  const data = await chrome.storage.local.get([listName]);
  const list = data[listName] || [];
  const filtered = list.filter(k => k.toLowerCase() !== keyword.toLowerCase());
  await chrome.storage.local.set({ [listName]: filtered });
  loadKeywordLists();
}

/**
 * キーワードをエクスポート
 */
async function exportKeywords() {
  const data = await chrome.storage.local.get(['watchedKeywords', 'excludedKeywords']);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bunseki-keywords-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showAlert('キーワードをエクスポートしました', 'success');
}

/**
 * キーワードをインポート
 */
async function importKeywords(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (data.watchedKeywords || data.excludedKeywords) {
      await chrome.storage.local.set({
        watchedKeywords: data.watchedKeywords || [],
        excludedKeywords: data.excludedKeywords || []
      });
      loadKeywordLists();
      showAlert('キーワードをインポートしました', 'success');
    } else {
      showAlert('有効なキーワードファイルではありません', 'error');
    }
  } catch (e) {
    showAlert('ファイルの読み込みに失敗しました', 'error');
  }
}

/**
 * キーワードタブ切り替え
 */
function switchKeywordTab(tabName) {
  // タブボタン
  document.querySelectorAll('.keyword-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.keywordTab === tabName);
  });

  // セクション
  const watchedSection = document.getElementById('watchedKeywordsSection');
  const excludedSection = document.getElementById('excludedKeywordsSection');
  
  if (tabName === 'watched') {
    watchedSection.style.display = 'block';
    watchedSection.classList.add('active');
    excludedSection.style.display = 'none';
    excludedSection.classList.remove('active');
  } else {
    watchedSection.style.display = 'none';
    watchedSection.classList.remove('active');
    excludedSection.style.display = 'block';
    excludedSection.classList.add('active');
  }
}

/**
 * キーワードUI初期化
 */
function initKeywordUI() {
  // キーワードボタン
  const keywordBtn = document.getElementById('keywordBtn');
  if (keywordBtn) {
    keywordBtn.addEventListener('click', openKeywordModal);
  }

  // モーダル閉じるボタン
  const closeBtn = document.getElementById('closeKeywordModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeKeywordModal);
  }

  // タブ切り替え
  document.querySelectorAll('.keyword-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchKeywordTab(tab.dataset.keywordTab);
    });
  });

  // 注目キーワード追加
  const addWatchedBtn = document.getElementById('addWatchedKeywordBtn');
  const watchedInput = document.getElementById('watchedKeywordInput');
  if (addWatchedBtn && watchedInput) {
    addWatchedBtn.addEventListener('click', () => {
      addKeywordToList('watchedKeywords', watchedInput.value);
      watchedInput.value = '';
    });
    watchedInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addKeywordToList('watchedKeywords', watchedInput.value);
        watchedInput.value = '';
      }
    });
  }

  // 除外キーワード追加
  const addExcludedBtn = document.getElementById('addExcludedKeywordBtn');
  const excludedInput = document.getElementById('excludedKeywordInput');
  if (addExcludedBtn && excludedInput) {
    addExcludedBtn.addEventListener('click', () => {
      addKeywordToList('excludedKeywords', excludedInput.value);
      excludedInput.value = '';
    });
    excludedInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addKeywordToList('excludedKeywords', excludedInput.value);
        excludedInput.value = '';
      }
    });
  }

  // エクスポート
  const exportBtn = document.getElementById('exportKeywordsBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportKeywords);
  }

  // インポート
  const importBtn = document.getElementById('importKeywordsBtn');
  const importFile = document.getElementById('keywordImportFile');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        importKeywords(e.target.files[0]);
        e.target.value = '';
      }
    });
  }

  // モーダル外クリックで閉じる
  const modal = document.getElementById('keywordModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeKeywordModal();
      }
    });
  }
}

// グローバルエクスポート
window.openKeywordModal = openKeywordModal;

// DOMContentLoaded時にキーワードUIを初期化
document.addEventListener('DOMContentLoaded', () => {
  initKeywordUI();
});
