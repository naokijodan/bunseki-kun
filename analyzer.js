/**
 * eBay分析ロジック
 * ぶんせき君 v2.1.2 - 統合版
 */

// ========================================
// カテゴリ階層構造（大分類 → 細分類）
// ========================================
const CATEGORY_HIERARCHY = {
  '時計': {
    subcategories: ['腕時計', '懐中時計', 'スマートウォッチ', '時計アクセサリー'],
    keywords: ['watch', 'wristwatch', 'timepiece', 'clock', 'chronograph']
  },
  'アクセサリー': {
    subcategories: ['ネックレス', 'ブレスレット', 'リング', 'ピアス・イヤリング', 'ブローチ', 'アンクレット', 'カフス', 'その他アクセサリー'],
    keywords: ['jewelry', 'jewellery', 'necklace', 'bracelet', 'ring', 'earring', 'brooch', 'pendant', 'charm', 'anklet', 'cufflink']
  },
  'バッグ': {
    subcategories: ['ハンドバッグ', 'ショルダーバッグ', 'トートバッグ', 'リュック', 'クラッチ', 'ボストンバッグ', 'その他バッグ'],
    keywords: ['bag', 'handbag', 'shoulder', 'tote', 'backpack', 'clutch', 'crossbody', 'satchel', 'hobo']
  },
  '財布・小物': {
    subcategories: ['長財布', '二つ折り財布', 'コインケース', 'カードケース', 'キーケース', 'その他小物'],
    keywords: ['wallet', 'purse', 'coin', 'card case', 'key case', 'money clip']
  },
  'アウター': {
    subcategories: ['コート', 'ジャケット', 'ベスト', 'ダウン', 'ブルゾン', 'その他アウター'],
    keywords: ['coat', 'jacket', 'vest', 'blazer', 'down', 'outerwear', 'parka', 'bomber']
  },
  '衣類': {
    subcategories: ['トップス', 'ボトムス', 'ワンピース', 'スーツ', 'その他衣類'],
    keywords: ['shirt', 'top', 'pants', 'dress', 'skirt', 'clothing', 'sweater', 'blouse']
  },
  '靴': {
    subcategories: ['スニーカー', 'ブーツ', 'パンプス', 'ローファー', 'サンダル', 'その他靴'],
    keywords: ['shoes', 'sneaker', 'boot', 'pump', 'loafer', 'sandal', 'heel', 'oxford']
  },
  'スカーフ・マフラー': {
    subcategories: ['シルクスカーフ', 'マフラー', 'ストール', 'バンダナ', 'その他スカーフ'],
    keywords: ['scarf', 'muffler', 'stole', 'shawl', 'bandana', 'wrap', 'twilly']
  },
  '帽子': {
    subcategories: ['キャップ', 'ハット', 'ニット帽', 'ベレー帽', 'その他帽子'],
    keywords: ['hat', 'cap', 'beanie', 'beret', 'fedora', 'bucket']
  },
  '手袋': {
    subcategories: ['革手袋', 'ニット手袋', 'その他手袋'],
    keywords: ['glove', 'mitten']
  },
  'ベルト': {
    subcategories: ['レザーベルト', 'その他ベルト'],
    keywords: ['belt']
  },
  'ネクタイ': {
    subcategories: ['ネクタイ', '蝶ネクタイ', 'その他'],
    keywords: ['tie', 'necktie', 'bow tie']
  },
  'サングラス・メガネ': {
    subcategories: ['サングラス', 'メガネ', 'その他'],
    keywords: ['sunglasses', 'eyeglasses', 'glasses']
  },
  'フィギュア・おもちゃ': {
    subcategories: ['フィギュア', 'プラモデル', 'ぬいぐるみ', 'ミニカー', 'その他おもちゃ'],
    keywords: ['figure', 'figurine', 'toy', 'model', 'plush', 'doll', 'action figure']
  },
  'トレカ・ゲーム': {
    subcategories: ['ポケモンカード', '遊戯王', 'スポーツカード', 'ゲームソフト', 'その他'],
    keywords: ['card', 'trading card', 'pokemon', 'game', 'tcg']
  },
  'インテリア・雑貨': {
    subcategories: ['食器', 'スノードーム', '花瓶', 'プレート', 'その他雑貨'],
    keywords: ['decor', 'plate', 'vase', 'snow globe', 'ornament', 'home']
  },
  'その他': {
    subcategories: ['その他'],
    keywords: []
  }
};

// 細分類 → 大分類のマッピング（自動生成）
const SUBCATEGORY_TO_MAIN = {};
for (const [mainCat, data] of Object.entries(CATEGORY_HIERARCHY)) {
  for (const subCat of data.subcategories) {
    SUBCATEGORY_TO_MAIN[subCat] = mainCat;
  }
}

