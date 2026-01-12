/**
 * ワンピースカード専用プロファイル
 * タイトルからカード属性を抽出するロジック
 */

// =====================================
// キャラクター辞書（主要キャラ約100種）
// =====================================
const ONEPIECE_CHARACTERS = {
  // ===== 麦わらの一味 =====
  'monkey d. luffy': { ja: 'モンキー・D・ルフィ', aliases: ['luffy', 'ルフィ', 'gear 5', 'gear5', 'ギア5', 'nika'], crew: '麦わらの一味' },
  'luffy': { ja: 'モンキー・D・ルフィ', aliases: ['ルフィ'], crew: '麦わらの一味' },
  'ルフィ': { ja: 'モンキー・D・ルフィ', aliases: [], crew: '麦わらの一味' },
  'roronoa zoro': { ja: 'ロロノア・ゾロ', aliases: ['zoro', 'ゾロ', 'zorojuro', 'ゾロ十郎'], crew: '麦わらの一味' },
  'zoro': { ja: 'ロロノア・ゾロ', aliases: ['ゾロ'], crew: '麦わらの一味' },
  'ゾロ': { ja: 'ロロノア・ゾロ', aliases: [], crew: '麦わらの一味' },
  'nami': { ja: 'ナミ', aliases: ['ナミ'], crew: '麦わらの一味' },
  'ナミ': { ja: 'ナミ', aliases: [], crew: '麦わらの一味' },
  'usopp': { ja: 'ウソップ', aliases: ['ウソップ', 'sogeking', 'そげキング'], crew: '麦わらの一味' },
  'sogeking': { ja: 'そげキング', aliases: ['ウソップ'], crew: '麦わらの一味' },
  'sanji': { ja: 'サンジ', aliases: ['サンジ', 'vinsmoke sanji'], crew: '麦わらの一味' },
  'サンジ': { ja: 'サンジ', aliases: [], crew: '麦わらの一味' },
  'tony tony chopper': { ja: 'トニートニー・チョッパー', aliases: ['chopper', 'チョッパー'], crew: '麦わらの一味' },
  'chopper': { ja: 'トニートニー・チョッパー', aliases: ['チョッパー'], crew: '麦わらの一味' },
  'nico robin': { ja: 'ニコ・ロビン', aliases: ['robin', 'ロビン'], crew: '麦わらの一味' },
  'robin': { ja: 'ニコ・ロビン', aliases: ['ロビン'], crew: '麦わらの一味' },
  'franky': { ja: 'フランキー', aliases: ['フランキー', 'cutty flam'], crew: '麦わらの一味' },
  'フランキー': { ja: 'フランキー', aliases: [], crew: '麦わらの一味' },
  'brook': { ja: 'ブルック', aliases: ['ブルック', 'soul king'], crew: '麦わらの一味' },
  'ブルック': { ja: 'ブルック', aliases: [], crew: '麦わらの一味' },
  'jinbe': { ja: 'ジンベエ', aliases: ['ジンベエ', 'jimbei', 'jinbei'], crew: '麦わらの一味' },
  'ジンベエ': { ja: 'ジンベエ', aliases: [], crew: '麦わらの一味' },

  // ===== 四皇 =====
  'shanks': { ja: 'シャンクス', aliases: ['シャンクス', 'red-haired shanks', '赤髪のシャンクス'], crew: '赤髪海賊団' },
  'シャンクス': { ja: 'シャンクス', aliases: [], crew: '赤髪海賊団' },
  'kaido': { ja: 'カイドウ', aliases: ['カイドウ', 'kaidou', '百獣のカイドウ'], crew: '百獣海賊団' },
  'カイドウ': { ja: 'カイドウ', aliases: [], crew: '百獣海賊団' },
  'big mom': { ja: 'ビッグ・マム', aliases: ['charlotte linlin', 'linlin', 'リンリン'], crew: 'ビッグマム海賊団' },
  'blackbeard': { ja: '黒ひげ', aliases: ['marshall d. teach', 'teach', 'ティーチ', '黒ひげ'], crew: '黒ひげ海賊団' },
  'marshall d. teach': { ja: 'マーシャル・D・ティーチ', aliases: ['blackbeard', '黒ひげ'], crew: '黒ひげ海賊団' },
  'buggy': { ja: 'バギー', aliases: ['バギー', 'captain buggy'], crew: 'バギーズデリバリー' },

  // ===== 白ひげ海賊団 =====
  'whitebeard': { ja: '白ひげ', aliases: ['edward newgate', 'ニューゲート', '白ひげ'], crew: '白ひげ海賊団' },
  'edward newgate': { ja: 'エドワード・ニューゲート', aliases: ['whitebeard', '白ひげ'], crew: '白ひげ海賊団' },
  'portgas d. ace': { ja: 'ポートガス・D・エース', aliases: ['ace', 'エース', 'fire fist ace'], crew: '白ひげ海賊団' },
  'ace': { ja: 'ポートガス・D・エース', aliases: ['エース'], crew: '白ひげ海賊団' },
  'エース': { ja: 'ポートガス・D・エース', aliases: [], crew: '白ひげ海賊団' },
  'marco': { ja: 'マルコ', aliases: ['マルコ', 'marco the phoenix', '不死鳥マルコ'], crew: '白ひげ海賊団' },

  // ===== 最悪の世代 =====
  'trafalgar law': { ja: 'トラファルガー・ロー', aliases: ['law', 'ロー', 'trafalgar d. water law'], crew: 'ハートの海賊団' },
  'law': { ja: 'トラファルガー・ロー', aliases: ['ロー'], crew: 'ハートの海賊団' },
  'ロー': { ja: 'トラファルガー・ロー', aliases: [], crew: 'ハートの海賊団' },
  'eustass kid': { ja: 'ユースタス・キッド', aliases: ['kid', 'キッド', 'eustass captain kid'], crew: 'キッド海賊団' },
  'kid': { ja: 'ユースタス・キッド', aliases: ['キッド'], crew: 'キッド海賊団' },
  'キッド': { ja: 'ユースタス・キッド', aliases: [], crew: 'キッド海賊団' },
  'x drake': { ja: 'X・ドレーク', aliases: ['drake', 'ドレーク'], crew: 'ドレーク海賊団' },
  'jewelry bonney': { ja: 'ジュエリー・ボニー', aliases: ['bonney', 'ボニー'], crew: 'ボニー海賊団' },
  'scratchmen apoo': { ja: 'スクラッチメン・アプー', aliases: ['apoo', 'アプー'], crew: 'オンエア海賊団' },
  'basil hawkins': { ja: 'バジル・ホーキンス', aliases: ['hawkins', 'ホーキンス'], crew: 'ホーキンス海賊団' },
  'capone bege': { ja: 'カポネ・ベッジ', aliases: ['bege', 'ベッジ'], crew: 'ファイアタンク海賊団' },
  'urouge': { ja: 'ウルージ', aliases: ['ウルージ'], crew: '破戒僧海賊団' },
  'killer': { ja: 'キラー', aliases: ['キラー'], crew: 'キッド海賊団' },

  // ===== 海軍 =====
  'akainu': { ja: '赤犬', aliases: ['sakazuki', 'サカズキ', '赤犬'], crew: '海軍' },
  'sakazuki': { ja: 'サカズキ', aliases: ['akainu', '赤犬'], crew: '海軍' },
  'aokiji': { ja: '青キジ', aliases: ['kuzan', 'クザン', '青キジ'], crew: '海軍' },
  'kuzan': { ja: 'クザン', aliases: ['aokiji', '青キジ'], crew: '海軍' },
  'kizaru': { ja: '黄猿', aliases: ['borsalino', 'ボルサリーノ', '黄猿'], crew: '海軍' },
  'borsalino': { ja: 'ボルサリーノ', aliases: ['kizaru', '黄猿'], crew: '海軍' },
  'fujitora': { ja: '藤虎', aliases: ['issho', 'イッショウ', '藤虎'], crew: '海軍' },
  'sengoku': { ja: 'センゴク', aliases: ['センゴク', '仏のセンゴク'], crew: '海軍' },
  'garp': { ja: 'ガープ', aliases: ['monkey d. garp', 'モンキー・D・ガープ'], crew: '海軍' },
  'smoker': { ja: 'スモーカー', aliases: ['スモーカー'], crew: '海軍' },
  'tashigi': { ja: 'たしぎ', aliases: ['たしぎ'], crew: '海軍' },
  'coby': { ja: 'コビー', aliases: ['コビー'], crew: '海軍' },

  // ===== 王下七武海 =====
  'dracule mihawk': { ja: 'ジュラキュール・ミホーク', aliases: ['mihawk', 'ミホーク', '鷹の目'], crew: '王下七武海' },
  'mihawk': { ja: 'ジュラキュール・ミホーク', aliases: ['ミホーク'], crew: '王下七武海' },
  'boa hancock': { ja: 'ボア・ハンコック', aliases: ['hancock', 'ハンコック', '蛇姫'], crew: '九蛇海賊団' },
  'hancock': { ja: 'ボア・ハンコック', aliases: ['ハンコック'], crew: '九蛇海賊団' },
  'crocodile': { ja: 'クロコダイル', aliases: ['クロコダイル', 'sir crocodile'], crew: 'バロックワークス' },
  'donquixote doflamingo': { ja: 'ドンキホーテ・ドフラミンゴ', aliases: ['doflamingo', 'ドフラミンゴ', 'joker'], crew: 'ドンキホーテファミリー' },
  'doflamingo': { ja: 'ドンキホーテ・ドフラミンゴ', aliases: ['ドフラミンゴ'], crew: 'ドンキホーテファミリー' },
  'gecko moria': { ja: 'ゲッコー・モリア', aliases: ['moria', 'モリア'], crew: 'スリラーバーク海賊団' },
  'bartholomew kuma': { ja: 'バーソロミュー・くま', aliases: ['kuma', 'くま'], crew: '王下七武海' },

  // ===== ワノ国 =====
  'yamato': { ja: 'ヤマト', aliases: ['ヤマト'], crew: 'ワノ国' },
  'ヤマト': { ja: 'ヤマト', aliases: [], crew: 'ワノ国' },
  'kozuki oden': { ja: '光月おでん', aliases: ['oden', 'おでん'], crew: 'ワノ国' },
  'kozuki momonosuke': { ja: '光月モモの助', aliases: ['momonosuke', 'モモの助'], crew: 'ワノ国' },
  'king': { ja: 'キング', aliases: ['キング', 'alber'], crew: '百獣海賊団' },
  'queen': { ja: 'クイーン', aliases: ['クイーン'], crew: '百獣海賊団' },
  'jack': { ja: 'ジャック', aliases: ['ジャック'], crew: '百獣海賊団' },

  // ===== ビッグマム海賊団 =====
  'charlotte katakuri': { ja: 'シャーロット・カタクリ', aliases: ['katakuri', 'カタクリ'], crew: 'ビッグマム海賊団' },
  'katakuri': { ja: 'シャーロット・カタクリ', aliases: ['カタクリ'], crew: 'ビッグマム海賊団' },
  'charlotte pudding': { ja: 'シャーロット・プリン', aliases: ['pudding', 'プリン'], crew: 'ビッグマム海賊団' },
  'charlotte smoothie': { ja: 'シャーロット・スムージー', aliases: ['smoothie', 'スムージー'], crew: 'ビッグマム海賊団' },
  'charlotte cracker': { ja: 'シャーロット・クラッカー', aliases: ['cracker', 'クラッカー'], crew: 'ビッグマム海賊団' },

  // ===== 革命軍 =====
  'sabo': { ja: 'サボ', aliases: ['サボ'], crew: '革命軍' },
  'サボ': { ja: 'サボ', aliases: [], crew: '革命軍' },
  'monkey d. dragon': { ja: 'モンキー・D・ドラゴン', aliases: ['dragon', 'ドラゴン'], crew: '革命軍' },
  'emporio ivankov': { ja: 'エンポリオ・イワンコフ', aliases: ['ivankov', 'イワンコフ'], crew: '革命軍' },
  'koala': { ja: 'コアラ', aliases: ['コアラ'], crew: '革命軍' },

  // ===== その他人気キャラ =====
  'enel': { ja: 'エネル', aliases: ['エネル', 'god enel'], crew: 'スカイピア' },
  'エネル': { ja: 'エネル', aliases: [], crew: 'スカイピア' },
  'rob lucci': { ja: 'ロブ・ルッチ', aliases: ['lucci', 'ルッチ'], crew: 'CP0' },
  'kaku': { ja: 'カク', aliases: ['カク'], crew: 'CP0' },
  'uta': { ja: 'ウタ', aliases: ['ウタ'], crew: 'Film Red' },
  'ウタ': { ja: 'ウタ', aliases: [], crew: 'Film Red' },
  'perona': { ja: 'ペローナ', aliases: ['ペローナ'], crew: 'スリラーバーク' },
  'rebecca': { ja: 'レベッカ', aliases: ['レベッカ'], crew: 'ドレスローザ' },
  'vivi': { ja: 'ビビ', aliases: ['nefertari vivi', 'ネフェルタリ・ビビ'], crew: 'アラバスタ' },
  'carrot': { ja: 'キャロット', aliases: ['キャロット'], crew: 'ミンク族' },
  'cavendish': { ja: 'キャベンディッシュ', aliases: ['キャベンディッシュ', 'hakuba'], crew: '美しき海賊団' },

  // ===== ヴィンスモーク家 =====
  'vinsmoke reiju': { ja: 'ヴィンスモーク・レイジュ', aliases: ['reiju', 'レイジュ'], crew: 'ジェルマ66' },
  'vinsmoke ichiji': { ja: 'ヴィンスモーク・イチジ', aliases: ['ichiji', 'イチジ'], crew: 'ジェルマ66' },
  'vinsmoke niji': { ja: 'ヴィンスモーク・ニジ', aliases: ['niji', 'ニジ'], crew: 'ジェルマ66' },
  'vinsmoke yonji': { ja: 'ヴィンスモーク・ヨンジ', aliases: ['yonji', 'ヨンジ'], crew: 'ジェルマ66' },
};

