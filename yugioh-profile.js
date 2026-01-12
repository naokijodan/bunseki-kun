/**
 * 遊戯王カード専用プロファイル
 * タイトルからカード属性を抽出するロジック
 *
 * 注意: 遊戯王は歴史が長く（25年以上）カード数が膨大なため、
 * 高額カード・人気カードに絞った辞書設計としている
 */

// =====================================
// 高額・人気カード辞書（約150種）
// =====================================
const YUGIOH_CARDS = {
  // ===== 初期・レジェンドカード =====
  'blue-eyes white dragon': { ja: '青眼の白龍', aliases: ['blue eyes', 'bewd', '青眼', 'ブルーアイズ'], category: 'ドラゴン族' },
  'blue eyes white dragon': { ja: '青眼の白龍', aliases: ['bewd', '青眼'], category: 'ドラゴン族' },
  '青眼の白龍': { ja: '青眼の白龍', aliases: [], category: 'ドラゴン族' },
  'dark magician': { ja: 'ブラック・マジシャン', aliases: ['ブラマジ', 'dm'], category: '魔法使い族' },
  'ブラック・マジシャン': { ja: 'ブラック・マジシャン', aliases: [], category: '魔法使い族' },
  'dark magician girl': { ja: 'ブラック・マジシャン・ガール', aliases: ['dmg', 'ブラマジガール', 'BMG'], category: '魔法使い族' },
  'ブラック・マジシャン・ガール': { ja: 'ブラック・マジシャン・ガール', aliases: [], category: '魔法使い族' },
  'red-eyes black dragon': { ja: '真紅眼の黒竜', aliases: ['red eyes', 'rebd', 'レッドアイズ', '真紅眼'], category: 'ドラゴン族' },
  'red eyes black dragon': { ja: '真紅眼の黒竜', aliases: ['rebd'], category: 'ドラゴン族' },
  '真紅眼の黒竜': { ja: '真紅眼の黒竜', aliases: [], category: 'ドラゴン族' },
  'exodia': { ja: 'エクゾディア', aliases: ['封印されしエクゾディア', 'エクゾディア'], category: '魔法使い族' },
  'exodia the forbidden one': { ja: '封印されしエクゾディア', aliases: ['exodia'], category: '魔法使い族' },

  // ===== 三幻神 =====
  'slifer the sky dragon': { ja: 'オシリスの天空竜', aliases: ['slifer', 'オシリス'], category: '幻神獣族' },
  'オシリスの天空竜': { ja: 'オシリスの天空竜', aliases: [], category: '幻神獣族' },
  'obelisk the tormentor': { ja: 'オベリスクの巨神兵', aliases: ['obelisk', 'オベリスク'], category: '幻神獣族' },
  'オベリスクの巨神兵': { ja: 'オベリスクの巨神兵', aliases: [], category: '幻神獣族' },
  'the winged dragon of ra': { ja: 'ラーの翼神竜', aliases: ['ra', 'ラー'], category: '幻神獣族' },
  'ラーの翼神竜': { ja: 'ラーの翼神竜', aliases: [], category: '幻神獣族' },

  // ===== 手札誘発（環境カード）=====
  'ash blossom & joyous spring': { ja: '灰流うらら', aliases: ['ash blossom', 'ash', 'うらら'], category: 'アンデット族' },
  'ash blossom': { ja: '灰流うらら', aliases: ['うらら'], category: 'アンデット族' },
  '灰流うらら': { ja: '灰流うらら', aliases: [], category: 'アンデット族' },
  'ghost belle & haunted mansion': { ja: '屋敷わらし', aliases: ['ghost belle', 'わらし'], category: 'アンデット族' },
  '屋敷わらし': { ja: '屋敷わらし', aliases: [], category: 'アンデット族' },
  'ghost ogre & snow rabbit': { ja: '幽鬼うさぎ', aliases: ['ghost ogre', 'うさぎ'], category: 'サイキック族' },
  '幽鬼うさぎ': { ja: '幽鬼うさぎ', aliases: [], category: 'サイキック族' },
  'ghost mourner & moonlit chill': { ja: '儚無みずき', aliases: ['ghost mourner', 'みずき'], category: 'アンデット族' },
  '儚無みずき': { ja: '儚無みずき', aliases: [], category: 'アンデット族' },
  'effect veiler': { ja: 'エフェクト・ヴェーラー', aliases: ['veiler', 'ヴェーラー'], category: '魔法使い族' },
  'エフェクト・ヴェーラー': { ja: 'エフェクト・ヴェーラー', aliases: [], category: '魔法使い族' },
  'maxx c': { ja: '増殖するG', aliases: ['maxx', '増G', '増殖G'], category: '昆虫族' },
  '増殖するG': { ja: '増殖するG', aliases: [], category: '昆虫族' },
  'nibiru': { ja: '原始生命態ニビル', aliases: ['nibiru the primal being', 'ニビル'], category: '岩石族' },
  '原始生命態ニビル': { ja: '原始生命態ニビル', aliases: [], category: '岩石族' },
  'droll & lock bird': { ja: 'ドロール＆ロックバード', aliases: ['droll', 'ドロール'], category: '魔法使い族' },

  // ===== シンクロモンスター =====
  'stardust dragon': { ja: 'スターダスト・ドラゴン', aliases: ['stardust', 'スタダ'], category: 'ドラゴン族' },
  'スターダスト・ドラゴン': { ja: 'スターダスト・ドラゴン', aliases: [], category: 'ドラゴン族' },
  'black rose dragon': { ja: 'ブラック・ローズ・ドラゴン', aliases: ['black rose', 'ブラロ'], category: 'ドラゴン族' },
  'ブラック・ローズ・ドラゴン': { ja: 'ブラック・ローズ・ドラゴン', aliases: [], category: 'ドラゴン族' },
  'red dragon archfiend': { ja: 'レッド・デーモンズ・ドラゴン', aliases: ['rda', 'レッドデーモンズ'], category: 'ドラゴン族' },
  'ancient fairy dragon': { ja: 'エンシェント・フェアリー・ドラゴン', aliases: ['ancient fairy'], category: 'ドラゴン族' },
  'shooting star dragon': { ja: 'シューティング・スター・ドラゴン', aliases: ['shooting star'], category: 'ドラゴン族' },
  'crystal wing synchro dragon': { ja: 'クリスタルウィング・シンクロ・ドラゴン', aliases: ['crystal wing'], category: 'ドラゴン族' },
  'baronne de fleur': { ja: 'フルール・ド・バロネス', aliases: ['baronne', 'バロネス'], category: '戦士族' },

  // ===== エクシーズモンスター =====
  'number 39: utopia': { ja: 'No.39 希望皇ホープ', aliases: ['utopia', 'ホープ', 'no.39'], category: '戦士族' },
  'divine arsenal aa-zeus': { ja: '天霆號アーゼウス', aliases: ['zeus', 'アーゼウス'], category: '機械族' },
  '天霆號アーゼウス': { ja: '天霆號アーゼウス', aliases: [], category: '機械族' },

  // ===== リンクモンスター =====
  'accesscode talker': { ja: 'アクセスコード・トーカー', aliases: ['accesscode', 'アクセスコード'], category: 'サイバース族' },
  'アクセスコード・トーカー': { ja: 'アクセスコード・トーカー', aliases: [], category: 'サイバース族' },
  'apollousa bow of the goddess': { ja: '召命の神弓-アポロウーサ', aliases: ['apollousa', 'アポロウーサ'], category: '天使族' },
  'i:p masquerena': { ja: 'I:Pマスカレーナ', aliases: ['masquerena', 'マスカレーナ'], category: 'サイバース族' },
  'knightmare unicorn': { ja: 'トロイメア・ユニコーン', aliases: ['unicorn', 'ユニコーン'], category: '悪魔族' },
  'knightmare phoenix': { ja: 'トロイメア・フェニックス', aliases: ['phoenix'], category: '悪魔族' },

  // ===== 融合モンスター =====
  'blue-eyes ultimate dragon': { ja: '青眼の究極竜', aliases: ['beud', '究極竜'], category: 'ドラゴン族' },
  'five-headed dragon': { ja: 'F・G・D', aliases: ['fgd'], category: 'ドラゴン族' },
  'destiny hero - destroyer phoenix enforcer': { ja: 'D-HERO デストロイフェニックスガイ', aliases: ['dpe', 'デストロイフェニックス'], category: '戦士族' },
  'masquerade the blazing dragon': { ja: '烙印竜マスカレイド', aliases: ['masquerade', 'マスカレイド'], category: 'ドラゴン族' },
  'mirrorjade the iceblade dragon': { ja: '氷剣竜ミラジェイド', aliases: ['mirrorjade', 'ミラジェイド'], category: 'ドラゴン族' },
  'tearlaments kitkallos': { ja: 'ティアラメンツ・キトカロス', aliases: ['kitkallos', 'キトカロス'], category: '水族' },

  // ===== 人気テーマカード =====
  'sky striker ace - raye': { ja: '閃刀姫-レイ', aliases: ['raye', 'レイ'], category: '戦士族' },
  'sky striker ace - kagari': { ja: '閃刀姫-カガリ', aliases: ['kagari', 'カガリ'], category: '機械族' },
  '閃刀姫-レイ': { ja: '閃刀姫-レイ', aliases: [], category: '戦士族' },
  'labrynth of the silver castle': { ja: '白銀の城のラビュリンス', aliases: ['labrynth', 'ラビュリンス'], category: '悪魔族' },
  'spright blue': { ja: 'スプライト・ブルー', aliases: ['spright', 'スプライト'], category: '雷族' },
  'tearlaments scheiren': { ja: 'ティアラメンツ・シェイレーン', aliases: ['scheiren', 'シェイレーン'], category: '水族' },

  // ===== 伝説の高額カード =====
  'crush card virus': { ja: '死のデッキ破壊ウイルス', aliases: ['ccv', 'crush card'], category: '罠カード' },
  'tournament black luster soldier': { ja: 'カオス・ソルジャー', aliases: ['tbs', 'bls'], category: '戦士族' },
  'tyler the great warrior': { ja: 'タイラー・ザ・グレート・ウォリアー', aliases: ['tyler'], category: '戦士族' },
  'morphing jar': { ja: 'メタモルポット', aliases: ['morphing jar'], category: '岩石族' },

  // ===== 最新環境カード =====
  'snake-eye ash': { ja: 'スネークアイ・エクセル', aliases: ['snake-eye', 'スネークアイ'], category: '炎族' },
  'diabellstar the black witch': { ja: '黒魔女ディアベルスター', aliases: ['diabellstar', 'ディアベルスター'], category: '魔法使い族' },
  'fiendsmith engraver': { ja: 'デモンスミス', aliases: ['fiendsmith', 'デモンスミス'], category: '悪魔族' },

  // ===== ストラクチャーデッキ人気カード =====
  'pot of greed': { ja: '強欲な壺', aliases: ['強欲'], category: '魔法カード' },
  '強欲な壺': { ja: '強欲な壺', aliases: [], category: '魔法カード' },
  'pot of prosperity': { ja: '金満で謙虚な壺', aliases: ['prosperity', '金謙'], category: '魔法カード' },
  'called by the grave': { ja: '墓穴の指名者', aliases: ['called', '墓穴'], category: '魔法カード' },
  'forbidden droplet': { ja: '禁じられた一滴', aliases: ['droplet', '一滴'], category: '魔法カード' },
  'infinite impermanence': { ja: '無限泡影', aliases: ['imperm', '泡影'], category: '罠カード' },
  '無限泡影': { ja: '無限泡影', aliases: [], category: '罠カード' },
};