// カテゴリ正規化マッピング（英語eBayカテゴリ/日本語 → {main, sub}）
const CATEGORY_MAPPING = {
  // 時計関連
  'wristwatches': { main: '時計', sub: '腕時計' },
  'watches': { main: '時計', sub: '腕時計' },
  'watch': { main: '時計', sub: '腕時計' },
  '時計': { main: '時計', sub: '腕時計' },
  '腕時計': { main: '時計', sub: '腕時計' },
  'pocket watches': { main: '時計', sub: '懐中時計' },
  '懐中時計': { main: '時計', sub: '懐中時計' },
  'smart watches': { main: '時計', sub: 'スマートウォッチ' },
  'smartwatches': { main: '時計', sub: 'スマートウォッチ' },
  'スマートウォッチ': { main: '時計', sub: 'スマートウォッチ' },
  'watch accessories': { main: '時計', sub: '時計アクセサリー' },

  // アクセサリー関連
  'jewelry': { main: 'アクセサリー', sub: 'その他アクセサリー' },
  'jewellery': { main: 'アクセサリー', sub: 'その他アクセサリー' },
  'fine jewelry': { main: 'アクセサリー', sub: 'その他アクセサリー' },
  'fashion jewelry': { main: 'アクセサリー', sub: 'その他アクセサリー' },
  'アクセサリー': { main: 'アクセサリー', sub: 'その他アクセサリー' },
  'necklaces & pendants': { main: 'アクセサリー', sub: 'ネックレス' },
  'necklace': { main: 'アクセサリー', sub: 'ネックレス' },
  'ネックレス': { main: 'アクセサリー', sub: 'ネックレス' },
  'pendants': { main: 'アクセサリー', sub: 'ネックレス' },
  'bracelets': { main: 'アクセサリー', sub: 'ブレスレット' },
  'bracelet': { main: 'アクセサリー', sub: 'ブレスレット' },
  'ブレスレット': { main: 'アクセサリー', sub: 'ブレスレット' },
  'charms & charm bracelets': { main: 'アクセサリー', sub: 'ブレスレット' },
  'rings': { main: 'アクセサリー', sub: 'リング' },
  'ring': { main: 'アクセサリー', sub: 'リング' },
  'リング': { main: 'アクセサリー', sub: 'リング' },
  '指輪': { main: 'アクセサリー', sub: 'リング' },
  'earrings': { main: 'アクセサリー', sub: 'ピアス・イヤリング' },
  'earring': { main: 'アクセサリー', sub: 'ピアス・イヤリング' },
  'ピアス': { main: 'アクセサリー', sub: 'ピアス・イヤリング' },
  'イヤリング': { main: 'アクセサリー', sub: 'ピアス・イヤリング' },
  'ピアス・イヤリング': { main: 'アクセサリー', sub: 'ピアス・イヤリング' },
  'brooches & pins': { main: 'アクセサリー', sub: 'ブローチ' },
  'brooch': { main: 'アクセサリー', sub: 'ブローチ' },
  'ブローチ': { main: 'アクセサリー', sub: 'ブローチ' },
  'anklets': { main: 'アクセサリー', sub: 'アンクレット' },
  'cufflinks': { main: 'アクセサリー', sub: 'カフス' },
  'body jewelry': { main: 'アクセサリー', sub: 'その他アクセサリー' },

  // バッグ関連
  'handbags': { main: 'バッグ', sub: 'ハンドバッグ' },
  'handbag': { main: 'バッグ', sub: 'ハンドバッグ' },
  'ハンドバッグ': { main: 'バッグ', sub: 'ハンドバッグ' },
  'shoulder bags': { main: 'バッグ', sub: 'ショルダーバッグ' },
  'ショルダーバッグ': { main: 'バッグ', sub: 'ショルダーバッグ' },
  'crossbody bags': { main: 'バッグ', sub: 'ショルダーバッグ' },
  'tote bags': { main: 'バッグ', sub: 'トートバッグ' },
  'tote': { main: 'バッグ', sub: 'トートバッグ' },
  'トートバッグ': { main: 'バッグ', sub: 'トートバッグ' },
  'backpacks': { main: 'バッグ', sub: 'リュック' },
  'backpack': { main: 'バッグ', sub: 'リュック' },
  'リュック': { main: 'バッグ', sub: 'リュック' },
  'clutches': { main: 'バッグ', sub: 'クラッチ' },
  'clutch': { main: 'バッグ', sub: 'クラッチ' },
  'クラッチ': { main: 'バッグ', sub: 'クラッチ' },
  'bags': { main: 'バッグ', sub: 'その他バッグ' },
  'bag': { main: 'バッグ', sub: 'その他バッグ' },
  'バッグ': { main: 'バッグ', sub: 'その他バッグ' },

  // 財布・小物関連
  'wallets': { main: '財布・小物', sub: '長財布' },
  'wallet': { main: '財布・小物', sub: '長財布' },
  '財布': { main: '財布・小物', sub: '長財布' },
  '長財布': { main: '財布・小物', sub: '長財布' },
  '財布・小物': { main: '財布・小物', sub: 'その他小物' },
  'coin purse': { main: '財布・小物', sub: 'コインケース' },
  'コインケース': { main: '財布・小物', sub: 'コインケース' },
  'card case': { main: '財布・小物', sub: 'カードケース' },
  'card holder': { main: '財布・小物', sub: 'カードケース' },
  'カードケース': { main: '財布・小物', sub: 'カードケース' },
  'key case': { main: '財布・小物', sub: 'キーケース' },
  'キーケース': { main: '財布・小物', sub: 'キーケース' },

  // アウター関連
  'coats': { main: 'アウター', sub: 'コート' },
  'coat': { main: 'アウター', sub: 'コート' },
  'コート': { main: 'アウター', sub: 'コート' },
  'coats & jackets': { main: 'アウター', sub: 'コート' },
  'coats, jackets & vests': { main: 'アウター', sub: 'コート' },
  'jackets': { main: 'アウター', sub: 'ジャケット' },
  'jacket': { main: 'アウター', sub: 'ジャケット' },
  'ジャケット': { main: 'アウター', sub: 'ジャケット' },
  'blazer': { main: 'アウター', sub: 'ジャケット' },
  'vests': { main: 'アウター', sub: 'ベスト' },
  'vest': { main: 'アウター', sub: 'ベスト' },
  'ベスト': { main: 'アウター', sub: 'ベスト' },
  'down': { main: 'アウター', sub: 'ダウン' },
  'ダウン': { main: 'アウター', sub: 'ダウン' },
  'outerwear': { main: 'アウター', sub: 'その他アウター' },
  'アウター': { main: 'アウター', sub: 'その他アウター' },
  'activewear jackets': { main: 'アウター', sub: 'ジャケット' },

  // 衣類関連
  'tops': { main: '衣類', sub: 'トップス' },
  'トップス': { main: '衣類', sub: 'トップス' },
  'shirts': { main: '衣類', sub: 'トップス' },
  'shirt': { main: '衣類', sub: 'トップス' },
  'pants': { main: '衣類', sub: 'ボトムス' },
  'ボトムス': { main: '衣類', sub: 'ボトムス' },
  'jeans': { main: '衣類', sub: 'ボトムス' },
  'dresses': { main: '衣類', sub: 'ワンピース' },
  'dress': { main: '衣類', sub: 'ワンピース' },
  'ワンピース': { main: '衣類', sub: 'ワンピース' },
  'clothing': { main: '衣類', sub: 'その他衣類' },
  '衣類': { main: '衣類', sub: 'その他衣類' },
  "women's clothing": { main: '衣類', sub: 'その他衣類' },
  "men's clothing": { main: '衣類', sub: 'その他衣類' },

  // 靴関連
  'shoes': { main: '靴', sub: 'その他靴' },
  '靴': { main: '靴', sub: 'その他靴' },
  "women's shoes": { main: '靴', sub: 'その他靴' },
  "men's shoes": { main: '靴', sub: 'その他靴' },
  'sneakers': { main: '靴', sub: 'スニーカー' },
  'スニーカー': { main: '靴', sub: 'スニーカー' },
  'boots': { main: '靴', sub: 'ブーツ' },
  'ブーツ': { main: '靴', sub: 'ブーツ' },
  'pumps': { main: '靴', sub: 'パンプス' },
  'パンプス': { main: '靴', sub: 'パンプス' },
  'heels': { main: '靴', sub: 'パンプス' },
  'loafers': { main: '靴', sub: 'ローファー' },
  'ローファー': { main: '靴', sub: 'ローファー' },
  'sandals': { main: '靴', sub: 'サンダル' },
  'サンダル': { main: '靴', sub: 'サンダル' },

  // スカーフ・マフラー関連
  'scarves': { main: 'スカーフ・マフラー', sub: 'シルクスカーフ' },
  'scarf': { main: 'スカーフ・マフラー', sub: 'シルクスカーフ' },
  'スカーフ': { main: 'スカーフ・マフラー', sub: 'シルクスカーフ' },
  'scarves & wraps': { main: 'スカーフ・マフラー', sub: 'シルクスカーフ' },
  'スカーフ・マフラー': { main: 'スカーフ・マフラー', sub: 'シルクスカーフ' },
  'muffler': { main: 'スカーフ・マフラー', sub: 'マフラー' },
  'マフラー': { main: 'スカーフ・マフラー', sub: 'マフラー' },
  'stole': { main: 'スカーフ・マフラー', sub: 'ストール' },
  'ストール': { main: 'スカーフ・マフラー', sub: 'ストール' },
  'shawl': { main: 'スカーフ・マフラー', sub: 'ストール' },

  // 帽子関連
  'hats': { main: '帽子', sub: 'ハット' },
  'hat': { main: '帽子', sub: 'ハット' },
  '帽子': { main: '帽子', sub: 'ハット' },
  'caps': { main: '帽子', sub: 'キャップ' },
  'cap': { main: '帽子', sub: 'キャップ' },
  'キャップ': { main: '帽子', sub: 'キャップ' },
  'beanie': { main: '帽子', sub: 'ニット帽' },
  'ニット帽': { main: '帽子', sub: 'ニット帽' },
  'beret': { main: '帽子', sub: 'ベレー帽' },
  'ベレー帽': { main: '帽子', sub: 'ベレー帽' },

  // 手袋関連
  'gloves & mittens': { main: '手袋', sub: 'その他手袋' },
  'gloves': { main: '手袋', sub: 'その他手袋' },
  '手袋': { main: '手袋', sub: 'その他手袋' },

  // ベルト関連
  'belts': { main: 'ベルト', sub: 'レザーベルト' },
  'belt': { main: 'ベルト', sub: 'レザーベルト' },
  'ベルト': { main: 'ベルト', sub: 'レザーベルト' },

  // ネクタイ関連
  'ties': { main: 'ネクタイ', sub: 'ネクタイ' },
  'tie': { main: 'ネクタイ', sub: 'ネクタイ' },
  'necktie': { main: 'ネクタイ', sub: 'ネクタイ' },
  'ネクタイ': { main: 'ネクタイ', sub: 'ネクタイ' },
  'bow ties': { main: 'ネクタイ', sub: '蝶ネクタイ' },
  'bow tie': { main: 'ネクタイ', sub: '蝶ネクタイ' },
  '蝶ネクタイ': { main: 'ネクタイ', sub: '蝶ネクタイ' },

  // サングラス・メガネ関連
  'sunglasses': { main: 'サングラス・メガネ', sub: 'サングラス' },
  'サングラス': { main: 'サングラス・メガネ', sub: 'サングラス' },
  'eyeglasses': { main: 'サングラス・メガネ', sub: 'メガネ' },
  'メガネ': { main: 'サングラス・メガネ', sub: 'メガネ' },
  'glasses': { main: 'サングラス・メガネ', sub: 'メガネ' },

  // フィギュア・おもちゃ関連
  'figurines': { main: 'フィギュア・おもちゃ', sub: 'フィギュア' },
  'figures': { main: 'フィギュア・おもちゃ', sub: 'フィギュア' },
  'action figures': { main: 'フィギュア・おもちゃ', sub: 'フィギュア' },
  'フィギュア': { main: 'フィギュア・おもちゃ', sub: 'フィギュア' },
  'フィギュア・おもちゃ': { main: 'フィギュア・おもちゃ', sub: 'フィギュア' },
  'toys': { main: 'フィギュア・おもちゃ', sub: 'その他おもちゃ' },
  'toy': { main: 'フィギュア・おもちゃ', sub: 'その他おもちゃ' },
  'other animation merchandise': { main: 'フィギュア・おもちゃ', sub: 'その他おもちゃ' },
  'animation merchandise': { main: 'フィギュア・おもちゃ', sub: 'その他おもちゃ' },
  'plush': { main: 'フィギュア・おもちゃ', sub: 'ぬいぐるみ' },
  'ぬいぐるみ': { main: 'フィギュア・おもちゃ', sub: 'ぬいぐるみ' },
  'ぬいぐるみ・コレクション': { main: 'フィギュア・おもちゃ', sub: 'ぬいぐるみ' },

  // トレカ・ゲーム関連
  'trading cards': { main: 'トレカ・ゲーム', sub: 'その他' },
  'トレカ': { main: 'トレカ・ゲーム', sub: 'その他' },
  'sports cards': { main: 'トレカ・ゲーム', sub: 'スポーツカード' },
  'pokemon': { main: 'トレカ・ゲーム', sub: 'ポケモンカード' },
  'ポケモンカード': { main: 'トレカ・ゲーム', sub: 'ポケモンカード' },
  'ゲーム': { main: 'トレカ・ゲーム', sub: 'ゲームソフト' },

  // インテリア・雑貨関連
  'snow globes': { main: 'インテリア・雑貨', sub: 'スノードーム' },
  'スノードーム': { main: 'インテリア・雑貨', sub: 'スノードーム' },
  'plates': { main: 'インテリア・雑貨', sub: 'プレート' },
  'plate': { main: 'インテリア・雑貨', sub: 'プレート' },
  'プレート': { main: 'インテリア・雑貨', sub: 'プレート' },
  '食器': { main: 'インテリア・雑貨', sub: '食器' },
  'decorative collectibles': { main: 'インテリア・雑貨', sub: 'その他雑貨' },
  'home décor': { main: 'インテリア・雑貨', sub: 'その他雑貨' },
  'home decor': { main: 'インテリア・雑貨', sub: 'その他雑貨' },
  'インテリア・雑貨': { main: 'インテリア・雑貨', sub: 'その他雑貨' },
  'vase': { main: 'インテリア・雑貨', sub: '花瓶' },
  '花瓶': { main: 'インテリア・雑貨', sub: '花瓶' },

  // その他
  'collectibles': { main: 'その他', sub: 'その他' },
  'vintage': { main: 'その他', sub: 'その他' },
  'antiques': { main: 'その他', sub: 'その他' },
  'accessories': { main: 'その他', sub: 'その他' }
};

