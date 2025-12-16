/**
 * カテゴリ・ブランド判定ルール
 * ぶんせき君 v2.0.0
 * 日本語 + 英語キーワード対応
 */

// カテゴリ判定ルール
const CATEGORY_RULES = {
  // === アパレル系 ===
  "トップス": {
    keywords: [
      // 日本語
      "シャツ", "Tシャツ", "ブラウス", "ニット", "セーター", "カーディガン", "パーカー", "スウェット", "タンクトップ", "ポロシャツ", "カットソー", "ベスト", "トレーナー",
      // 英語
      "Shirt", "T-Shirt", "Tee", "Blouse", "Knit", "Sweater", "Cardigan", "Hoodie", "Sweatshirt", "Tank Top", "Polo", "Vest", "Pullover", "Top"
    ],
    priority: 10
  },
  "アウター": {
    keywords: [
      // 日本語
      "ジャケット", "コート", "ブルゾン", "ダウン", "MA-1", "トレンチ", "ライダース", "ピーコート", "モッズコート", "ステンカラー", "チェスター", "ダッフル", "アウター",
      // 英語
      "Jacket", "Coat", "Blazer", "Down", "Bomber", "Trench", "Leather Jacket", "Pea Coat", "Parka", "Overcoat", "Outerwear", "Windbreaker", "Fleece"
    ],
    priority: 10
  },
  "ボトムス": {
    keywords: [
      // 日本語
      "パンツ", "ジーンズ", "デニム", "スカート", "ショーツ", "チノパン", "スラックス", "ハーフパンツ", "ショートパンツ", "ワイドパンツ", "テーパード", "スキニー",
      // 英語
      "Pants", "Jeans", "Denim", "Skirt", "Shorts", "Chino", "Slacks", "Trousers", "Tapered", "Skinny", "Wide Leg", "Cargo"
    ],
    priority: 10
  },
  "ワンピース": {
    keywords: [
      // 日本語
      "ワンピース", "ドレス", "オールインワン", "サロペット", "ロンパース", "コンビネゾン",
      // 英語
      "Dress", "One Piece", "Jumpsuit", "Romper", "Maxi Dress", "Mini Dress", "Evening Dress"
    ],
    priority: 10
  },
  "バッグ": {
    keywords: [
      // 日本語
      "バッグ", "リュック", "トート", "ショルダー", "ポーチ", "ボストン", "クラッチ", "ハンドバッグ", "リュックサック", "バックパック", "ボディバッグ", "ウエストバッグ", "サコッシュ",
      // 英語
      "Bag", "Backpack", "Tote", "Shoulder Bag", "Pouch", "Boston Bag", "Clutch", "Handbag", "Crossbody", "Messenger", "Satchel", "Hobo", "Bucket Bag", "Purse"
    ],
    priority: 10
  },
  "財布・小物": {
    keywords: [
      // 日本語
      "財布", "ウォレット", "キーケース", "名刺入れ", "カードケース", "コインケース", "パスケース", "長財布", "二つ折り", "三つ折り", "マネークリップ",
      // 英語
      "Wallet", "Purse", "Key Case", "Key Holder", "Card Case", "Card Holder", "Coin Case", "Coin Purse", "Money Clip", "Bifold", "Trifold", "Long Wallet", "Compact Wallet"
    ],
    priority: 10
  },
  "靴": {
    keywords: [
      // 日本語
      "スニーカー", "ブーツ", "パンプス", "サンダル", "ローファー", "スリッポン", "ヒール", "革靴", "ドレスシューズ", "モカシン", "デッキシューズ", "ランニングシューズ",
      // 英語
      "Sneakers", "Boots", "Pumps", "Sandals", "Loafers", "Slip-on", "Heels", "Leather Shoes", "Dress Shoes", "Moccasin", "Deck Shoes", "Running Shoes", "Oxford", "Derby", "Flats"
    ],
    priority: 10
  },
  "時計": {
    keywords: [
      // 日本語
      "腕時計", "懐中時計", "置時計", "掛け時計", "クォーツ", "自動巻き", "手巻き",
      // 英語
      "Watch", "Wristwatch", "Timepiece", "Clock", "Quartz", "Automatic", "Hand Wound", "Hand Wind", "Manual Wind", "Chronograph", "Stopwatch", "Pocket Watch", "Table Clock"
    ],
    priority: 15
  },
  "アクセサリー": {
    keywords: [
      // 日本語
      "ネックレス", "ブレスレット", "リング", "指輪", "ピアス", "イヤリング", "バングル", "チョーカー", "ペンダント", "アンクレット", "ブローチ", "カフス", "タイピン",
      // 英語
      "Necklace", "Bracelet", "Bangle", "Ring", "Earring", "Piercing", "Choker", "Pendant", "Anklet", "Brooch", "Cufflinks", "Tie Pin", "Chain", "Charm", "Jewelry", "Jewellery"
    ],
    priority: 10
  },
  "帽子": {
    keywords: [
      // 日本語
      "キャップ", "ハット", "ニット帽", "ビーニー", "ベレー帽", "バケットハット", "キャスケット", "ハンチング",
      // 英語
      "Cap", "Hat", "Beanie", "Beret", "Bucket Hat", "Casquette", "Fedora", "Panama Hat", "Sun Hat", "Newsboy Cap", "Baseball Cap", "Knit Hat", "Ear Warmer"
    ],
    priority: 10
  },
  "スカーフ・マフラー": {
    keywords: [
      // 日本語
      "スカーフ", "マフラー", "ストール", "ショール", "バンダナ", "カレ",
      // 英語
      "Scarf", "Muffler", "Stole", "Shawl", "Bandana", "Wrap", "Neckerchief", "Silk Scarf", "Carre", "Twilly"
    ],
    priority: 10
  },

  // === 食器・インテリア ===
  "食器": {
    keywords: [
      // 日本語
      "カップ", "ソーサー", "皿", "プレート", "ボウル", "マグカップ", "ティーカップ", "コーヒーカップ", "グラス", "食器",
      // 英語
      "Cup", "Saucer", "Plate", "Dish", "Bowl", "Mug", "Tea Cup", "Coffee Cup", "Glass", "Tableware", "Dinnerware", "Porcelain", "Ceramic", "China"
    ],
    priority: 10
  },
  "インテリア・雑貨": {
    keywords: [
      // 日本語
      "クッション", "ラグ", "照明", "収納", "観葉植物", "花瓶", "ミラー", "カーテン", "ベッド", "ソファ", "チェスト", "スノードーム", "置物", "オーナメント", "小物入れ", "ボックス",
      // 英語
      "Cushion", "Rug", "Lighting", "Storage", "Vase", "Mirror", "Curtain", "Sofa", "Snow Dome", "Snow Globe", "Ornament", "Decor", "Home Decor", "Decoration", "Globe", "Gift Box", "Dome Accessory", "Balloon Dome", "Wooden Box"
    ],
    priority: 8
  },

  // === ホビー系 ===
  "トレカ": {
    keywords: [
      // 日本語
      "ポケモンカード", "ポケカ", "遊戯王", "ワンピースカード", "デュエマ", "MTG", "プロモ", "PSA", "BGS", "トレーディングカード", "シャドウバース", "ヴァイスシュヴァルツ", "デュエルマスターズ",
      // 英語
      "Pokemon Card", "Trading Card", "Promo Card", "Card Game", "TCG", "CCG"
    ],
    priority: 20
  },
  "ゲーム": {
    keywords: [
      // 日本語
      "PS5", "PS4", "PS3", "ゲームソフト", "コントローラー", "3DS", "Wii", "ゲームボーイ", "プレステ", "ファミコン", "スーファミ",
      // 英語
      "Switch", "Nintendo", "Xbox", "PlayStation", "Game Card", "Console", "Video Game", "Gaming", "NTSC-J", "Offline Pack", "Anniversary Pack"
    ],
    priority: 15
  },
  "フィギュア・おもちゃ": {
    keywords: [
      // 日本語
      "フィギュア", "プラモ", "ガンプラ", "ねんどろいど", "一番くじ", "トミカ", "プラレール", "レゴ", "ベアブリック", "アクションフィギュア", "美少女フィギュア", "スケールフィギュア",
      // 英語
      "Figure", "Figurine", "Model Kit", "Nendoroid", "Action Figure", "Toy", "Collectible"
    ],
    priority: 15
  },
  "本・マンガ": {
    keywords: [
      // 日本語
      "全巻", "セット", "コミック", "漫画", "小説", "文庫", "単行本", "初版", "マンガ", "ラノベ", "ライトノベル", "画集",
      // 英語
      "Book", "Comic", "Manga", "Novel", "Art Book", "Illustrations", "Artbook"
    ],
    priority: 10
  },
  "CD・DVD": {
    keywords: [
      // 日本語
      "アルバム", "初回限定", "特典", "シングル", "ライブDVD", "ミュージックビデオ",
      // 英語
      "CD", "DVD", "Blu-ray", "Album", "Music CD", "Remix Album", "Music Video"
    ],
    priority: 10
  },
  "アイドル・アニメグッズ": {
    keywords: [
      // 日本語
      "アクスタ", "アクリルスタンド", "缶バッジ", "タペストリー", "ポスター", "クリアファイル", "ペンライト", "うちわ", "生写真", "チェキ",
      // 英語
      "Acrylic Stand", "Badge", "Poster", "Clear File", "Penlight", "Photo Card"
    ],
    priority: 15
  },
  "ぬいぐるみ・コレクション": {
    keywords: [
      // 日本語
      "ぬいぐるみ", "テディベア", "マスコット", "人形", "ドール",
      // 英語
      "Plush", "Teddy Bear", "Stuffed Animal", "Mascot", "Doll", "Soft Toy", "Cuddly"
    ],
    priority: 12
  },

  // === 家電・ガジェット系 ===
  "スマホ・タブレット": {
    keywords: [
      // 日本語
      "スマホ", "タブレット", "スマートフォン",
      // 英語
      "iPhone", "iPad", "Android", "Galaxy", "Pixel", "Xperia", "AQUOS", "OPPO", "Smartphone", "Tablet", "Mobile"
    ],
    priority: 15
  },
  "オーディオ": {
    keywords: [
      // 日本語
      "イヤホン", "ヘッドホン", "スピーカー", "ワイヤレスイヤホン", "Bluetoothスピーカー", "ポータブルスピーカー", "アンプ", "DAC",
      // 英語
      "AirPods", "Earphone", "Headphone", "Speaker", "Wireless", "Bluetooth", "Amplifier", "Audio"
    ],
    priority: 15
  },
  "PC・周辺機器": {
    keywords: [
      // 日本語
      "ノートPC", "キーボード", "マウス", "モニター", "メモリ", "グラボ", "グラフィックボード", "マザーボード", "ゲーミングPC",
      // 英語
      "MacBook", "Laptop", "Keyboard", "Mouse", "Monitor", "SSD", "HDD", "CPU", "GPU", "PC", "Computer"
    ],
    priority: 15
  },
  "カメラ": {
    keywords: [
      // 日本語
      "一眼", "ミラーレス", "レンズ", "カメラ", "デジカメ", "コンデジ", "フィルムカメラ", "三脚", "ストロボ",
      // 英語
      "Camera", "DSLR", "Mirrorless", "Lens", "GoPro", "Tripod", "Flash", "Photography"
    ],
    priority: 15
  },
  "家電": {
    keywords: [
      // 日本語
      "ドライヤー", "アイロン", "掃除機", "空気清浄機", "加湿器", "除湿機", "扇風機", "ヒーター", "炊飯器", "電子レンジ", "トースター",
      // 英語
      "Dryer", "Iron", "Vacuum", "Air Purifier", "Humidifier", "Fan", "Heater", "Rice Cooker", "Microwave", "Toaster", "Appliance"
    ],
    priority: 10
  },

  // === その他 ===
  "コスメ・美容": {
    keywords: [
      // 日本語
      "化粧品", "コスメ", "香水", "スキンケア", "ファンデ", "リップ", "アイシャドウ", "マスカラ", "チーク", "美容液", "クレンジング", "シャンプー",
      // 英語
      "Cosmetics", "Perfume", "Fragrance", "Skincare", "Foundation", "Lipstick", "Eyeshadow", "Mascara", "Blush", "Serum", "Makeup", "Beauty"
    ],
    priority: 10
  },
  "スポーツ": {
    keywords: [
      // 日本語
      "ゴルフ", "テニス", "サッカー", "野球", "バスケ", "ランニング", "ヨガ", "サイクリング", "スキー", "スノボ", "スノーボード", "ラケット", "グローブ", "ユニフォーム", "ジャージ",
      // 英語
      "Golf", "Tennis", "Soccer", "Baseball", "Basketball", "Running", "Yoga", "Cycling", "Ski", "Snowboard", "Racket", "Sports", "Track Jacket", "Jersey", "Autographed Ball", "Autographed Jersey", "Signed Ball", "MVP", "World Series", "MLB", "NPB"
    ],
    priority: 12
  },
  "アウトドア": {
    keywords: [
      // 日本語
      "キャンプ", "テント", "寝袋", "焚火", "ランタン", "クーラーボックス", "タープ", "バーベキュー", "登山", "トレッキング",
      // 英語
      "Camp", "Camping", "Tent", "Sleeping Bag", "Lantern", "Cooler", "Tarp", "BBQ", "Hiking", "Trekking", "Camping Gear"
    ],
    priority: 10
  },
  "ベビー・キッズ": {
    keywords: [
      // 日本語
      "ベビー", "キッズ", "子供服", "ベビーカー", "チャイルドシート", "抱っこ紐", "おむつ", "離乳食", "知育玩具",
      // 英語
      "Baby", "Kids", "Children", "Stroller", "Car Seat", "Diaper", "Toy"
    ],
    priority: 10
  },
  "食品・飲料": {
    keywords: [
      // 日本語
      "お菓子", "スイーツ", "コーヒー", "紅茶", "ワイン", "日本酒", "ウイスキー", "調味料", "サプリメント",
      // 英語
      "Snack", "Sweet", "Coffee", "Tea", "Wine", "Sake", "Whiskey", "Supplement"
    ],
    priority: 5
  }
};

