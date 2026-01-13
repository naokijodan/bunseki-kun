/**
 * ポケモンカード専用プロファイル
 * タイトルからカード属性を抽出するロジック
 */

// =====================================
// カード名辞書（名寄せ対応）- 主要ポケモン約150種+トレーナー
// =====================================
const POKEMON_CARDS = {
  // ===== 初代御三家 =====
  'pikachu': { ja: 'ピカチュウ', id: '025', category: 'ポケモン' },
  'ピカチュウ': { ja: 'ピカチュウ', id: '025', category: 'ポケモン' },
  'raichu': { ja: 'ライチュウ', id: '026', category: 'ポケモン' },
  'ライチュウ': { ja: 'ライチュウ', id: '026', category: 'ポケモン' },
  'pichu': { ja: 'ピチュー', id: '172', category: 'ポケモン' },

  'charizard': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'lizardon': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'リザードン': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'charmeleon': { ja: 'リザード', id: '005', category: 'ポケモン' },
  'charmander': { ja: 'ヒトカゲ', id: '004', category: 'ポケモン' },
  'ヒトカゲ': { ja: 'ヒトカゲ', id: '004', category: 'ポケモン' },

  'venusaur': { ja: 'フシギバナ', id: '003', category: 'ポケモン' },
  'フシギバナ': { ja: 'フシギバナ', id: '003', category: 'ポケモン' },
  'ivysaur': { ja: 'フシギソウ', id: '002', category: 'ポケモン' },
  'bulbasaur': { ja: 'フシギダネ', id: '001', category: 'ポケモン' },
  'フシギダネ': { ja: 'フシギダネ', id: '001', category: 'ポケモン' },

  'blastoise': { ja: 'カメックス', id: '009', category: 'ポケモン' },
  'カメックス': { ja: 'カメックス', id: '009', category: 'ポケモン' },
  'wartortle': { ja: 'カメール', id: '008', category: 'ポケモン' },
  'squirtle': { ja: 'ゼニガメ', id: '007', category: 'ポケモン' },
  'ゼニガメ': { ja: 'ゼニガメ', id: '007', category: 'ポケモン' },

  // ===== 伝説・幻 =====
  'mewtwo': { ja: 'ミュウツー', id: '150', category: 'ポケモン' },
  'ミュウツー': { ja: 'ミュウツー', id: '150', category: 'ポケモン' },
  'mew': { ja: 'ミュウ', id: '151', category: 'ポケモン' },
  'ミュウ': { ja: 'ミュウ', id: '151', category: 'ポケモン' },

  'lugia': { ja: 'ルギア', id: '249', category: 'ポケモン' },
  'ルギア': { ja: 'ルギア', id: '249', category: 'ポケモン' },
  'ho-oh': { ja: 'ホウオウ', id: '250', category: 'ポケモン' },
  'ホウオウ': { ja: 'ホウオウ', id: '250', category: 'ポケモン' },
  'celebi': { ja: 'セレビィ', id: '251', category: 'ポケモン' },

  'rayquaza': { ja: 'レックウザ', id: '384', category: 'ポケモン' },
  'レックウザ': { ja: 'レックウザ', id: '384', category: 'ポケモン' },
  'groudon': { ja: 'グラードン', id: '383', category: 'ポケモン' },
  'kyogre': { ja: 'カイオーガ', id: '382', category: 'ポケモン' },
  'カイオーガ': { ja: 'カイオーガ', id: '382', category: 'ポケモン' },

  'dialga': { ja: 'ディアルガ', id: '483', category: 'ポケモン' },
  'ディアルガ': { ja: 'ディアルガ', id: '483', category: 'ポケモン' },
  'palkia': { ja: 'パルキア', id: '484', category: 'ポケモン' },
  'パルキア': { ja: 'パルキア', id: '484', category: 'ポケモン' },
  'giratina': { ja: 'ギラティナ', id: '487', category: 'ポケモン' },
  'ギラティナ': { ja: 'ギラティナ', id: '487', category: 'ポケモン' },
  'arceus': { ja: 'アルセウス', id: '493', category: 'ポケモン' },
  'アルセウス': { ja: 'アルセウス', id: '493', category: 'ポケモン' },

  'reshiram': { ja: 'レシラム', id: '643', category: 'ポケモン' },
  'zekrom': { ja: 'ゼクロム', id: '644', category: 'ポケモン' },
  'kyurem': { ja: 'キュレム', id: '646', category: 'ポケモン' },

  'xerneas': { ja: 'ゼルネアス', id: '716', category: 'ポケモン' },
  'yveltal': { ja: 'イベルタル', id: '717', category: 'ポケモン' },

  'solgaleo': { ja: 'ソルガレオ', id: '791', category: 'ポケモン' },
  'lunala': { ja: 'ルナアーラ', id: '792', category: 'ポケモン' },
  'necrozma': { ja: 'ネクロズマ', id: '800', category: 'ポケモン' },

  'zacian': { ja: 'ザシアン', id: '888', category: 'ポケモン' },
  'ザシアン': { ja: 'ザシアン', id: '888', category: 'ポケモン' },
  'zamazenta': { ja: 'ザマゼンタ', id: '889', category: 'ポケモン' },
  'eternatus': { ja: 'ムゲンダイナ', id: '890', category: 'ポケモン' },
  'ムゲンダイナ': { ja: 'ムゲンダイナ', id: '890', category: 'ポケモン' },
  'calyrex': { ja: 'バドレックス', id: '898', category: 'ポケモン' },

  'koraidon': { ja: 'コライドン', id: '1007', category: 'ポケモン' },
  'コライドン': { ja: 'コライドン', id: '1007', category: 'ポケモン' },
  'miraidon': { ja: 'ミライドン', id: '1008', category: 'ポケモン' },
  'ミライドン': { ja: 'ミライドン', id: '1008', category: 'ポケモン' },

  // ===== イーブイ系 =====
  'eevee': { ja: 'イーブイ', id: '133', category: 'ポケモン' },
  'イーブイ': { ja: 'イーブイ', id: '133', category: 'ポケモン' },
  'vaporeon': { ja: 'シャワーズ', id: '134', category: 'ポケモン' },
  'シャワーズ': { ja: 'シャワーズ', id: '134', category: 'ポケモン' },
  'jolteon': { ja: 'サンダース', id: '135', category: 'ポケモン' },
  'サンダース': { ja: 'サンダース', id: '135', category: 'ポケモン' },
  'flareon': { ja: 'ブースター', id: '136', category: 'ポケモン' },
  'ブースター': { ja: 'ブースター', id: '136', category: 'ポケモン' },
  'espeon': { ja: 'エーフィ', id: '196', category: 'ポケモン' },
  'エーフィ': { ja: 'エーフィ', id: '196', category: 'ポケモン' },
  'umbreon': { ja: 'ブラッキー', id: '197', category: 'ポケモン' },
  'ブラッキー': { ja: 'ブラッキー', id: '197', category: 'ポケモン' },
  'leafeon': { ja: 'リーフィア', id: '470', category: 'ポケモン' },
  'リーフィア': { ja: 'リーフィア', id: '470', category: 'ポケモン' },
  'glaceon': { ja: 'グレイシア', id: '471', category: 'ポケモン' },
  'グレイシア': { ja: 'グレイシア', id: '471', category: 'ポケモン' },
  'sylveon': { ja: 'ニンフィア', id: '700', category: 'ポケモン' },
  'ニンフィア': { ja: 'ニンフィア', id: '700', category: 'ポケモン' },

  // ===== 人気ポケモン =====
  'lucario': { ja: 'ルカリオ', id: '448', category: 'ポケモン' },
  'ルカリオ': { ja: 'ルカリオ', id: '448', category: 'ポケモン' },
  'gengar': { ja: 'ゲンガー', id: '094', category: 'ポケモン' },
  'ゲンガー': { ja: 'ゲンガー', id: '094', category: 'ポケモン' },
  'gyarados': { ja: 'ギャラドス', id: '130', category: 'ポケモン' },
  'ギャラドス': { ja: 'ギャラドス', id: '130', category: 'ポケモン' },
  'dragonite': { ja: 'カイリュー', id: '149', category: 'ポケモン' },
  'カイリュー': { ja: 'カイリュー', id: '149', category: 'ポケモン' },
  'alakazam': { ja: 'フーディン', id: '065', category: 'ポケモン' },
  'machamp': { ja: 'カイリキー', id: '068', category: 'ポケモン' },
  'snorlax': { ja: 'カビゴン', id: '143', category: 'ポケモン' },
  'カビゴン': { ja: 'カビゴン', id: '143', category: 'ポケモン' },
  'lapras': { ja: 'ラプラス', id: '131', category: 'ポケモン' },
  'ラプラス': { ja: 'ラプラス', id: '131', category: 'ポケモン' },
  'arcanine': { ja: 'ウインディ', id: '059', category: 'ポケモン' },
  'ninetales': { ja: 'キュウコン', id: '038', category: 'ポケモン' },
  'magikarp': { ja: 'コイキング', id: '129', category: 'ポケモン' },

  'garchomp': { ja: 'ガブリアス', id: '445', category: 'ポケモン' },
  'ガブリアス': { ja: 'ガブリアス', id: '445', category: 'ポケモン' },
  'tyranitar': { ja: 'バンギラス', id: '248', category: 'ポケモン' },
  'バンギラス': { ja: 'バンギラス', id: '248', category: 'ポケモン' },
  'salamence': { ja: 'ボーマンダ', id: '373', category: 'ポケモン' },
  'metagross': { ja: 'メタグロス', id: '376', category: 'ポケモン' },
  'blaziken': { ja: 'バシャーモ', id: '257', category: 'ポケモン' },
  'swampert': { ja: 'ラグラージ', id: '260', category: 'ポケモン' },
  'sceptile': { ja: 'ジュカイン', id: '254', category: 'ポケモン' },

  'gardevoir': { ja: 'サーナイト', id: '282', category: 'ポケモン' },
  'サーナイト': { ja: 'サーナイト', id: '282', category: 'ポケモン' },
  'gallade': { ja: 'エルレイド', id: '475', category: 'ポケモン' },
  'togekiss': { ja: 'トゲキッス', id: '468', category: 'ポケモン' },

  'greninja': { ja: 'ゲッコウガ', id: '658', category: 'ポケモン' },
  'ゲッコウガ': { ja: 'ゲッコウガ', id: '658', category: 'ポケモン' },
  'aegislash': { ja: 'ギルガルド', id: '681', category: 'ポケモン' },
  'mimikyu': { ja: 'ミミッキュ', id: '778', category: 'ポケモン' },
  'ミミッキュ': { ja: 'ミミッキュ', id: '778', category: 'ポケモン' },

  'cinderace': { ja: 'エースバーン', id: '815', category: 'ポケモン' },
  'エースバーン': { ja: 'エースバーン', id: '815', category: 'ポケモン' },
  'inteleon': { ja: 'インテレオン', id: '818', category: 'ポケモン' },
  'rillaboom': { ja: 'ゴリランダー', id: '812', category: 'ポケモン' },
  'dragapult': { ja: 'ドラパルト', id: '887', category: 'ポケモン' },
  'ドラパルト': { ja: 'ドラパルト', id: '887', category: 'ポケモン' },
  'urshifu': { ja: 'ウーラオス', id: '892', category: 'ポケモン' },
  'ウーラオス': { ja: 'ウーラオス', id: '892', category: 'ポケモン' },

  'meowscarada': { ja: 'マスカーニャ', id: '0908', category: 'ポケモン' },
  'マスカーニャ': { ja: 'マスカーニャ', id: '0908', category: 'ポケモン' },
  'skeledirge': { ja: 'ラウドボーン', id: '0911', category: 'ポケモン' },
  'quaquaval': { ja: 'ウェーニバル', id: '0914', category: 'ポケモン' },

  // ===== ゴースト系 =====
  'gastly': { ja: 'ゴース', id: '092', category: 'ポケモン' },
  'haunter': { ja: 'ゴースト', id: '093', category: 'ポケモン' },
  'chandelure': { ja: 'シャンデラ', id: '609', category: 'ポケモン' },

  // ===== ドラゴン系 =====
  'dratini': { ja: 'ミニリュウ', id: '147', category: 'ポケモン' },
  'dragonair': { ja: 'ハクリュー', id: '148', category: 'ポケモン' },
  'kingdra': { ja: 'キングドラ', id: '230', category: 'ポケモン' },
  'latios': { ja: 'ラティオス', id: '381', category: 'ポケモン' },
  'latias': { ja: 'ラティアス', id: '380', category: 'ポケモン' },

  // ===== その他人気 =====
  'ditto': { ja: 'メタモン', id: '132', category: 'ポケモン' },
  'メタモン': { ja: 'メタモン', id: '132', category: 'ポケモン' },
  'chansey': { ja: 'ラッキー', id: '113', category: 'ポケモン' },
  'blissey': { ja: 'ハピナス', id: '242', category: 'ポケモン' },
  'scizor': { ja: 'ハッサム', id: '212', category: 'ポケモン' },
  'heracross': { ja: 'ヘラクロス', id: '214', category: 'ポケモン' },
  'ampharos': { ja: 'デンリュウ', id: '181', category: 'ポケモン' },
  'wobbuffet': { ja: 'ソーナンス', id: '202', category: 'ポケモン' },
  'absol': { ja: 'アブソル', id: '359', category: 'ポケモン' },
  'milotic': { ja: 'ミロカロス', id: '350', category: 'ポケモン' },
  'aggron': { ja: 'ボスゴドラ', id: '306', category: 'ポケモン' },
  'weavile': { ja: 'マニューラ', id: '461', category: 'ポケモン' },
  'zoroark': { ja: 'ゾロアーク', id: '571', category: 'ポケモン' },
  'ゾロアーク': { ja: 'ゾロアーク', id: '571', category: 'ポケモン' },
  'hydreigon': { ja: 'サザンドラ', id: '635', category: 'ポケモン' },
  'volcarona': { ja: 'ウルガモス', id: '637', category: 'ポケモン' },
  'haxorus': { ja: 'オノノクス', id: '612', category: 'ポケモン' },
  'goodra': { ja: 'ヌメルゴン', id: '706', category: 'ポケモン' },
  'noivern': { ja: 'オンバーン', id: '715', category: 'ポケモン' },
  'decidueye': { ja: 'ジュナイパー', id: '724', category: 'ポケモン' },
  'primarina': { ja: 'アシレーヌ', id: '730', category: 'ポケモン' },
  'incineroar': { ja: 'ガオガエン', id: '727', category: 'ポケモン' },
  'ガオガエン': { ja: 'ガオガエン', id: '727', category: 'ポケモン' },
  'toxtricity': { ja: 'ストリンダー', id: '849', category: 'ポケモン' },
  'grimmsnarl': { ja: 'オーロンゲ', id: '861', category: 'ポケモン' },
  'corviknight': { ja: 'アーマーガア', id: '823', category: 'ポケモン' },

  // ===== サポート・トレーナーカード =====
  'マリィ': { ja: 'マリィ', id: 'TR-MARNIE', category: 'トレーナー' },
  'marnie': { ja: 'マリィ', id: 'TR-MARNIE', category: 'トレーナー' },
  'リーリエ': { ja: 'リーリエ', id: 'TR-LILLIE', category: 'トレーナー' },
  'lillie': { ja: 'リーリエ', id: 'TR-LILLIE', category: 'トレーナー' },
  'アセロラ': { ja: 'アセロラ', id: 'TR-ACEROLA', category: 'トレーナー' },
  'acerola': { ja: 'アセロラ', id: 'TR-ACEROLA', category: 'トレーナー' },
  'カイ': { ja: 'カイ', id: 'TR-IRIDA', category: 'トレーナー' },
  'irida': { ja: 'カイ', id: 'TR-IRIDA', category: 'トレーナー' },
  'ナンジャモ': { ja: 'ナンジャモ', id: 'TR-IONO', category: 'トレーナー' },
  'iono': { ja: 'ナンジャモ', id: 'TR-IONO', category: 'トレーナー' },
  'セレナ': { ja: 'セレナ', id: 'TR-SERENA', category: 'トレーナー' },
  'serena': { ja: 'セレナ', id: 'TR-SERENA', category: 'トレーナー' },
  'ミモザ': { ja: 'ミモザ', id: 'TR-MIRIAM', category: 'トレーナー' },
  'miriam': { ja: 'ミモザ', id: 'TR-MIRIAM', category: 'トレーナー' },
  'ボタン': { ja: 'ボタン', id: 'TR-PENNY', category: 'トレーナー' },
  'penny': { ja: 'ボタン', id: 'TR-PENNY', category: 'トレーナー' },
  'キバナ': { ja: 'キバナ', id: 'TR-RAIHAN', category: 'トレーナー' },
  'raihan': { ja: 'キバナ', id: 'TR-RAIHAN', category: 'トレーナー' },
  'ルリナ': { ja: 'ルリナ', id: 'TR-NESSA', category: 'トレーナー' },
  'nessa': { ja: 'ルリナ', id: 'TR-NESSA', category: 'トレーナー' },
  'サイトウ': { ja: 'サイトウ', id: 'TR-BEA', category: 'トレーナー' },
  'bea': { ja: 'サイトウ', id: 'TR-BEA', category: 'トレーナー' },
  'ユウリ': { ja: 'ユウリ', id: 'TR-GLORIA', category: 'トレーナー' },
  'gloria': { ja: 'ユウリ', id: 'TR-GLORIA', category: 'トレーナー' },
  'professor oak': { ja: 'オーキド博士', id: 'TR-OAK', category: 'トレーナー' },
  'オーキド博士': { ja: 'オーキド博士', id: 'TR-OAK', category: 'トレーナー' },
  "professor's research": { ja: '博士の研究', id: 'TR-RESEARCH', category: 'トレーナー' },
  '博士の研究': { ja: '博士の研究', id: 'TR-RESEARCH', category: 'トレーナー' },
  'boss orders': { ja: 'ボスの指令', id: 'TR-BOSS', category: 'トレーナー' },
  'ボスの指令': { ja: 'ボスの指令', id: 'TR-BOSS', category: 'トレーナー' },
  'ネモ': { ja: 'ネモ', id: 'TR-NEMONA', category: 'トレーナー' },
  'nemona': { ja: 'ネモ', id: 'TR-NEMONA', category: 'トレーナー' },
  'オモダカ': { ja: 'オモダカ', id: 'TR-GEETA', category: 'トレーナー' },
  'geeta': { ja: 'オモダカ', id: 'TR-GEETA', category: 'トレーナー' },
  'チリ': { ja: 'チリ', id: 'TR-RIKA', category: 'トレーナー' },
  'rika': { ja: 'チリ', id: 'TR-RIKA', category: 'トレーナー' },
  'ポピー': { ja: 'ポピー', id: 'TR-POPPY', category: 'トレーナー' },
  'poppy': { ja: 'ポピー', id: 'TR-POPPY', category: 'トレーナー' },
  'アオキ': { ja: 'アオキ', id: 'TR-LARRY', category: 'トレーナー' },
  'larry': { ja: 'アオキ', id: 'TR-LARRY', category: 'トレーナー' },
  'ハッサク': { ja: 'ハッサク', id: 'TR-HASSEL', category: 'トレーナー' },
  'hassel': { ja: 'ハッサク', id: 'TR-HASSEL', category: 'トレーナー' },
};