class EbayAnalyzer {
  constructor() {
    this.customBrandRules = {}; // AI学習したカスタムブランドルール
    this.reset();
  }

  /**
   * カテゴリを正規化（統一）- 階層構造対応
   * @param {string} category - 元のカテゴリ名
   * @returns {object} - { main: 大分類, sub: 細分類 }
   */
  normalizeCategory(category) {
    if (!category || category === '(不明)') {
      return { main: 'その他', sub: 'その他' };
    }

    const categoryLower = category.toLowerCase().trim();

    // 完全一致でマッピングをチェック
    if (CATEGORY_MAPPING[categoryLower]) {
      return CATEGORY_MAPPING[categoryLower];
    }

    // 日本語カテゴリもチェック
    if (CATEGORY_MAPPING[category]) {
      return CATEGORY_MAPPING[category];
    }

    // 部分一致でチェック（例: "Wristwatches, Parts & Accessories" → 時計）
    for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
      if (categoryLower.includes(key.toLowerCase())) {
        return value;
      }
    }

    // CATEGORY_HIERARCHYのキーワードでチェック
    for (const [mainCat, data] of Object.entries(CATEGORY_HIERARCHY)) {
      for (const keyword of data.keywords) {
        if (categoryLower.includes(keyword.toLowerCase())) {
          return { main: mainCat, sub: data.subcategories[data.subcategories.length - 1] }; // 「その他○○」
        }
      }
    }