// =====================================
// セット辞書（OP01〜現行、ST、EB、PRB）
// =====================================
const ONEPIECE_SETS = {
  // ===== ブースターパック =====
  'op01': { ja: 'ROMANCE DAWN', code: 'OP01', release: '2022-12', era: 'ブースター' },
  'op-01': { ja: 'ROMANCE DAWN', code: 'OP01', release: '2022-12', era: 'ブースター' },
  'romance dawn': { ja: 'ROMANCE DAWN', code: 'OP01', release: '2022-12', era: 'ブースター' },
  'op02': { ja: '頂上決戦', code: 'OP02', release: '2023-03', era: 'ブースター' },
  'op-02': { ja: '頂上決戦', code: 'OP02', release: '2023-03', era: 'ブースター' },
  'paramount war': { ja: '頂上決戦', code: 'OP02', release: '2023-03', era: 'ブースター' },
  'op03': { ja: '強大な敵', code: 'OP03', release: '2023-06', era: 'ブースター' },
  'op-03': { ja: '強大な敵', code: 'OP03', release: '2023-06', era: 'ブースター' },
  'pillars of strength': { ja: '強大な敵', code: 'OP03', release: '2023-06', era: 'ブースター' },
  'op04': { ja: '謀略の王国', code: 'OP04', release: '2023-09', era: 'ブースター' },
  'op-04': { ja: '謀略の王国', code: 'OP04', release: '2023-09', era: 'ブースター' },
  'kingdoms of intrigue': { ja: '謀略の王国', code: 'OP04', release: '2023-09', era: 'ブースター' },
  'op05': { ja: '新時代の主役', code: 'OP05', release: '2023-12', era: 'ブースター' },
  'op-05': { ja: '新時代の主役', code: 'OP05', release: '2023-12', era: 'ブースター' },
  'awakening of the new era': { ja: '新時代の主役', code: 'OP05', release: '2023-12', era: 'ブースター' },
  'op06': { ja: '双璧の覇者', code: 'OP06', release: '2024-03', era: 'ブースター' },
  'op-06': { ja: '双璧の覇者', code: 'OP06', release: '2024-03', era: 'ブースター' },
  'wings of the captain': { ja: '双璧の覇者', code: 'OP06', release: '2024-03', era: 'ブースター' },
  'op07': { ja: '500年後の未来', code: 'OP07', release: '2024-06', era: 'ブースター' },
  'op-07': { ja: '500年後の未来', code: 'OP07', release: '2024-06', era: 'ブースター' },
  '500 years in the future': { ja: '500年後の未来', code: 'OP07', release: '2024-06', era: 'ブースター' },
  'op08': { ja: '二つの伝説', code: 'OP08', release: '2024-09', era: 'ブースター' },
  'op-08': { ja: '二つの伝説', code: 'OP08', release: '2024-09', era: 'ブースター' },
  'two legends': { ja: '二つの伝説', code: 'OP08', release: '2024-09', era: 'ブースター' },
  'op09': { ja: '新世界の覇者', code: 'OP09', release: '2024-12', era: 'ブースター' },
  'op-09': { ja: '新世界の覇者', code: 'OP09', release: '2024-12', era: 'ブースター' },
  'emperors in the new world': { ja: '新世界の覇者', code: 'OP09', release: '2024-12', era: 'ブースター' },
  'op10': { ja: 'OP10', code: 'OP10', release: '2025-02', era: 'ブースター' },
  'op-10': { ja: 'OP10', code: 'OP10', release: '2025-02', era: 'ブースター' },
  'op11': { ja: 'OP11', code: 'OP11', release: '2025-05', era: 'ブースター' },
  'op-11': { ja: 'OP11', code: 'OP11', release: '2025-05', era: 'ブースター' },
  'a fist of divine speed': { ja: 'OP11', code: 'OP11', release: '2025-05', era: 'ブースター' },
  'op12': { ja: 'OP12', code: 'OP12', release: '2025-08', era: 'ブースター' },
  'op13': { ja: 'OP13', code: 'OP13', release: '2025-11', era: 'ブースター' },
  'op14': { ja: 'OP14', code: 'OP14', release: '2026-01', era: 'ブースター' },

  // ===== スタートデッキ =====
  'st01': { ja: '麦わらの一味', code: 'ST01', release: '2022-12', era: 'スターター' },
  'st-01': { ja: '麦わらの一味', code: 'ST01', release: '2022-12', era: 'スターター' },
  'straw hat crew': { ja: '麦わらの一味', code: 'ST01', release: '2022-12', era: 'スターター' },
  'st02': { ja: '最悪の世代', code: 'ST02', release: '2022-12', era: 'スターター' },
  'st-02': { ja: '最悪の世代', code: 'ST02', release: '2022-12', era: 'スターター' },
  'worst generation': { ja: '最悪の世代', code: 'ST02', release: '2022-12', era: 'スターター' },
  'st03': { ja: '王下七武海', code: 'ST03', release: '2022-12', era: 'スターター' },
  'st-03': { ja: '王下七武海', code: 'ST03', release: '2022-12', era: 'スターター' },
  'seven warlords': { ja: '王下七武海', code: 'ST03', release: '2022-12', era: 'スターター' },
  'st04': { ja: '百獣海賊団', code: 'ST04', release: '2022-12', era: 'スターター' },
  'st-04': { ja: '百獣海賊団', code: 'ST04', release: '2022-12', era: 'スターター' },
  'animal kingdom pirates': { ja: '百獣海賊団', code: 'ST04', release: '2022-12', era: 'スターター' },
  'st05': { ja: 'ONE PIECE FILM', code: 'ST05', release: '2023-02', era: 'スターター' },
  'st-05': { ja: 'ONE PIECE FILM', code: 'ST05', release: '2023-02', era: 'スターター' },
  'film edition': { ja: 'ONE PIECE FILM', code: 'ST05', release: '2023-02', era: 'スターター' },
  'st06': { ja: '海軍', code: 'ST06', release: '2023-03', era: 'スターター' },
  'st-06': { ja: '海軍', code: 'ST06', release: '2023-03', era: 'スターター' },
  'absolute justice': { ja: '海軍', code: 'ST06', release: '2023-03', era: 'スターター' },
  'st07': { ja: 'ビッグ・マム海賊団', code: 'ST07', release: '2023-06', era: 'スターター' },
  'st-07': { ja: 'ビッグ・マム海賊団', code: 'ST07', release: '2023-06', era: 'スターター' },
  'big mom pirates': { ja: 'ビッグ・マム海賊団', code: 'ST07', release: '2023-06', era: 'スターター' },
  'st08': { ja: 'モンキー・D・ルフィ', code: 'ST08', release: '2023-08', era: 'スターター' },
  'st-08': { ja: 'モンキー・D・ルフィ', code: 'ST08', release: '2023-08', era: 'スターター' },
  'st09': { ja: 'ヤマト', code: 'ST09', release: '2023-08', era: 'スターター' },
  'st-09': { ja: 'ヤマト', code: 'ST09', release: '2023-08', era: 'スターター' },
  'st10': { ja: '三船長集結', code: 'ST10', release: '2023-11', era: 'スターター' },
  'st-10': { ja: '三船長集結', code: 'ST10', release: '2023-11', era: 'スターター' },
  'three captains': { ja: '三船長集結', code: 'ST10', release: '2023-11', era: 'スターター' },
  'ultra deck': { ja: '三船長集結', code: 'ST10', release: '2023-11', era: 'スターター' },
  'st11': { ja: 'ウタ', code: 'ST11', release: '2024-02', era: 'スターター' },
  'st12': { ja: 'ゾロ＆サンジ', code: 'ST12', release: '2024-03', era: 'スターター' },
  'st13': { ja: 'ウルトラデッキ 三兄弟の絆', code: 'ST13', release: '2024-05', era: 'スターター' },
  'three brothers': { ja: 'ウルトラデッキ 三兄弟の絆', code: 'ST13', release: '2024-05', era: 'スターター' },
  'st14': { ja: '3D2Y', code: 'ST14', release: '2024-08', era: 'スターター' },
  'st15': { ja: 'RED ロー', code: 'ST15', release: '2024-08', era: 'スターター' },
  'st16': { ja: 'GREEN ウタ', code: 'ST16', release: '2024-08', era: 'スターター' },
  'st17': { ja: 'BLUE ドンキホーテ・ドフラミンゴ', code: 'ST17', release: '2024-09', era: 'スターター' },
  'st18': { ja: 'PURPLE モンキー・D・ルフィ', code: 'ST18', release: '2024-09', era: 'スターター' },
  'st19': { ja: 'BLACK スモーカー', code: 'ST19', release: '2024-09', era: 'スターター' },
  'st20': { ja: 'YELLOW シャーロット・カタクリ', code: 'ST20', release: '2024-09', era: 'スターター' },
  'st21': { ja: 'ギア5', code: 'ST21', release: '2025-03', era: 'スターター' },
  'ex gear 5': { ja: 'ギア5', code: 'ST21', release: '2025-03', era: 'スターター' },

  // ===== 特別セット =====
  'prb01': { ja: 'PREMIUM BOOSTER ONE PIECE CARD THE BEST', code: 'PRB01', release: '2024-11', era: 'プレミアム' },
  'prb-01': { ja: 'PREMIUM BOOSTER ONE PIECE CARD THE BEST', code: 'PRB01', release: '2024-11', era: 'プレミアム' },
  'premium booster': { ja: 'PREMIUM BOOSTER ONE PIECE CARD THE BEST', code: 'PRB01', release: '2024-11', era: 'プレミアム' },
  'the best': { ja: 'PREMIUM BOOSTER ONE PIECE CARD THE BEST', code: 'PRB01', release: '2024-11', era: 'プレミアム' },
  'eb01': { ja: 'Memorial Collection', code: 'EB01', release: '2024-05', era: 'エクストラ' },
  'eb-01': { ja: 'Memorial Collection', code: 'EB01', release: '2024-05', era: 'エクストラ' },
  'memorial collection': { ja: 'Memorial Collection', code: 'EB01', release: '2024-05', era: 'エクストラ' },
  'eb02': { ja: 'Memorial Collection EB-02', code: 'EB02', release: '2025-01', era: 'エクストラ' },
  'eb-02': { ja: 'Memorial Collection EB-02', code: 'EB02', release: '2025-01', era: 'エクストラ' },

  // ===== プロモ =====
  'promo': { ja: 'プロモ', code: 'P', release: '-', era: 'プロモ' },
  'p-': { ja: 'プロモ', code: 'P', release: '-', era: 'プロモ' },
  'tournament': { ja: 'トーナメントプロモ', code: 'P-TOUR', release: '-', era: 'プロモ' },
  'championship': { ja: 'チャンピオンシッププロモ', code: 'P-CHAMP', release: '-', era: 'プロモ' },
};

