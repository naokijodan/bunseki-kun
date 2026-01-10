/**
 * ポケモンカード専用プロファイル
 * タイトルからカード属性を抽出するロジック
 */

// =====================================
// カード名辞書（名寄せ対応）
// =====================================
const POKEMON_CARDS = {
  // ピカチュウ系
  'pikachu': { ja: 'ピカチュウ', id: '025', category: 'ポケモン' },
  'ピカチュウ': { ja: 'ピカチュウ', id: '025', category: 'ポケモン' },
  'raichu': { ja: 'ライチュウ', id: '026', category: 'ポケモン' },
  'ライチュウ': { ja: 'ライチュウ', id: '026', category: 'ポケモン' },

  // リザードン系
  'charizard': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'lizardon': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'リザードン': { ja: 'リザードン', id: '006', category: 'ポケモン' },
  'charmeleon': { ja: 'リザード', id: '005', category: 'ポケモン' },
  'charmander': { ja: 'ヒトカゲ', id: '004', category: 'ポケモン' },

  // フシギバナ系
  'venusaur': { ja: 'フシギバナ', id: '003', category: 'ポケモン' },
  'フシギバナ': { ja: 'フシギバナ', id: '003', category: 'ポケモン' },
  'ivysaur': { ja: 'フシギソウ', id: '002', category: 'ポケモン' },
  'bulbasaur': { ja: 'フシギダネ', id: '001', category: 'ポケモン' },

  // カメックス系
  'blastoise': { ja: 'カメックス', id: '009', category: 'ポケモン' },
  'カメックス': { ja: 'カメックス', id: '009', category: 'ポケモン' },
  'wartortle': { ja: 'カメール', id: '008', category: 'ポケモン' },
  'squirtle': { ja: 'ゼニガメ', id: '007', category: 'ポケモン' },

  // ミュウ・ミュウツー
  'mewtwo': { ja: 'ミュウツー', id: '150', category: 'ポケモン' },
  'ミュウツー': { ja: 'ミュウツー', id: '150', category: 'ポケモン' },
  'mew': { ja: 'ミュウ', id: '151', category: 'ポケモン' },
  'ミュウ': { ja: 'ミュウ', id: '151', category: 'ポケモン' },

  // イーブイ系
  'eevee': { ja: 'イーブイ', id: '133', category: 'ポケモン' },
  'イーブイ': { ja: 'イーブイ', id: '133', category: 'ポケモン' },
  'vaporeon': { ja: 'シャワーズ', id: '134', category: 'ポケモン' },
  'jolteon': { ja: 'サンダース', id: '135', category: 'ポケモン' },
  'flareon': { ja: 'ブースター', id: '136', category: 'ポケモン' },
  'espeon': { ja: 'エーフィ', id: '196', category: 'ポケモン' },
  'umbreon': { ja: 'ブラッキー', id: '197', category: 'ポケモン' },
  'ブラッキー': { ja: 'ブラッキー', id: '197', category: 'ポケモン' },
  'leafeon': { ja: 'リーフィア', id: '470', category: 'ポケモン' },
  'glaceon': { ja: 'グレイシア', id: '471', category: 'ポケモン' },
  'sylveon': { ja: 'ニンフィア', id: '700', category: 'ポケモン' },
  'ニンフィア': { ja: 'ニンフィア', id: '700', category: 'ポケモン' },

  // ルカリオ
  'lucario': { ja: 'ルカリオ', id: '448', category: 'ポケモン' },
  'ルカリオ': { ja: 'ルカリオ', id: '448', category: 'ポケモン' },

  // ゲンガー
  'gengar': { ja: 'ゲンガー', id: '094', category: 'ポケモン' },
  'ゲンガー': { ja: 'ゲンガー', id: '094', category: 'ポケモン' },

  // ギャラドス
  'gyarados': { ja: 'ギャラドス', id: '130', category: 'ポケモン' },
  'ギャラドス': { ja: 'ギャラドス', id: '130', category: 'ポケモン' },

  // レックウザ
  'rayquaza': { ja: 'レックウザ', id: '384', category: 'ポケモン' },
  'レックウザ': { ja: 'レックウザ', id: '384', category: 'ポケモン' },

  // サポート・トレーナーカード
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
};