// =====================================
// セット名辞書（拡充版）
// =====================================
const POKEMON_SETS = {
  // ===== 初期シリーズ（WOTC期）=====
  'base set': { ja: '初版', code: 'BS', era: '初期' },
  '1st edition': { ja: '初版', code: 'BS-1ST', era: '初期' },
  'shadowless': { ja: 'シャドーレス', code: 'BS-SL', era: '初期' },
  'jungle': { ja: 'ジャングル', code: 'JU', era: '初期' },
  'fossil': { ja: '化石の秘密', code: 'FO', era: '初期' },
  'team rocket': { ja: 'ロケット団', code: 'TR', era: '初期' },
  'gym heroes': { ja: 'ジムヒーローズ', code: 'GH', era: '初期' },
  'gym challenge': { ja: 'ジムチャレンジ', code: 'GC', era: '初期' },
  'neo genesis': { ja: 'ネオジェネシス', code: 'N1', era: 'ネオ' },
  'neo discovery': { ja: 'ネオディスカバリー', code: 'N2', era: 'ネオ' },
  'neo revelation': { ja: 'ネオレベレーション', code: 'N3', era: 'ネオ' },
  'neo destiny': { ja: 'ネオデスティニー', code: 'N4', era: 'ネオ' },

  // ===== ソード&シールド =====
  'shiny star v': { ja: 'シャイニースターV', code: 'S4a', era: 'ソード&シールド' },
  'シャイニースターv': { ja: 'シャイニースターV', code: 'S4a', era: 'ソード&シールド' },
  's4a': { ja: 'シャイニースターV', code: 'S4a', era: 'ソード&シールド' },
  'eevee heroes': { ja: 'イーブイヒーローズ', code: 'S6a', era: 'ソード&シールド' },
  'イーブイヒーローズ': { ja: 'イーブイヒーローズ', code: 'S6a', era: 'ソード&シールド' },
  's6a': { ja: 'イーブイヒーローズ', code: 'S6a', era: 'ソード&シールド' },
  'vmax climax': { ja: 'VMAXクライマックス', code: 'S8b', era: 'ソード&シールド' },
  'vmaxクライマックス': { ja: 'VMAXクライマックス', code: 'S8b', era: 'ソード&シールド' },
  's8b': { ja: 'VMAXクライマックス', code: 'S8b', era: 'ソード&シールド' },
  'vstar universe': { ja: 'VSTARユニバース', code: 'S12a', era: 'ソード&シールド' },
  'vstarユニバース': { ja: 'VSTARユニバース', code: 'S12a', era: 'ソード&シールド' },
  's12a': { ja: 'VSTARユニバース', code: 'S12a', era: 'ソード&シールド' },
  'dream league': { ja: 'ドリームリーグ', code: 'SM11b', era: 'サン&ムーン' },
  'ドリームリーグ': { ja: 'ドリームリーグ', code: 'SM11b', era: 'サン&ムーン' },
  'tag all stars': { ja: 'タッグオールスターズ', code: 'SM12a', era: 'サン&ムーン' },
  'タッグオールスターズ': { ja: 'タッグオールスターズ', code: 'SM12a', era: 'サン&ムーン' },
  'fusion arts': { ja: 'フュージョンアーツ', code: 'S8', era: 'ソード&シールド' },
  'フュージョンアーツ': { ja: 'フュージョンアーツ', code: 'S8', era: 'ソード&シールド' },
  'star birth': { ja: 'スターバース', code: 'S9', era: 'ソード&シールド' },
  'スターバース': { ja: 'スターバース', code: 'S9', era: 'ソード&シールド' },
  'brilliant stars': { ja: 'スターバース', code: 'SWSH9', era: 'ソード&シールド' },

  // ===== スカーレット&バイオレット =====
  'pokemon 151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  'ポケモンカード151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  '151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  'sv2a': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  'クレイバースト': { ja: 'クレイバースト', code: 'SV2D', era: 'スカーレット&バイオレット' },
  'clay burst': { ja: 'クレイバースト', code: 'SV2D', era: 'スカーレット&バイオレット' },
  'sv2d': { ja: 'クレイバースト', code: 'SV2D', era: 'スカーレット&バイオレット' },
  'スノーハザード': { ja: 'スノーハザード', code: 'SV2P', era: 'スカーレット&バイオレット' },
  'snow hazard': { ja: 'スノーハザード', code: 'SV2P', era: 'スカーレット&バイオレット' },
  'sv2p': { ja: 'スノーハザード', code: 'SV2P', era: 'スカーレット&バイオレット' },
  'レイジングサーフ': { ja: 'レイジングサーフ', code: 'SV3a', era: 'スカーレット&バイオレット' },
  'raging surf': { ja: 'レイジングサーフ', code: 'SV3a', era: 'スカーレット&バイオレット' },
  'sv3a': { ja: 'レイジングサーフ', code: 'SV3a', era: 'スカーレット&バイオレット' },
  '黒炎の支配者': { ja: '黒炎の支配者', code: 'SV3', era: 'スカーレット&バイオレット' },
  'obsidian flames': { ja: '黒炎の支配者', code: 'SV3', era: 'スカーレット&バイオレット' },
  'ruler of the black flame': { ja: '黒炎の支配者', code: 'SV3', era: 'スカーレット&バイオレット' },
  'シャイニートレジャーex': { ja: 'シャイニートレジャーex', code: 'SV4a', era: 'スカーレット&バイオレット' },
  'shiny treasure ex': { ja: 'シャイニートレジャーex', code: 'SV4a', era: 'スカーレット&バイオレット' },
  'sv4a': { ja: 'シャイニートレジャーex', code: 'SV4a', era: 'スカーレット&バイオレット' },
  '古代の咆哮': { ja: '古代の咆哮', code: 'SV4K', era: 'スカーレット&バイオレット' },
  'ancient roar': { ja: '古代の咆哮', code: 'SV4K', era: 'スカーレット&バイオレット' },
  '未来の一閃': { ja: '未来の一閃', code: 'SV4M', era: 'スカーレット&バイオレット' },
  'future flash': { ja: '未来の一閃', code: 'SV4M', era: 'スカーレット&バイオレット' },
  'ワイルドフォース': { ja: 'ワイルドフォース', code: 'SV5K', era: 'スカーレット&バイオレット' },
  'wild force': { ja: 'ワイルドフォース', code: 'SV5K', era: 'スカーレット&バイオレット' },
  'サイバージャッジ': { ja: 'サイバージャッジ', code: 'SV5M', era: 'スカーレット&バイオレット' },
  'cyber judge': { ja: 'サイバージャッジ', code: 'SV5M', era: 'スカーレット&バイオレット' },
  'クリムゾンヘイズ': { ja: 'クリムゾンヘイズ', code: 'SV5a', era: 'スカーレット&バイオレット' },
  'crimson haze': { ja: 'クリムゾンヘイズ', code: 'SV5a', era: 'スカーレット&バイオレット' },
  '変幻の仮面': { ja: '変幻の仮面', code: 'SV6', era: 'スカーレット&バイオレット' },
  'mask of change': { ja: '変幻の仮面', code: 'SV6', era: 'スカーレット&バイオレット' },
  'twilight masquerade': { ja: '変幻の仮面', code: 'SV6', era: 'スカーレット&バイオレット' },
  'ナイトワンダラー': { ja: 'ナイトワンダラー', code: 'SV6a', era: 'スカーレット&バイオレット' },
  'night wanderer': { ja: 'ナイトワンダラー', code: 'SV6a', era: 'スカーレット&バイオレット' },
  'shrouded fable': { ja: 'ナイトワンダラー', code: 'SV6a', era: 'スカーレット&バイオレット' },
  'ステラミラクル': { ja: 'ステラミラクル', code: 'SV7', era: 'スカーレット&バイオレット' },
  'stellar miracle': { ja: 'ステラミラクル', code: 'SV7', era: 'スカーレット&バイオレット' },
  'stellar crown': { ja: 'ステラミラクル', code: 'SV7', era: 'スカーレット&バイオレット' },
  'スーパー電気タイプパワーバンド': { ja: '超電ブレイカー', code: 'SV7a', era: 'スカーレット&バイオレット' },
  '超電ブレイカー': { ja: '超電ブレイカー', code: 'SV7a', era: 'スカーレット&バイオレット' },
  'surging sparks': { ja: '超電ブレイカー', code: 'SV7a', era: 'スカーレット&バイオレット' },

  // ===== 英語版セット名 =====
  'scarlet & violet': { ja: 'スカーレット&バイオレット', code: 'SV1', era: 'スカーレット&バイオレット' },
  'paldea evolved': { ja: 'トリプレットビート', code: 'SV2', era: 'スカーレット&バイオレット' },
  'paradox rift': { ja: 'パラドックスリフト', code: 'SV4', era: 'スカーレット&バイオレット' },
  'paldean fates': { ja: 'パルデアンフェイト', code: 'SV4.5', era: 'スカーレット&バイオレット' },
  'temporal forces': { ja: 'テンポラルフォース', code: 'SV5', era: 'スカーレット&バイオレット' },
  'prismatic evolutions': { ja: 'プリズマティックエボリューション', code: 'SV8a', era: 'スカーレット&バイオレット' },

  // ===== プロモ =====
  'promo': { ja: 'プロモ', code: 'PROMO', era: 'プロモ' },
  'プロモ': { ja: 'プロモ', code: 'PROMO', era: 'プロモ' },
  'swsh promo': { ja: 'SWSHプロモ', code: 'SWSH-P', era: 'ソード&シールド' },
  'sv promo': { ja: 'SVプロモ', code: 'SV-P', era: 'スカーレット&バイオレット' },
};