// =====================================
// セット辞書（高額セット中心）
// =====================================
const YUGIOH_SETS = {
  // ===== 初期シリーズ（WOTC・高額） =====
  'lob': { ja: 'Legend of Blue Eyes White Dragon', code: 'LOB', release: '2002', era: '初期', region: 'TCG' },
  'legend of blue eyes': { ja: 'Legend of Blue Eyes White Dragon', code: 'LOB', release: '2002', era: '初期', region: 'TCG' },
  'mrd': { ja: 'Metal Raiders', code: 'MRD', release: '2002', era: '初期', region: 'TCG' },
  'metal raiders': { ja: 'Metal Raiders', code: 'MRD', release: '2002', era: '初期', region: 'TCG' },
  'psv': { ja: 'Pharaoh\'s Servant', code: 'PSV', release: '2002', era: '初期', region: 'TCG' },
  'pharaohs servant': { ja: 'Pharaoh\'s Servant', code: 'PSV', release: '2002', era: '初期', region: 'TCG' },
  'lod': { ja: 'Legacy of Darkness', code: 'LOD', release: '2003', era: '初期', region: 'TCG' },
  'sdk': { ja: 'Starter Deck: Kaiba', code: 'SDK', release: '2002', era: '初期', region: 'TCG' },
  'sdy': { ja: 'Starter Deck: Yugi', code: 'SDY', release: '2002', era: '初期', region: 'TCG' },
  'dds': { ja: 'Dark Duel Stories', code: 'DDS', release: '2002', era: 'プロモ', region: 'TCG' },

  // ===== 20thシリーズ（OCG高額） =====
  '20th anniversary': { ja: '20th Anniversary', code: '20TH', release: '2019', era: '記念', region: 'OCG' },
  '20th secret': { ja: '20th Secret Rare', code: '20TH', release: '2019', era: '記念', region: 'OCG' },
  '20th-jpbs': { ja: '20th Anniversary Legend Collection', code: '20TH-JPBS', release: '2019', era: '記念', region: 'OCG' },

  // ===== 25thシリーズ =====
  'ra01': { ja: '25th Anniversary Rarity Collection', code: 'RA01', release: '2023', era: '25周年', region: 'TCG' },
  '25th anniversary rarity collection': { ja: '25th Anniversary Rarity Collection', code: 'RA01', release: '2023', era: '25周年', region: 'TCG' },
  'ra02': { ja: '25th Anniversary Rarity Collection II', code: 'RA02', release: '2024', era: '25周年', region: 'TCG' },
  'quarter century': { ja: 'Quarter Century', code: 'QC', release: '2024', era: '25周年', region: 'Both' },

  // ===== Ghosts From the Past =====
  'gftp': { ja: 'Ghosts From the Past', code: 'GFTP', release: '2021', era: 'ゴーストレア', region: 'TCG' },
  'ghosts from the past': { ja: 'Ghosts From the Past', code: 'GFTP', release: '2021', era: 'ゴーストレア', region: 'TCG' },
  'gfp2': { ja: 'Ghosts From the Past: The 2nd Haunting', code: 'GFP2', release: '2022', era: 'ゴーストレア', region: 'TCG' },

  // ===== Prismatic Art Collection =====
  'pac1': { ja: 'PRISMATIC ART COLLECTION', code: 'PAC1', release: '2021', era: 'プリズマ', region: 'OCG' },
  'prismatic art collection': { ja: 'PRISMATIC ART COLLECTION', code: 'PAC1', release: '2021', era: 'プリズマ', region: 'OCG' },

  // ===== OTS Tournament Pack =====
  'ots': { ja: 'OTS Tournament Pack', code: 'OTS', release: '-', era: 'OTS', region: 'TCG' },
  'ots tournament pack': { ja: 'OTS Tournament Pack', code: 'OTS', release: '-', era: 'OTS', region: 'TCG' },

  // ===== 最新セット =====
  'lede': { ja: 'Legacy of Destruction', code: 'LEDE', release: '2024', era: '最新', region: 'TCG' },
  'phni': { ja: 'Phantom Nightmare', code: 'PHNI', release: '2024', era: '最新', region: 'TCG' },
  'agov': { ja: 'Age of Overlord', code: 'AGOV', release: '2023', era: '最新', region: 'TCG' },
  'dune': { ja: 'Duelist Nexus', code: 'DUNE', release: '2023', era: '最新', region: 'TCG' },
  'cyac': { ja: 'Cyberstorm Access', code: 'CYAC', release: '2023', era: '最新', region: 'TCG' },

  // ===== プロモ・トーナメント =====
  'sjcs': { ja: 'Shonen Jump Championship Series', code: 'SJCS', release: '-', era: 'プロモ', region: 'TCG' },
  'shonen jump': { ja: 'Shonen Jump Promo', code: 'JUMP', release: '-', era: 'プロモ', region: 'TCG' },
  'wcq': { ja: 'World Championship Qualifier', code: 'WCQ', release: '-', era: 'プロモ', region: 'Both' },
  'ycs': { ja: 'Yu-Gi-Oh! Championship Series', code: 'YCS', release: '-', era: 'プロモ', region: 'Both' },

  // ===== 人気セット =====
  'toch': { ja: 'Toon Chaos', code: 'TOCH', release: '2020', era: 'コレクターズ', region: 'TCG' },
  'mama': { ja: 'Maze of Memories', code: 'MAMA', release: '2023', era: 'コレクターズ', region: 'TCG' },
  'maze of memories': { ja: 'Maze of Memories', code: 'MAMA', release: '2023', era: 'コレクターズ', region: 'TCG' },
  'mago': { ja: 'Maximum Gold', code: 'MAGO', release: '2020', era: 'ゴールド', region: 'TCG' },
  'maximum gold': { ja: 'Maximum Gold', code: 'MAGO', release: '2020', era: 'ゴールド', region: 'TCG' },
};