// =====================================
// セット名辞書
// =====================================
const POKEMON_SETS = {
  // 初期シリーズ
  'base set': { ja: '初版', code: 'BS', era: '初期' },
  'jungle': { ja: 'ジャングル', code: 'JU', era: '初期' },
  'fossil': { ja: '化石の秘密', code: 'FO', era: '初期' },
  'team rocket': { ja: 'ロケット団', code: 'TR', era: '初期' },

  // 近年の人気セット
  'shiny star v': { ja: 'シャイニースターV', code: 'S4a', era: 'ソード&シールド' },
  'シャイニースターv': { ja: 'シャイニースターV', code: 'S4a', era: 'ソード&シールド' },
  'eevee heroes': { ja: 'イーブイヒーローズ', code: 'S6a', era: 'ソード&シールド' },
  'イーブイヒーローズ': { ja: 'イーブイヒーローズ', code: 'S6a', era: 'ソード&シールド' },
  'vmax climax': { ja: 'VMAXクライマックス', code: 'S8b', era: 'ソード&シールド' },
  'vmaxクライマックス': { ja: 'VMAXクライマックス', code: 'S8b', era: 'ソード&シールド' },
  'vstar universe': { ja: 'VSTARユニバース', code: 'S12a', era: 'ソード&シールド' },
  'vstarユニバース': { ja: 'VSTARユニバース', code: 'S12a', era: 'ソード&シールド' },

  // スカーレット&バイオレット
  'pokemon 151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  'ポケモンカード151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  '151': { ja: 'ポケモンカード151', code: 'SV2a', era: 'スカーレット&バイオレット' },
  'クレイバースト': { ja: 'クレイバースト', code: 'SV2D', era: 'スカーレット&バイオレット' },
  'clay burst': { ja: 'クレイバースト', code: 'SV2D', era: 'スカーレット&バイオレット' },
  'スノーハザード': { ja: 'スノーハザード', code: 'SV2P', era: 'スカーレット&バイオレット' },
  'snow hazard': { ja: 'スノーハザード', code: 'SV2P', era: 'スカーレット&バイオレット' },
  'レイジングサーフ': { ja: 'レイジングサーフ', code: 'SV3a', era: 'スカーレット&バイオレット' },
  'raging surf': { ja: 'レイジングサーフ', code: 'SV3a', era: 'スカーレット&バイオレット' },
  '黒炎の支配者': { ja: '黒炎の支配者', code: 'SV3', era: 'スカーレット&バイオレット' },
  'obsidian flames': { ja: '黒炎の支配者', code: 'SV3', era: 'スカーレット&バイオレット' },
  'シャイニートレジャーex': { ja: 'シャイニートレジャーex', code: 'SV4a', era: 'スカーレット&バイオレット' },
  'shiny treasure ex': { ja: 'シャイニートレジャーex', code: 'SV4a', era: 'スカーレット&バイオレット' },
};

// =====================================
// レアリティパターン
// =====================================
const RARITY_PATTERNS = [
  // 特殊レアリティ（高額）
  { pattern: /\bSAR\b/i, rarity: 'SAR', ja: 'スペシャルアートレア', tier: 1 },
  { pattern: /\bAR\b/i, rarity: 'AR', ja: 'アートレア', tier: 2 },
  { pattern: /\bSR\b/i, rarity: 'SR', ja: 'スーパーレア', tier: 2 },
  { pattern: /\bUR\b/i, rarity: 'UR', ja: 'ウルトラレア', tier: 1 },
  { pattern: /\bHR\b/i, rarity: 'HR', ja: 'ハイパーレア', tier: 1 },
  { pattern: /\bCHR\b/i, rarity: 'CHR', ja: 'キャラクターレア', tier: 2 },
  { pattern: /\bCSR\b/i, rarity: 'CSR', ja: 'キャラクタースーパーレア', tier: 1 },

  // VMAX/VSTAR系
  { pattern: /\bVMAX\b/i, rarity: 'VMAX', ja: 'VMAX', tier: 3 },
  { pattern: /\bVSTAR\b/i, rarity: 'VSTAR', ja: 'VSTAR', tier: 3 },
  { pattern: /\bV\b(?!MAX|STAR)/i, rarity: 'V', ja: 'V', tier: 4 },

  // ex/EX系
  { pattern: /\bex\b/i, rarity: 'ex', ja: 'ex', tier: 3 },
  { pattern: /\bEX\b/, rarity: 'EX', ja: 'EX', tier: 3 },
  { pattern: /\bGX\b/i, rarity: 'GX', ja: 'GX', tier: 3 },

  // 基本レアリティ
  { pattern: /\bHolo\s*Rare\b/i, rarity: 'Holo Rare', ja: 'ホロレア', tier: 4 },
  { pattern: /\bHolo\b/i, rarity: 'Holo', ja: 'ホロ', tier: 5 },
  { pattern: /\bRare\b/i, rarity: 'Rare', ja: 'レア', tier: 5 },
  { pattern: /\bUncommon\b/i, rarity: 'Uncommon', ja: 'アンコモン', tier: 6 },
  { pattern: /\bCommon\b/i, rarity: 'Common', ja: 'コモン', tier: 7 },

  // 1st Edition
  { pattern: /1st\s*Edition/i, rarity: '1st Edition', ja: '初版', tier: 1 },
  { pattern: /\bShadowless\b/i, rarity: 'Shadowless', ja: 'シャドーレス', tier: 1 },
];

