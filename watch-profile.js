/**
 * 時計プロファイル - eBay時計販売向け属性抽出
 * 中低価格帯（$800以下）を中心とした分析向け
 * 分析軸: ブランド → タイプ → ムーブメント → サイズ → デザイン
 */

(function() {
  'use strict';

  // ============================================
  // ブランド辞書（価格帯別）
  // ============================================
  const BRAND_DICTIONARY = {
    // 高級（$500-2000+）
    luxury: [
      'Omega', 'Tudor', 'TAG Heuer', 'Longines', 'Oris', 'Bell & Ross',
      'Breitling', 'IWC', 'Panerai', 'Zenith', 'Grand Seiko', 'Nomos'
    ],
    // 中〜高級（$200-800）
    midHigh: [
      'Seiko', 'Citizen', 'Tissot', 'Hamilton', 'Orient', 'Bulova',
      'Glycine', 'Mido', 'Certina', 'Frederique Constant', 'Alpina',
      'Victorinox', 'Luminox', 'Marathon'
    ],
    // エントリー〜中堅（$50-300）
    entry: [
      'Casio', 'Timex', 'Invicta', 'Fossil', 'Stuhrling', 'Seiko 5',
      'Orient Bambino', 'Vostok', 'Parnis', 'Pagani Design', 'San Martin',
      'Steeldive', 'Heimdallr', 'Sugess', 'Escapement Time'
    ],
    // ファッション（$30-200）
    fashion: [
      'Michael Kors', 'Skagen', 'Nixon', 'Guess', 'Armani Exchange',
      'MVMT', 'Daniel Wellington', 'Vincero', 'Tommy Hilfiger', 'Hugo Boss',
      'Lacoste', 'Diesel', 'Emporio Armani', 'Anne Klein', 'Kate Spade'
    ],
    // G-Shock/デジタル
    digital: [
      'G-Shock', 'Baby-G', 'Pro Trek', 'Garmin', 'Suunto', 'Polar',
      'Fitbit', 'Apple Watch', 'Samsung Galaxy Watch', 'Amazfit'
    ],
    // ヴィンテージ/コレクター
    vintage: [
      'Swatch', 'Raketa', 'Vostok', 'Pobeda', 'Slava', 'Poljot',
      'Waltham', 'Elgin', 'Gruen', 'Benrus', 'Wittnauer', 'Zodiac'
    ]
  };

  // ブランドの正規化マップ（表記ゆれ対応）
  // 注意: 短いイニシャル（dw, mk, ax, fc）は型番と誤認識するため削除
  const BRAND_ALIASES = {
    'tag heuer': 'TAG Heuer',
    'tagheuer': 'TAG Heuer',
    'grand seiko': 'Grand Seiko',
    'grandseiko': 'Grand Seiko',
    'g-shock': 'G-Shock',
    'gshock': 'G-Shock',
    'g shock': 'G-Shock',
    'baby-g': 'Baby-G',
    'babyg': 'Baby-G',
    'baby g': 'Baby-G',
    'pro trek': 'Pro Trek',
    'protrek': 'Pro Trek',
    'apple watch': 'Apple Watch',
    'applewatch': 'Apple Watch',
    'michael kors': 'Michael Kors',
    'michaelkors': 'Michael Kors',
    // 'mk' 削除: 型番と誤認識
    'daniel wellington': 'Daniel Wellington',
    // 'dw' 削除: Casio DW-5600などと誤認識
    'armani exchange': 'Armani Exchange',
    'a/x': 'Armani Exchange',
    // 'ax' 削除: 型番と誤認識
    'emporio armani': 'Emporio Armani',
    'anne klein': 'Anne Klein',
    'kate spade': 'Kate Spade',
    'tommy hilfiger': 'Tommy Hilfiger',
    'hugo boss': 'Hugo Boss',
    'bell & ross': 'Bell & Ross',
    'bell ross': 'Bell & Ross',
    'bell and ross': 'Bell & Ross',
    'frederique constant': 'Frederique Constant',
    // 'fc' 削除: 型番と誤認識
    'orient bambino': 'Orient Bambino',
    'seiko 5': 'Seiko 5',
    'seiko5': 'Seiko 5',
    'pagani design': 'Pagani Design',
    'san martin': 'San Martin',
    'sanmartin': 'San Martin',
    'samsung galaxy watch': 'Samsung Galaxy Watch',
    'galaxy watch': 'Samsung Galaxy Watch'
  };

  // ============================================
  // タイプ辞書（見た目ベース）
  // ============================================
  const TYPE_DICTIONARY = {
    diver: {
      name: 'Diver',
      nameJp: 'ダイバー',
      keywords: [
        'diver', 'diving', 'dive watch', 'submariner', 'sub',
        'aqua', 'ocean', 'sea', 'marine', 'neptune',
        'turtle', 'samurai', 'monster', 'tuna', 'sumo',
        'skx', 'srpd', 'srpe', 'prospex', 'hydroconquest',
        'pelagos', 'seamaster', 'aquaracer', 'superocean',
        '200m', '300m', 'water resistant', 'rotating bezel'
      ]
    },
    chronograph: {
      name: 'Chronograph',
      nameJp: 'クロノグラフ',
      keywords: [
        'chronograph', 'chrono', 'stopwatch', 'tachymeter',
        'speedmaster', 'daytona', 'navitimer', 'carrera',
        'subdial', 'sub-dial', 'pushers', 'racing'
      ]
    },
    dress: {
      name: 'Dress',
      nameJp: 'ドレス',
      keywords: [
        'dress', 'formal', 'elegant', 'classic', 'thin',
        'slim', 'minimalist', 'simple', 'cocktail',
        'bambino', 'presage', 'visodate', 'le locle',
        'master', 'patrimony', 'calatrava'
      ]
    },
    field: {
      name: 'Field/Military',
      nameJp: 'フィールド/ミリタリー',
      keywords: [
        'field', 'military', 'army', 'tactical', 'combat',
        'pilot', 'flieger', 'aviator', 'aviation', 'flight',
        'khaki', 'expedition', 'ranger', 'scout',
        'nato', 'canvas'
      ]
    },
    digital: {
      name: 'Digital',
      nameJp: 'デジタル',
      keywords: [
        'digital', 'lcd', 'led', 'g-shock', 'gshock',
        'baby-g', 'pro trek', 'databank', 'calculator',
        'casio f-91', 'ae-1200', 'dw-5600', 'ga-100',
        'square', 'module'
      ]
    },
    smartwatch: {
      name: 'Smart Watch',
      nameJp: 'スマートウォッチ',
      keywords: [
        'smart watch', 'smartwatch', 'fitness', 'tracker',
        'apple watch', 'galaxy watch', 'garmin', 'fitbit',
        'amazfit', 'huawei watch', 'wear os', 'watchos',
        'heart rate', 'gps', 'bluetooth'
      ]
    },
    sports: {
      name: 'Sports',
      nameJp: 'スポーツ',
      keywords: [
        'sport', 'sports', 'athletic', 'active', 'outdoor',
        'running', 'training', 'workout', 'gym',
        'rubber', 'silicone', 'resin'
      ]
    },
    fashion: {
      name: 'Fashion',
      nameJp: 'ファッション',
      keywords: [
        'fashion', 'designer', 'trendy', 'style', 'casual',
        'everyday', 'lifestyle', 'modern'
      ]
    }
  };

  // ============================================
  // ムーブメント辞書
  // ============================================
  const MOVEMENT_DICTIONARY = {
    automatic: {
      name: 'Automatic',
      nameJp: '自動巻き',
      keywords: [
        'automatic', 'auto', 'self-winding', 'self winding',
        'nh35', 'nh36', '4r35', '4r36', '6r15', '6r35',
        'miyota 8215', 'miyota 9015', 'sw200', 'eta 2824',
        'caliber', 'calibre', 'movement', 'rotor',
        '21 jewels', '23 jewels', '24 jewels'
      ]
    },
    mechanical: {
      name: 'Mechanical',
      nameJp: '手巻き',
      keywords: [
        'mechanical', 'manual', 'hand-winding', 'hand winding',
        'hand wound', 'manual wind'
      ]
    },
    quartz: {
      name: 'Quartz',
      nameJp: 'クォーツ',
      keywords: [
        'quartz', 'battery', 'vx42', 'vx43', 'vd57',
        'ronda', 'eta quartz', 'miyota quartz'
      ]
    },
    solar: {
      name: 'Solar',
      nameJp: 'ソーラー',
      keywords: [
        'solar', 'eco-drive', 'eco drive', 'ecodrive',
        'light powered', 'solar powered', 'tough solar'
      ]
    },
    kinetic: {
      name: 'Kinetic',
      nameJp: 'キネティック',
      keywords: [
        'kinetic', 'autoquartz', 'auto quartz', 'spring drive'
      ]
    }
  };

  // ============================================
  // サイズ辞書（Men's/Women's/Boys）
  // ============================================
  const SIZE_DICTIONARY = {
    mens: {
      name: "Men's",
      nameJp: 'メンズ',
      keywords: [
        'men', 'mens', "men's", 'male', 'gentleman', 'gents',
        'large', 'big', 'oversized', '44mm', '45mm', '46mm',
        '47mm', '48mm', '50mm'
      ],
      sizeRange: { min: 40, typical: 42 }
    },
    womens: {
      name: "Women's",
      nameJp: 'レディース',
      keywords: [
        'women', 'womens', "women's", 'ladies', 'lady', 'female',
        'petite', 'small', 'mini', '26mm', '28mm', '30mm',
        '32mm', '34mm'
      ],
      sizeRange: { max: 36, typical: 32 }
    },
    boys: {
      name: 'Boys/Unisex',
      nameJp: 'ボーイズ/ユニセックス',
      keywords: [
        'boys', 'boy', 'unisex', 'midsize', 'mid-size', 'medium',
        '36mm', '37mm', '38mm', '39mm'
      ],
      sizeRange: { min: 36, max: 39, typical: 38 }
    }
  };

  // ============================================
  // デザイン辞書（色・バンド）
  // ============================================
  const DIAL_COLOR_DICTIONARY = {
    black: { name: 'Black', nameJp: '黒', keywords: ['black', 'noir', 'schwarz', 'nero'] },
    blue: { name: 'Blue', nameJp: '青', keywords: ['blue', 'navy', 'midnight', 'azure', 'bleu'] },
    white: { name: 'White', nameJp: '白', keywords: ['white', 'cream', 'ivory', 'silver white'] },
    silver: { name: 'Silver', nameJp: 'シルバー', keywords: ['silver', 'grey', 'gray', 'sunburst'] },
    green: { name: 'Green', nameJp: '緑', keywords: ['green', 'olive', 'emerald', 'teal'] },
    gold: { name: 'Gold', nameJp: 'ゴールド', keywords: ['gold', 'champagne', 'yellow', 'golden'] },
    rose: { name: 'Rose Gold', nameJp: 'ローズゴールド', keywords: ['rose', 'rose gold', 'pink gold', 'salmon'] },
    brown: { name: 'Brown', nameJp: '茶', keywords: ['brown', 'bronze', 'chocolate', 'tan'] },
    red: { name: 'Red', nameJp: '赤', keywords: ['red', 'burgundy', 'maroon'] },
    orange: { name: 'Orange', nameJp: 'オレンジ', keywords: ['orange'] },
    mop: { name: 'Mother of Pearl', nameJp: 'マザーオブパール', keywords: ['mother of pearl', 'mop', 'pearl'] }
  };

  const BAND_TYPE_DICTIONARY = {
    metal: { name: 'Metal Bracelet', nameJp: 'メタルブレス', keywords: ['bracelet', 'steel', 'stainless', 'metal', 'oyster', 'jubilee', 'president', 'link'] },
    leather: { name: 'Leather', nameJp: 'レザー', keywords: ['leather', 'strap', 'alligator', 'crocodile', 'calf', 'suede'] },
    rubber: { name: 'Rubber/Silicone', nameJp: 'ラバー', keywords: ['rubber', 'silicone', 'resin', 'polyurethane'] },
    nato: { name: 'NATO/Fabric', nameJp: 'NATO/ファブリック', keywords: ['nato', 'nylon', 'canvas', 'fabric', 'perlon', 'zulu'] },
    mesh: { name: 'Mesh', nameJp: 'メッシュ', keywords: ['mesh', 'milanese', 'shark mesh'] }
  };

  // ============================================
  // 抽出関数
  // ============================================

  /**
   * ブランドを抽出
   */
  function extractBrand(title) {
    const lowerTitle = title.toLowerCase();

    // エイリアスチェック
    for (const [alias, brand] of Object.entries(BRAND_ALIASES)) {
      if (lowerTitle.includes(alias)) {
        return brand;
      }
    }

    // カテゴリ別にブランドチェック
    for (const category of Object.values(BRAND_DICTIONARY)) {
      for (const brand of category) {
        if (lowerTitle.includes(brand.toLowerCase())) {
          return brand;
        }
      }
    }

    return null;
  }

  /**
   * タイプを抽出
   */
  function extractType(title) {
    const lowerTitle = title.toLowerCase();

    for (const [key, typeInfo] of Object.entries(TYPE_DICTIONARY)) {
      for (const keyword of typeInfo.keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return { key, name: typeInfo.name, nameJp: typeInfo.nameJp };
        }
      }
    }

    return null;
  }

  /**
   * ムーブメントを抽出
   */
  function extractMovement(title) {
    const lowerTitle = title.toLowerCase();

    for (const [key, movInfo] of Object.entries(MOVEMENT_DICTIONARY)) {
      for (const keyword of movInfo.keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return { key, name: movInfo.name, nameJp: movInfo.nameJp };
        }
      }
    }

    return null;
  }

  /**
   * サイズを抽出（mm数値またはキーワード）
   */
  function extractSize(title) {
    const lowerTitle = title.toLowerCase();

    // mm数値を抽出
    const mmMatch = title.match(/(\d{2})\s*mm/i);
    if (mmMatch) {
      const mm = parseInt(mmMatch[1]);
      if (mm >= 40) {
        return { key: 'mens', name: "Men's", nameJp: 'メンズ', mm };
      } else if (mm <= 35) {
        return { key: 'womens', name: "Women's", nameJp: 'レディース', mm };
      } else {
        return { key: 'boys', name: 'Boys/Unisex', nameJp: 'ボーイズ/ユニセックス', mm };
      }
    }

    // キーワードで判定
    for (const [key, sizeInfo] of Object.entries(SIZE_DICTIONARY)) {
      for (const keyword of sizeInfo.keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return { key, name: sizeInfo.name, nameJp: sizeInfo.nameJp };
        }
      }
    }

    return null;
  }

  /**
   * ダイヤルカラーを抽出
   */
  function extractDialColor(title) {
    const lowerTitle = title.toLowerCase();

    for (const [key, colorInfo] of Object.entries(DIAL_COLOR_DICTIONARY)) {
      for (const keyword of colorInfo.keywords) {
        // "dial" との組み合わせを優先チェック
        if (lowerTitle.includes(keyword + ' dial') ||
            lowerTitle.includes(keyword + ' face')) {
          return { key, name: colorInfo.name, nameJp: colorInfo.nameJp };
        }
      }
    }

    // dialとの組み合わせがなければ単独キーワードで
    for (const [key, colorInfo] of Object.entries(DIAL_COLOR_DICTIONARY)) {
      for (const keyword of colorInfo.keywords) {
        if (lowerTitle.includes(keyword)) {
          return { key, name: colorInfo.name, nameJp: colorInfo.nameJp };
        }
      }
    }

    return null;
  }

  /**
   * バンドタイプを抽出
   */
  function extractBandType(title) {
    const lowerTitle = title.toLowerCase();

    for (const [key, bandInfo] of Object.entries(BAND_TYPE_DICTIONARY)) {
      for (const keyword of bandInfo.keywords) {
        if (lowerTitle.includes(keyword.toLowerCase())) {
          return { key, name: bandInfo.name, nameJp: bandInfo.nameJp };
        }
      }
    }

    return null;
  }

  /**
   * 型番を抽出（あれば）
   */
  function extractReference(title, brand) {
    // ブランド別の型番パターン
    const patterns = {
      'Seiko': /\b([A-Z]{3,4}\d{2,3}[A-Z]?\d*)\b/i,  // SKX007, SRPD79, SNK809
      'Citizen': /\b([A-Z]{2}\d{4}[A-Z]?-\d{2}[A-Z]?)\b/i,  // BN0150-28E
      'Casio': /\b([A-Z]{1,3}-?\d{3,4}[A-Z]*)\b/i,  // F-91W, DW-5600
      'G-Shock': /\b(DW-?\d{4}|GA-?\d{3,4}|GW-?\d{4}|GMW-?\w+)\b/i,
      'Orient': /\b(RA-[A-Z]{2}\d{4}[A-Z]?)\b/i,  // RA-AA0001B
      'Tissot': /\b(T\d{3}\.\d{3}\.\d{2}\.\d{3}\.\d{2})\b/i,  // T120.407.11.041.00
      'Hamilton': /\b(H\d{8})\b/i,  // H70455133
      default: /\b([A-Z]{2,4}\d{4,6}[A-Z]{0,3})\b/  // 汎用パターン
    };

    const pattern = patterns[brand] || patterns.default;
    const match = title.match(pattern);

    return match ? match[1] : null;
  }

  /**
   * メイン抽出関数
   */
  function extractAttributes(title) {
    const brand = extractBrand(title);
    const type = extractType(title);
    const movement = extractMovement(title);
    const size = extractSize(title);
    const dialColor = extractDialColor(title);
    const bandType = extractBandType(title);
    const reference = extractReference(title, brand);

    return {
      // 時計固有の詳細情報
      brand: brand,
      type: type ? type.name : null,
      typeJp: type ? type.nameJp : null,
      movement: movement ? movement.name : null,
      movementJp: movement ? movement.nameJp : null,
      size: size ? size.name : null,
      sizeJp: size ? size.nameJp : null,
      sizeMm: size ? size.mm : null,
      dialColor: dialColor ? dialColor.name : null,
      dialColorJp: dialColor ? dialColor.nameJp : null,
      bandType: bandType ? bandType.name : null,
      bandTypeJp: bandType ? bandType.nameJp : null,
      reference: reference,
      // 分析用キー
      brandKey: brand ? brand.toLowerCase().replace(/\s+/g, '_') : null,
      typeKey: type ? type.key : null,
      movementKey: movement ? movement.key : null,
      sizeKey: size ? size.key : null,
      // カード系プロファイルとの互換性（タブ表示用）
      // cardName = ブランド, set = タイプ, grading = ムーブメント, rarity = サイズ
      cardName: brand ? {
        name: brand,
        nameEn: getCategoryNameJp(getBrandCategory(brand)),  // サブ表示用にカテゴリ名
        category: getBrandCategory(brand)
      } : null,
      set: type ? {
        name: type.name,
        nameJp: type.nameJp,
        code: type.key,
        era: null
      } : null,
      grading: {
        company: movement ? movement.name : null,
        grade: null,
        gradeStr: movement ? movement.nameJp : null,
        isGraded: movement !== null
      },
      rarity: size ? {
        code: size.key,
        name: size.name,
        nameJp: size.nameJp,
        tier: null
      } : null
    };
  }

  /**
   * ブランドカテゴリを取得
   */
  function getBrandCategory(brand) {
    if (!brand) return null;
    const lowerBrand = brand.toLowerCase();

    for (const [category, brands] of Object.entries(BRAND_DICTIONARY)) {
      if (brands.some(b => b.toLowerCase() === lowerBrand)) {
        return category;
      }
    }
    return 'other';
  }

  /**
   * カテゴリの日本語名を取得
   */
  function getCategoryNameJp(category) {
    const categoryNames = {
      luxury: '高級',
      midHigh: '中〜高級',
      entry: 'エントリー',
      fashion: 'ファッション',
      digital: 'デジタル',
      vintage: 'ヴィンテージ',
      other: 'その他'
    };
    return categoryNames[category] || 'その他';
  }

  // ============================================
  // カテゴリフィルタリング
  // ============================================

  // 有効なeBayカテゴリ（Active Listings用）
  const VALID_EBAY_CATEGORIES = [
    'Wristwatches',
    'Watches, Parts & Accessories',
    'Pocket Watches',
    'Watch Accessories',
    'Watch Bands',
    'Watch Parts',
    'Watches'
  ];

  // 除外キーワード（タイトルベースフィルタ用、Sold/Orders用）
  const EXCLUDED_KEYWORDS = [
    // ジュエリー
    'earring', 'earrings', 'necklace', 'bracelet', 'ring', 'pendant', 'brooch', 'anklet', 'charm',
    // バッグ・財布
    'bag', 'handbag', 'wallet', 'purse', 'tote', 'clutch', 'backpack',
    // 衣類・靴
    'clothing', 'dress', 'shirt', 'shoes', 'sneaker', 'heel', 'boot', 'sandal',
    // その他
    'sunglasses', 'eyeglasses', 'keychain', 'key chain', 'scarf', 'belt'
  ];

  /**
   * eBayカテゴリが時計関連かチェック
   * @param {string} ebayCategory - eBayカテゴリ名
   * @returns {boolean} - 有効なカテゴリならtrue
   */
  function isValidCategory(ebayCategory) {
    if (!ebayCategory) return true; // カテゴリがない場合はスキップしない（Sold用）
    const lowerCategory = ebayCategory.toLowerCase();
    return VALID_EBAY_CATEGORIES.some(cat => lowerCategory.includes(cat.toLowerCase()));
  }

  /**
   * タイトルに除外キーワードが含まれているかチェック
   * @param {string} title - 商品タイトル
   * @returns {boolean} - 除外すべきならtrue
   */
  function isExcludedByKeyword(title) {
    if (!title) return false;
    const lowerTitle = title.toLowerCase();

    // 除外キーワードがあっても、watchキーワードがあれば時計として扱う
    const hasWatchKeyword = /\bwatch\b|\bwristwatch\b|\btimepiece\b|\bchronograph\b/i.test(title);
    if (hasWatchKeyword) return false;

    return EXCLUDED_KEYWORDS.some(keyword => lowerTitle.includes(keyword));
  }

  /**
   * 商品が時計として有効かチェック（カテゴリ + キーワード）
   * @param {string} title - 商品タイトル
   * @param {string} ebayCategory - eBayカテゴリ名（nullの場合はキーワードのみで判定）
   * @returns {boolean} - 有効ならtrue
   */
  function isValidWatchItem(title, ebayCategory) {
    // カテゴリがある場合はカテゴリで判定
    if (ebayCategory && ebayCategory.trim() !== '') {
      return isValidCategory(ebayCategory);
    }
    // カテゴリがない場合（Sold）は除外キーワードで判定
    return !isExcludedByKeyword(title);
  }

  // ============================================
  // グローバル公開
  // ============================================
  window.WatchProfile = {
    extractAttributes,
    extractBrand,
    extractType,
    extractMovement,
    extractSize,
    extractDialColor,
    extractBandType,
    extractReference,
    getBrandCategory,
    // カテゴリフィルタ
    isValidCategory,
    isExcludedByKeyword,
    isValidWatchItem,
    // 辞書へのアクセス
    BRAND_DICTIONARY,
    TYPE_DICTIONARY,
    MOVEMENT_DICTIONARY,
    SIZE_DICTIONARY,
    DIAL_COLOR_DICTIONARY,
    BAND_TYPE_DICTIONARY,
    VALID_EBAY_CATEGORIES,
    EXCLUDED_KEYWORDS
  };

})();