// =====================================
// レアリティパターン
// =====================================
const RARITY_PATTERNS = [
  // 特殊レアリティ（高額）
  { pattern: /\bSAR\b/i, rarity: 'SAR', ja: 'スペシャルアートレア', tier: 1 },
  { pattern: /\bSpecial\s*Art\s*Rare\b/i, rarity: 'SAR', ja: 'スペシャルアートレア', tier: 1 },
  { pattern: /\bAR\b/i, rarity: 'AR', ja: 'アートレア', tier: 2 },
  { pattern: /\bArt\s*Rare\b/i, rarity: 'AR', ja: 'アートレア', tier: 2 },
  { pattern: /\bSR\b/i, rarity: 'SR', ja: 'スーパーレア', tier: 2 },
  { pattern: /\bSuper\s*Rare\b/i, rarity: 'SR', ja: 'スーパーレア', tier: 2 },
  { pattern: /\bUR\b/i, rarity: 'UR', ja: 'ウルトラレア', tier: 1 },
  { pattern: /\bUltra\s*Rare\b/i, rarity: 'UR', ja: 'ウルトラレア', tier: 1 },
  { pattern: /\bHR\b/i, rarity: 'HR', ja: 'ハイパーレア', tier: 1 },
  { pattern: /\bHyper\s*Rare\b/i, rarity: 'HR', ja: 'ハイパーレア', tier: 1 },
  { pattern: /\bCHR\b/i, rarity: 'CHR', ja: 'キャラクターレア', tier: 2 },
  { pattern: /\bCSR\b/i, rarity: 'CSR', ja: 'キャラクタースーパーレア', tier: 1 },
  { pattern: /\bSSR\b/i, rarity: 'SSR', ja: 'シャイニースーパーレア', tier: 1 },
  { pattern: /\bS\b(?=\s|$)/i, rarity: 'S', ja: 'シャイニー', tier: 3 },
  { pattern: /\bShiny\b/i, rarity: 'Shiny', ja: 'シャイニー', tier: 3 },
  { pattern: /\bFull\s*Art\b/i, rarity: 'Full Art', ja: 'フルアート', tier: 2 },
  { pattern: /\bAlt\s*Art\b/i, rarity: 'Alt Art', ja: 'オルタネートアート', tier: 1 },
  { pattern: /\bAlternate\s*Art\b/i, rarity: 'Alt Art', ja: 'オルタネートアート', tier: 1 },
  { pattern: /\bSecret\s*Rare\b/i, rarity: 'Secret', ja: 'シークレット', tier: 1 },
  { pattern: /\bGold\s*Rare\b/i, rarity: 'Gold', ja: 'ゴールド', tier: 1 },
  { pattern: /\bRainbow\s*Rare\b/i, rarity: 'Rainbow', ja: 'レインボー', tier: 1 },
  { pattern: /\bIllustration\s*Rare\b/i, rarity: 'IR', ja: 'イラストレア', tier: 2 },

  // VMAX/VSTAR系
  { pattern: /\bVMAX\b/i, rarity: 'VMAX', ja: 'VMAX', tier: 3 },
  { pattern: /\bVSTAR\b/i, rarity: 'VSTAR', ja: 'VSTAR', tier: 3 },
  { pattern: /\bV\b(?!MAX|STAR)/i, rarity: 'V', ja: 'V', tier: 4 },

  // ex/EX/GX系
  { pattern: /\bex\b/, rarity: 'ex', ja: 'ex', tier: 3 },
  { pattern: /\bEX\b/, rarity: 'EX', ja: 'EX', tier: 3 },
  { pattern: /\bGX\b/i, rarity: 'GX', ja: 'GX', tier: 3 },
  { pattern: /\bTERA\b/i, rarity: 'Tera', ja: 'テラスタル', tier: 3 },

  // 基本レアリティ
  { pattern: /\bHolo\s*Rare\b/i, rarity: 'Holo Rare', ja: 'ホロレア', tier: 4 },
  { pattern: /\bReverse\s*Holo\b/i, rarity: 'Reverse Holo', ja: 'リバースホロ', tier: 5 },
  { pattern: /\bHolo\b/i, rarity: 'Holo', ja: 'ホロ', tier: 5 },
  { pattern: /\bRare\b/i, rarity: 'Rare', ja: 'レア', tier: 5 },
  { pattern: /\bDouble\s*Rare\b/i, rarity: 'RR', ja: 'ダブルレア', tier: 4 },
  { pattern: /\bRR\b/i, rarity: 'RR', ja: 'ダブルレア', tier: 4 },
  { pattern: /\bUncommon\b/i, rarity: 'Uncommon', ja: 'アンコモン', tier: 6 },
  { pattern: /\bCommon\b/i, rarity: 'Common', ja: 'コモン', tier: 7 },

  // 1st Edition / Shadowless
  { pattern: /1st\s*Edition/i, rarity: '1st Edition', ja: '初版', tier: 1 },
  { pattern: /\bShadowless\b/i, rarity: 'Shadowless', ja: 'シャドーレス', tier: 1 },
  { pattern: /\bUnlimited\b/i, rarity: 'Unlimited', ja: 'アンリミテッド', tier: 4 },
];