// =====================================
// グレーディングパターン
// =====================================
const GRADING_PATTERNS = [
  // PSA
  { pattern: /PSA\s*(\d+(?:\.\d+)?)/i, company: 'PSA' },
  // BGS / Beckett
  { pattern: /BGS\s*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /Beckett\s*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  // CGC
  { pattern: /CGC\s*(\d+(?:\.\d+)?)/i, company: 'CGC' },
  // ARS
  { pattern: /ARS\s*(\d+(?:\.\d+)?)/i, company: 'ARS' },
];

// =====================================
// 言語パターン
// =====================================
const LANGUAGE_PATTERNS = [
  { pattern: /\bJapanese\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJPN\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\b日本語\b/, code: 'JP', ja: '日本語' },
  { pattern: /\bEnglish\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bENG\b/i, code: 'EN', ja: '英語' },
  { pattern: /\b英語\b/, code: 'EN', ja: '英語' },
  { pattern: /\bKorean\b/i, code: 'KR', ja: '韓国語' },
  { pattern: /\bChinese\b/i, code: 'CN', ja: '中国語' },
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
    // 単語境界でマッチ
    const regex = new RegExp(`\\b${escapeRegex(keyLower)}\\b`, 'i');
    if (regex.test(titleLower) || title.includes(key)) {
      matches.push({
        matched: key,
        ...value,
        confidence: key.length > 3 ? 0.9 : 0.7 // 短いキーワードは確信度低め
      });
    }
  }

  // 最も確信度が高いものを返す
  if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    return matches[0];
  }

  return null;
}

/**
 * セット名を抽出
 */
function extractPokemonSet(title) {
  const titleLower = title.toLowerCase();

  for (const [key, value] of Object.entries(POKEMON_SETS)) {
    const keyLower = key.toLowerCase();
    if (titleLower.includes(keyLower) || title.includes(key)) {
      return {
        matched: key,
        ...value,
        confidence: 0.85
      };
    }
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
        gradeStr: match[0],
        isGraded: true,
        confidence: 0.95
      };
    }
  }

  // Raw（未鑑定）
  if (/\bRaw\b/i.test(title)) {
    return {
      company: null,
      grade: null,
      gradeStr: 'Raw',
      isGraded: false,
      confidence: 0.8
    };
  }

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

  // デフォルトは英語
  return {
    code: 'EN',
    ja: '英語',
    confidence: 0.5
  };
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
      isGraded: grading.isGraded
    },
    language: {
      code: language.code,
      name: language.ja
    },
    confidence: overallConfidence,
    extractedAt: new Date().toISOString()
  };
}

// グローバルに公開
window.PokemonProfile = {
  extractAttributes: extractPokemonAttributes,
  extractCardName: extractPokemonCardName,
  extractSet: extractPokemonSet,
  extractRarity: extractPokemonRarity,
  extractGrading: extractPokemonGrading,
  extractLanguage: extractPokemonLanguage,
  CARDS: POKEMON_CARDS,
  SETS: POKEMON_SETS,
  RARITY_PATTERNS,
  GRADING_PATTERNS,
  LANGUAGE_PATTERNS
};

console.log('Pokemon Profile loaded');