// =====================================
// レアリティパターン（遊戯王固有の複雑なレアリティ体系）
// =====================================
const YUGIOH_RARITY_PATTERNS = [
  // 超高額レアリティ
  { pattern: /\bGhost\s*Rare\b/i, rarity: 'Ghost Rare', ja: 'ゴーストレア', tier: 1 },
  { pattern: /\bGR\b(?=\s|$)/i, rarity: 'Ghost Rare', ja: 'ゴーストレア', tier: 1 },
  { pattern: /\bStarlight\s*Rare\b/i, rarity: 'Starlight Rare', ja: 'スターライトレア', tier: 1 },
  { pattern: /\bStR\b/i, rarity: 'Starlight Rare', ja: 'スターライトレア', tier: 1 },
  { pattern: /\bCollector'?s?\s*Rare\b/i, rarity: 'Collectors Rare', ja: 'コレクターズレア', tier: 1 },
  { pattern: /\bCR\b(?=\s|$)/i, rarity: 'Collectors Rare', ja: 'コレクターズレア', tier: 1 },
  { pattern: /\b20th\s*Secret\b/i, rarity: '20th Secret', ja: '20thシークレット', tier: 1 },
  { pattern: /\bQuarter\s*Century\s*Secret\b/i, rarity: 'Quarter Century Secret', ja: 'クォーターセンチュリーシークレット', tier: 1 },
  { pattern: /\bQCSR\b/i, rarity: 'Quarter Century Secret', ja: 'クォーターセンチュリーシークレット', tier: 1 },
  { pattern: /\bQCR\b/i, rarity: 'Quarter Century Secret', ja: 'クォーターセンチュリーシークレット', tier: 1 },

  // 高額レアリティ
  { pattern: /\bUltimate\s*Rare\b/i, rarity: 'Ultimate Rare', ja: 'アルティメットレア', tier: 2 },
  { pattern: /\bUtR\b/i, rarity: 'Ultimate Rare', ja: 'アルティメットレア', tier: 2 },
  { pattern: /\bUlti\b/i, rarity: 'Ultimate Rare', ja: 'アルティメットレア', tier: 2 },
  { pattern: /\bレリーフ\b/i, rarity: 'Ultimate Rare', ja: 'アルティメットレア', tier: 2 },
  { pattern: /\bPrismatic\s*Secret\b/i, rarity: 'Prismatic Secret', ja: 'プリズマティックシークレット', tier: 2 },
  { pattern: /\bPSR\b/i, rarity: 'Prismatic Secret', ja: 'プリズマティックシークレット', tier: 2 },
  { pattern: /\bPrismatic\b/i, rarity: 'Prismatic', ja: 'プリズマティック', tier: 2 },
  { pattern: /\bPlatinum\s*Secret\b/i, rarity: 'Platinum Secret', ja: 'プラチナシークレット', tier: 2 },

  // 標準高額レアリティ
  { pattern: /\bSecret\s*Rare\b/i, rarity: 'Secret Rare', ja: 'シークレットレア', tier: 3 },
  { pattern: /\bScR\b/i, rarity: 'Secret Rare', ja: 'シークレットレア', tier: 3 },
  { pattern: /\bUltra\s*Rare\b/i, rarity: 'Ultra Rare', ja: 'ウルトラレア', tier: 4 },
  { pattern: /\bUR\b(?=\s|$)/i, rarity: 'Ultra Rare', ja: 'ウルトラレア', tier: 4 },
  { pattern: /\bSuper\s*Rare\b/i, rarity: 'Super Rare', ja: 'スーパーレア', tier: 5 },
  { pattern: /\bSR\b(?=\s|$)/i, rarity: 'Super Rare', ja: 'スーパーレア', tier: 5 },
  { pattern: /\bRare\b(?!\s*(Card|Yu))/i, rarity: 'Rare', ja: 'レア', tier: 6 },

  // 特殊レアリティ
  { pattern: /\bGold\s*Rare\b/i, rarity: 'Gold Rare', ja: 'ゴールドレア', tier: 4 },
  { pattern: /\bGold\s*Secret\b/i, rarity: 'Gold Secret', ja: 'ゴールドシークレット', tier: 3 },
  { pattern: /\bPremium\s*Gold\b/i, rarity: 'Premium Gold', ja: 'プレミアムゴールド', tier: 3 },
  { pattern: /\bPharaoh'?s?\s*Rare\b/i, rarity: 'Pharaohs Rare', ja: 'ファラオズレア', tier: 4 },
  { pattern: /\bMillennium\s*Rare\b/i, rarity: 'Millennium Rare', ja: 'ミレニアムレア', tier: 4 },
  { pattern: /\bHolographic\s*Rare\b/i, rarity: 'Holographic Rare', ja: 'ホログラフィックレア', tier: 1 },
  { pattern: /\bParallel\s*Rare\b/i, rarity: 'Parallel Rare', ja: 'パラレルレア', tier: 4 },
  { pattern: /\bMosaic\s*Rare\b/i, rarity: 'Mosaic Rare', ja: 'モザイクレア', tier: 5 },
  { pattern: /\bShatterfoil\b/i, rarity: 'Shatterfoil', ja: 'シャッターホイル', tier: 5 },
  { pattern: /\bStarfoil\b/i, rarity: 'Starfoil', ja: 'スターホイル', tier: 5 },
  { pattern: /\bDuel\s*Terminal\b/i, rarity: 'Duel Terminal', ja: 'デュエルターミナル', tier: 4 },

  // 版（Editionで価格激変）
  { pattern: /\b1st\s*Edition\b/i, rarity: '1st Edition', ja: '初版', tier: 1 },
  { pattern: /\b1st\s*Ed\.?\b/i, rarity: '1st Edition', ja: '初版', tier: 1 },
  { pattern: /\bFirst\s*Edition\b/i, rarity: '1st Edition', ja: '初版', tier: 1 },
  { pattern: /\bUnlimited\b/i, rarity: 'Unlimited', ja: 'アンリミテッド', tier: 4 },
  { pattern: /\bUnlim\b/i, rarity: 'Unlimited', ja: 'アンリミテッド', tier: 4 },
  { pattern: /\bLimited\s*Edition\b/i, rarity: 'Limited Edition', ja: '限定版', tier: 3 },
];

// =====================================
// グレーディングパターン
// =====================================
const YUGIOH_GRADING_PATTERNS = [
  { pattern: /PSA[\s\-]*(\d+(?:\.\d+)?)/i, company: 'PSA' },
  { pattern: /PSA[\s\-]*(?:GEM[\s\-]*)?(?:MT[\s\-]*)?(\d+)/i, company: 'PSA' },
  { pattern: /BGS[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /Beckett[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /BGS[\s\-]*(?:Black\s*Label[\s\-]*)?(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /CGC[\s\-]*(\d+(?:\.\d+)?)/i, company: 'CGC' },
  { pattern: /(?:Grade|Graded)[\s\-]*(\d+(?:\.\d+)?)/i, company: 'Unknown' },
];

// =====================================
// 言語パターン
// =====================================
const YUGIOH_LANGUAGE_PATTERNS = [
  { pattern: /\bJapanese\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJPN\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJP\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bOCG\b/i, code: 'JP', ja: 'OCG' },
  { pattern: /\bEnglish\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bENG\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bTCG\b/i, code: 'EN', ja: 'TCG' },
  { pattern: /\bKorean\b/i, code: 'KR', ja: '韓国語' },
  { pattern: /\bKOR\b/i, code: 'KR', ja: '韓国語' },
  { pattern: /\bAsian\s*English\b/i, code: 'AE', ja: 'アジア英語' },
  { pattern: /\bAE\b/i, code: 'AE', ja: 'アジア英語' },
];

// =====================================
// 型番抽出パターン（LOB-001, GFTP-EN128形式）
// =====================================
const YUGIOH_CARD_ID_PATTERN = /\b([A-Z]{2,5})[\-]?([A-Z]{0,2})(\d{3,4})\b/i;

// =====================================
// 抽出関数
// =====================================

function extractYugiohCard(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  for (const [key, value] of Object.entries(YUGIOH_CARDS)) {
    const keyLower = key.toLowerCase();
    let found = false;

    if (/^[a-z\s\.\-'&:]+$/i.test(key)) {
      const regex = new RegExp(`\\b${escapeRegex(keyLower)}\\b`, 'i');
      found = regex.test(title);
    } else {
      found = title.includes(key);
    }

    if (!found && value.aliases) {
      for (const alias of value.aliases) {
        if (alias.length > 2) {
          const aliasLower = alias.toLowerCase();
          if (/^[a-z\s\.\-'&]+$/i.test(alias)) {
            const regex = new RegExp(`\\b${escapeRegex(aliasLower)}\\b`, 'i');
            found = regex.test(title);
          } else {
            found = title.includes(alias);
          }
          if (found) break;
        }
      }
    }

    if (found) {
      matches.push({
        matched: key,
        ...value,
        confidence: key.length > 5 ? 0.9 : 0.7
      });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.matched.length - a.matched.length);
    return matches[0];
  }

  return null;
}

function extractYugiohSet(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  // 型番パターンでセットを抽出
  const cardIdMatch = title.match(YUGIOH_CARD_ID_PATTERN);
  if (cardIdMatch) {
    const setCode = cardIdMatch[1].toUpperCase();
    const setCodeLower = setCode.toLowerCase();

    if (YUGIOH_SETS[setCodeLower]) {
      return {
        matched: setCode,
        ...YUGIOH_SETS[setCodeLower],
        confidence: 0.95
      };
    }
  }

  for (const [key, value] of Object.entries(YUGIOH_SETS)) {
    const keyLower = key.toLowerCase();
    if (titleLower.includes(keyLower)) {
      matches.push({
        matched: key,
        ...value,
        confidence: 0.85,
        length: key.length
      });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => b.length - a.length);
    return matches[0];
  }

  return null;
}

function extractYugiohRarity(title) {
  const matches = [];

  for (const rarity of YUGIOH_RARITY_PATTERNS) {
    if (rarity.pattern.test(title)) {
      matches.push({
        ...rarity,
        confidence: 0.9
      });
    }
  }

  if (matches.length > 0) {
    matches.sort((a, b) => a.tier - b.tier);
    return matches[0];
  }

  return null;
}

function extractYugiohGrading(title) {
  for (const grading of YUGIOH_GRADING_PATTERNS) {
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

  if (/\bRaw\b/i.test(title) || /\bUngraded\b/i.test(title)) {
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

function extractYugiohLanguage(title) {
  for (const lang of YUGIOH_LANGUAGE_PATTERNS) {
    if (lang.pattern.test(title)) {
      return {
        code: lang.code,
        ja: lang.ja,
        confidence: 0.9
      };
    }
  }

  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(title)) {
    return {
      code: 'JP',
      ja: '日本語',
      confidence: 0.7
    };
  }

  return {
    code: 'Unknown',
    ja: '不明',
    confidence: 0.3
  };
}

function extractYugiohCardId(title) {
  const match = title.match(YUGIOH_CARD_ID_PATTERN);
  if (match) {
    const setCode = match[1].toUpperCase();
    const lang = match[2] ? match[2].toUpperCase() : '';
    const cardNum = match[3];
    return {
      full: lang ? `${setCode}-${lang}${cardNum}` : `${setCode}-${cardNum}`,
      setCode: setCode,
      lang: lang,
      cardNum: cardNum,
      confidence: 0.95
    };
  }
  return null;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractYugiohAttributes(title) {
  const card = extractYugiohCard(title);
  const set = extractYugiohSet(title);
  const rarity = extractYugiohRarity(title);
  const grading = extractYugiohGrading(title);
  const language = extractYugiohLanguage(title);
  const cardId = extractYugiohCardId(title);

  const extractedCount = [card, set, rarity, grading?.isGraded ? grading : null, cardId]
    .filter(x => x !== null).length;

  const confidences = [
    card?.confidence || 0,
    set?.confidence || 0,
    rarity?.confidence || 0,
    grading?.confidence || 0,
    language?.confidence || 0
  ].filter(c => c > 0);

  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  return {
    card: card ? {
      name: card.ja,
      nameEn: card.matched,
      category: card.category
    } : null,
    set: set ? {
      name: set.ja,
      code: set.code,
      era: set.era,
      region: set.region
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
    cardId: cardId,
    confidence: overallConfidence,
    extractedCount: extractedCount,
    extractedAt: new Date().toISOString()
  };
}

// =====================================
// ユーザー補正用
// =====================================

function addCustomYugiohCard(key, value) {
  YUGIOH_CARDS[key.toLowerCase()] = value;
  if (value.ja) {
    YUGIOH_CARDS[value.ja] = value;
  }
}

function addCustomYugiohSet(key, value) {
  YUGIOH_SETS[key.toLowerCase()] = value;
}

// グローバルに公開
window.YugiohProfile = {
  extractAttributes: extractYugiohAttributes,
  extractCard: extractYugiohCard,
  extractSet: extractYugiohSet,
  extractRarity: extractYugiohRarity,
  extractGrading: extractYugiohGrading,
  extractLanguage: extractYugiohLanguage,
  extractCardId: extractYugiohCardId,
  addCustomCard: addCustomYugiohCard,
  addCustomSet: addCustomYugiohSet,
  CARDS: YUGIOH_CARDS,
  SETS: YUGIOH_SETS,
  RARITY_PATTERNS: YUGIOH_RARITY_PATTERNS,
  GRADING_PATTERNS: YUGIOH_GRADING_PATTERNS,
  LANGUAGE_PATTERNS: YUGIOH_LANGUAGE_PATTERNS
};

console.log('Yugioh Profile loaded - Cards:', Object.keys(YUGIOH_CARDS).length, 'Sets:', Object.keys(YUGIOH_SETS).length);