// =====================================
// レアリティパターン
// =====================================
const ONEPIECE_RARITY_PATTERNS = [
  // 超高額レアリティ
  { pattern: /\bSEC\b/i, rarity: 'SEC', ja: 'シークレットレア', tier: 1 },
  { pattern: /\bSecret\s*Rare\b/i, rarity: 'SEC', ja: 'シークレットレア', tier: 1 },
  { pattern: /\bManga\s*(Rare|Parallel|Art)?\b/i, rarity: 'Manga', ja: 'マンガレア', tier: 1 },
  { pattern: /\bComic\s*(Rare|Parallel|Art)?\b/i, rarity: 'Manga', ja: 'マンガレア', tier: 1 },
  { pattern: /\bSP\b(?!\w)/i, rarity: 'SP', ja: 'スーパーパラレル', tier: 1 },
  { pattern: /\bSuper\s*Parallel\b/i, rarity: 'SP', ja: 'スーパーパラレル', tier: 1 },

  // 高額レアリティ
  { pattern: /\bL\b(?!\w)(?!aw)/i, rarity: 'L', ja: 'リーダー', tier: 2 },
  { pattern: /\bLeader\b/i, rarity: 'L', ja: 'リーダー', tier: 2 },
  { pattern: /\bAlt\s*Art\b/i, rarity: 'Alt Art', ja: 'オルタネートアート', tier: 2 },
  { pattern: /\bAlternate\s*Art\b/i, rarity: 'Alt Art', ja: 'オルタネートアート', tier: 2 },
  { pattern: /\bAA\b/i, rarity: 'Alt Art', ja: 'オルタネートアート', tier: 2 },
  { pattern: /\bParallel\b/i, rarity: 'Parallel', ja: 'パラレル', tier: 2 },
  { pattern: /\/P\b/i, rarity: 'Parallel', ja: 'パラレル', tier: 2 },

  // 標準レアリティ
  { pattern: /\bSR\b/i, rarity: 'SR', ja: 'スーパーレア', tier: 3 },
  { pattern: /\bSuper\s*Rare\b/i, rarity: 'SR', ja: 'スーパーレア', tier: 3 },
  { pattern: /\bR\b(?!\w)/i, rarity: 'R', ja: 'レア', tier: 4 },
  { pattern: /\bRare\b(?!\s*(Card|One|Yu))/i, rarity: 'R', ja: 'レア', tier: 4 },
  { pattern: /\bUC\b/i, rarity: 'UC', ja: 'アンコモン', tier: 5 },
  { pattern: /\bUncommon\b/i, rarity: 'UC', ja: 'アンコモン', tier: 5 },
  { pattern: /\bC\b(?!\w)/i, rarity: 'C', ja: 'コモン', tier: 6 },
  { pattern: /\bCommon\b/i, rarity: 'C', ja: 'コモン', tier: 6 },

  // 特殊
  { pattern: /\bFoil\b/i, rarity: 'Foil', ja: 'フォイル', tier: 4 },
  { pattern: /\bFull\s*Art\b/i, rarity: 'Full Art', ja: 'フルアート', tier: 3 },
  { pattern: /\bBox\s*Topper\b/i, rarity: 'Box Topper', ja: 'ボックストッパー', tier: 2 },
  { pattern: /\bPromo\b/i, rarity: 'Promo', ja: 'プロモ', tier: 3 },
  { pattern: /\bSigned\b/i, rarity: 'Signed', ja: 'サイン入り', tier: 1 },
  { pattern: /\bOda\b/i, rarity: 'Oda', ja: '尾田サイン', tier: 1 },
];

