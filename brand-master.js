/**
 * ブランドマスター
 * ぶんせき君 v4.1.0
 *
 * 全シート・ハイライト機能で共通利用するブランドリスト
 * カテゴリは含まない（ブランド名の判定のみ）
 */

const DEFAULT_BRANDS = [
  // === ラグジュアリーブランド ===
  { id: "b001", name: "LOUIS VUITTON", patterns: ["LOUIS VUITTON", "ルイヴィトン", "ルイ・ヴィトン", "LV"], matchType: "word" },
  { id: "b002", name: "GUCCI", patterns: ["GUCCI", "グッチ"], matchType: "word" },
  { id: "b003", name: "CHANEL", patterns: ["CHANEL", "シャネル"], matchType: "word" },
  { id: "b004", name: "HERMES", patterns: ["HERMES", "HERMÈS", "エルメス"], matchType: "word" },
  { id: "b005", name: "PRADA", patterns: ["PRADA", "プラダ"], matchType: "word" },
  { id: "b006", name: "DIOR", patterns: ["DIOR", "Christian Dior", "ディオール"], matchType: "word" },
  { id: "b007", name: "CELINE", patterns: ["CELINE", "CÉLINE", "セリーヌ"], matchType: "word" },
  { id: "b008", name: "BALENCIAGA", patterns: ["BALENCIAGA", "バレンシアガ"], matchType: "word" },
  { id: "b009", name: "BOTTEGA VENETA", patterns: ["BOTTEGA VENETA", "ボッテガ・ヴェネタ", "ボッテガ"], matchType: "word" },
  { id: "b010", name: "LOEWE", patterns: ["LOEWE", "ロエベ"], matchType: "word" },
  { id: "b011", name: "FENDI", patterns: ["FENDI", "フェンディ"], matchType: "word" },
  { id: "b012", name: "VALENTINO", patterns: ["VALENTINO", "ヴァレンティノ"], matchType: "word" },
  { id: "b013", name: "SAINT LAURENT", patterns: ["SAINT LAURENT", "YSL", "サンローラン"], matchType: "word" },
  { id: "b014", name: "GIVENCHY", patterns: ["GIVENCHY", "ジバンシー", "ジバンシィ"], matchType: "word" },
  { id: "b015", name: "BURBERRY", patterns: ["BURBERRY", "バーバリー"], matchType: "word" },
  { id: "b016", name: "VERSACE", patterns: ["VERSACE", "ヴェルサーチ"], matchType: "word" },
  { id: "b017", name: "DOLCE & GABBANA", patterns: ["DOLCE & GABBANA", "DOLCE&GABBANA", "D&G", "ドルチェ&ガッバーナ"], matchType: "word" },
  { id: "b018", name: "ARMANI", patterns: ["ARMANI", "GIORGIO ARMANI", "EMPORIO ARMANI", "アルマーニ"], matchType: "word" },

  // === アクセシブルラグジュアリー ===
  { id: "b020", name: "COACH", patterns: ["COACH", "コーチ"], matchType: "word" },
  { id: "b021", name: "MICHAEL KORS", patterns: ["MICHAEL KORS", "マイケルコース"], matchType: "word" },
  { id: "b022", name: "kate spade", patterns: ["kate spade", "ケイトスペード"], matchType: "word" },
  { id: "b023", name: "FURLA", patterns: ["FURLA", "フルラ"], matchType: "word" },
  { id: "b024", name: "TORY BURCH", patterns: ["TORY BURCH", "トリーバーチ"], matchType: "word" },
  { id: "b025", name: "MARC JACOBS", patterns: ["MARC JACOBS", "マークジェイコブス"], matchType: "exact" },
  { id: "b026", name: "MCM", patterns: ["MCM"], matchType: "word" },
  { id: "b027", name: "LONGCHAMP", patterns: ["LONGCHAMP", "ロンシャン"], matchType: "word" },

  // === イギリス・ヨーロッパファッション ===
  { id: "b030", name: "Vivienne Westwood", patterns: ["Vivienne Westwood", "ヴィヴィアン・ウエストウッド", "ヴィヴィアンウエストウッド"], matchType: "exact" },
  { id: "b031", name: "Paul Smith", patterns: ["Paul Smith", "ポールスミス"], matchType: "exact" },
  { id: "b032", name: "MARNI", patterns: ["MARNI", "マルニ"], matchType: "word" },
  { id: "b033", name: "Maison Margiela", patterns: ["Maison Margiela", "Martin Margiela", "マルジェラ"], matchType: "word" },
  { id: "b034", name: "Alexander McQueen", patterns: ["Alexander McQueen", "アレキサンダーマックイーン"], matchType: "exact" },
  { id: "b035", name: "Stella McCartney", patterns: ["Stella McCartney", "ステラマッカートニー"], matchType: "exact" },
  { id: "b036", name: "Jimmy Choo", patterns: ["Jimmy Choo", "ジミーチュウ"], matchType: "exact" },
  { id: "b037", name: "Manolo Blahnik", patterns: ["Manolo Blahnik", "マノロブラニク"], matchType: "exact" },
  { id: "b038", name: "Christian Louboutin", patterns: ["Christian Louboutin", "Louboutin", "ルブタン"], matchType: "word" },
  { id: "b039", name: "MONCLER", patterns: ["MONCLER", "モンクレール"], matchType: "word" },
  { id: "b040", name: "JIL SANDER", patterns: ["JIL SANDER", "ジルサンダー"], matchType: "exact" },
  { id: "b041", name: "ACNE STUDIOS", patterns: ["ACNE STUDIOS", "アクネストゥディオズ"], matchType: "exact" },
  { id: "b042", name: "A.P.C.", patterns: ["A.P.C.", "APC", "アーペーセー"], matchType: "word" },
  { id: "b043", name: "MAISON KITSUNE", patterns: ["MAISON KITSUNE", "メゾンキツネ"], matchType: "exact" },

  // === スポーツブランド ===
  { id: "b050", name: "NIKE", patterns: ["NIKE", "ナイキ"], matchType: "word" },
  { id: "b051", name: "adidas", patterns: ["adidas", "アディダス"], matchType: "word" },
  { id: "b052", name: "New Balance", patterns: ["New Balance", "NEW BALANCE", "ニューバランス", "NB"], matchType: "word" },
  { id: "b053", name: "CONVERSE", patterns: ["CONVERSE", "コンバース"], matchType: "word" },
  { id: "b054", name: "VANS", patterns: ["VANS", "ヴァンズ", "バンズ"], matchType: "word" },
  { id: "b055", name: "PUMA", patterns: ["PUMA", "プーマ"], matchType: "word" },
  { id: "b056", name: "Reebok", patterns: ["Reebok", "リーボック"], matchType: "word" },
  { id: "b057", name: "ASICS", patterns: ["ASICS", "アシックス", "Onitsuka Tiger", "オニツカタイガー"], matchType: "word" },
  { id: "b058", name: "MIZUNO", patterns: ["MIZUNO", "ミズノ"], matchType: "word" },
  { id: "b059", name: "UNDER ARMOUR", patterns: ["UNDER ARMOUR", "アンダーアーマー"], matchType: "exact" },
  { id: "b060", name: "SAUCONY", patterns: ["SAUCONY", "サッカニー"], matchType: "word" },
  { id: "b061", name: "BROOKS", patterns: ["BROOKS", "ブルックス"], matchType: "word" },
  { id: "b062", name: "HOKA", patterns: ["HOKA", "HOKA ONE ONE", "ホカ"], matchType: "word" },
  { id: "b063", name: "ON", patterns: ["ON Running", "On"], matchType: "exact" },
  { id: "b064", name: "JORDAN", patterns: ["JORDAN", "AIR JORDAN", "ジョーダン"], matchType: "word" },

  // === ストリートブランド ===
  { id: "b070", name: "Supreme", patterns: ["Supreme", "シュプリーム"], matchType: "word" },
  { id: "b071", name: "STUSSY", patterns: ["STUSSY", "ステューシー"], matchType: "word" },
  { id: "b072", name: "A BATHING APE", patterns: ["A BATHING APE", "BAPE", "ベイプ", "エイプ"], matchType: "word" },
  { id: "b073", name: "OFF-WHITE", patterns: ["OFF-WHITE", "OFF WHITE", "オフホワイト"], matchType: "word" },
  { id: "b074", name: "PALM ANGELS", patterns: ["PALM ANGELS", "パームエンジェルス"], matchType: "exact" },
  { id: "b075", name: "HUMAN MADE", patterns: ["HUMAN MADE", "ヒューマンメイド"], matchType: "exact" },
  { id: "b076", name: "NEIGHBORHOOD", patterns: ["NEIGHBORHOOD", "ネイバーフッド"], matchType: "word" },
  { id: "b077", name: "WTAPS", patterns: ["WTAPS", "ダブルタップス"], matchType: "word" },
  { id: "b078", name: "UNDERCOVER", patterns: ["UNDERCOVER", "アンダーカバー"], matchType: "word" },
  { id: "b079", name: "FEAR OF GOD", patterns: ["FEAR OF GOD", "フィアオブゴッド"], matchType: "exact" },
  { id: "b080", name: "ESSENTIALS", patterns: ["ESSENTIALS", "エッセンシャルズ"], matchType: "word" },
  { id: "b081", name: "KITH", patterns: ["KITH", "キス"], matchType: "word" },
  { id: "b082", name: "ANTI SOCIAL SOCIAL CLUB", patterns: ["ANTI SOCIAL SOCIAL CLUB", "ASSC"], matchType: "word" },

  // === 日本デザイナーブランド ===
  { id: "b090", name: "COMME des GARCONS", patterns: ["COMME des GARCONS", "COMME des GARÇONS", "コムデギャルソン", "CDG"], matchType: "word" },
  { id: "b091", name: "ISSEY MIYAKE", patterns: ["ISSEY MIYAKE", "イッセイミヤケ"], matchType: "exact" },
  { id: "b092", name: "Yohji Yamamoto", patterns: ["Yohji Yamamoto", "Y's", "ヨウジヤマモト"], matchType: "word" },
  { id: "b093", name: "sacai", patterns: ["sacai", "サカイ"], matchType: "word" },
  { id: "b094", name: "visvim", patterns: ["visvim", "ビズビム"], matchType: "word" },
  { id: "b095", name: "KAPITAL", patterns: ["KAPITAL", "キャピタル"], matchType: "word" },
  { id: "b096", name: "NEEDLES", patterns: ["NEEDLES", "ニードルス"], matchType: "word" },
  { id: "b097", name: "PORTER", patterns: ["PORTER", "PORTER-YOSHIDA", "ポーター"], matchType: "word" },
  { id: "b098", name: "ANTEPRIMA", patterns: ["ANTEPRIMA", "アンテプリマ"], matchType: "word" },
  { id: "b099", name: "SAMANTHA THAVASA", patterns: ["SAMANTHA THAVASA", "サマンサタバサ"], matchType: "exact" },

  // === アウトドアブランド ===
  { id: "b100", name: "THE NORTH FACE", patterns: ["THE NORTH FACE", "NORTH FACE", "ザノースフェイス", "ノースフェイス", "TNF"], matchType: "word" },
  { id: "b101", name: "Patagonia", patterns: ["Patagonia", "パタゴニア"], matchType: "word" },
  { id: "b102", name: "ARC'TERYX", patterns: ["ARC'TERYX", "ARCTERYX", "アークテリクス"], matchType: "word" },
  { id: "b103", name: "CANADA GOOSE", patterns: ["CANADA GOOSE", "カナダグース"], matchType: "exact" },
  { id: "b104", name: "Columbia", patterns: ["Columbia", "コロンビア"], matchType: "word" },
  { id: "b105", name: "MAMMUT", patterns: ["MAMMUT", "マムート"], matchType: "word" },
  { id: "b106", name: "mont-bell", patterns: ["mont-bell", "montbell", "モンベル"], matchType: "word" },
  { id: "b107", name: "Snow Peak", patterns: ["Snow Peak", "スノーピーク"], matchType: "exact" },
  { id: "b108", name: "Coleman", patterns: ["Coleman", "コールマン"], matchType: "word" },
  { id: "b109", name: "LOGOS", patterns: ["LOGOS", "ロゴス"], matchType: "word" },
  { id: "b110", name: "SALOMON", patterns: ["SALOMON", "サロモン"], matchType: "word" },

  // === 高級時計ブランド ===
  { id: "b120", name: "ROLEX", patterns: ["ROLEX", "ロレックス"], matchType: "word" },
  { id: "b121", name: "OMEGA", patterns: ["OMEGA", "オメガ"], matchType: "word" },
  { id: "b122", name: "Cartier", patterns: ["Cartier", "カルティエ"], matchType: "word" },
  { id: "b123", name: "BVLGARI", patterns: ["BVLGARI", "BULGARI", "ブルガリ"], matchType: "word" },
  { id: "b124", name: "TAG HEUER", patterns: ["TAG HEUER", "タグホイヤー"], matchType: "exact" },
  { id: "b125", name: "BREITLING", patterns: ["BREITLING", "ブライトリング"], matchType: "word" },
  { id: "b126", name: "PANERAI", patterns: ["PANERAI", "パネライ"], matchType: "word" },
  { id: "b127", name: "IWC", patterns: ["IWC"], matchType: "word" },
  { id: "b128", name: "Jaeger-LeCoultre", patterns: ["Jaeger-LeCoultre", "Jaeger LeCoultre", "ジャガールクルト"], matchType: "word" },
  { id: "b129", name: "Audemars Piguet", patterns: ["Audemars Piguet", "オーデマピゲ"], matchType: "exact" },
  { id: "b130", name: "Patek Philippe", patterns: ["Patek Philippe", "パテックフィリップ"], matchType: "exact" },
  { id: "b131", name: "Vacheron Constantin", patterns: ["Vacheron Constantin", "ヴァシュロンコンスタンタン"], matchType: "exact" },
  { id: "b132", name: "Blancpain", patterns: ["Blancpain", "ブランパン"], matchType: "word" },
  { id: "b133", name: "TUDOR", patterns: ["TUDOR", "チュードル", "チューダー"], matchType: "word" },
  { id: "b134", name: "Zenith", patterns: ["Zenith", "ゼニス"], matchType: "word" },
  { id: "b135", name: "Hublot", patterns: ["Hublot", "ウブロ"], matchType: "word" },
  { id: "b136", name: "Franck Muller", patterns: ["Franck Muller", "フランクミュラー"], matchType: "exact" },

  // === 中価格帯時計ブランド ===
  { id: "b140", name: "Longines", patterns: ["Longines", "ロンジン"], matchType: "word" },
  { id: "b141", name: "Tissot", patterns: ["Tissot", "ティソ"], matchType: "word" },
  { id: "b142", name: "Hamilton", patterns: ["Hamilton", "ハミルトン"], matchType: "word" },
  { id: "b143", name: "Oris", patterns: ["Oris", "オリス"], matchType: "word" },
  { id: "b144", name: "Maurice Lacroix", patterns: ["Maurice Lacroix", "モーリスラクロア"], matchType: "exact" },
  { id: "b145", name: "Baume & Mercier", patterns: ["Baume & Mercier", "Baume Mercier", "ボームメルシエ"], matchType: "word" },
  { id: "b146", name: "RADO", patterns: ["RADO", "ラドー"], matchType: "word" },
  { id: "b147", name: "GaGa MILANO", patterns: ["GaGa MILANO", "ガガミラノ"], matchType: "exact" },
  { id: "b148", name: "Bell & Ross", patterns: ["Bell & Ross", "ベル&ロス"], matchType: "word" },
  { id: "b149", name: "NOMOS", patterns: ["NOMOS", "ノモス"], matchType: "word" },
  { id: "b150", name: "Frederique Constant", patterns: ["Frederique Constant", "フレデリックコンスタント"], matchType: "exact" },
  { id: "b151", name: "SINN", patterns: ["SINN", "ジン"], matchType: "word" },
  { id: "b152", name: "Mido", patterns: ["Mido", "ミドー"], matchType: "word" },

  // === 日本の時計ブランド ===
  { id: "b160", name: "SEIKO", patterns: ["SEIKO", "セイコー"], matchType: "word" },
  { id: "b161", name: "Grand Seiko", patterns: ["Grand Seiko", "グランドセイコー", "GS"], matchType: "word" },
  { id: "b162", name: "CITIZEN", patterns: ["CITIZEN", "シチズン"], matchType: "word" },
  { id: "b163", name: "CASIO", patterns: ["CASIO", "カシオ"], matchType: "word" },
  { id: "b164", name: "G-SHOCK", patterns: ["G-SHOCK", "GSHOCK", "Gショック"], matchType: "word" },
  { id: "b165", name: "Orient", patterns: ["Orient", "オリエント"], matchType: "word" },
  { id: "b166", name: "Orient Star", patterns: ["Orient Star", "オリエントスター"], matchType: "exact" },
  { id: "b167", name: "CREDOR", patterns: ["CREDOR", "クレドール"], matchType: "word" },
  { id: "b168", name: "ALBA", patterns: ["ALBA", "アルバ"], matchType: "word" },
  { id: "b169", name: "PROSPEX", patterns: ["PROSPEX", "プロスペックス"], matchType: "word" },
  { id: "b170", name: "PRESAGE", patterns: ["PRESAGE", "プレザージュ"], matchType: "word" },

  // === ファッションウォッチ ===
  { id: "b175", name: "Daniel Wellington", patterns: ["Daniel Wellington", "ダニエルウェリントン", "DW"], matchType: "word" },
  { id: "b176", name: "Apple Watch", patterns: ["Apple Watch", "アップルウォッチ"], matchType: "exact" },
  { id: "b177", name: "Swatch", patterns: ["Swatch", "スウォッチ"], matchType: "word" },
  { id: "b178", name: "Fossil", patterns: ["Fossil", "フォッシル"], matchType: "word" },
  { id: "b179", name: "SKAGEN", patterns: ["SKAGEN", "スカーゲン"], matchType: "word" },
  { id: "b180", name: "NIXON", patterns: ["NIXON", "ニクソン"], matchType: "word" },
  { id: "b181", name: "DIESEL", patterns: ["DIESEL", "ディーゼル"], matchType: "word" },

  // === ジュエリーブランド ===
  { id: "b190", name: "TIFFANY & CO.", patterns: ["TIFFANY", "Tiffany & Co.", "ティファニー"], matchType: "word" },
  { id: "b191", name: "Van Cleef & Arpels", patterns: ["Van Cleef & Arpels", "Van Cleef", "ヴァンクリーフ"], matchType: "word" },
  { id: "b192", name: "Harry Winston", patterns: ["Harry Winston", "ハリーウィンストン"], matchType: "exact" },
  { id: "b193", name: "MIKIMOTO", patterns: ["MIKIMOTO", "ミキモト"], matchType: "word" },
  { id: "b194", name: "TASAKI", patterns: ["TASAKI", "タサキ", "田崎"], matchType: "word" },
  { id: "b195", name: "SWAROVSKI", patterns: ["SWAROVSKI", "スワロフスキー"], matchType: "word" },
  { id: "b196", name: "PANDORA", patterns: ["PANDORA", "パンドラ"], matchType: "word" },
  { id: "b197", name: "CHROME HEARTS", patterns: ["CHROME HEARTS", "クロムハーツ"], matchType: "exact" },
  { id: "b198", name: "GRAFF", patterns: ["GRAFF", "グラフ"], matchType: "word" },

  // === カジュアルブランド ===
  { id: "b200", name: "UNIQLO", patterns: ["UNIQLO", "ユニクロ"], matchType: "word" },
  { id: "b201", name: "GU", patterns: ["GU", "ジーユー"], matchType: "word" },
  { id: "b202", name: "ZARA", patterns: ["ZARA", "ザラ"], matchType: "word" },
  { id: "b203", name: "H&M", patterns: ["H&M"], matchType: "word" },
  { id: "b204", name: "GAP", patterns: ["GAP", "ギャップ"], matchType: "word" },
  { id: "b205", name: "無印良品", patterns: ["無印良品", "MUJI"], matchType: "word" },

  // === 日本セレクトショップ ===
  { id: "b210", name: "BEAMS", patterns: ["BEAMS", "ビームス"], matchType: "word" },
  { id: "b211", name: "UNITED ARROWS", patterns: ["UNITED ARROWS", "ユナイテッドアローズ"], matchType: "exact" },
  { id: "b212", name: "SHIPS", patterns: ["SHIPS", "シップス"], matchType: "word" },
  { id: "b213", name: "JOURNAL STANDARD", patterns: ["JOURNAL STANDARD", "ジャーナルスタンダード"], matchType: "exact" },
  { id: "b214", name: "URBAN RESEARCH", patterns: ["URBAN RESEARCH", "アーバンリサーチ"], matchType: "exact" },
  { id: "b215", name: "nano universe", patterns: ["nano universe", "ナノユニバース"], matchType: "exact" },
  { id: "b216", name: "TOMORROWLAND", patterns: ["TOMORROWLAND", "トゥモローランド"], matchType: "word" },
  { id: "b217", name: "EDIFICE", patterns: ["EDIFICE", "エディフィス"], matchType: "word" },

  // === デニムブランド ===
  { id: "b220", name: "Levi's", patterns: ["Levi's", "Levis", "LEVI'S", "リーバイス"], matchType: "word" },
  { id: "b221", name: "LEE", patterns: ["LEE", "リー"], matchType: "word" },
  { id: "b222", name: "Wrangler", patterns: ["Wrangler", "ラングラー"], matchType: "word" },
  { id: "b223", name: "EDWIN", patterns: ["EDWIN", "エドウィン"], matchType: "word" },
  { id: "b224", name: "EVISU", patterns: ["EVISU", "エビス"], matchType: "word" },
  { id: "b225", name: "桃太郎ジーンズ", patterns: ["桃太郎ジーンズ", "Momotaro", "MOMOTARO JEANS"], matchType: "word" },
  { id: "b226", name: "Pure Blue Japan", patterns: ["Pure Blue Japan", "ピュアブルージャパン"], matchType: "exact" },
  { id: "b227", name: "Iron Heart", patterns: ["Iron Heart", "アイアンハート"], matchType: "exact" },
  { id: "b228", name: "Samurai Jeans", patterns: ["Samurai Jeans", "サムライジーンズ"], matchType: "exact" },
  { id: "b229", name: "Sugar Cane", patterns: ["Sugar Cane", "シュガーケーン"], matchType: "exact" },
  { id: "b230", name: "Full Count", patterns: ["Full Count", "フルカウント"], matchType: "exact" },
  { id: "b231", name: "Warehouse", patterns: ["Warehouse", "ウエアハウス"], matchType: "word" },

  // === テック・家電ブランド ===
  { id: "b240", name: "Apple", patterns: ["Apple", "アップル", "iPhone", "iPad", "Mac", "AirPods"], matchType: "word" },
  { id: "b241", name: "SONY", patterns: ["SONY", "ソニー", "PlayStation"], matchType: "word" },
  { id: "b242", name: "Nintendo", patterns: ["Nintendo", "任天堂", "ニンテンドー"], matchType: "word" },
  { id: "b243", name: "Canon", patterns: ["Canon", "キヤノン", "キャノン"], matchType: "word" },
  { id: "b244", name: "Nikon", patterns: ["Nikon", "ニコン"], matchType: "word" },
  { id: "b245", name: "FUJIFILM", patterns: ["FUJIFILM", "富士フイルム"], matchType: "word" },
  { id: "b246", name: "Panasonic", patterns: ["Panasonic", "パナソニック"], matchType: "word" },
  { id: "b247", name: "Dyson", patterns: ["Dyson", "ダイソン"], matchType: "word" },
  { id: "b248", name: "BOSE", patterns: ["BOSE", "ボーズ"], matchType: "word" },
  { id: "b249", name: "Beats", patterns: ["Beats", "ビーツ"], matchType: "word" },
  { id: "b250", name: "JBL", patterns: ["JBL"], matchType: "word" },
  { id: "b251", name: "LEICA", patterns: ["LEICA", "ライカ"], matchType: "word" },
  { id: "b252", name: "HASSELBLAD", patterns: ["HASSELBLAD", "ハッセルブラッド"], matchType: "word" },
  { id: "b253", name: "GoPro", patterns: ["GoPro", "ゴープロ"], matchType: "word" },
  { id: "b254", name: "DJI", patterns: ["DJI"], matchType: "word" },

  // === コスメ・美容ブランド ===
  { id: "b260", name: "SHISEIDO", patterns: ["SHISEIDO", "資生堂"], matchType: "word" },
  { id: "b261", name: "SK-II", patterns: ["SK-II", "SK2", "エスケーツー"], matchType: "word" },
  { id: "b262", name: "MAC", patterns: ["MAC"], matchType: "word" },
  { id: "b263", name: "NARS", patterns: ["NARS", "ナーズ"], matchType: "word" },
  { id: "b264", name: "Aesop", patterns: ["Aesop", "イソップ"], matchType: "word" },
  { id: "b265", name: "La Mer", patterns: ["La Mer", "ラメール", "ドゥラメール"], matchType: "exact" },
  { id: "b266", name: "Jo Malone", patterns: ["Jo Malone", "ジョーマローン"], matchType: "exact" },
  { id: "b267", name: "TOM FORD", patterns: ["TOM FORD", "トムフォード"], matchType: "exact" },
  { id: "b268", name: "YSL BEAUTE", patterns: ["YSL BEAUTE", "イヴサンローラン"], matchType: "word" },

  // === 食器・インテリアブランド ===
  { id: "b280", name: "Meissen", patterns: ["Meissen", "マイセン"], matchType: "word" },
  { id: "b281", name: "Royal Copenhagen", patterns: ["Royal Copenhagen", "ロイヤルコペンハーゲン"], matchType: "exact" },
  { id: "b282", name: "Wedgwood", patterns: ["Wedgwood", "ウェッジウッド"], matchType: "word" },
  { id: "b283", name: "Baccarat", patterns: ["Baccarat", "バカラ"], matchType: "word" },
  { id: "b284", name: "Richard Ginori", patterns: ["Richard Ginori", "リチャードジノリ"], matchType: "exact" },
  { id: "b285", name: "Noritake", patterns: ["Noritake", "ノリタケ"], matchType: "word" },
  { id: "b286", name: "Herend", patterns: ["Herend", "ヘレンド"], matchType: "word" },
  { id: "b287", name: "ARABIA", patterns: ["ARABIA", "アラビア"], matchType: "word" },
  { id: "b288", name: "iittala", patterns: ["iittala", "イッタラ"], matchType: "word" },
  { id: "b289", name: "Marimekko", patterns: ["Marimekko", "マリメッコ"], matchType: "word" },

  // === トレカ・ホビー関連 ===
  { id: "b300", name: "Pokemon", patterns: ["Pokemon", "Pokémon", "ポケモン", "ポケカ"], matchType: "word" },
  { id: "b301", name: "遊戯王", patterns: ["遊戯王", "Yu-Gi-Oh", "YuGiOh"], matchType: "word" },
  { id: "b302", name: "ONE PIECE", patterns: ["ONE PIECE", "ワンピース"], matchType: "exact" },
  { id: "b303", name: "バンダイ", patterns: ["BANDAI", "バンダイ"], matchType: "word" },
  { id: "b304", name: "タミヤ", patterns: ["TAMIYA", "タミヤ"], matchType: "word" },
  { id: "b305", name: "京商", patterns: ["KYOSHO", "京商"], matchType: "word" },
  { id: "b306", name: "Good Smile", patterns: ["Good Smile", "グッドスマイル", "ねんどろいど"], matchType: "word" },
  { id: "b307", name: "Hot Wheels", patterns: ["Hot Wheels", "ホットウィール"], matchType: "exact" },
  { id: "b308", name: "Steiff", patterns: ["Steiff", "シュタイフ"], matchType: "word" },
  { id: "b309", name: "LEGO", patterns: ["LEGO", "レゴ"], matchType: "word" },

  // === 眼鏡・サングラス ===
  { id: "b320", name: "Ray-Ban", patterns: ["Ray-Ban", "RayBan", "レイバン"], matchType: "word" },
  { id: "b321", name: "Oakley", patterns: ["Oakley", "オークリー"], matchType: "word" },
  { id: "b322", name: "OLIVER PEOPLES", patterns: ["OLIVER PEOPLES", "オリバーピープルズ"], matchType: "exact" },
  { id: "b323", name: "TOM FORD EYEWEAR", patterns: ["TOM FORD", "トムフォード"], matchType: "exact" },
  { id: "b324", name: "Persol", patterns: ["Persol", "ペルソール"], matchType: "word" },
  { id: "b325", name: "金子眼鏡", patterns: ["金子眼鏡", "KANEKO OPTICAL"], matchType: "word" },
  { id: "b326", name: "JINS", patterns: ["JINS", "ジンズ"], matchType: "word" },
  { id: "b327", name: "Zoff", patterns: ["Zoff", "ゾフ"], matchType: "word" },

  // === その他ブランド ===
  { id: "b340", name: "RIMOWA", patterns: ["RIMOWA", "リモワ"], matchType: "word" },
  { id: "b341", name: "GLOBE-TROTTER", patterns: ["GLOBE-TROTTER", "グローブトロッター"], matchType: "word" },
  { id: "b342", name: "TUMI", patterns: ["TUMI", "トゥミ"], matchType: "word" },
  { id: "b343", name: "BRIEFING", patterns: ["BRIEFING", "ブリーフィング"], matchType: "word" },
  { id: "b344", name: "GREGORY", patterns: ["GREGORY", "グレゴリー"], matchType: "word" },
  { id: "b345", name: "MYSTERY RANCH", patterns: ["MYSTERY RANCH", "ミステリーランチ"], matchType: "exact" },
  { id: "b346", name: "FILSON", patterns: ["FILSON", "フィルソン"], matchType: "word" },
  { id: "b347", name: "Herschel", patterns: ["Herschel", "ハーシェル"], matchType: "word" },

  // === 靴専門ブランド ===
  { id: "b350", name: "RED WING", patterns: ["RED WING", "レッドウィング"], matchType: "exact" },
  { id: "b351", name: "ALDEN", patterns: ["ALDEN", "オールデン"], matchType: "word" },
  { id: "b352", name: "CHURCH'S", patterns: ["CHURCH'S", "CHURCHS", "チャーチ"], matchType: "word" },
  { id: "b353", name: "CLARKS", patterns: ["CLARKS", "クラークス"], matchType: "word" },
  { id: "b354", name: "Dr.Martens", patterns: ["Dr.Martens", "Dr Martens", "ドクターマーチン"], matchType: "word" },
  { id: "b355", name: "Paraboot", patterns: ["Paraboot", "パラブーツ"], matchType: "word" },
  { id: "b356", name: "TRICKER'S", patterns: ["TRICKER'S", "TRICKERS", "トリッカーズ"], matchType: "word" },
  { id: "b357", name: "Crockett & Jones", patterns: ["Crockett & Jones", "クロケット&ジョーンズ"], matchType: "exact" },
  { id: "b358", name: "Edward Green", patterns: ["Edward Green", "エドワードグリーン"], matchType: "exact" },
  { id: "b359", name: "John Lobb", patterns: ["John Lobb", "ジョンロブ"], matchType: "exact" },
  { id: "b360", name: "COLE HAAN", patterns: ["COLE HAAN", "コールハーン"], matchType: "exact" },
  { id: "b361", name: "Allen Edmonds", patterns: ["Allen Edmonds", "アレンエドモンズ"], matchType: "exact" },
  { id: "b362", name: "Salvatore Ferragamo", patterns: ["Salvatore Ferragamo", "Ferragamo", "フェラガモ"], matchType: "word" },
  { id: "b363", name: "TOD'S", patterns: ["TOD'S", "TODS", "トッズ"], matchType: "word" },
  { id: "b364", name: "SANTONI", patterns: ["SANTONI", "サントーニ"], matchType: "word" },
  { id: "b365", name: "UGG", patterns: ["UGG", "アグ"], matchType: "word" },
  { id: "b366", name: "Timberland", patterns: ["Timberland", "ティンバーランド"], matchType: "word" },
  { id: "b367", name: "BIRKENSTOCK", patterns: ["BIRKENSTOCK", "ビルケンシュトック"], matchType: "word" },
  { id: "b368", name: "Dansko", patterns: ["Dansko", "ダンスコ"], matchType: "word" },
  { id: "b369", name: "CAMPER", patterns: ["CAMPER", "カンペール"], matchType: "word" },

  // === アメカジ・ヴィンテージ系 ===
  { id: "b380", name: "SCHOTT", patterns: ["SCHOTT", "ショット"], matchType: "word" },
  { id: "b381", name: "AVIREX", patterns: ["AVIREX", "アヴィレックス"], matchType: "word" },
  { id: "b382", name: "ALPHA INDUSTRIES", patterns: ["ALPHA INDUSTRIES", "ALPHA", "アルファ"], matchType: "word" },
  { id: "b383", name: "BUZZ RICKSON'S", patterns: ["BUZZ RICKSON'S", "BUZZ RICKSONS", "バズリクソンズ"], matchType: "word" },
  { id: "b384", name: "VANSON", patterns: ["VANSON", "バンソン"], matchType: "word" },
  { id: "b385", name: "REAL McCOY'S", patterns: ["REAL McCOY'S", "REAL MCCOYS", "リアルマッコイズ"], matchType: "word" },
  { id: "b386", name: "TOYS McCOY", patterns: ["TOYS McCOY", "TOYS MCCOY", "トイズマッコイ"], matchType: "word" },
  { id: "b387", name: "WEST RIDE", patterns: ["WEST RIDE", "ウエストライド"], matchType: "exact" },
  { id: "b388", name: "JELADO", patterns: ["JELADO", "ジェラード"], matchType: "word" },
  { id: "b389", name: "FREEWHEELERS", patterns: ["FREEWHEELERS", "フリーホイーラーズ"], matchType: "word" },
  { id: "b390", name: "FLAT HEAD", patterns: ["FLAT HEAD", "フラットヘッド"], matchType: "exact" },
  { id: "b391", name: "STUDIO D'ARTISAN", patterns: ["STUDIO D'ARTISAN", "ステュディオダルチザン"], matchType: "word" },
  { id: "b392", name: "TENDERLOIN", patterns: ["TENDERLOIN", "テンダーロイン"], matchType: "word" },
  { id: "b393", name: "WESCO", patterns: ["WESCO", "ウエスコ"], matchType: "word" },
  { id: "b394", name: "WHITE'S", patterns: ["WHITE'S", "WHITES", "ホワイツ"], matchType: "word" },
  { id: "b395", name: "Lewis Leathers", patterns: ["Lewis Leathers", "ルイスレザー"], matchType: "exact" },
  { id: "b396", name: "Barbour", patterns: ["Barbour", "バブアー"], matchType: "word" },
  { id: "b397", name: "Belstaff", patterns: ["Belstaff", "ベルスタッフ"], matchType: "word" },
  { id: "b398", name: "WOOLRICH", patterns: ["WOOLRICH", "ウールリッチ"], matchType: "word" },
  { id: "b399", name: "Pendleton", patterns: ["Pendleton", "ペンドルトン"], matchType: "word" },

  // === 北欧ブランド ===
  { id: "b400", name: "COS", patterns: ["COS"], matchType: "word" },
  { id: "b401", name: "& Other Stories", patterns: ["& Other Stories", "Other Stories"], matchType: "word" },
  { id: "b402", name: "GANNI", patterns: ["GANNI", "ガニー"], matchType: "word" },
  { id: "b403", name: "ARKET", patterns: ["ARKET", "アーケット"], matchType: "word" },
  { id: "b404", name: "FILIPPA K", patterns: ["FILIPPA K", "フィリッパコー"], matchType: "exact" },
  { id: "b405", name: "TIGER OF SWEDEN", patterns: ["TIGER OF SWEDEN", "タイガーオブスウェーデン"], matchType: "exact" },
  { id: "b406", name: "HOLZWEILER", patterns: ["HOLZWEILER", "ホルツワイラー"], matchType: "word" },
  { id: "b407", name: "TOTEME", patterns: ["TOTEME", "トーテム"], matchType: "word" },
  { id: "b408", name: "RODEBJER", patterns: ["RODEBJER", "ロデベエル"], matchType: "word" },
  { id: "b409", name: "WOOD WOOD", patterns: ["WOOD WOOD", "ウッドウッド"], matchType: "exact" },
  { id: "b410", name: "Norse Projects", patterns: ["Norse Projects", "ノースプロジェクト"], matchType: "exact" },

  // === 時計（追加） ===
  { id: "b420", name: "MOVADO", patterns: ["MOVADO", "モバード"], matchType: "word" },
  { id: "b421", name: "BULOVA", patterns: ["BULOVA", "ブローバ"], matchType: "word" },
  { id: "b422", name: "INVICTA", patterns: ["INVICTA", "インビクタ"], matchType: "word" },
  { id: "b423", name: "Stuhrling", patterns: ["Stuhrling", "ストゥーリング"], matchType: "word" },
  { id: "b424", name: "JUNGHANS", patterns: ["JUNGHANS", "ユンハンス"], matchType: "word" },
  { id: "b425", name: "Laco", patterns: ["Laco", "ラコ"], matchType: "word" },
  { id: "b426", name: "Tutima", patterns: ["Tutima", "チュチマ"], matchType: "word" },
  { id: "b427", name: "STOWA", patterns: ["STOWA", "ストーヴァ"], matchType: "word" },
  { id: "b428", name: "Glycine", patterns: ["Glycine", "グリシン"], matchType: "word" },
  { id: "b429", name: "Eterna", patterns: ["Eterna", "エテルナ"], matchType: "word" },
  { id: "b430", name: "Doxa", patterns: ["Doxa", "ドクサ"], matchType: "word" },
  { id: "b431", name: "Ebel", patterns: ["Ebel", "エベル"], matchType: "word" },
  { id: "b432", name: "Concord", patterns: ["Concord", "コンコルド"], matchType: "word" },
  { id: "b433", name: "Raymond Weil", patterns: ["Raymond Weil", "レイモンドウェイル"], matchType: "exact" },
  { id: "b434", name: "Corum", patterns: ["Corum", "コルム"], matchType: "word" },
  { id: "b435", name: "Perrelet", patterns: ["Perrelet", "ペルレ"], matchType: "word" },
  { id: "b436", name: "Alpina", patterns: ["Alpina", "アルピナ"], matchType: "word" },
  { id: "b437", name: "KING SEIKO", patterns: ["KING SEIKO", "キングセイコー"], matchType: "exact" },
  { id: "b438", name: "ASTRON", patterns: ["ASTRON", "アストロン"], matchType: "word" },
  { id: "b439", name: "OCEANUS", patterns: ["OCEANUS", "オシアナス"], matchType: "word" },
  { id: "b440", name: "ATTESA", patterns: ["ATTESA", "アテッサ"], matchType: "word" },
  { id: "b441", name: "PROMASTER", patterns: ["PROMASTER", "プロマスター"], matchType: "word" },
  { id: "b442", name: "Baby-G", patterns: ["Baby-G", "ベビージー"], matchType: "word" },
  { id: "b443", name: "PRO TREK", patterns: ["PRO TREK", "プロトレック"], matchType: "exact" },
  { id: "b444", name: "EDIFICE", patterns: ["EDIFICE", "エディフィス"], matchType: "word" },
  { id: "b445", name: "MR-G", patterns: ["MR-G"], matchType: "word" },

  // === ゴルフブランド ===
  { id: "b450", name: "Titleist", patterns: ["Titleist", "タイトリスト"], matchType: "word" },
  { id: "b451", name: "Callaway", patterns: ["Callaway", "キャロウェイ"], matchType: "word" },
  { id: "b452", name: "TaylorMade", patterns: ["TaylorMade", "テーラーメイド"], matchType: "word" },
  { id: "b453", name: "PING", patterns: ["PING", "ピン"], matchType: "word" },
  { id: "b454", name: "Scotty Cameron", patterns: ["Scotty Cameron", "スコッティキャメロン"], matchType: "exact" },
  { id: "b455", name: "Bridgestone Golf", patterns: ["Bridgestone Golf", "ブリヂストンゴルフ"], matchType: "exact" },
  { id: "b456", name: "SRIXON", patterns: ["SRIXON", "スリクソン"], matchType: "word" },
  { id: "b457", name: "DUNLOP", patterns: ["DUNLOP", "ダンロップ"], matchType: "word" },
  { id: "b458", name: "Cleveland", patterns: ["Cleveland Golf", "クリーブランド"], matchType: "word" },
  { id: "b459", name: "Cobra", patterns: ["Cobra Golf", "コブラ"], matchType: "word" },
  { id: "b460", name: "HONMA", patterns: ["HONMA", "本間ゴルフ"], matchType: "word" },
  { id: "b461", name: "MIZUNO GOLF", patterns: ["MIZUNO GOLF", "ミズノゴルフ"], matchType: "word" },
  { id: "b462", name: "FootJoy", patterns: ["FootJoy", "フットジョイ"], matchType: "word" },
  { id: "b463", name: "Odyssey", patterns: ["Odyssey", "オデッセイ"], matchType: "word" },

  // === 楽器ブランド ===
  { id: "b470", name: "FENDER", patterns: ["FENDER", "フェンダー"], matchType: "word" },
  { id: "b471", name: "GIBSON", patterns: ["GIBSON", "ギブソン"], matchType: "word" },
  { id: "b472", name: "YAMAHA", patterns: ["YAMAHA", "ヤマハ"], matchType: "word" },
  { id: "b473", name: "Roland", patterns: ["Roland", "ローランド"], matchType: "word" },
  { id: "b474", name: "BOSS", patterns: ["BOSS"], matchType: "word" },
  { id: "b475", name: "Martin", patterns: ["Martin Guitar", "マーティン"], matchType: "word" },
  { id: "b476", name: "Taylor", patterns: ["Taylor Guitar", "テイラー"], matchType: "word" },
  { id: "b477", name: "Ibanez", patterns: ["Ibanez", "アイバニーズ"], matchType: "word" },
  { id: "b478", name: "ESP", patterns: ["ESP"], matchType: "word" },
  { id: "b479", name: "PRS", patterns: ["PRS", "Paul Reed Smith"], matchType: "word" },
  { id: "b480", name: "Epiphone", patterns: ["Epiphone", "エピフォン"], matchType: "word" },
  { id: "b481", name: "Gretsch", patterns: ["Gretsch", "グレッチ"], matchType: "word" },
  { id: "b482", name: "Rickenbacker", patterns: ["Rickenbacker", "リッケンバッカー"], matchType: "word" },
  { id: "b483", name: "KORG", patterns: ["KORG", "コルグ"], matchType: "word" },
  { id: "b484", name: "Moog", patterns: ["Moog", "モーグ"], matchType: "word" },
  { id: "b485", name: "Marshall", patterns: ["Marshall", "マーシャル"], matchType: "word" },
  { id: "b486", name: "VOX", patterns: ["VOX", "ヴォックス"], matchType: "word" },
  { id: "b487", name: "SHURE", patterns: ["SHURE", "シュア"], matchType: "word" },
  { id: "b488", name: "Sennheiser", patterns: ["Sennheiser", "ゼンハイザー"], matchType: "word" },
  { id: "b489", name: "Audio-Technica", patterns: ["Audio-Technica", "オーディオテクニカ"], matchType: "word" },

  // === 筆記具・高級文具 ===
  { id: "b500", name: "MONTBLANC", patterns: ["MONTBLANC", "モンブラン"], matchType: "word" },
  { id: "b501", name: "PARKER", patterns: ["PARKER", "パーカー"], matchType: "word" },
  { id: "b502", name: "PELIKAN", patterns: ["PELIKAN", "ペリカン"], matchType: "word" },
  { id: "b503", name: "LAMY", patterns: ["LAMY", "ラミー"], matchType: "word" },
  { id: "b504", name: "CROSS", patterns: ["CROSS", "クロス"], matchType: "word" },
  { id: "b505", name: "Waterman", patterns: ["Waterman", "ウォーターマン"], matchType: "word" },
  { id: "b506", name: "PILOT", patterns: ["PILOT", "パイロット"], matchType: "word" },
  { id: "b507", name: "SAILOR", patterns: ["SAILOR", "セーラー"], matchType: "word" },
  { id: "b508", name: "PLATINUM", patterns: ["PLATINUM", "プラチナ万年筆"], matchType: "word" },
  { id: "b509", name: "Aurora", patterns: ["Aurora", "アウロラ"], matchType: "word" },
  { id: "b510", name: "Visconti", patterns: ["Visconti", "ヴィスコンティ"], matchType: "word" },
  { id: "b511", name: "Caran d'Ache", patterns: ["Caran d'Ache", "カランダッシュ"], matchType: "word" },
  { id: "b512", name: "Faber-Castell", patterns: ["Faber-Castell", "ファーバーカステル"], matchType: "word" },
  { id: "b513", name: "Kaweco", patterns: ["Kaweco", "カヴェコ"], matchType: "word" },
  { id: "b514", name: "TWSBI", patterns: ["TWSBI", "ツイスビー"], matchType: "word" },

  // === バイク・車関連 ===
  { id: "b520", name: "HARLEY-DAVIDSON", patterns: ["HARLEY-DAVIDSON", "HARLEY", "ハーレーダビッドソン", "ハーレー"], matchType: "word" },
  { id: "b521", name: "Ducati", patterns: ["Ducati", "ドゥカティ"], matchType: "word" },
  { id: "b522", name: "TRIUMPH", patterns: ["TRIUMPH", "トライアンフ"], matchType: "word" },
  { id: "b523", name: "BMW Motorrad", patterns: ["BMW Motorrad", "BMWバイク"], matchType: "word" },
  { id: "b524", name: "KAWASAKI", patterns: ["KAWASAKI", "カワサキ"], matchType: "word" },
  { id: "b525", name: "HONDA", patterns: ["HONDA", "ホンダ"], matchType: "word" },
  { id: "b526", name: "SUZUKI", patterns: ["SUZUKI", "スズキ"], matchType: "word" },
  { id: "b527", name: "Ferrari", patterns: ["Ferrari", "フェラーリ"], matchType: "word" },
  { id: "b528", name: "PORSCHE", patterns: ["PORSCHE", "ポルシェ"], matchType: "word" },
  { id: "b529", name: "Lamborghini", patterns: ["Lamborghini", "ランボルギーニ"], matchType: "word" },
  { id: "b530", name: "BENTLEY", patterns: ["BENTLEY", "ベントレー"], matchType: "word" },
  { id: "b531", name: "Rolls-Royce", patterns: ["Rolls-Royce", "Rolls Royce", "ロールスロイス"], matchType: "word" },
  { id: "b532", name: "ASTON MARTIN", patterns: ["ASTON MARTIN", "アストンマーティン"], matchType: "exact" },
  { id: "b533", name: "Maserati", patterns: ["Maserati", "マセラティ"], matchType: "word" },
  { id: "b534", name: "ALFA ROMEO", patterns: ["ALFA ROMEO", "アルファロメオ"], matchType: "exact" },
  { id: "b535", name: "Mercedes-Benz", patterns: ["Mercedes-Benz", "Mercedes", "メルセデスベンツ", "ベンツ"], matchType: "word" },
  { id: "b536", name: "BMW", patterns: ["BMW"], matchType: "word" },
  { id: "b537", name: "Audi", patterns: ["Audi", "アウディ"], matchType: "word" },

  // === キャラクター・アニメ ===
  { id: "b550", name: "SANRIO", patterns: ["SANRIO", "サンリオ", "Hello Kitty", "ハローキティ"], matchType: "word" },
  { id: "b551", name: "Disney", patterns: ["Disney", "ディズニー", "Mickey Mouse", "ミッキーマウス"], matchType: "word" },
  { id: "b552", name: "スタジオジブリ", patterns: ["スタジオジブリ", "Studio Ghibli", "Ghibli", "ジブリ"], matchType: "word" },
  { id: "b553", name: "鬼滅の刃", patterns: ["鬼滅の刃", "Demon Slayer", "Kimetsu"], matchType: "word" },
  { id: "b554", name: "呪術廻戦", patterns: ["呪術廻戦", "Jujutsu Kaisen"], matchType: "word" },
  { id: "b555", name: "進撃の巨人", patterns: ["進撃の巨人", "Attack on Titan"], matchType: "word" },
  { id: "b556", name: "ドラゴンボール", patterns: ["ドラゴンボール", "Dragon Ball", "DRAGON BALL"], matchType: "word" },
  { id: "b557", name: "NARUTO", patterns: ["NARUTO", "ナルト"], matchType: "word" },
  { id: "b558", name: "初音ミク", patterns: ["初音ミク", "Hatsune Miku", "MIKU"], matchType: "word" },
  { id: "b559", name: "Snoopy", patterns: ["Snoopy", "スヌーピー", "PEANUTS", "ピーナッツ"], matchType: "word" },
  { id: "b560", name: "MARVEL", patterns: ["MARVEL", "マーベル"], matchType: "word" },
  { id: "b561", name: "DC Comics", patterns: ["DC Comics", "DC", "Batman", "バットマン", "Superman"], matchType: "word" },
  { id: "b562", name: "Star Wars", patterns: ["Star Wars", "スターウォーズ"], matchType: "exact" },
  { id: "b563", name: "Harry Potter", patterns: ["Harry Potter", "ハリーポッター"], matchType: "exact" },
  { id: "b564", name: "となりのトトロ", patterns: ["となりのトトロ", "Totoro", "トトロ"], matchType: "word" },
  { id: "b565", name: "千と千尋の神隠し", patterns: ["千と千尋の神隠し", "Spirited Away"], matchType: "word" },
  { id: "b566", name: "すみっコぐらし", patterns: ["すみっコぐらし", "Sumikko Gurashi"], matchType: "word" },
  { id: "b567", name: "リラックマ", patterns: ["リラックマ", "Rilakkuma"], matchType: "word" },
  { id: "b568", name: "ムーミン", patterns: ["ムーミン", "Moomin"], matchType: "word" },
  { id: "b569", name: "miffy", patterns: ["miffy", "ミッフィー"], matchType: "word" },

  // === スポーツチーム・選手 ===
  { id: "b580", name: "大谷翔平", patterns: ["大谷翔平", "Shohei Ohtani", "Ohtani"], matchType: "word" },
  { id: "b581", name: "イチロー", patterns: ["イチロー", "Ichiro"], matchType: "word" },
  { id: "b582", name: "田中将大", patterns: ["田中将大", "Masahiro Tanaka"], matchType: "word" },
  { id: "b583", name: "ダルビッシュ有", patterns: ["ダルビッシュ有", "Yu Darvish", "Darvish"], matchType: "word" },
  { id: "b584", name: "New York Yankees", patterns: ["Yankees", "ヤンキース"], matchType: "word" },
  { id: "b585", name: "Los Angeles Dodgers", patterns: ["Dodgers", "ドジャース"], matchType: "word" },
  { id: "b586", name: "Boston Red Sox", patterns: ["Red Sox", "レッドソックス"], matchType: "word" },
  { id: "b587", name: "Chicago Cubs", patterns: ["Cubs", "カブス"], matchType: "word" },
  { id: "b588", name: "阪神タイガース", patterns: ["阪神タイガース", "阪神", "Tigers"], matchType: "word" },
  { id: "b589", name: "読売ジャイアンツ", patterns: ["読売ジャイアンツ", "巨人", "Giants"], matchType: "word" },
  { id: "b590", name: "LA Lakers", patterns: ["Lakers", "レイカーズ"], matchType: "word" },
  { id: "b591", name: "Chicago Bulls", patterns: ["Bulls", "ブルズ"], matchType: "word" },
  { id: "b592", name: "Michael Jordan", patterns: ["Michael Jordan", "マイケルジョーダン"], matchType: "exact" },
  { id: "b593", name: "LeBron James", patterns: ["LeBron James", "LeBron", "レブロン"], matchType: "word" },
  { id: "b594", name: "Kobe Bryant", patterns: ["Kobe Bryant", "Kobe", "コービー"], matchType: "word" },

  // === バッグ・革製品（追加） ===
  { id: "b600", name: "IL BISONTE", patterns: ["IL BISONTE", "イルビゾンテ"], matchType: "exact" },
  { id: "b601", name: "MANSUR GAVRIEL", patterns: ["MANSUR GAVRIEL", "マンサーガブリエル"], matchType: "exact" },
  { id: "b602", name: "POLENE", patterns: ["POLENE", "ポレーヌ"], matchType: "word" },
  { id: "b603", name: "WANDLER", patterns: ["WANDLER", "ワンドラー"], matchType: "word" },
  { id: "b604", name: "BY FAR", patterns: ["BY FAR", "バイファー"], matchType: "exact" },
  { id: "b605", name: "STAUD", patterns: ["STAUD", "スタウド"], matchType: "word" },
  { id: "b606", name: "GANNI", patterns: ["GANNI", "ガニー"], matchType: "word" },
  { id: "b607", name: "DANSE LENTE", patterns: ["DANSE LENTE", "ダンスレンテ"], matchType: "exact" },
  { id: "b608", name: "Anya Hindmarch", patterns: ["Anya Hindmarch", "アニヤハインドマーチ"], matchType: "exact" },
  { id: "b609", name: "MULBERRY", patterns: ["MULBERRY", "マルベリー"], matchType: "word" },
  { id: "b610", name: "ZANELLATO", patterns: ["ZANELLATO", "ザネラート"], matchType: "word" },
  { id: "b611", name: "SERAPIAN", patterns: ["SERAPIAN", "セラピアン"], matchType: "word" },
  { id: "b612", name: "VALEXTRA", patterns: ["VALEXTRA", "ヴァレクストラ"], matchType: "word" },
  { id: "b613", name: "Delvaux", patterns: ["Delvaux", "デルヴォー"], matchType: "word" },
  { id: "b614", name: "MOYNAT", patterns: ["MOYNAT", "モワナ"], matchType: "word" },
  { id: "b615", name: "GOYARD", patterns: ["GOYARD", "ゴヤール"], matchType: "word" },
  { id: "b616", name: "HUNTING WORLD", patterns: ["HUNTING WORLD", "ハンティングワールド"], matchType: "exact" },
  { id: "b617", name: "Felisi", patterns: ["Felisi", "フェリージ"], matchType: "word" },
  { id: "b618", name: "Daniel & Bob", patterns: ["Daniel & Bob", "ダニエル&ボブ"], matchType: "word" },
  { id: "b619", name: "HENRY CUIR", patterns: ["HENRY CUIR", "アンリークイール"], matchType: "exact" },

  // === ストリート・スケート（追加） ===
  { id: "b630", name: "PALACE", patterns: ["PALACE", "パレス"], matchType: "word" },
  { id: "b631", name: "Carhartt WIP", patterns: ["Carhartt WIP", "Carhartt", "カーハート"], matchType: "word" },
  { id: "b632", name: "THRASHER", patterns: ["THRASHER", "スラッシャー"], matchType: "word" },
  { id: "b633", name: "HUF", patterns: ["HUF", "ハフ"], matchType: "word" },
  { id: "b634", name: "XLARGE", patterns: ["XLARGE", "エクストララージ"], matchType: "word" },
  { id: "b635", name: "X-girl", patterns: ["X-girl", "エックスガール"], matchType: "word" },
  { id: "b636", name: "COOTIE", patterns: ["COOTIE", "クーティー"], matchType: "word" },
  { id: "b637", name: "WACKO MARIA", patterns: ["WACKO MARIA", "ワコマリア"], matchType: "exact" },
  { id: "b638", name: "CHALLENGER", patterns: ["CHALLENGER", "チャレンジャー"], matchType: "word" },
  { id: "b639", name: "RADIALL", patterns: ["RADIALL", "ラディアル"], matchType: "word" },
  { id: "b640", name: "CALEE", patterns: ["CALEE", "キャリー"], matchType: "word" },
  { id: "b641", name: "CRIMIE", patterns: ["CRIMIE", "クライミー"], matchType: "word" },
  { id: "b642", name: "RATS", patterns: ["RATS", "ラッツ"], matchType: "word" },

  // === その他追加 ===
  { id: "b650", name: "GLOBE-TROTTER", patterns: ["GLOBE-TROTTER", "グローブトロッター"], matchType: "word" },
  { id: "b651", name: "ZERO HALLIBURTON", patterns: ["ZERO HALLIBURTON", "ゼロハリバートン"], matchType: "exact" },
  { id: "b652", name: "Pelican", patterns: ["Pelican", "ペリカン"], matchType: "word" },
  { id: "b653", name: "Nanga", patterns: ["Nanga", "ナンガ"], matchType: "word" },
  { id: "b654", name: "NORRONA", patterns: ["NORRONA", "ノローナ"], matchType: "word" },
  { id: "b655", name: "KLATTERMUSEN", patterns: ["KLATTERMUSEN", "クレッタルムーセン"], matchType: "word" },
  { id: "b656", name: "HAGLOFS", patterns: ["HAGLOFS", "ホグロフス"], matchType: "word" },
  { id: "b657", name: "Fjallraven", patterns: ["Fjallraven", "フェールラーベン"], matchType: "word" },
  { id: "b658", name: "OSPREY", patterns: ["OSPREY", "オスプレー"], matchType: "word" },
  { id: "b659", name: "DEUTER", patterns: ["DEUTER", "ドイター"], matchType: "word" },
  { id: "b660", name: "Karrimor", patterns: ["Karrimor", "カリマー"], matchType: "word" },
  { id: "b661", name: "MILLET", patterns: ["MILLET", "ミレー"], matchType: "word" },
  { id: "b662", name: "Black Diamond", patterns: ["Black Diamond", "ブラックダイヤモンド"], matchType: "exact" },
  { id: "b663", name: "MSR", patterns: ["MSR"], matchType: "word" },
  { id: "b664", name: "SOTO", patterns: ["SOTO", "ソト"], matchType: "word" },
  { id: "b665", name: "PRIMUS", patterns: ["PRIMUS", "プリムス"], matchType: "word" },
  { id: "b666", name: "HILLEBERG", patterns: ["HILLEBERG", "ヒルバーグ"], matchType: "word" },
  { id: "b667", name: "Nordisk", patterns: ["Nordisk", "ノルディスク"], matchType: "word" },
  { id: "b668", name: "HELINOX", patterns: ["HELINOX", "ヘリノックス"], matchType: "word" },
  { id: "b669", name: "YETI", patterns: ["YETI", "イエティ"], matchType: "word" },
  { id: "b670", name: "STANLEY", patterns: ["STANLEY", "スタンレー"], matchType: "word" },

  // === 追加ブランド（500件達成用） ===
  // ラグジュアリー追加
  { id: "b680", name: "BRUNELLO CUCINELLI", patterns: ["BRUNELLO CUCINELLI", "ブルネロクチネリ"], matchType: "exact" },
  { id: "b681", name: "LORO PIANA", patterns: ["LORO PIANA", "ロロピアーナ"], matchType: "exact" },
  { id: "b682", name: "ZEGNA", patterns: ["ZEGNA", "Ermenegildo Zegna", "ゼニア"], matchType: "word" },
  { id: "b683", name: "BERLUTI", patterns: ["BERLUTI", "ベルルッティ"], matchType: "word" },
  { id: "b684", name: "BRIONI", patterns: ["BRIONI", "ブリオーニ"], matchType: "word" },
  { id: "b685", name: "KITON", patterns: ["KITON", "キートン"], matchType: "word" },
  { id: "b686", name: "TOM FORD", patterns: ["TOM FORD", "トムフォード"], matchType: "exact" },
  { id: "b687", name: "Ralph Lauren", patterns: ["Ralph Lauren", "POLO RALPH LAUREN", "ラルフローレン"], matchType: "word" },
  { id: "b688", name: "BROOKS BROTHERS", patterns: ["BROOKS BROTHERS", "ブルックスブラザーズ"], matchType: "exact" },
  { id: "b689", name: "LACOSTE", patterns: ["LACOSTE", "ラコステ"], matchType: "word" },

  // 日本ブランド追加
  { id: "b690", name: "KENZO", patterns: ["KENZO", "ケンゾー"], matchType: "word" },
  { id: "b691", name: "HANAE MORI", patterns: ["HANAE MORI", "ハナエモリ"], matchType: "exact" },
  { id: "b692", name: "JUNKO SHIMADA", patterns: ["JUNKO SHIMADA", "ジュンコシマダ"], matchType: "exact" },
  { id: "b693", name: "KANSAI YAMAMOTO", patterns: ["KANSAI YAMAMOTO", "山本寛斎"], matchType: "exact" },
  { id: "b694", name: "45rpm", patterns: ["45rpm", "45アールピーエム"], matchType: "word" },
  { id: "b695", name: "YAECA", patterns: ["YAECA", "ヤエカ"], matchType: "word" },
  { id: "b696", name: "AURALEE", patterns: ["AURALEE", "オーラリー"], matchType: "word" },
  { id: "b697", name: "COMOLI", patterns: ["COMOLI", "コモリ"], matchType: "word" },
  { id: "b698", name: "ATON", patterns: ["ATON", "エイトン"], matchType: "word" },
  { id: "b699", name: "TEATORA", patterns: ["TEATORA", "テアトラ"], matchType: "word" },

  // 時計追加
  { id: "b700", name: "A. Lange & Sohne", patterns: ["A. Lange & Sohne", "A.LANGE", "ランゲ&ゾーネ"], matchType: "word" },
  { id: "b701", name: "Glashutte Original", patterns: ["Glashutte Original", "グラスヒュッテ"], matchType: "word" },
  { id: "b702", name: "Roger Dubuis", patterns: ["Roger Dubuis", "ロジェデュブイ"], matchType: "exact" },
  { id: "b703", name: "Richard Mille", patterns: ["Richard Mille", "リシャールミル"], matchType: "exact" },
  { id: "b704", name: "Jacob & Co", patterns: ["Jacob & Co", "ジェイコブ"], matchType: "word" },
  { id: "b705", name: "Chopard", patterns: ["Chopard", "ショパール"], matchType: "word" },
  { id: "b706", name: "Piaget", patterns: ["Piaget", "ピアジェ"], matchType: "word" },
  { id: "b707", name: "BREGUET", patterns: ["BREGUET", "ブレゲ"], matchType: "word" },
  { id: "b708", name: "SEIKO DOLCE", patterns: ["SEIKO DOLCE", "セイコードルチェ"], matchType: "exact" },
  { id: "b709", name: "SEIKO EXCELINE", patterns: ["SEIKO EXCELINE", "セイコーエクセリーヌ"], matchType: "exact" },

  // カメラ追加
  { id: "b710", name: "OLYMPUS", patterns: ["OLYMPUS", "オリンパス"], matchType: "word" },
  { id: "b711", name: "PENTAX", patterns: ["PENTAX", "ペンタックス"], matchType: "word" },
  { id: "b712", name: "SIGMA", patterns: ["SIGMA", "シグマ"], matchType: "word" },
  { id: "b713", name: "TAMRON", patterns: ["TAMRON", "タムロン"], matchType: "word" },
  { id: "b714", name: "RICOH", patterns: ["RICOH", "リコー", "GR"], matchType: "word" },
  { id: "b715", name: "Mamiya", patterns: ["Mamiya", "マミヤ"], matchType: "word" },
  { id: "b716", name: "CONTAX", patterns: ["CONTAX", "コンタックス"], matchType: "word" },
  { id: "b717", name: "Voigtlander", patterns: ["Voigtlander", "フォクトレンダー"], matchType: "word" },
  { id: "b718", name: "Zeiss", patterns: ["Zeiss", "ツァイス"], matchType: "word" },
  { id: "b719", name: "MINOLTA", patterns: ["MINOLTA", "ミノルタ"], matchType: "word" },

  // アクセサリー追加
  { id: "b720", name: "PIAGET", patterns: ["PIAGET", "ピアジェ"], matchType: "word" },
  { id: "b721", name: "POMELLATO", patterns: ["POMELLATO", "ポメラート"], matchType: "word" },
  { id: "b722", name: "BOUCHERON", patterns: ["BOUCHERON", "ブシュロン"], matchType: "word" },
  { id: "b723", name: "CHAUMET", patterns: ["CHAUMET", "ショーメ"], matchType: "word" },
  { id: "b724", name: "FRED", patterns: ["FRED", "フレッド"], matchType: "word" },
  { id: "b725", name: "DAMIANI", patterns: ["DAMIANI", "ダミアーニ"], matchType: "word" },
  { id: "b726", name: "BUCCELLATI", patterns: ["BUCCELLATI", "ブチェラッティ"], matchType: "word" },
  { id: "b727", name: "Georg Jensen", patterns: ["Georg Jensen", "ジョージジェンセン"], matchType: "exact" },
  { id: "b728", name: "JOHN HARDY", patterns: ["JOHN HARDY", "ジョンハーディ"], matchType: "exact" },
  { id: "b729", name: "DAVID YURMAN", patterns: ["DAVID YURMAN", "デビッドユーマン"], matchType: "exact" },

  // インテリア・食器追加
  { id: "b730", name: "LE CREUSET", patterns: ["LE CREUSET", "ルクルーゼ"], matchType: "exact" },
  { id: "b731", name: "STAUB", patterns: ["STAUB", "ストウブ"], matchType: "word" },
  { id: "b732", name: "VERMICULAR", patterns: ["VERMICULAR", "バーミキュラ"], matchType: "word" },
  { id: "b733", name: "DANSK", patterns: ["DANSK", "ダンスク"], matchType: "word" },
  { id: "b734", name: "ALESSI", patterns: ["ALESSI", "アレッシィ"], matchType: "word" },
  { id: "b735", name: "KAHLER", patterns: ["KAHLER", "ケーラー"], matchType: "word" },
  { id: "b736", name: "Georg Jensen Living", patterns: ["Georg Jensen", "ジョージジェンセン"], matchType: "word" },
  { id: "b737", name: "RIEDEL", patterns: ["RIEDEL", "リーデル"], matchType: "word" },
  { id: "b738", name: "LALIQUE", patterns: ["LALIQUE", "ラリック"], matchType: "word" },
  { id: "b739", name: "CHRISTOFLE", patterns: ["CHRISTOFLE", "クリストフル"], matchType: "word" },

  // ゲーム・ホビー追加
  { id: "b740", name: "SEGA", patterns: ["SEGA", "セガ"], matchType: "word" },
  { id: "b741", name: "CAPCOM", patterns: ["CAPCOM", "カプコン"], matchType: "word" },
  { id: "b742", name: "KONAMI", patterns: ["KONAMI", "コナミ"], matchType: "word" },
  { id: "b743", name: "SQUARE ENIX", patterns: ["SQUARE ENIX", "スクウェアエニックス", "スクエニ"], matchType: "word" },
  { id: "b744", name: "TAKARA TOMY", patterns: ["TAKARA TOMY", "タカラトミー", "トミカ", "プラレール"], matchType: "word" },
  { id: "b745", name: "MEDICOM TOY", patterns: ["MEDICOM TOY", "メディコムトイ", "BE@RBRICK", "ベアブリック"], matchType: "word" },
  { id: "b746", name: "KAWS", patterns: ["KAWS", "カウズ"], matchType: "word" },
  { id: "b747", name: "BEARBRICK", patterns: ["BEARBRICK", "BE@RBRICK", "ベアブリック"], matchType: "word" },
  { id: "b748", name: "FUNKO", patterns: ["FUNKO", "ファンコ", "POP!"], matchType: "word" },
  { id: "b749", name: "NECA", patterns: ["NECA", "ネカ"], matchType: "word" },

  // 香水ブランド
  { id: "b750", name: "CREED", patterns: ["CREED", "クリード"], matchType: "word" },
  { id: "b751", name: "BYREDO", patterns: ["BYREDO", "バイレード"], matchType: "word" },
  { id: "b752", name: "DIPTYQUE", patterns: ["DIPTYQUE", "ディプティック"], matchType: "word" },
  { id: "b753", name: "LE LABO", patterns: ["LE LABO", "ルラボ"], matchType: "exact" },
  { id: "b754", name: "FREDERIC MALLE", patterns: ["FREDERIC MALLE", "フレデリックマル"], matchType: "exact" },
  { id: "b755", name: "MAISON FRANCIS KURKDJIAN", patterns: ["MAISON FRANCIS KURKDJIAN", "MFK", "メゾンフランシスクルジャン"], matchType: "word" },
  { id: "b756", name: "PENHALIGON'S", patterns: ["PENHALIGON'S", "PENHALIGONS", "ペンハリガン"], matchType: "word" },
  { id: "b757", name: "ACQUA DI PARMA", patterns: ["ACQUA DI PARMA", "アクアディパルマ"], matchType: "exact" },
  { id: "b758", name: "SERGE LUTENS", patterns: ["SERGE LUTENS", "セルジュルタンス"], matchType: "exact" },
  { id: "b759", name: "SANTA MARIA NOVELLA", patterns: ["SANTA MARIA NOVELLA", "サンタマリアノヴェッラ"], matchType: "exact" },
];