    // マッチしない場合は「その他」
    return { main: 'その他', sub: 'その他' };
  }

  /**
   * 大分類のみ取得（互換性用）
   * @param {string} category - 元のカテゴリ名
   * @returns {string} - 大分類名
   */
  getMainCategory(category) {
    const normalized = this.normalizeCategory(category);
    return normalized.main;
  }

  /**
   * 細分類を取得
   * @param {string} category - 元のカテゴリ名
   * @returns {string} - 細分類名
   */
  getSubCategory(category) {
    const normalized = this.normalizeCategory(category);
    return normalized.sub;
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

      // カテゴリを正規化（英語eBayカテゴリ → 統一日本語カテゴリ）
      const normalizedCategory = this.normalizeCategory(category || '(不明)');

      items.push({
        title,
        startDate,
        watchers,
        price,
        categoryMain: normalizedCategory.main,  // 大分類
        categorySub: normalizedCategory.sub,    // 細分類
        category: normalizedCategory.main,      // 互換性のため大分類を保持
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
        // カテゴリを正規化（英語eBayカテゴリ → 統一日本語カテゴリ）
        const normalizedCategory = this.normalizeCategory(category || '(不明)');

        items.push({
          title,
          saleDate,
          soldFor,
          sku,
          quantity,
          brand,
          categoryMain: normalizedCategory.main,  // 大分類
          categorySub: normalizedCategory.sub,    // 細分類
          category: normalizedCategory.main       // 互換性のため大分類を保持
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
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    // 市場データを集計
    for (const item of marketData.items) {
      // 常にタイトルから再判定（item.brandは信頼しない）
      const brand = extractBrand(item.title);
      if (!brand || brand === '(不明)') continue;

      if (!marketBrands[brand]) {
        marketBrands[brand] = {
          count: 0,
          totalPrice: 0,
          sold: 0
        };
      }

      marketBrands[brand].count++;
      if (item.price) {
        marketBrands[brand].totalPrice += item.price;
      }
      if (item.sold) {
        marketBrands[brand].sold += item.sold;
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
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    const items = this.activeListings.filter(item => {
      // 常にタイトルから再判定（item.brandは信頼しない）
      const itemBrand = extractBrand(item.title);
      return itemBrand === brand && item.price > 0;
    });

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
    // AI分類結果を参照（popup.jsから設定される）
    const aiClassifications = window.aiClassificationResults || {};
    // extractBrandFromTitle関数を取得（popup.jsで定義してwindowに公開、なければthis.extractBrandを使用）
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    // カテゴリ抽出関数
    const extractCategory = (title) => this.extractCategoryFromTitle(title) || '(不明)';

    // 出品中のブランド集計
    for (const item of this.activeListings) {
      // 既存のbrand値を信頼せず、常にタイトルから再判定
      let brand;
      if (aiClassifications[item.title] && aiClassifications[item.title].brand) {
        brand = aiClassifications[item.title].brand;
      } else {
        brand = extractBrand(item.title);
      }
      const category = item.category || extractCategory(item.title);

      if (!brandStats[brand]) {
        brandStats[brand] = {
          brand,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          totalActivePrice: 0,
          avgDaysToSell: null,
          daysToSellList: [],
          categoryStats: {} // カテゴリ別内訳
        };
      }
      brandStats[brand].active++;
      brandStats[brand].totalWatchers += item.watchers || 0;
      brandStats[brand].totalActivePrice += item.price || 0;

      // カテゴリ別内訳を集計
      if (!brandStats[brand].categoryStats[category]) {
        brandStats[brand].categoryStats[category] = {
          category,
          active: 0,
          sold: 0,
          totalPrice: 0,
          revenue: 0
        };
      }
      brandStats[brand].categoryStats[category].active++;
      brandStats[brand].categoryStats[category].totalPrice += item.price || 0;
    }

    // 売れたブランド集計
    for (const item of this.soldItems) {
      // 既存のbrand値を信頼せず、常にタイトルから再判定
      let brand;
      if (aiClassifications[item.title] && aiClassifications[item.title].brand) {
        brand = aiClassifications[item.title].brand;
      } else {
        brand = extractBrand(item.title);
      }
      const category = item.category || extractCategory(item.title);

      if (!brandStats[brand]) {
        brandStats[brand] = {
          brand,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          totalActivePrice: 0,
          avgDaysToSell: null,
          daysToSellList: [],
          categoryStats: {}
        };
      }
      brandStats[brand].sold += item.quantity || 1;
      brandStats[brand].revenue += (item.soldFor || 0) * (item.quantity || 1);

      // カテゴリ別内訳を集計
      if (!brandStats[brand].categoryStats[category]) {
        brandStats[brand].categoryStats[category] = {
          category,
          active: 0,
          sold: 0,
          totalPrice: 0,
          revenue: 0
        };
      }
      brandStats[brand].categoryStats[category].sold += item.quantity || 1;
      brandStats[brand].categoryStats[category].revenue += (item.soldFor || 0) * (item.quantity || 1);
    }

    // 売上率と平均価格を計算してソート
    const performance = Object.values(brandStats)
      .map(stat => {
        // 平均価格: 出品中の平均価格（売却済みは売却価格/revenueで別計算）
        const avgPrice = stat.active > 0 ? stat.totalActivePrice / stat.active : 0;
        // 売却平均価格
        const avgSoldPrice = stat.sold > 0 ? stat.revenue / stat.sold : 0;

        // カテゴリ別内訳を配列に変換（件数順）
        const categories = Object.values(stat.categoryStats)
          .map(cat => ({
            ...cat,
            avgPrice: (cat.active + cat.sold) > 0
              ? (cat.totalPrice + cat.revenue) / (cat.active + cat.sold)
              : 0
          }))
          .sort((a, b) => (b.active + b.sold) - (a.active + a.sold));

        return {
          ...stat,
          sellThroughRate: stat.active + stat.sold > 0
            ? ((stat.sold / (stat.active + stat.sold)) * 100).toFixed(1)
            : 0,
          avgWatchers: stat.active > 0
            ? (stat.totalWatchers / stat.active).toFixed(1)
            : 0,
          avgPrice: avgPrice,
          avgSoldPrice: avgSoldPrice,
          categories: categories // カテゴリ内訳配列
        };
      })
      .sort((a, b) => (b.sold + b.active) - (a.sold + a.active));

    this.results.brandPerformance = performance;
    this.results.byBrand = brandStats;
  }

  /**
   * カテゴリ別分析（階層構造対応）
   * 大分類・細分類の両方で集計
   */
  calculateCategoryStats() {
    // 大分類の集計
    const mainCategoryStats = {};
    // 細分類の集計（大分類ごと）
    const subCategoryStats = {};

    // AI分類結果を参照（popup.jsから設定される）
    const aiClassifications = window.aiClassificationResults || {};

    // 出品中のカテゴリ集計
    for (const item of this.activeListings) {
      // itemに既にcategoryMain/categorySubがあればそれを使用
      let mainCat = item.categoryMain;
      let subCat = item.categorySub;

      // なければ正規化して取得
      if (!mainCat) {
        let category = item.category || '(不明)';
        if (aiClassifications[item.title] && aiClassifications[item.title].category) {
          category = aiClassifications[item.title].category;
        }
        const normalized = this.normalizeCategory(category);
        mainCat = normalized.main;
        subCat = normalized.sub;
      }

      // 大分類の集計
      if (!mainCategoryStats[mainCat]) {
        mainCategoryStats[mainCat] = {
          category: mainCat,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          subcategories: {}
        };
      }
      mainCategoryStats[mainCat].active++;
      mainCategoryStats[mainCat].totalWatchers += item.watchers || 0;

      // 細分類の集計
      if (!mainCategoryStats[mainCat].subcategories[subCat]) {
        mainCategoryStats[mainCat].subcategories[subCat] = {
          category: subCat,
          parentCategory: mainCat,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0
        };
      }
      mainCategoryStats[mainCat].subcategories[subCat].active++;
      mainCategoryStats[mainCat].subcategories[subCat].totalWatchers += item.watchers || 0;
    }

    // 販売済のカテゴリ集計
    for (const item of this.soldItems) {
      // itemに既にcategoryMain/categorySubがあればそれを使用
      let mainCat = item.categoryMain;
      let subCat = item.categorySub;

      // なければ正規化して取得
      if (!mainCat) {
        let category = item.category || '(不明)';
        if (aiClassifications[item.title] && aiClassifications[item.title].category) {
          category = aiClassifications[item.title].category;
        }
        const normalized = this.normalizeCategory(category);
        mainCat = normalized.main;
        subCat = normalized.sub;
      }

      // 大分類の集計
      if (!mainCategoryStats[mainCat]) {
        mainCategoryStats[mainCat] = {
          category: mainCat,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0,
          subcategories: {}
        };
      }
      mainCategoryStats[mainCat].sold += item.quantity || 1;
      mainCategoryStats[mainCat].revenue += (item.soldFor || 0) * (item.quantity || 1);

      // 細分類の集計
      if (!mainCategoryStats[mainCat].subcategories[subCat]) {
        mainCategoryStats[mainCat].subcategories[subCat] = {
          category: subCat,
          parentCategory: mainCat,
          active: 0,
          sold: 0,
          totalWatchers: 0,
          revenue: 0
        };
      }
      mainCategoryStats[mainCat].subcategories[subCat].sold += item.quantity || 1;
      mainCategoryStats[mainCat].subcategories[subCat].revenue += (item.soldFor || 0) * (item.quantity || 1);
    }

    // 各大分類のsubcategoriesを配列に変換してソート
    for (const mainCat of Object.values(mainCategoryStats)) {
      mainCat.subcategoriesArray = Object.values(mainCat.subcategories)
        .sort((a, b) => (b.active + b.sold) - (a.active + a.sold));
    }

    // 配列に変換してソート（大分類）
    this.results.categoryStats = Object.values(mainCategoryStats)
      .sort((a, b) => (b.active + b.sold) - (a.active + a.sold));

    // 互換性のため byCategory も設定（大分類のみ）
    this.results.byCategory = mainCategoryStats;

    // 階層構造のカテゴリデータ
    this.results.categoryHierarchy = mainCategoryStats;
  }

  /**
   * Watch数ランキング TOP10
   */
  calculateWatchRanking() {
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    const ranking = this.activeListings
      .filter(item => item.watchers > 0)
      .sort((a, b) => b.watchers - a.watchers)
      .slice(0, 10)
      .map((item, idx) => ({
        rank: idx + 1,
        title: item.title,
        watchers: item.watchers,
        price: item.price,
        // 常にタイトルから再判定（item.brandは信頼しない）
        brand: extractBrand(item.title)
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
   * AI分析用サマリーデータ（強化版）
   */
  getAISummary() {
    const last7days = this.results.listingPace.slice(-7);
    const prev7days = this.results.listingPace.slice(-14, -7);

    // 前週比計算
    const thisWeekListings = last7days.reduce((sum, p) => sum + p.listings, 0);
    const thisWeekSales = last7days.reduce((sum, p) => sum + p.sales, 0);
    const prevWeekListings = prev7days.reduce((sum, p) => sum + p.listings, 0);
    const prevWeekSales = prev7days.reduce((sum, p) => sum + p.sales, 0);

    const weekOverWeek = {
      listingsChange: prevWeekListings > 0 ? Math.round(((thisWeekListings - prevWeekListings) / prevWeekListings) * 100) : 0,
      salesChange: prevWeekSales > 0 ? Math.round(((thisWeekSales - prevWeekSales) / prevWeekSales) * 100) : 0
    };

    return {
      summary: this.results.summary,
      brandPerformance: this.results.brandPerformance.slice(0, 20),
      categoryStats: Object.values(this.results.byCategory).slice(0, 15),
      watchRanking: this.results.watchRanking,
      listingPace: {
        last7days: last7days,
        totalListings: thisWeekListings,
        totalSales: thisWeekSales
      },
      alerts: this.results.alerts,
      // 新規追加データ
      priceDistribution: this.getPriceDistribution(),
      staleItems: this.getStaleItems(),
      efficiencyMetrics: {
        avgSoldPrice: this.getAverageSoldPrice(),
        weekOverWeek: weekOverWeek
      }
    };
  }

  /**
   * 価格帯別パフォーマンスを計算
   */
  getPriceDistribution() {
    const ranges = [
      { min: 0, max: 50, active: 0, sold: 0 },
      { min: 51, max: 100, active: 0, sold: 0 },
      { min: 101, max: 200, active: 0, sold: 0 },
      { min: 201, max: 500, active: 0, sold: 0 },
      { min: 501, max: 99999, active: 0, sold: 0 }
    ];

    // 出品中の価格帯分布
    this.activeListings.forEach(item => {
      const price = item.price || 0;
      for (const range of ranges) {
        if (price >= range.min && price <= range.max) {
          range.active++;
          break;
        }
      }
    });

    // 販売済みの価格帯分布
    this.soldItems.forEach(item => {
      const price = item.soldFor || 0;
      for (const range of ranges) {
        if (price >= range.min && price <= range.max) {
          range.sold++;
          break;
        }
      }
    });

    // 売上率を計算
    return ranges.map(r => ({
      min: r.min,
      max: r.max === 99999 ? '500+' : r.max,
      active: r.active,
      sold: r.sold,
      sellThrough: (r.active + r.sold) > 0
        ? Math.round((r.sold / (r.active + r.sold)) * 100)
        : 0
    })).filter(r => r.active > 0 || r.sold > 0);
  }

  /**
   * 滞留在庫（30日以上未販売）を取得
   */
  getStaleItems() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.activeListings
      .filter(item => {
        if (!item.startDate) return false;
        return item.startDate < thirtyDaysAgo;
      })
      .map(item => {
        const daysListed = Math.floor((now - item.startDate) / (24 * 60 * 60 * 1000));
        return {
          title: item.title,
          price: item.price || 0,
          watchers: item.watchers || 0,
          daysListed: daysListed,
          brand: item.brand || '(不明)'
        };
      })
      .sort((a, b) => b.daysListed - a.daysListed)
      .slice(0, 20);
  }

  /**
   * 平均販売価格を計算
   */
  getAverageSoldPrice() {
    if (this.soldItems.length === 0) return 0;
    const total = this.soldItems.reduce((sum, item) => sum + (item.soldFor || 0), 0);
    return Math.round(total / this.soldItems.length);
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

  // ========================================
  // 市場データ分析機能
  // ========================================

  /**
   * IndexedDBから市場データを取得
   * @returns {Promise<Array>} 市場データ配列
   */
  async getMarketDataFromDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BunsekiKunDB', 3);

      request.onerror = () => reject(new Error('IndexedDB接続エラー'));

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('marketData')) {
          const store = db.createObjectStore('marketData', { keyPath: 'id', autoIncrement: true });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('titleLower', 'titleLower', { unique: true });
          store.createIndex('brand', 'brand', { unique: false });
          store.createIndex('capturedAt', 'capturedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const tx = db.transaction(['marketData'], 'readonly');
        const store = tx.objectStore('marketData');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          db.close();
          resolve(getAllRequest.result || []);
        };

        getAllRequest.onerror = () => {
          db.close();
          reject(new Error('市場データ取得エラー'));
        };
      };
    });
  }

  /**
   * 市場データにブランド・カテゴリを正規化して付与
   * @param {Array} marketItems - 市場データ配列
   * @param {boolean} forceReanalyze - trueの場合、既存のブランド・カテゴリを無視して再判定
   * @returns {Array} 正規化済み市場データ
   */
  normalizeMarketData(marketItems, forceReanalyze = false) {
    // popup.jsのdetectCategoryWithSubを使用（より精度の高い判定）
    const detectCatWithSub = (typeof window !== 'undefined' && typeof window.detectCategoryWithSub === 'function')
      ? window.detectCategoryWithSub
      : null;

    return marketItems.map(item => {
      // ブランド判定 - 常にタイトルから再判定（あり得ないブランドが上位に来る問題を防ぐ）
      let brand = this.extractBrand(item.title) || '(不明)';

      // カテゴリ判定 - popup.jsのdetectCategoryWithSubを優先使用
      let categoryMain, categorySub;
      if (detectCatWithSub) {
        const detected = detectCatWithSub(item.title);
        categoryMain = detected.main;
        categorySub = detected.sub;
      } else {
        // フォールバック: 従来のロジック
        let category = this.extractCategoryFromTitle(item.title);
        if (!category) {
          category = this.extractCategoryFromBrand(item.title);
        }
        const normalized = this.normalizeCategory(category || '(不明)');
        categoryMain = normalized.main;
        categorySub = normalized.sub;
      }

      return {
        ...item,
        brand,
        categoryMain,
        categorySub
      };
    });
  }

  /**
   * 市場データのブランドランキングを取得
   * @param {Array} marketItems - 市場データ配列（正規化済み）
   * @param {number} limit - 取得件数上限
   * @returns {Array} ブランドランキング
   */
  getMarketBrandRanking(marketItems, limit = 50) {
    const brandStats = {};
    // 価格帯の定義
    const priceRanges = [
      { label: '~$50', min: 0, max: 50 },
      { label: '$50-100', min: 50, max: 100 },
      { label: '$100-200', min: 100, max: 200 },
      { label: '$200-500', min: 200, max: 500 },
      { label: '$500-1000', min: 500, max: 1000 },
      { label: '$1000+', min: 1000, max: Infinity }
    ];
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    for (const item of marketItems) {
      // 常にタイトルから再判定（item.brandは信頼しない）
      const brand = extractBrand(item.title) || '(不明)';
      if (brand === '(不明)') continue;

      if (!brandStats[brand]) {
        brandStats[brand] = {
          brand,
          soldCount: 0,      // 売上数（sold）の合計
          listingCount: 0,   // 出品数（商品件数）
          totalPrice: 0,
          priceCount: 0,     // 価格が有効な件数（平均計算用）
          minPrice: Infinity,
          maxPrice: 0,
          categories: {},      // 大分類
          subcategories: {},   // 細分類
          priceDistribution: {} // 価格帯分布
        };
        // 価格帯を初期化
        priceRanges.forEach(r => {
          brandStats[brand].priceDistribution[r.label] = 0;
        });
      }

      // 売上数を加算（soldがなければ1として扱う）
      const sold = parseInt(item.sold) || 1;
      brandStats[brand].soldCount += sold;
      brandStats[brand].listingCount++;

      const price = parseFloat(item.price) || 0;
      if (price > 0) {
        brandStats[brand].totalPrice += price;
        brandStats[brand].priceCount++;
        brandStats[brand].minPrice = Math.min(brandStats[brand].minPrice, price);
        brandStats[brand].maxPrice = Math.max(brandStats[brand].maxPrice, price);

        // 価格帯に振り分け
        for (const range of priceRanges) {
          if (price >= range.min && price < range.max) {
            brandStats[brand].priceDistribution[range.label] += sold;
            break;
          }
        }
      }

      // ブランド内大分類集計（売上数ベース）
      const mainCat = item.categoryMain || 'その他';
      if (!brandStats[brand].categories[mainCat]) {
        brandStats[brand].categories[mainCat] = 0;
      }
      brandStats[brand].categories[mainCat] += sold;

      // ブランド内細分類集計（売上数・価格・価格帯分布）
      const subCat = item.categorySub || 'その他';
      if (!brandStats[brand].subcategories[subCat]) {
        brandStats[brand].subcategories[subCat] = {
          count: 0,
          totalPrice: 0,
          priceCount: 0,
          priceDistribution: {}
        };
        priceRanges.forEach(r => {
          brandStats[brand].subcategories[subCat].priceDistribution[r.label] = 0;
        });
      }
      brandStats[brand].subcategories[subCat].count += sold;
      if (price > 0) {
        brandStats[brand].subcategories[subCat].totalPrice += price;
        brandStats[brand].subcategories[subCat].priceCount++;
        // 細分類の価格帯分布
        for (const range of priceRanges) {
          if (price >= range.min && price < range.max) {
            brandStats[brand].subcategories[subCat].priceDistribution[range.label] += sold;
            break;
          }
        }
      }
    }

    // ランキング生成（売上数順）
    return Object.values(brandStats)
      .map(stat => {
        // 価格帯分布を配列に変換し、最も売れている価格帯を特定
        const priceDistArr = Object.entries(stat.priceDistribution)
          .map(([range, cnt]) => ({ range, count: cnt }))
          .sort((a, b) => b.count - a.count);
        const topPriceRange = priceDistArr.find(p => p.count > 0) || { range: '-', count: 0 };

        // 細分類データを整形（シェア、平均価格、売れ筋価格帯を含む）
        const subcategoriesArr = Object.entries(stat.subcategories)
          .filter(([cat]) => cat !== 'その他')
          .map(([cat, data]) => {
            const subPriceDistArr = Object.entries(data.priceDistribution)
              .map(([range, cnt]) => ({ range, count: cnt }))
              .sort((a, b) => b.count - a.count);
            const subTopPriceRange = subPriceDistArr.find(p => p.count > 0) || { range: '-', count: 0 };
            return {
              category: cat,
              count: data.count,
              share: stat.soldCount > 0 ? ((data.count / stat.soldCount) * 100).toFixed(1) : 0,
              avgPrice: data.priceCount > 0 ? Math.round(data.totalPrice / data.priceCount) : 0,
              topPriceRange: subTopPriceRange.range
            };
          })
          .sort((a, b) => b.count - a.count);

        return {
          brand: stat.brand,
          count: stat.soldCount,           // 売上数
          listingCount: stat.listingCount, // 出品数
          avgPrice: stat.priceCount > 0 ? Math.round(stat.totalPrice / stat.priceCount) : 0,
          minPrice: stat.minPrice === Infinity ? 0 : Math.round(stat.minPrice),
          maxPrice: Math.round(stat.maxPrice),
          share: 0, // 後で計算
          topCategories: Object.entries(stat.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([cat, cnt]) => ({ category: cat, count: cnt })),
          subcategories: subcategoriesArr,
          priceDistribution: priceDistArr,
          topPriceRange: topPriceRange.range
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, idx, arr) => {
        const totalCount = arr.reduce((sum, i) => sum + i.count, 0);
        return {
          ...item,
          rank: idx + 1,
          share: totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0
        };
      });
  }

  /**
   * 市場データのカテゴリランキングを取得
   * @param {Array} marketItems - 市場データ配列（正規化済み）
   * @param {number} limit - 取得件数上限
   * @returns {Array} カテゴリランキング
   */
  getMarketCategoryRanking(marketItems, limit = 30) {
    const categoryStats = {};
    // 価格帯の定義
    const priceRanges = [
      { label: '~$50', min: 0, max: 50 },
      { label: '$50-100', min: 50, max: 100 },
      { label: '$100-200', min: 100, max: 200 },
      { label: '$200-500', min: 200, max: 500 },
      { label: '$500-1000', min: 500, max: 1000 },
      { label: '$1000+', min: 1000, max: Infinity }
    ];
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    for (const item of marketItems) {
      const mainCat = item.categoryMain || 'その他';

      if (!categoryStats[mainCat]) {
        categoryStats[mainCat] = {
          category: mainCat,
          soldCount: 0,      // 売上数の合計
          listingCount: 0,   // 出品数
          totalPrice: 0,
          priceCount: 0,
          brands: {},
          subcategories: {},
          priceDistribution: {}
        };
        // 価格帯を初期化
        priceRanges.forEach(r => {
          categoryStats[mainCat].priceDistribution[r.label] = 0;
        });
      }

      // 売上数を加算（soldがなければ1として扱う）
      const sold = parseInt(item.sold) || 1;
      categoryStats[mainCat].soldCount += sold;
      categoryStats[mainCat].listingCount++;

      const price = parseFloat(item.price) || 0;
      if (price > 0) {
        categoryStats[mainCat].totalPrice += price;
        categoryStats[mainCat].priceCount++;

        // 価格帯に振り分け
        for (const range of priceRanges) {
          if (price >= range.min && price < range.max) {
            categoryStats[mainCat].priceDistribution[range.label] += sold;
            break;
          }
        }
      }

      // カテゴリ内ブランド集計（売上数ベース）- 常にタイトルから再判定
      const brand = extractBrand(item.title) || '(不明)';
      if (brand !== '(不明)') {
        if (!categoryStats[mainCat].brands[brand]) {
          categoryStats[mainCat].brands[brand] = 0;
        }
        categoryStats[mainCat].brands[brand] += sold;
      }

      // 細分類集計（売上数・価格・価格帯分布）
      const subCat = item.categorySub || 'その他';
      if (!categoryStats[mainCat].subcategories[subCat]) {
        categoryStats[mainCat].subcategories[subCat] = {
          count: 0,
          totalPrice: 0,
          priceCount: 0,
          priceDistribution: {}
        };
        priceRanges.forEach(r => {
          categoryStats[mainCat].subcategories[subCat].priceDistribution[r.label] = 0;
        });
      }
      categoryStats[mainCat].subcategories[subCat].count += sold;
      if (price > 0) {
        categoryStats[mainCat].subcategories[subCat].totalPrice += price;
        categoryStats[mainCat].subcategories[subCat].priceCount++;
        // 細分類の価格帯分布
        for (const range of priceRanges) {
          if (price >= range.min && price < range.max) {
            categoryStats[mainCat].subcategories[subCat].priceDistribution[range.label] += sold;
            break;
          }
        }
      }
    }

    // ランキング生成（売上数順）- 未分類/その他を除外
    const filteredStats = Object.values(categoryStats)
      .filter(stat => stat.category !== 'その他' && stat.category !== '(不明)' && stat.category !== '(未分類)');
    const totalSold = filteredStats.reduce((sum, s) => sum + s.soldCount, 0);
    return filteredStats
      .map(stat => {
        // 価格帯分布を配列に変換し、最も売れている価格帯を特定
        const priceDistArr = Object.entries(stat.priceDistribution)
          .map(([range, cnt]) => ({ range, count: cnt }))
          .sort((a, b) => b.count - a.count);
        const topPriceRange = priceDistArr.find(p => p.count > 0) || { range: '-', count: 0 };

        // 細分類データを整形（シェア、平均価格、売れ筋価格帯を含む）
        const subcategoriesArr = Object.entries(stat.subcategories)
          .map(([sub, data]) => {
            const subPriceDistArr = Object.entries(data.priceDistribution)
              .map(([range, cnt]) => ({ range, count: cnt }))
              .sort((a, b) => b.count - a.count);
            const subTopPriceRange = subPriceDistArr.find(p => p.count > 0) || { range: '-', count: 0 };
            return {
              subcategory: sub,
              count: data.count,
              share: stat.soldCount > 0 ? ((data.count / stat.soldCount) * 100).toFixed(1) : 0,
              avgPrice: data.priceCount > 0 ? Math.round(data.totalPrice / data.priceCount) : 0,
              topPriceRange: subTopPriceRange.range
            };
          })
          .sort((a, b) => b.count - a.count);

        return {
          category: stat.category,
          count: stat.soldCount,           // 売上数
          listingCount: stat.listingCount, // 出品数
          avgPrice: stat.priceCount > 0 ? Math.round(stat.totalPrice / stat.priceCount) : 0,
          share: totalSold > 0 ? ((stat.soldCount / totalSold) * 100).toFixed(1) : 0,
          topBrands: Object.entries(stat.brands)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([brand, cnt]) => ({ brand, count: cnt })),
          subcategories: subcategoriesArr,
          priceDistribution: priceDistArr,
          topPriceRange: topPriceRange.range
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item, idx) => ({
        ...item,
        rank: idx + 1
      }));
  }

  /**
   * ブランド別カテゴリランキングを取得
   * （各ブランド内で売れているカテゴリの順位）
   * @param {Array} marketItems - 市場データ配列（正規化済み）
   * @param {number} brandLimit - ブランド数上限
   * @returns {Array} ブランド別カテゴリランキング
   */
  getMarketBrandCategoryRanking(marketItems, brandLimit = 20) {
    const brandCategoryStats = {};
    // 価格帯の定義
    const priceRanges = [
      { label: '~$50', min: 0, max: 50 },
      { label: '$50-100', min: 50, max: 100 },
      { label: '$100-200', min: 100, max: 200 },
      { label: '$200-500', min: 200, max: 500 },
      { label: '$500-1000', min: 500, max: 1000 },
      { label: '$1000+', min: 1000, max: Infinity }
    ];
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    for (const item of marketItems) {
      // 常にタイトルから再判定（item.brandは信頼しない）
      const brand = extractBrand(item.title) || '(不明)';
      if (brand === '(不明)') continue;

      // 細分類を使用（ブランド×カテゴリは細分類で表示）
      const subCat = item.categorySub || 'その他';

      // 売上数を取得（soldがなければ1として扱う）
      const sold = parseInt(item.sold) || 1;
      const price = parseFloat(item.price) || 0;

      if (!brandCategoryStats[brand]) {
        brandCategoryStats[brand] = {
          brand,
          totalCount: 0,
          categories: {}
        };
      }

      brandCategoryStats[brand].totalCount += sold;

      // 細分類で集計（価格・価格帯分布も含む）
      if (!brandCategoryStats[brand].categories[subCat]) {
        brandCategoryStats[brand].categories[subCat] = {
          category: subCat,
          count: 0,
          totalPrice: 0,
          priceCount: 0,
          priceDistribution: {}
        };
        priceRanges.forEach(r => {
          brandCategoryStats[brand].categories[subCat].priceDistribution[r.label] = 0;
        });
      }
      brandCategoryStats[brand].categories[subCat].count += sold;
      if (price > 0) {
        brandCategoryStats[brand].categories[subCat].totalPrice += price;
        brandCategoryStats[brand].categories[subCat].priceCount++;
        // 価格帯に振り分け
        for (const range of priceRanges) {
          if (price >= range.min && price < range.max) {
            brandCategoryStats[brand].categories[subCat].priceDistribution[range.label] += sold;
            break;
          }
        }
      }
    }

    // ランキング生成（売上数順）
    return Object.values(brandCategoryStats)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, brandLimit)
      .map((brandStat, idx) => ({
        rank: idx + 1,
        brand: brandStat.brand,
        totalCount: brandStat.totalCount,
        categoryRanking: Object.values(brandStat.categories)
          .map(cat => {
            // 価格帯分布を配列に変換し、最も売れている価格帯を特定
            const priceDistArr = Object.entries(cat.priceDistribution)
              .map(([range, cnt]) => ({ range, count: cnt }))
              .sort((a, b) => b.count - a.count);
            const topPriceRange = priceDistArr.find(p => p.count > 0) || { range: '-', count: 0 };

            return {
              category: cat.category,
              count: cat.count,
              share: brandStat.totalCount > 0
                ? ((cat.count / brandStat.totalCount) * 100).toFixed(1)
                : 0,
              avgPrice: cat.priceCount > 0 ? Math.round(cat.totalPrice / cat.priceCount) : 0,
              topPriceRange: topPriceRange.range,
              priceDistribution: priceDistArr
            };
          })
          .sort((a, b) => b.count - a.count)
      }));
  }

  /**
   * 自分の出品と市場データを比較
   * @param {Array} marketItems - 市場データ配列（正規化済み）
   * @returns {Object} 比較結果
   */
  compareWithMyListings(marketItems) {
    // 市場のブランドランキング
    const marketBrandRanking = this.getMarketBrandRanking(marketItems, 100);
    // 市場のカテゴリランキング
    const marketCategoryRanking = this.getMarketCategoryRanking(marketItems, 50);

    // 自分のブランド別データ
    const myBrandStats = this.results.byBrand || {};
    // 自分のカテゴリ別データ
    const myCategoryStats = this.results.byCategory || {};

    // ブランド比較
    const brandComparison = marketBrandRanking.map(marketBrand => {
      const myBrand = myBrandStats[marketBrand.brand] || { active: 0, sold: 0 };
      const myTotal = myBrand.active + (myBrand.sold || 0);

      // 充足度: 市場シェアに対して自分がどれだけ出品しているか
      // 市場で1%のシェア → 自分も1%程度あれば適正
      const myActiveTotal = this.activeListings?.length || 0;
      const myShare = myActiveTotal > 0 ? (myBrand.active / myActiveTotal) * 100 : 0;
      const marketShare = parseFloat(marketBrand.share) || 0;

      let status = 'adequate'; // 適正
      let statusIcon = '✅';
      if (myBrand.active === 0) {
        status = 'missing'; // 未出品
        statusIcon = '❌';
      } else if (myShare < marketShare * 0.5) {
        status = 'shortage'; // 不足
        statusIcon = '⚠️';
      } else if (myShare > marketShare * 2) {
        status = 'excess'; // 過剰
        statusIcon = '📈';
      }

      return {
        brand: marketBrand.brand,
        marketRank: marketBrand.rank,
        marketCount: marketBrand.count,
        marketShare: marketBrand.share,
        marketAvgPrice: marketBrand.avgPrice,
        myActive: myBrand.active,
        mySold: myBrand.sold || 0,
        myShare: myShare.toFixed(1),
        status,
        statusIcon,
        recommendation: this.getBrandRecommendation(status, marketBrand, myBrand)
      };
    });

    // カテゴリ比較
    const categoryComparison = marketCategoryRanking.map(marketCat => {
      const myCat = myCategoryStats[marketCat.category] || { active: 0, sold: 0 };
      const myActiveTotal = this.activeListings?.length || 0;
      const myShare = myActiveTotal > 0 ? (myCat.active / myActiveTotal) * 100 : 0;
      const marketShare = parseFloat(marketCat.share) || 0;

      let status = 'adequate';
      let statusIcon = '✅';
      if (myCat.active === 0) {
        status = 'missing';
        statusIcon = '❌';
      } else if (myShare < marketShare * 0.5) {
        status = 'shortage';
        statusIcon = '⚠️';
      } else if (myShare > marketShare * 2) {
        status = 'excess';
        statusIcon = '📈';
      }

      return {
        category: marketCat.category,
        marketRank: marketCat.rank,
        marketCount: marketCat.count,
        marketShare: marketCat.share,
        myActive: myCat.active || 0,
        mySold: myCat.sold || 0,
        myShare: myShare.toFixed(1),
        status,
        statusIcon
      };
    });

    // トレンド適合度スコア（0-100）
    const trendScore = this.calculateTrendScore(brandComparison, categoryComparison);

    // 仕入れ推奨
    const purchaseRecommendations = this.generatePurchaseRecommendations(
      brandComparison,
      categoryComparison,
      marketItems
    );

    return {
      brandComparison,
      categoryComparison,
      trendScore,
      purchaseRecommendations,
      summary: {
        totalMarketItems: marketItems.length,
        myActiveItems: this.activeListings?.length || 0,
        missingBrands: brandComparison.filter(b => b.status === 'missing').length,
        shortageBrands: brandComparison.filter(b => b.status === 'shortage').length,
        adequateBrands: brandComparison.filter(b => b.status === 'adequate').length
      }
    };
  }

  /**
   * ブランドの推奨アクションを生成
   */
  getBrandRecommendation(status, marketBrand, myBrand) {
    switch (status) {
      case 'missing':
        return `市場で${marketBrand.count}件売れている人気ブランド。仕入れを検討してください。`;
      case 'shortage':
        return `市場シェア${marketBrand.share}%に対し出品が少なめ。追加仕入れ推奨。`;
      case 'excess':
        return `市場シェア以上に出品中。価格競争力を確認してください。`;
      case 'adequate':
        return `適正な出品数です。継続して仕入れてください。`;
      default:
        return '';
    }
  }

  /**
   * トレンド適合度スコアを計算
   */
  calculateTrendScore(brandComparison, categoryComparison) {
    let score = 0;
    let weight = 0;

    // ブランド適合度（上位20ブランドで計算）
    const topBrands = brandComparison.slice(0, 20);
    for (const brand of topBrands) {
      const brandWeight = 21 - brand.marketRank; // 上位ほど重要
      weight += brandWeight;

      if (brand.status === 'adequate') {
        score += brandWeight * 1.0;
      } else if (brand.status === 'excess') {
        score += brandWeight * 0.8;
      } else if (brand.status === 'shortage') {
        score += brandWeight * 0.5;
      } else {
        score += brandWeight * 0.1;
      }
    }

    return weight > 0 ? Math.round((score / weight) * 100) : 0;
  }

  /**
   * 仕入れ推奨リストを生成
   */
  generatePurchaseRecommendations(brandComparison, categoryComparison, marketItems) {
    const recommendations = [];
    // extractBrandFromTitle関数を取得
    const extractBrand = (typeof window !== 'undefined' && typeof window.extractBrandFromTitle === 'function')
      ? window.extractBrandFromTitle
      : (typeof extractBrandFromTitle === 'function')
        ? extractBrandFromTitle
        : (title) => this.extractBrand(title) || '(不明)';

    // ブランド×カテゴリのマッピングを作成
    const brandCategoryMap = {};
    for (const item of marketItems) {
      // 常にタイトルから再判定（item.brandは信頼しない）
      const brand = extractBrand(item.title);
      if (!brand || brand === 'Unknown' || brand === '(不明)') continue;
      if (!brandCategoryMap[brand]) {
        brandCategoryMap[brand] = {};
      }
      const cat = item.category?.main || item.category || 'Other';
      brandCategoryMap[brand][cat] = (brandCategoryMap[brand][cat] || 0) + 1;
    }

    // ブランドのトップカテゴリを取得する関数
    const getTopCategories = (brandName) => {
      const catData = brandCategoryMap[brandName];
      if (!catData) return [];
      return Object.entries(catData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));
    };

    // 未出品の人気ブランドTOP5
    const missingBrands = brandComparison
      .filter(b => b.status === 'missing')
      .slice(0, 5);

    for (const brand of missingBrands) {
      const topCategories = getTopCategories(brand.brand);
      recommendations.push({
        type: 'brand',
        priority: 'high',
        name: brand.brand,
        reason: `市場ランキング${brand.marketRank}位、${brand.marketCount}件販売中`,
        avgPrice: brand.marketAvgPrice,
        action: '仕入れ開始推奨',
        topCategories: topCategories
      });
    }

    // 出品不足ブランドTOP5
    const shortageBrands = brandComparison
      .filter(b => b.status === 'shortage')
      .slice(0, 5);

    for (const brand of shortageBrands) {
      const topCategories = getTopCategories(brand.brand);
      recommendations.push({
        type: 'brand',
        priority: 'medium',
        name: brand.brand,
        reason: `市場シェア${brand.marketShare}%に対し、自分は${brand.myShare}%`,
        avgPrice: brand.marketAvgPrice,
        action: '追加仕入れ推奨',
        topCategories: topCategories
      });
    }

    // 未出品の人気カテゴリ
    const missingCategories = categoryComparison
      .filter(c => c.status === 'missing' && c.marketRank <= 10)
      .slice(0, 3);

    for (const cat of missingCategories) {
      recommendations.push({
        type: 'category',
        priority: 'medium',
        name: cat.category,
        reason: `市場ランキング${cat.marketRank}位、${cat.marketCount}件販売中`,
        action: 'カテゴリ参入検討',
        topCategories: []
      });
    }

    return recommendations;
  }

  /**
   * 市場データ分析のサマリーを取得（AI分析用）
   */
  async getMarketAnalysisSummary() {
    try {
      const marketItems = await this.getMarketDataFromDB();
      if (!marketItems || marketItems.length === 0) {
        return null;
      }

      const normalizedItems = this.normalizeMarketData(marketItems);
      const brandRanking = this.getMarketBrandRanking(normalizedItems, 20);
      const categoryRanking = this.getMarketCategoryRanking(normalizedItems, 15);
      const brandCategoryRanking = this.getMarketBrandCategoryRanking(normalizedItems, 10);
      const comparison = this.compareWithMyListings(normalizedItems);

      return {
        totalMarketItems: normalizedItems.length,
        brandRanking,
        categoryRanking,
        brandCategoryRanking,
        comparison,
        lastUpdated: marketItems[0]?.capturedAt || null
      };
    } catch (error) {
      console.error('市場データ分析エラー:', error);
      return null;
    }
  }
}

// グローバルインスタンス
const analyzer = new EbayAnalyzer();