// =====================================
// グレーディングパターン（ポケカと共通）
// =====================================
const ONEPIECE_GRADING_PATTERNS = [
  { pattern: /PSA[\s\-]*(\d+(?:\.\d+)?)/i, company: 'PSA' },
  { pattern: /PSA[\s\-]*(?:GEM[\s\-]*)?(?:MT[\s\-]*)?(\d+)/i, company: 'PSA' },
  { pattern: /BGS[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /Beckett[\s\-]*(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /BGS[\s\-]*(?:Black\s*Label[\s\-]*)?(\d+(?:\.\d+)?)/i, company: 'BGS' },
  { pattern: /CGC[\s\-]*(\d+(?:\.\d+)?)/i, company: 'CGC' },
  { pattern: /ARS[\s\-]*(\d+(?:\.\d+)?)/i, company: 'ARS' },
  { pattern: /ACE[\s\-]*(\d+(?:\.\d+)?)/i, company: 'ACE' },
  { pattern: /(?:Grade|Graded)[\s\-]*(\d+(?:\.\d+)?)/i, company: 'Unknown' },
];

// =====================================
// 言語パターン
// =====================================
const ONEPIECE_LANGUAGE_PATTERNS = [
  { pattern: /\bJapanese\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJPN\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\bJP\b/i, code: 'JP', ja: '日本語' },
  { pattern: /\b日本語\b/, code: 'JP', ja: '日本語' },
  { pattern: /\bEnglish\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bENG\b/i, code: 'EN', ja: '英語' },
  { pattern: /\bEN\b/i, code: 'EN', ja: '英語' },
  { pattern: /\b英語\b/, code: 'EN', ja: '英語' },
];

// =====================================
// 型番抽出パターン（OP05-119形式）
// =====================================
const CARD_ID_PATTERN = /\b(OP|ST|EB|PRB|P)[\-]?(\d{1,2})[\-\s]?(\d{3})\b/i;

// =====================================
// 抽出関数
// =====================================

/**
 * キャラクター名を抽出
 */
function extractOnePieceCharacter(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  for (const [key, value] of Object.entries(ONEPIECE_CHARACTERS)) {
    const keyLower = key.toLowerCase();
    let found = false;

    // 英語キーの場合は単語境界でマッチ
    if (/^[a-z\s\.\-']+$/i.test(key)) {
      const regex = new RegExp(`\\b${escapeRegex(keyLower)}\\b`, 'i');
      found = regex.test(title);
    } else {
      // 日本語キーはそのまま検索
      found = title.includes(key);
    }

    // エイリアスもチェック
    if (!found && value.aliases) {
      for (const alias of value.aliases) {
        if (alias.length > 2) {
          const aliasLower = alias.toLowerCase();
          if (/^[a-z\s\.\-']+$/i.test(alias)) {
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
        confidence: key.length > 4 ? 0.9 : 0.7
      });
    }
  }

  // 最も長いマッチを優先
  if (matches.length > 0) {
    matches.sort((a, b) => b.matched.length - a.matched.length);
    return matches[0];
  }

  return null;
}

/**
 * セット名を抽出
 */
function extractOnePieceSet(title) {
  const titleLower = title.toLowerCase();
  const matches = [];

  // まず型番パターンでセットを抽出
  const cardIdMatch = title.match(CARD_ID_PATTERN);
  if (cardIdMatch) {
    const prefix = cardIdMatch[1].toUpperCase();
    const setNum = cardIdMatch[2].padStart(2, '0');
    const setCode = `${prefix}${setNum}`.toLowerCase();

    if (ONEPIECE_SETS[setCode]) {
      return {
        matched: `${prefix}${setNum}`,
        ...ONEPIECE_SETS[setCode],
        confidence: 0.95
      };
    }
  }

  // セット名辞書で検索
  for (const [key, value] of Object.entries(ONEPIECE_SETS)) {
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

/**
 * レアリティを抽出
 */
function extractOnePieceRarity(title) {
  const matches = [];

  for (const rarity of ONEPIECE_RARITY_PATTERNS) {
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
function extractOnePieceGrading(title) {
  for (const grading of ONEPIECE_GRADING_PATTERNS) {
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

/**
 * 言語を抽出
 */
function extractOnePieceLanguage(title) {
  for (const lang of ONEPIECE_LANGUAGE_PATTERNS) {
    if (lang.pattern.test(title)) {
      return {
        code: lang.code,
        ja: lang.ja,
        confidence: 0.9
      };
    }
  }

  // 日本語文字があれば日本語カード
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

/**
 * カード番号（型番）を抽出
 */
function extractOnePieceCardId(title) {
  const match = title.match(CARD_ID_PATTERN);
  if (match) {
    const prefix = match[1].toUpperCase();
    const setNum = match[2].padStart(2, '0');
    const cardNum = match[3];
    return {
      full: `${prefix}${setNum}-${cardNum}`,
      prefix: prefix,
      setNum: setNum,
      cardNum: cardNum,
      confidence: 0.95
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
function extractOnePieceAttributes(title) {
  const character = extractOnePieceCharacter(title);
  const set = extractOnePieceSet(title);
  const rarity = extractOnePieceRarity(title);
  const grading = extractOnePieceGrading(title);
  const language = extractOnePieceLanguage(title);
  const cardId = extractOnePieceCardId(title);

  // 抽出成功した項目数
  const extractedCount = [character, set, rarity, grading?.isGraded ? grading : null, cardId]
    .filter(x => x !== null).length;

  // 全体の確信度
  const confidences = [
    character?.confidence || 0,
    set?.confidence || 0,
    rarity?.confidence || 0,
    grading?.confidence || 0,
    language?.confidence || 0
  ].filter(c => c > 0);

  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;

  return {
    character: character ? {
      name: character.ja,
      nameEn: character.matched,
      crew: character.crew
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
    cardId: cardId,
    confidence: overallConfidence,
    extractedCount: extractedCount,
    extractedAt: new Date().toISOString()
  };
}

// =====================================
// ユーザー補正用の辞書管理
// =====================================

function addCustomOnePieceCharacter(key, value) {
  ONEPIECE_CHARACTERS[key.toLowerCase()] = value;
  if (value.ja) {
    ONEPIECE_CHARACTERS[value.ja] = value;
  }
}

function addCustomOnePieceSet(key, value) {
  ONEPIECE_SETS[key.toLowerCase()] = value;
}

// グローバルに公開
window.OnePieceProfile = {
  extractAttributes: extractOnePieceAttributes,
  extractCharacter: extractOnePieceCharacter,
  extractSet: extractOnePieceSet,
  extractRarity: extractOnePieceRarity,
  extractGrading: extractOnePieceGrading,
  extractLanguage: extractOnePieceLanguage,
  extractCardId: extractOnePieceCardId,
  addCustomCharacter: addCustomOnePieceCharacter,
  addCustomSet: addCustomOnePieceSet,
  CHARACTERS: ONEPIECE_CHARACTERS,
  SETS: ONEPIECE_SETS,
  RARITY_PATTERNS: ONEPIECE_RARITY_PATTERNS,
  GRADING_PATTERNS: ONEPIECE_GRADING_PATTERNS,
  LANGUAGE_PATTERNS: ONEPIECE_LANGUAGE_PATTERNS
};

console.log('OnePiece Profile loaded - Characters:', Object.keys(ONEPIECE_CHARACTERS).length, 'Sets:', Object.keys(ONEPIECE_SETS).length);