// ブランド判定パターン（正規表現）
const BRAND_PATTERNS = [
  // === ラグジュアリーブランド ===
  { pattern: /ルイ\s?ヴィトン|LOUIS\s?VUITTON|\bLV\b/i, brand: "LOUIS VUITTON", category: "バッグ" },
  { pattern: /グッチ|GUCCI/i, brand: "GUCCI", category: "バッグ" },
  { pattern: /シャネル|CHANEL/i, brand: "CHANEL", category: "バッグ" },
  { pattern: /エルメス|HERMES|HERMÈS/i, brand: "HERMES", category: "バッグ" },
  { pattern: /プラダ|PRADA/i, brand: "PRADA", category: "バッグ" },
  { pattern: /ディオール|DIOR|Christian\s?Dior/i, brand: "DIOR", category: "バッグ" },
  { pattern: /セリーヌ|CELINE|CÉLINE/i, brand: "CELINE", category: "バッグ" },
  { pattern: /バレンシアガ|BALENCIAGA/i, brand: "BALENCIAGA", category: "バッグ" },
  { pattern: /ボッテガ|BOTTEGA\s?VENETA/i, brand: "BOTTEGA VENETA", category: "バッグ" },
  { pattern: /ロエベ|LOEWE/i, brand: "LOEWE", category: "バッグ" },
  { pattern: /フェンディ|FENDI/i, brand: "FENDI", category: "バッグ" },
  { pattern: /ヴァレンティノ|VALENTINO/i, brand: "VALENTINO", category: "バッグ" },
  { pattern: /サンローラン|SAINT\s?LAURENT|YSL/i, brand: "SAINT LAURENT", category: "バッグ" },
  { pattern: /ジバンシー|GIVENCHY/i, brand: "GIVENCHY", category: "アクセサリー" },
  { pattern: /バーバリー|BURBERRY/i, brand: "BURBERRY", category: "アウター" },
  { pattern: /コーチ|COACH/i, brand: "COACH", category: "バッグ" },
  { pattern: /マイケルコース|MICHAEL\s?KORS/i, brand: "MICHAEL KORS", category: "バッグ" },
  { pattern: /ケイトスペード|kate\s?spade/i, brand: "kate spade", category: "バッグ" },
  { pattern: /フルラ|FURLA/i, brand: "FURLA", category: "バッグ" },
  { pattern: /トリーバーチ|TORY\s?BURCH/i, brand: "TORY BURCH", category: "バッグ" },

  // === ファッション（イギリス・ヨーロッパ） ===
  { pattern: /ヴィヴィアン\s?ウエストウッド|Vivienne\s?Westwood/i, brand: "Vivienne Westwood", category: "アクセサリー" },
  { pattern: /ポールスミス|Paul\s?Smith/i, brand: "Paul Smith", category: "トップス" },
  { pattern: /マルニ|MARNI/i, brand: "MARNI", category: "バッグ" },
  { pattern: /マルジェラ|Maison\s?Margiela|Martin\s?Margiela/i, brand: "Maison Margiela", category: "トップス" },
  { pattern: /アレキサンダー\s?マックイーン|Alexander\s?McQueen/i, brand: "Alexander McQueen", category: "トップス" },
  { pattern: /ステラ\s?マッカートニー|Stella\s?McCartney/i, brand: "Stella McCartney", category: "バッグ" },
  { pattern: /ジミー\s?チュウ|Jimmy\s?Choo/i, brand: "Jimmy Choo", category: "靴" },
  { pattern: /マノロ\s?ブラニク|Manolo\s?Blahnik/i, brand: "Manolo Blahnik", category: "靴" },
  { pattern: /クリスチャン\s?ルブタン|Christian\s?Louboutin|Louboutin/i, brand: "Christian Louboutin", category: "靴" },
  { pattern: /モンクレール|MONCLER/i, brand: "MONCLER", category: "アウター" },

  // === スポーツ・ストリート ===
  { pattern: /ナイキ|NIKE/i, brand: "NIKE", category: "靴" },
  { pattern: /アディダス|adidas/i, brand: "adidas", category: "靴" },
  { pattern: /ニューバランス|NEW\s?BALANCE|NB\s?\d{3,4}/i, brand: "New Balance", category: "靴" },
  { pattern: /コンバース|CONVERSE/i, brand: "CONVERSE", category: "靴" },
  { pattern: /VANS|ヴァンズ/i, brand: "VANS", category: "靴" },
  { pattern: /プーマ|PUMA/i, brand: "PUMA", category: "靴" },
  { pattern: /リーボック|Reebok/i, brand: "Reebok", category: "靴" },
  { pattern: /アシックス|ASICS|Onitsuka\s?Tiger|オニツカタイガー/i, brand: "ASICS/Onitsuka Tiger", category: "靴" },
  { pattern: /ザノースフェイス|THE\s?NORTH\s?FACE|TNF|North\s?Face/i, brand: "THE NORTH FACE", category: "アウター" },
  { pattern: /パタゴニア|Patagonia/i, brand: "Patagonia", category: "アウター" },
  { pattern: /シュプリーム|Supreme/i, brand: "Supreme", category: "トップス" },
  { pattern: /ステューシー|STUSSY/i, brand: "STUSSY", category: "トップス" },
  { pattern: /ア\s?ベイシング\s?エイプ|A\s?BATHING\s?APE|BAPE/i, brand: "A BATHING APE", category: "トップス" },
  { pattern: /オフホワイト|OFF[\s-]?WHITE/i, brand: "OFF-WHITE", category: "トップス" },
  { pattern: /パーム\s?エンジェルス|PALM\s?ANGELS/i, brand: "PALM ANGELS", category: "トップス" },

  // === カジュアル・セレクト ===
  { pattern: /ユニクロ|UNIQLO/i, brand: "UNIQLO", category: "トップス" },
  { pattern: /ジーユー|\bGU\b(?!CCI)/i, brand: "GU", category: "トップス" },
  { pattern: /ZARA|ザラ/i, brand: "ZARA", category: "トップス" },
  { pattern: /H&M/i, brand: "H&M", category: "トップス" },
  { pattern: /無印良品|MUJI/i, brand: "無印良品", category: "インテリア・雑貨" },
  { pattern: /ビームス|BEAMS/i, brand: "BEAMS", category: "トップス" },
  { pattern: /ユナイテッドアローズ|UNITED\s?ARROWS/i, brand: "UNITED ARROWS", category: "トップス" },
  { pattern: /シップス|SHIPS/i, brand: "SHIPS", category: "トップス" },
  { pattern: /ジャーナルスタンダード|JOURNAL\s?STANDARD/i, brand: "JOURNAL STANDARD", category: "トップス" },
  { pattern: /アーバンリサーチ|URBAN\s?RESEARCH/i, brand: "URBAN RESEARCH", category: "トップス" },
  { pattern: /ナノユニバース|nano[\s・]?universe/i, brand: "nano universe", category: "トップス" },
  { pattern: /グローバルワーク|GLOBAL\s?WORK/i, brand: "GLOBAL WORK", category: "トップス" },
  { pattern: /ローリーズファーム|LOWRYS\s?FARM/i, brand: "LOWRYS FARM", category: "トップス" },
  { pattern: /JIL\s?SANDER|ジル\s?サンダー/i, brand: "JIL SANDER", category: "トップス" },

  // === デニム ===
  { pattern: /リーバイス|Levi'?s|LEVIS/i, brand: "Levi's", category: "ボトムス" },
  { pattern: /リー|LEE(?![\w])/i, brand: "LEE", category: "ボトムス" },
  { pattern: /ラングラー|Wrangler/i, brand: "Wrangler", category: "ボトムス" },
  { pattern: /ディーゼル|DIESEL/i, brand: "DIESEL", category: "ボトムス" },
  { pattern: /エドウィン|EDWIN/i, brand: "EDWIN", category: "ボトムス" },

  // === 時計ブランド（高級） ===
  { pattern: /ロレックス|ROLEX/i, brand: "ROLEX", category: "時計" },
  { pattern: /オメガ|OMEGA/i, brand: "OMEGA", category: "時計" },
  { pattern: /カルティエ|Cartier/i, brand: "Cartier", category: "時計" },
  { pattern: /ブルガリ|BVLGARI|BULGARI/i, brand: "BVLGARI", category: "時計" },
  { pattern: /タグホイヤー|TAG\s?HEUER/i, brand: "TAG HEUER", category: "時計" },
  { pattern: /ブライトリング|BREITLING/i, brand: "BREITLING", category: "時計" },
  { pattern: /パネライ|PANERAI/i, brand: "PANERAI", category: "時計" },
  { pattern: /IWC/i, brand: "IWC", category: "時計" },
  { pattern: /ジャガールクルト|Jaeger[\s-]?LeCoultre/i, brand: "Jaeger-LeCoultre", category: "時計" },
  { pattern: /オーデマ\s?ピゲ|Audemars\s?Piguet/i, brand: "Audemars Piguet", category: "時計" },
  { pattern: /パテック\s?フィリップ|Patek\s?Philippe/i, brand: "Patek Philippe", category: "時計" },

  // === 時計ブランド（中価格帯） ===
  { pattern: /ロンジン|Longines/i, brand: "Longines", category: "時計" },
  { pattern: /ティソ|Tissot/i, brand: "Tissot", category: "時計" },
  { pattern: /ハミルトン|Hamilton/i, brand: "Hamilton", category: "時計" },
  { pattern: /オリス|Oris/i, brand: "Oris", category: "時計" },
  { pattern: /モーリス\s?ラクロア|Maurice\s?Lacroix/i, brand: "Maurice Lacroix", category: "時計" },
  { pattern: /ボーム\s?メルシエ|Baume[\s&]?Mercier/i, brand: "Baume & Mercier", category: "時計" },
  { pattern: /ラドー|RADO/i, brand: "RADO", category: "時計" },
  { pattern: /ガガ\s?ミラノ|GaGa\s?MILANO/i, brand: "GaGa MILANO", category: "時計" },

  // === 日本の時計ブランド ===
  { pattern: /セイコー|SEIKO/i, brand: "SEIKO", category: "時計" },
  { pattern: /シチズン|CITIZEN/i, brand: "CITIZEN", category: "時計" },
  { pattern: /カシオ|CASIO|G[\s-]?SHOCK/i, brand: "CASIO", category: "時計" },
  { pattern: /オリエント|Orient(?!\s?Star)|ORIENT(?!\s?STAR)/i, brand: "Orient", category: "時計" },
  { pattern: /オリエントスター|Orient\s?Star/i, brand: "Orient Star", category: "時計" },
  { pattern: /グランドセイコー|Grand\s?Seiko/i, brand: "Grand Seiko", category: "時計" },
  { pattern: /クレドール|CREDOR/i, brand: "CREDOR", category: "時計" },
  { pattern: /ALBA/i, brand: "ALBA", category: "時計" },

  // === その他時計 ===
  { pattern: /ダニエルウェリントン|Daniel\s?Wellington|DW/i, brand: "Daniel Wellington", category: "時計" },
  { pattern: /アップルウォッチ|Apple\s?Watch/i, brand: "Apple", category: "時計" },
  { pattern: /スウォッチ|Swatch/i, brand: "Swatch", category: "時計" },
  { pattern: /フォッシル|Fossil/i, brand: "Fossil", category: "時計" },
  { pattern: /スカーゲン|SKAGEN/i, brand: "SKAGEN", category: "時計" },

  // === 家電・ガジェット ===
  { pattern: /Apple|アップル|iPhone|iPad|Mac|AirPods/i, brand: "Apple", category: "スマホ・タブレット" },
  { pattern: /ソニー|SONY|プレイステーション|PlayStation/i, brand: "SONY", category: "ゲーム" },
  { pattern: /任天堂|Nintendo|ニンテンドー/i, brand: "Nintendo", category: "ゲーム" },
  { pattern: /Anker|アンカー/i, brand: "Anker", category: "オーディオ" },
  { pattern: /BOSE|ボーズ/i, brand: "BOSE", category: "オーディオ" },
  { pattern: /JBL/i, brand: "JBL", category: "オーディオ" },
  { pattern: /Beats/i, brand: "Beats", category: "オーディオ" },
  { pattern: /Canon|キヤノン|キャノン/i, brand: "Canon", category: "カメラ" },
  { pattern: /Nikon|ニコン/i, brand: "Nikon", category: "カメラ" },
  { pattern: /富士フイルム|FUJIFILM/i, brand: "FUJIFILM", category: "カメラ" },
  { pattern: /ダイソン|Dyson/i, brand: "Dyson", category: "家電" },
  { pattern: /パナソニック|Panasonic/i, brand: "Panasonic", category: "家電" },

  // === コスメ ===
  { pattern: /資生堂|SHISEIDO/i, brand: "SHISEIDO", category: "コスメ・美容" },
  { pattern: /SK[\s-]?II|エスケーツー/i, brand: "SK-II", category: "コスメ・美容" },
  { pattern: /MAC|マック(?!Book)/i, brand: "MAC", category: "コスメ・美容" },
  { pattern: /NARS|ナーズ/i, brand: "NARS", category: "コスメ・美容" },
  { pattern: /イソップ|Aesop/i, brand: "Aesop", category: "コスメ・美容" },

  // === アウトドア ===
  { pattern: /モンベル|mont[\s-]?bell/i, brand: "mont-bell", category: "アウトドア" },
  { pattern: /コールマン|Coleman/i, brand: "Coleman", category: "アウトドア" },
  { pattern: /スノーピーク|Snow\s?Peak/i, brand: "Snow Peak", category: "アウトドア" },
  { pattern: /ロゴス|LOGOS/i, brand: "LOGOS", category: "アウトドア" },

  // === トレカ関連 ===
  { pattern: /ポケモン|Pok[eé]?mon|ポケカ|Pokmon/i, brand: "Pokemon", category: "トレカ" },
  { pattern: /遊戯王|Yu[\s-]?Gi[\s-]?Oh/i, brand: "遊戯王", category: "トレカ" },
  { pattern: /ワンピース(?!.*(?:服|ドレス))|ONE\s?PIECE(?!.*dress)/i, brand: "ONE PIECE", category: "トレカ" },
  { pattern: /Mcdonald'?s|マクドナルド|マック(?!Book)/i, brand: "McDonald's", category: "トレカ" },

  // === 音楽・エンタメ ===
  { pattern: /MALICE\s?MIZER|マリス\s?ミゼル/i, brand: "MALICE MIZER", category: "CD・DVD" },
  { pattern: /HALCALI|ハルカリ/i, brand: "HALCALI", category: "CD・DVD" },

  // === テディベア・ぬいぐるみ ===
  { pattern: /Steiff|シュタイフ/i, brand: "Steiff", category: "ぬいぐるみ・コレクション" },
  { pattern: /Teddy\s?Bear|テディベア/i, brand: "(テディベア)", category: "ぬいぐるみ・コレクション" },

  // === デニム・ジーンズブランド（追加） ===
  { pattern: /Shoaiya|匠雅|ショウアイヤ/i, brand: "Shoaiya", category: "ボトムス" },
  { pattern: /Momotaro|桃太郎ジーンズ/i, brand: "桃太郎ジーンズ", category: "ボトムス" },
  { pattern: /Pure\s?Blue\s?Japan|ピュアブルージャパン/i, brand: "Pure Blue Japan", category: "ボトムス" },
  { pattern: /Iron\s?Heart|アイアンハート/i, brand: "Iron Heart", category: "ボトムス" },
  { pattern: /Samurai\s?Jeans|サムライジーンズ/i, brand: "Samurai Jeans", category: "ボトムス" },
  { pattern: /Sugar\s?Cane|シュガーケーン/i, brand: "Sugar Cane", category: "ボトムス" },
  { pattern: /EVISU|エビス/i, brand: "EVISU", category: "ボトムス" },
  { pattern: /Full\s?Count|フルカウント/i, brand: "Full Count", category: "ボトムス" },
  { pattern: /Warehouse|ウエアハウス/i, brand: "Warehouse", category: "ボトムス" },

  // === 野球・スポーツ関連 ===
  { pattern: /Yoshinobu\s?Yamamoto|山本由伸/i, brand: "山本由伸", category: "スポーツ" },
  { pattern: /Orix\s?Buffaloes|オリックス/i, brand: "オリックス", category: "スポーツ" },
  { pattern: /Shohei\s?Ohtani|大谷翔平/i, brand: "大谷翔平", category: "スポーツ" },
  { pattern: /Dodgers|ドジャース/i, brand: "ドジャース", category: "スポーツ" },
  { pattern: /World\s?Series/i, brand: "MLB", category: "スポーツ" },
  { pattern: /Autograph|サイン入り|直筆/i, brand: "(サイン入り)", category: "スポーツ" },

  // === ゲーム追加 ===
  { pattern: /Identity\s?V|第五人格/i, brand: "Identity V", category: "ゲーム" },
  { pattern: /Saturn\s?Tribute/i, brand: "Saturn Tribute", category: "ゲーム" },

  // === 航空会社・コレクション ===
  { pattern: /KLM/i, brand: "KLM", category: "インテリア・雑貨" },
  { pattern: /JAL|日本航空/i, brand: "JAL", category: "インテリア・雑貨" },
  { pattern: /ANA|全日空/i, brand: "ANA", category: "インテリア・雑貨" },

  // === 陶器・食器ブランド ===
  { pattern: /Meissen|マイセン/i, brand: "Meissen", category: "食器" },
  { pattern: /Royal\s?Copenhagen|ロイヤルコペンハーゲン/i, brand: "Royal Copenhagen", category: "食器" },
  { pattern: /Wedgwood|ウェッジウッド/i, brand: "Wedgwood", category: "食器" },
  { pattern: /Baccarat|バカラ/i, brand: "Baccarat", category: "食器" },
  { pattern: /Richard\s?Ginori|リチャードジノリ/i, brand: "Richard Ginori", category: "食器" },
  { pattern: /Noritake|ノリタケ/i, brand: "Noritake", category: "食器" },

  // === 高級時計ブランド（追加） ===
  { pattern: /Vacheron\s?Constantin|ヴァシュロン/i, brand: "Vacheron Constantin", category: "時計" },
  { pattern: /Blancpain|ブランパン/i, brand: "Blancpain", category: "時計" },
  { pattern: /Zenith|ゼニス/i, brand: "Zenith", category: "時計" },
  { pattern: /Girard[\s-]?Perregaux|ジラール[\s-]?ペルゴ/i, brand: "Girard-Perregaux", category: "時計" },
  { pattern: /Frederique\s?Constant|フレデリック[\s・]?コンスタント/i, brand: "Frederique Constant", category: "時計" },
  { pattern: /Ulysse\s?Nardin|ユリス[\s・]?ナルダン/i, brand: "Ulysse Nardin", category: "時計" },
  { pattern: /Chronoswiss|クロノスイス/i, brand: "Chronoswiss", category: "時計" },
  { pattern: /Ball\s?Watch|ボールウォッチ/i, brand: "Ball Watch", category: "時計" },
  { pattern: /Mido|ミドー/i, brand: "Mido", category: "時計" },
  { pattern: /Certina|サーチナ/i, brand: "Certina", category: "時計" },
  { pattern: /Edox|エドックス/i, brand: "Edox", category: "時計" },

  // === ホビー・コレクション ===
  { pattern: /Kyosho|京商/i, brand: "京商", category: "フィギュア・おもちゃ" },
  { pattern: /Tamiya|タミヤ/i, brand: "タミヤ", category: "フィギュア・おもちゃ" },
  { pattern: /Bandai|バンダイ/i, brand: "バンダイ", category: "フィギュア・おもちゃ" },
  { pattern: /Good\s?Smile|グッドスマイル/i, brand: "Good Smile", category: "フィギュア・おもちゃ" },
  { pattern: /Hot\s?Wheels|ホットウィール/i, brand: "Hot Wheels", category: "フィギュア・おもちゃ" },
  { pattern: /Matchbox|マッチボックス/i, brand: "Matchbox", category: "フィギュア・おもちゃ" },

  // === アート・イラスト関連 ===
  { pattern: /Yoneda\s?Hitoshi|米田仁士/i, brand: "米田仁士", category: "本・マンガ" },
];

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CATEGORY_RULES, BRAND_PATTERNS };
}