// ブランドマスター管理クラス
class BrandMaster {
  constructor() {
    this.brands = [];
    this.sheetBrands = {}; // シートごとの追加ブランド
    this.initialized = false;
  }

  /**
   * 初期化 - ストレージからデータを読み込み
   */
  async init() {
    if (this.initialized) return;

    try {
      const data = await chrome.storage.local.get(['brandMaster', 'sheetBrands']);

      if (data.brandMaster && data.brandMaster.brands) {
        this.brands = data.brandMaster.brands;
      } else {
        // 初回起動時はデフォルトをコピー
        this.brands = JSON.parse(JSON.stringify(DEFAULT_BRANDS));
        await this.save();
      }

      this.sheetBrands = data.sheetBrands || {};
      this.initialized = true;
    } catch (error) {
      console.error('BrandMaster init error:', error);
      this.brands = JSON.parse(JSON.stringify(DEFAULT_BRANDS));
    }
  }

  /**
   * ストレージに保存
   */
  async save() {
    await chrome.storage.local.set({
      brandMaster: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        brands: this.brands
      },
      sheetBrands: this.sheetBrands
    });
  }

  /**
   * 全ブランドを取得（マスター + シート固有）
   */
  getAllBrands(sheetId = null) {
    let allBrands = [...this.brands];

    if (sheetId && this.sheetBrands[sheetId]) {
      allBrands = [...allBrands, ...this.sheetBrands[sheetId]];
    }

    return allBrands;
  }

  /**
   * タイトルからブランドを判定
   */
  detectBrand(title, sheetId = null) {
    const allBrands = this.getAllBrands(sheetId);

    for (const brand of allBrands) {
      for (const pattern of brand.patterns) {
        let regex;

        if (brand.matchType === 'exact') {
          // 完全一致（2単語以上のブランド用）
          regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'i');
        } else if (brand.matchType === 'contains') {
          // 部分一致
          regex = new RegExp(this.escapeRegex(pattern), 'i');
        } else {
          // word（デフォルト）- 単語境界
          regex = new RegExp(`\\b${this.escapeRegex(pattern)}\\b`, 'i');
        }

        if (regex.test(title)) {
          return {
            name: brand.name,
            matchedPattern: pattern,
            id: brand.id
          };
        }
      }
    }

    return null;
  }

  /**
   * 正規表現の特殊文字をエスケープ
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * マスターにブランドを追加
   */
  async addBrand(brand) {
    const newId = `b${Date.now()}`;
    const newBrand = {
      id: newId,
      name: brand.name,
      patterns: brand.patterns || [brand.name],
      matchType: brand.matchType || 'word',
      isCustom: true
    };

    this.brands.push(newBrand);
    await this.save();
    return newBrand;
  }

  /**
   * シート固有のブランドを追加
   */
  async addSheetBrand(sheetId, brand) {
    if (!this.sheetBrands[sheetId]) {
      this.sheetBrands[sheetId] = [];
    }

    const newId = `sb_${sheetId}_${Date.now()}`;
    const newBrand = {
      id: newId,
      name: brand.name,
      patterns: brand.patterns || [brand.name],
      matchType: brand.matchType || 'word',
      isSheetSpecific: true,
      sheetId: sheetId
    };

    this.sheetBrands[sheetId].push(newBrand);
    await this.save();
    return newBrand;
  }

  /**
   * ブランドを削除
   */
  async removeBrand(brandId) {
    // マスターから削除
    this.brands = this.brands.filter(b => b.id !== brandId);

    // シート固有からも削除
    for (const sheetId in this.sheetBrands) {
      this.sheetBrands[sheetId] = this.sheetBrands[sheetId].filter(b => b.id !== brandId);
    }

    await this.save();
  }

  /**
   * ブランドを更新
   */
  async updateBrand(brandId, updates) {
    const brand = this.brands.find(b => b.id === brandId);
    if (brand) {
      Object.assign(brand, updates);
      await this.save();
      return brand;
    }

    // シート固有を検索
    for (const sheetId in this.sheetBrands) {
      const sheetBrand = this.sheetBrands[sheetId].find(b => b.id === brandId);
      if (sheetBrand) {
        Object.assign(sheetBrand, updates);
        await this.save();
        return sheetBrand;
      }
    }

    return null;
  }

  /**
   * デフォルトにリセット
   */
  async resetToDefault() {
    this.brands = JSON.parse(JSON.stringify(DEFAULT_BRANDS));
    await this.save();
  }

  /**
   * 検索
   */
  searchBrands(query) {
    const lowerQuery = query.toLowerCase();
    return this.brands.filter(brand =>
      brand.name.toLowerCase().includes(lowerQuery) ||
      brand.patterns.some(p => p.toLowerCase().includes(lowerQuery))
    );
  }
}

// シングルトンインスタンス
const brandMaster = new BrandMaster();

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_BRANDS, BrandMaster, brandMaster };
}