// =====================================
// グレーディングパターン（柔軟なマッチング）
// =====================================
const GRADING_PATTERNS = [
  // PSA (様々な表記に対応)
  { pattern: /PSA[\s\-]*(\d+(?:\.\d+)?)/i, company: 'PSA' },
  { pattern: /PSA[\s\-]*(?:GEM[\s\-]*)?(?:MT[\s\-]*)?(\d+)/i, company: 'PSA' },
  // BGS / Beckett
  { pattern: /BGS[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /Beckett[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /BGS[\s\-]*(?:Black\s*Label[\s\-]*)?(\d+(?:\.\d+)?)/i, company: 'BGS' },
  // CGC
  { pattern: /CGC[\s\-]*(\d+(?:\.\d+)?)/i, company: 'CGC' },
  { pattern: /CGC[\s\-]*(?:Pristine[\s\-]*)?(\d+(?:\.\d+)?)/i, company: 'CGC' },
  // ARS
  { pattern: /ARS[\s\-]*(\d+(?:\.\d+)?)/i, company: 'ARS' },
  // ACE
  { pattern: /ACE[\s\-]*(\d+(?:\.\d+)?)/i, company: 'ACE' },
  // その他
  { pattern: /(?:Grade|Graded)[\s\-]*(\d+(?:\.\d+)?)/i, company: 'Unknown' },
];

// =====================================
// 言語パターン
// =====================================
const LANGUAGE_PATTERNS = [
  { pattern: /\bJapanese\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJPN\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJP\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\b日本語\b/, code: 'JP', ja: '日本語' },
  { pattern: /\bEnglish\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bENG\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bEN\b/i, code: 'EN', ja: '英語' },
  { pattern: /\b英語\b/, code: 'EN', ja: '英語' },
  { pattern: /\bKorean\b/i, code: 'KR', ja: '韓国語' },
  { pattern: /\bKOR\b/i, code: 'KR', ja: '韓国語' },
  { pattern: /\bChinese\b/i, code: 'CN', ja: '中国語' },
  { pattern: /\bCHN\b/i, code: 'CN', ja: '中国語' },
  { pattern: /\bTCG\b/i, code: 'EN', ja: '英語' }, // TCGは通常英語版
];

// =====================================
// 抽出関数
// =====================================

/**
 * カード名を抽出
 */
function extractPokemonCardName(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  for (const [key, value] of Object.entries(POKEMON_CARDS)) {
    const keyLower = key.toLowerCase();
    // 単語境界でマッチ（日本語キーはそのまま検索）
    let found = false;
    if (/^[a-z\s\-']+$/i.test(key)) {
      // 英語キー
      const regex = new RegExp(`\\b${escapeRegex(keyLower)}\\b`, 'i');
      found = regex.test(title);
    } else {
      // 日本語キー
      found = title.includes(key);
    }

    if (found) {
      matches.push({
        matched: key,
        ...value,
        confidence: key.length > 3 ? 0.9 : 0.7
      });
    }
  }

  // 最も長いマッチを優先（より具体的な名前）
  if (matches.length > 0) {
    matches.sort((a, b) => b.matched.length - a.matched.length);
    return matches[0];
  }

  return null;
}

/**
 * セット名を抽出
 */
function extractPokemonSet(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  for (const [key, value] of Object.entries(POKEMON_SETS)) {
    const keyLower = key.toLowerCase();
    if (titleLower.includes(keyLower) || title.includes(key)) {
      matches.push({
        matched: key,
        ...value,
        confidence: 0.85,
        length: key.length
      });
    }
  }

  // 最も長いマッチを返す（より具体的なセット名）
  if (matches.length > 0) {
    matches.sort((a, b) => b.length - a.length);
    return matches[0];
  }

  return null;
}

/**
 * レアリティを抽出
 */
function extractPokemonRarity(title) {
  const matches = [];

  for (const rarity of RARITY_PATTERNS) {
    if (rarity.pattern.test(title)) {
      matches.push({
        ...rarity,
        confidence: 0.9
      });
    }
  }

  // 最もティアが高い（数値が小さい）ものを返す
  if (matches.length > 0) {
    matches.sort((a, b) => a.tier - b.tier);
    return matches[0];
  }

  return null;
}

/**
 * グレーディング情報を抽出
 */
function extractPokemonGrading(title) {
  for (const grading of GRADING_PATTERNS) {
    const match = title.match(grading.pattern);
    if (match) {
      const grade = parseFloat(match[1]);
      return {
        company: grading.company,
        grade: grade,
        gradeStr: match[0].trim(),
        isGraded: true,
        confidence: 0.95
      };
    }
  }

  // Raw（未鑑定）の明示的な記載
  if (/\bRaw\b/i.test(title) || /\bUngraded\b/i.test(title)) {
    return {
      company: null,
      grade: null,
      gradeStr: 'Raw',
      isGraded: false,
      confidence: 0.8
    };
  }

  // 鑑定に関する記載がない場合
  return {
    company: null,
    grade: null,
    gradeStr: null,
    isGraded: false,
    confidence: 0.5
  };
}

/**
 * 言語を抽出
 */
function extractPokemonLanguage(title) {
  for (const lang of LANGUAGE_PATTERNS) {
    if (lang.pattern.test(title)) {
      return {
        code: lang.code,
        ja: lang.ja,
        confidence: 0.9
      };
    }
  }

  // ヒューリスティック: 日本語文字があれば日本語カード
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title)) {
    return {
      code: 'JP',
      ja: '日本語',
      confidence: 0.7
    };
  }

  // デフォルトは不明
  return {
    code: 'Unknown',
    ja: '不明',
    confidence: 0.3
  };
}

/**
 * カード番号を抽出 (例: 025/165, #025)
 */
function extractCardNumber(title) {
  // パターン1: 025/165 形式
  const slashMatch = title.match(/(\d{1,4})\s*\/\s*(\d{1,4})/);
  if (slashMatch) {
    return {
      number: slashMatch[1],
      total: slashMatch[2],
      format: 'slash',
      confidence: 0.9
    };
  }

  // パターン2: #025 形式
  const hashMatch = title.match(/#\s*(\d{1,4})/);
  if (hashMatch) {
    return {
      number: hashMatch[1],
      total: null,
      format: 'hash',
      confidence: 0.8
    };
  }

  return null;
}

/**
 * 正規表現エスケープ
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 全属性を抽出（メイン関数）
 */
function extractPokemonAttributes(title) {
  const cardName = extractPokemonCardName(title);
  const set = extractPokemonSet(title);
  const rarity = extractPokemonRarity(title);
  const grading = extractPokemonGrading(title);
  const language = extractPokemonLanguage(title);
  const cardNumber = extractCardNumber(title);

  // 抽出成功した項目数を計算
  const extractedCount = [cardName, set, rarity, grading?.isGraded ? grading : null, cardNumber]
    .filter(x => x !== null).length;

  // 全体の確信度を計算
  const confidences = [
    cardName?.confidence || 0,
    set?.confidence || 0,
    rarity?.confidence || 0,
    grading?.confidence || 0,
    language?.confidence || 0
  ].filter(c => c > 0);

  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  return {
    cardName: cardName ? {
      name: cardName.ja,
      nameEn: cardName.matched,
      id: cardName.id,
      category: cardName.category
    } : null,
    set: set ? {
      name: set.ja,
      code: set.code,
      era: set.era
    } : null,
    rarity: rarity ? {
      code: rarity.rarity,
      name: rarity.ja,
      tier: rarity.tier
    } : null,
    grading: {
      company: grading.company,
      grade: grading.grade,
      gradeStr: grading.gradeStr,
      isGraded: grading.isGraded
    },
    language: {
      code: language.code,
      name: language.ja
    },
    cardNumber: cardNumber,
    confidence: overallConfidence,
    extractedCount: extractedCount,
    extractedAt: new Date().toISOString()
  };
}

// =====================================
// ユーザー補正用の辞書管理
// =====================================

/**
 * カスタム辞書を追加（ユーザー補正用）
 */
function addCustomPokemonCard(key, value) {
  POKEMON_CARDS[key.toLowerCase()] = value;
  POKEMON_CARDS[value.ja] = value;
}

/**
 * カスタムセットを追加（ユーザー補正用）
 */
function addCustomPokemonSet(key, value) {
  POKEMON_SETS[key.toLowerCase()] = value;
  if (value.ja) {
    POKEMON_SETS[value.ja.toLowerCase()] = value;
  }
}

// =====================================
// カテゴリフィルタ（関連アイテムのみを集計）
// =====================================

// 有効なeBayカテゴリ（Active Listings用）
const VALID_EBAY_CATEGORIES_POKEMON = [
  'CCG Individual Cards',
  'Collectible Card Games',
  'Trading Card Singles',
  'Pokémon Individual Cards',
  'Pokemon Individual Cards',
  'Pokémon TCG',
  'Pokemon TCG',
  'Card Singles',
  'Trading Cards',
  'Graded Cards'
];

// 除外キーワード（タイトルベースフィルタ用、Sold/Orders用）
const EXCLUDED_KEYWORDS_POKEMON = [
  // ぬいぐるみ・フィギュア
  'plush', 'plushie', 'stuffed', 'figure', 'figurine', 'statue', 'toy', 'action figure',
  // ゲーム関連
  'video game', 'game boy', 'nintendo switch', 'game cartridge', 'console', 'controller',
  // 衣類・アクセサリー
  'shirt', 't-shirt', 'hoodie', 'hat', 'cap', 'backpack', 'bag', 'wallet', 'keychain',
  // 食品・日用品
  'candy', 'snack', 'food', 'drink', 'cup', 'mug', 'plate',
  // ポスター・印刷物（カード以外）
  'poster', 'print', 'art print', 'wall art', 'sticker', 'decal',
  // おもちゃ
  'building blocks', 'lego', 'puzzle', 'board game',
  // その他
  'dvd', 'blu-ray', 'movie', 'manga', 'comic', 'book'
];

/**
 * eBayカテゴリが有効かチェック（Active Listings用）
 */
function isValidCategoryPokemon(ebayCategory) {
  if (!ebayCategory) return true; // カテゴリがない場合は許可
  const lowerCategory = ebayCategory.toLowerCase();
  return VALID_EBAY_CATEGORIES_POKEMON.some(cat => lowerCategory.includes(cat.toLowerCase()));
}

/**
 * タイトルに除外キーワードが含まれるかチェック（Sold/Orders用）
 */
function isExcludedByKeywordPokemon(title) {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();

  // ポケモンカード関連のキーワードがあれば除外しない
  const hasCardKeyword = /\bcard\b|\bcards\b|\btcg\b|\bccg\b|\bpsa\b|\bbgs\b|\bcgc\b|\bgraded\b|\bholo\b|\bex\b|\bgx\b|\bvmax\b|\bvstar\b/i.test(title);
  if (hasCardKeyword) return false;

  return EXCLUDED_KEYWORDS_POKEMON.some(keyword => lowerTitle.includes(keyword));
}

/**
 * ポケモンカードとして有効なアイテムかチェック（統合関数）
 * @param {string} title - 商品タイトル
 * @param {string} ebayCategory - eBayカテゴリ（Active Listingsの場合）
 * @returns {boolean}
 */
function isValidPokemonItem(title, ebayCategory) {
  // eBayカテゴリがある場合（Active Listings）
  if (ebayCategory && ebayCategory.trim() !== '') {
    return isValidCategoryPokemon(ebayCategory);
  }
  // カテゴリがない場合（Sold/Orders）はキーワードで除外
  return !isExcludedByKeywordPokemon(title);
}

// グローバルに公開
window.PokemonProfile = {
  extractAttributes: extractPokemonAttributes,
  extractCardName: extractPokemonCardName,
  extractSet: extractPokemonSet,
  extractRarity: extractPokemonRarity,
  extractGrading: extractPokemonGrading,
  extractLanguage: extractPokemonLanguage,
  extractCardNumber: extractCardNumber,
  addCustomCard: addCustomPokemonCard,
  addCustomSet: addCustomPokemonSet,
  // カテゴリフィルタ関数
  isValidCategory: isValidCategoryPokemon,
  isExcludedByKeyword: isExcludedByKeywordPokemon,
  isValidItem: isValidPokemonItem,
  CARDS: POKEMON_CARDS,
  SETS: POKEMON_SETS,
  RARITY_PATTERNS,
  GRADING_PATTERNS,
  LANGUAGE_PATTERNS,
  VALID_EBAY_CATEGORIES: VALID_EBAY_CATEGORIES_POKEMON,
  EXCLUDED_KEYWORDS: EXCLUDED_KEYWORDS_POKEMON
};

console.log('Pokemon Profile loaded - Cards:', Object.keys(POKEMON_CARDS).length, 'Sets:', Object.keys(POKEMON_SETS).length);
