/**
 * バックグラウンドサービスワーカー
 * ぶんせき君 v4.0.0 - eBay統合分析ツール
 *
 * 対応AI:
 * - OpenAI (GPT-4o-mini)
 * - Anthropic Claude (claude-3-5-sonnet)
 * - Google Gemini (gemini-pro)
 */

// ウィンドウIDを保持
let popupWindowId = null;

// アイコンクリック時に独立ウィンドウを開く
chrome.action.onClicked.addListener(async () => {
  // 既存のウィンドウがあるかチェック
  if (popupWindowId !== null) {
    try {
      const existingWindow = await chrome.windows.get(popupWindowId);
      // ウィンドウが存在する場合はフォーカス
      if (existingWindow) {
        await chrome.windows.update(popupWindowId, { focused: true });
        return;
      }
    } catch (e) {
      // ウィンドウが存在しない場合は新規作成
      popupWindowId = null;
    }
  }

  // 新しいウィンドウを作成
  const window = await chrome.windows.create({
    url: 'popup.html',
    type: 'popup',
    width: 720,
    height: 800,
    top: 100,
    left: 100
  });

  popupWindowId = window.id;
});

// ウィンドウが閉じられた時にIDをクリア
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    // OpenAI
    case 'analyzeWithAI':
      analyzeWithOpenAI(request.data, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'chatWithAI':
      chatWithOpenAI(request.message, request.history, request.analysisData, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    // Claude
    case 'analyzeWithClaude':
      analyzeWithClaude(request.data, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'chatWithClaude':
      chatWithClaude(request.message, request.history, request.analysisData, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    // Gemini
    case 'analyzeWithGemini':
      analyzeWithGemini(request.data, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'chatWithGemini':
      chatWithGemini(request.message, request.history, request.analysisData, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    // その他
    case 'classifyWithAI':
      classifyItemsWithAI(request.titles, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'analyzeCategoryWithAI':
      analyzeCategoryWithAI(request.data, request.apiKey)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'saveMarketData':
      saveMarketDataToDB(request.items)
        .then(result => sendResponse({ success: true, ...result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'getAnalysisData':
      chrome.storage.local.get(['analysisData', 'excludedBrands', 'highlightEnabled'])
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'updateExcludedBrand':
      handleExcludedBrandUpdate(request.brand, request.exclude)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'openPopup':
      chrome.action.openPopup();
      sendResponse({ success: true });
      return false;
  }
});

/**
 * 除外ブランドの更新処理
 */
async function handleExcludedBrandUpdate(brand, exclude) {
  const data = await chrome.storage.local.get(['excludedBrands']);
  let excludedBrands = data.excludedBrands || [];

  if (exclude) {
    if (!excludedBrands.includes(brand.toUpperCase())) {
      excludedBrands.push(brand.toUpperCase());
    }
  } else {
    excludedBrands = excludedBrands.filter(b => b !== brand.toUpperCase());
  }

  await chrome.storage.local.set({ excludedBrands });

  // アクティブなタブに変更を通知
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0] && tabs[0].url && tabs[0].url.includes('ebay.com')) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'excludedBrandsUpdated',
      brands: excludedBrands
    }).catch(() => {});
  }
}

/**
 * OpenAI APIでチャット（戦略相談）
 */
async function chatWithOpenAI(message, history, analysisData, apiKey) {
  const systemPrompt = `あなたはeBayセラー向けの販売戦略アドバイザーです。
日本人セラーが海外バイヤーに販売するeBay輸出ビジネスを支援します。

以下はセラーの現在の販売データサマリーです：
${JSON.stringify(analysisData, null, 2)}

このデータを踏まえて、セラーの質問に具体的で実践的なアドバイスを提供してください。

ルール：
- 回答は日本語で、簡潔に（200文字程度）
- 具体的な数値やブランド名を使って説明
- 実行可能なアクションを提案
- 必要に応じて注意点やリスクも伝える
- フレンドリーだがプロフェッショナルなトーンで`;

  // 会話履歴を構築
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // 直近10件の会話履歴のみ
    { role: 'user', content: message }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  return content;
}

/**
 * OpenAI APIでeBayデータを分析
 */
async function analyzeWithOpenAI(data, apiKey) {
  const systemPrompt = `あなたはeBayセラー向けの販売データアナリストです。
日本人セラーが海外バイヤーに販売するeBay輸出ビジネスのデータを分析します。

与えられたデータを分析し、以下の形式でJSON形式で提案を行ってください。

{
  "alerts": [
    { "name": "項目名", "reason": "アラート内容（30文字以内）" }
  ],
  "strengthen": [
    { "name": "ブランド名", "reason": "強化すべき理由（30文字以内）" }
  ],
  "review": [
    { "name": "ブランド名", "reason": "見直すべき理由（30文字以内）" }
  ],
  "opportunities": [
    { "name": "ブランド名", "reason": "売れ筋の理由（30文字以内）" }
  ],
  "suggestion": "総合的な仕入れ・出品戦略の提案（150文字程度）"
}

分析の観点：
1. alerts: 出品ペースの低下、Watch数が多いのに売れていない商品など、緊急度の高い警告
2. strengthen: 売上率が高く、もっと仕入れを増やすべきブランド（仕入れ強化推奨）
3. review: 出品数が多いが売れ行きが悪い、または在庫が滞留しているブランド（価格見直し推奨）
4. opportunities: 売上率・回転率が良い売れ筋ブランド
5. suggestion: 全体を踏まえた具体的な改善提案

各項目は最大3つまでに絞り、最も重要なものを選んでください。
データが不足している項目は空配列[]で返してください。`;

  const userPrompt = buildUserPrompt(data);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('JSON parse error:', content);
    throw new Error('AI応答のパースに失敗しました');
  }
}

/**
 * Claude APIでeBayデータを分析
 */
async function analyzeWithClaude(data, apiKey) {
  const systemPrompt = getAnalysisSystemPrompt();
  const userPrompt = buildUserPrompt(data);

  console.log('[Claude] Starting analysis request...');

  let response;
  try {
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userPrompt}\n\nJSON形式で回答してください。` }
        ]
      })
    });
  } catch (fetchError) {
    console.error('[Claude] Fetch error:', fetchError);
    throw new Error(`ネットワークエラー: ${fetchError.message}`);
  }

  console.log('[Claude] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Claude] Error response:', errorData);
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  console.log('[Claude] Response received');
  const content = result.content?.[0]?.text;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  // JSONを抽出（マークダウンコードブロックに囲まれている可能性）
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error:', content);
    throw new Error('AI応答のパースに失敗しました');
  }
}

/**
 * Claude APIでチャット
 */
async function chatWithClaude(message, history, analysisData, apiKey) {
  const systemPrompt = getChatSystemPrompt(analysisData);

  // 履歴をClaudeフォーマットに変換
  const messages = history.slice(-10).map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content
  }));

  messages.push({ role: 'user', content: message });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.content?.[0]?.text;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  return content;
}

/**
 * Gemini APIでeBayデータを分析
 */
async function analyzeWithGemini(data, apiKey) {
  const systemPrompt = getAnalysisSystemPrompt();
  const userPrompt = buildUserPrompt(data);

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nJSON形式で回答してください。余計な説明は不要です。`;

  console.log('[Gemini] Starting analysis request...');

  let response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    });
  } catch (fetchError) {
    console.error('[Gemini] Fetch error:', fetchError);
    throw new Error(`ネットワークエラー: ${fetchError.message}`);
  }

  console.log('[Gemini] Response status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[Gemini] Error response:', errorData);
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  console.log('[Gemini] Response received');
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  // JSONを抽出
  const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error:', content);
    throw new Error('AI応答のパースに失敗しました');
  }
}

/**
 * Gemini APIでチャット
 */
async function chatWithGemini(message, history, analysisData, apiKey) {
  const systemPrompt = getChatSystemPrompt(analysisData);

  // 履歴をGeminiフォーマットに変換
  const contents = [];

  // システムプロンプトを最初のメッセージに含める
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt + '\n\n以下の会話に答えてください。' }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'はい、eBay販売についてアドバイスします。' }]
  });

  // 履歴を追加
  history.slice(-10).forEach(msg => {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    });
  });

  // 新しいメッセージ
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const result = await response.json();
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  return content;
}

/**
 * 分析用システムプロンプトを取得
 */
function getAnalysisSystemPrompt() {
  return `あなたはeBayセラー向けの販売データアナリストです。
日本人セラーが海外バイヤーに販売するeBay輸出ビジネスのデータを分析します。

与えられたデータを分析し、以下の形式でJSON形式で提案を行ってください。

{
  "alerts": [
    { "name": "項目名", "reason": "アラート内容（30文字以内）" }
  ],
  "strengthen": [
    { "name": "ブランド名", "reason": "強化すべき理由（30文字以内）" }
  ],
  "review": [
    { "name": "ブランド名", "reason": "見直すべき理由（30文字以内）" }
  ],
  "opportunities": [
    { "name": "ブランド名", "reason": "売れ筋の理由（30文字以内）" }
  ],
  "suggestion": "総合的な仕入れ・出品戦略の提案（150文字程度）"
}

分析の観点：
1. alerts: 出品ペースの低下、Watch数が多いのに売れていない商品など、緊急度の高い警告
2. strengthen: 売上率が高く、もっと仕入れを増やすべきブランド（仕入れ強化推奨）
3. review: 出品数が多いが売れ行きが悪い、または在庫が滞留しているブランド（価格見直し推奨）
4. opportunities: 売上率・回転率が良い売れ筋ブランド
5. suggestion: 全体を踏まえた具体的な改善提案

各項目は最大3つまでに絞り、最も重要なものを選んでください。
データが不足している項目は空配列[]で返してください。`;
}

/**
 * チャット用システムプロンプトを取得
 */
function getChatSystemPrompt(analysisData) {
  return `あなたはeBayセラー向けの販売戦略アドバイザーです。
日本人セラーが海外バイヤーに販売するeBay輸出ビジネスを支援します。

以下はセラーの現在の販売データサマリーです：
${JSON.stringify(analysisData, null, 2)}

このデータを踏まえて、セラーの質問に具体的で実践的なアドバイスを提供してください。

ルール：
- 回答は日本語で、簡潔に（200文字程度）
- 具体的な数値やブランド名を使って説明
- 実行可能なアクションを提案
- 必要に応じて注意点やリスクも伝える
- フレンドリーだがプロフェッショナルなトーンで`;
}

/**
 * ユーザープロンプトを構築
 */
function buildUserPrompt(data) {
  const { summary, brandPerformance, categoryStats, watchRanking, listingPace, alerts, marketData } = data;

  let prompt = `以下のeBay販売データを分析してください：

【基本サマリー】
- 出品中: ${summary.totalActive}件
- 販売済み: ${summary.totalSold}件
- 総Watch数: ${summary.totalWatchers}
- 最終出品からの日数: ${summary.daysSinceLastListing !== null ? summary.daysSinceLastListing + '日' : '不明'}

【出品ペース（過去7日）】
${formatListingPace(listingPace.last7days)}
- 7日間の出品数合計: ${listingPace.totalListings}件
- 7日間の販売数合計: ${listingPace.totalSales}件

【ブランド別パフォーマンス TOP20】
${formatBrandPerformance(brandPerformance)}

【eBayカテゴリ別】
${formatCategoryStats(categoryStats)}

【Watch数ランキング TOP10】
${formatWatchRanking(watchRanking)}

【システムアラート】
${formatAlerts(alerts)}`;

  // 市場データがある場合は追加
  if (marketData && marketData.totalItems > 0) {
    prompt += `

【市場データ分析】（${marketData.totalItems}件の市場データを取得済み）

■ 市場で売れている上位ブランド:
${formatMarketTopBrands(marketData.topBrands)}

■ 競合比較（自分も扱っているブランド）:
${formatCompetitorBrands(marketData.competitorBrands)}

■ 仕入れチャンス（市場で売れているが自分は未出品）:
${formatOpportunityBrands(marketData.opportunities)}`;
  }

  prompt += `

上記データを分析し、具体的な改善提案をJSONで回答してください。
特に市場データがある場合は、市場の傾向と自分の在庫を比較した提案を重視してください。`;

  return prompt;
}

/**
 * 市場の上位ブランドをフォーマット
 */
function formatMarketTopBrands(brands) {
  if (!brands || brands.length === 0) return '（データなし）';
  return brands
    .slice(0, 10)
    .map(b => `- ${b.brand}: 市場${b.marketCount}件, 平均価格$${b.avgPrice}, 総販売数${b.totalSold}件`)
    .join('\n');
}

/**
 * 競合ブランド比較をフォーマット
 */
function formatCompetitorBrands(brands) {
  if (!brands || brands.length === 0) return '（該当なし）';
  return brands
    .slice(0, 10)
    .map(b => `- ${b.brand}: 市場${b.marketCount}件(平均$${b.avgPrice}) vs 自分:出品${b.myActive}件,販売${b.mySold}件(平均$${b.myAvgPrice || 0})`)
    .join('\n');
}

/**
 * チャンスブランドをフォーマット
 */
function formatOpportunityBrands(brands) {
  if (!brands || brands.length === 0) return '（該当なし）';
  return brands
    .map(b => `- ${b.brand}: 市場${b.marketCount}件, 平均価格$${b.avgPrice}【仕入れ推奨】`)
    .join('\n');
}

/**
 * 出品ペースをフォーマット
 */
function formatListingPace(pace) {
  if (!pace || pace.length === 0) return '（データなし）';
  return pace
    .map(p => `${p.label}: 出品${p.listings}件, 販売${p.sales}件`)
    .join('\n');
}

/**
 * ブランドパフォーマンスをフォーマット
 */
function formatBrandPerformance(brands) {
  if (!brands || brands.length === 0) return '（データなし）';
  return brands
    .map(b => `- ${b.brand}: 出品中${b.active}件, 販売${b.sold}件, 売上率${b.sellThroughRate}%, 平均Watch${b.avgWatchers}, 売上$${b.revenue.toFixed(0)}`)
    .join('\n');
}

/**
 * カテゴリ統計をフォーマット
 */
function formatCategoryStats(categories) {
  if (!categories || categories.length === 0) return '（データなし）';
  return categories
    .sort((a, b) => b.active - a.active)
    .map(c => `- ${c.category}: ${c.active}件 (Watch計: ${c.totalWatchers})`)
    .join('\n');
}

/**
 * Watchランキングをフォーマット
 */
function formatWatchRanking(ranking) {
  if (!ranking || ranking.length === 0) return '（Watch数のある商品なし）';
  return ranking
    .map(item => `${item.rank}. ${item.title.substring(0, 50)}... - ${item.watchers} watches ($${item.price.toFixed(0)})`)
    .join('\n');
}

/**
 * アラートをフォーマット
 */
function formatAlerts(alerts) {
  if (!alerts || alerts.length === 0) return '（なし）';
  return alerts
    .map(a => `- [${a.type}] ${a.message}`)
    .join('\n');
}

/**
 * OpenAI APIで商品タイトルからブランド・カテゴリを判定
 * @param {string[]} titles - 判定対象のタイトル配列（最大50件ずつ）
 * @param {string} apiKey - OpenAI APIキー
 * @returns {Promise<Object[]>} - 判定結果の配列
 */
async function classifyItemsWithAI(titles, apiKey) {
  if (!titles || titles.length === 0) {
    return [];
  }

  // 30件ずつバッチ処理（レート制限対策）
  const batchSize = 30;
  const results = [];

  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize);
    try {
      const batchResults = await classifyBatchWithAI(batch, apiKey);
      results.push(...batchResults);
    } catch (e) {
      console.error(`Batch ${i / batchSize + 1} failed:`, e.message);
      // エラーでも空の結果を追加して続行
      batch.forEach((_, idx) => {
        results.push({ index: i + idx, brand: null, category: 'その他' });
      });
    }

    // バッチ間に少し遅延を入れる（レート制限対策）
    if (i + batchSize < titles.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * バッチ単位でAI判定
 */
async function classifyBatchWithAI(titles, apiKey) {
  const systemPrompt = `あなたはeBay商品タイトルの分類専門家です。
商品タイトルから「ブランド名」と「カテゴリ」を判定してください。

【カテゴリ一覧】
■ 時計（Watches）- 詳細に分類
- 時計:メンズ腕時計
- 時計:レディース腕時計
- 時計:ヴィンテージ時計
- 時計:高級時計（Rolex, Omega, Cartier等）
- 時計:スポーツウォッチ
- 時計:スマートウォッチ
- 時計:懐中時計
- 時計:パーツ・アクセサリー

■ アクセサリー・ジュエリー - 詳細に分類
- ジュエリー:ネックレス・ペンダント
- ジュエリー:ブレスレット・バングル
- ジュエリー:リング・指輪
- ジュエリー:ピアス・イヤリング
- ジュエリー:ブローチ・ピン
- ジュエリー:ヴィンテージジュエリー
- ジュエリー:ファインジュエリー（金・プラチナ・宝石）
- ジュエリー:メンズジュエリー
- ジュエリー:ジュエリーセット

■ バッグ - 詳細に分類
- バッグ:ハンドバッグ
- バッグ:ショルダーバッグ
- バッグ:トートバッグ
- バッグ:クラッチバッグ
- バッグ:バックパック・リュック
- バッグ:ボストンバッグ
- バッグ:ヴィンテージバッグ

■ 財布・小物
- 財布:長財布
- 財布:二つ折り財布
- 財布:コインケース
- 小物:キーケース・キーホルダー
- 小物:カードケース・名刺入れ
- 小物:ポーチ

■ アパレル
- トップス（シャツ、Tシャツ、セーター等）
- アウター（ジャケット、コート等）
- ボトムス（パンツ、スカート等）
- ワンピース・ドレス
- 靴:スニーカー
- 靴:ブーツ
- 靴:パンプス・ヒール
- 靴:ローファー・革靴
- 靴:サンダル
- 帽子
- スカーフ・マフラー
- ベルト
- サングラス・眼鏡

■ その他カテゴリ
- 食器・テーブルウェア
- インテリア・雑貨
- トレカ（ポケモンカード、遊戯王等）
- ゲーム（ゲームソフト、ゲーム機等）
- フィギュア・おもちゃ
- 本・マンガ
- CD・DVD・レコード
- ぬいぐるみ・コレクション
- スマホ・タブレット
- オーディオ
- PC・周辺機器
- カメラ
- 家電
- コスメ・美容
- 香水
- スポーツ
- アウトドア
- ベビー・キッズ
- ペン・筆記具
- その他

【出力形式】
JSON配列で回答してください。各要素は:
{
  "index": タイトルの番号（0始まり）,
  "brand": "ブランド名（不明な場合はnull）",
  "category": "カテゴリ名（上記一覧から選択）"
}

【重要なルール】
- ブランド名は正式名称で（例: "ROLEX", "OMEGA", "SEIKO", "HERMES", "LOUIS VUITTON"）
- 時計ブランド例: ROLEX, OMEGA, CARTIER, TAG HEUER, SEIKO, CITIZEN, CASIO, TISSOT, LONGINES, BREITLING, IWC, PATEK PHILIPPE, AUDEMARS PIGUET
- ジュエリーブランド例: TIFFANY, CARTIER, BVLGARI, VAN CLEEF & ARPELS, HARRY WINSTON, MIKIMOTO
- ノーブランド・不明な場合はbrandをnullに
- カテゴリは必ず上記一覧から選択（詳細カテゴリを優先）
- 判断できない場合は "その他" を使用`;

  const userPrompt = `以下の${titles.length}件の商品タイトルを分類してください：

${titles.map((t, i) => `${i}. ${t}`).join('\n')}

JSON配列形式で回答してください。`;

  // タイムアウト付きfetch（60秒）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 4000
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI応答が空です');
    }

    const parsed = JSON.parse(content);
    // 配列形式または { items: [...] } 形式に対応
    const items = Array.isArray(parsed) ? parsed : (parsed.items || parsed.results || []);

    // 結果を整形
    return items.map(item => ({
      index: item.index,
      brand: item.brand || null,
      category: item.category || 'その他',
      title: titles[item.index] || ''
    }));

  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('API呼び出しがタイムアウトしました（60秒）');
    }
    console.error('AI分類エラー:', e);
    throw e;
  }
}

/**
 * カテゴリ特化AI分析
 */
async function analyzeCategoryWithAI(data, apiKey) {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません');
  }

  const systemPrompt = `あなたはeBay販売のプロフェッショナルアナリストです。
以下のカテゴリに特化した販売データを分析し、具体的で実践的なアドバイスを提供してください。

【分析対象カテゴリ】${data.category}

【重要】回答は以下のJSON形式で出力してください：
{
  "strengths": ["強み1", "強み2", ...],
  "improvements": ["改善点1", "改善点2", ...],
  "recommendations": ["仕入れ推奨1", "仕入れ推奨2", ...],
  "strategy": "全体的な戦略アドバイス"
}

【分析の観点】
1. 強み（strengths）: 自分のデータから見える競争優位性
2. 改善点（improvements）: 売上向上のための具体的なアクション
3. 仕入れ推奨（recommendations）: 市場データに基づく仕入れるべきブランド・商品タイプ
4. 戦略（strategy）: このカテゴリでの総合的な販売戦略

【注意事項】
- 具体的なブランド名や数値を含めてください
- 実践的かつ即座に行動できる提案をしてください
- 市場データとの比較を重視してください`;

  const userPrompt = `【自分のデータ】
- 出品中: ${data.myData.activeCount}件
- 売却済: ${data.myData.soldCount}件
- 売上率: ${data.myData.sellRate}%
- 平均価格: $${data.myData.avgPrice.toFixed(2)}
- トップブランド: ${data.myData.topBrands.map(b => `${b.brand}(${b.count}件)`).join(', ') || 'なし'}

【市場データ】
- 総件数: ${data.marketData.count}件
- 平均価格: $${data.marketData.avgPrice.toFixed(2)}
- トップブランド: ${data.marketData.topBrands.map(b => `${b.brand}(${b.count}件)`).join(', ') || 'なし'}

このデータを分析し、${data.category}カテゴリでの販売戦略を提案してください。`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API エラー: ${response.status}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI応答が空です');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('JSON parse error:', content);
    // パースに失敗した場合は構造化して返す
    return {
      strengths: ['分析結果の解析に問題が発生しました'],
      improvements: [],
      recommendations: [],
      strategy: content
    };
  }
}

/**
 * 市場データをIndexedDBに保存
 */
async function saveMarketDataToDB(items) {
  if (!items || items.length === 0) {
    return { added: 0, duplicates: 0 };
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BunsekiKunDB', 1);

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
      const tx = db.transaction(['marketData'], 'readwrite');
      const store = tx.objectStore('marketData');

      let added = 0;
      let duplicates = 0;
      const capturedAt = new Date().toISOString();
      const seenTitles = new Set();

      // 既存データのタイトルを取得
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const existingItems = getAllRequest.result || [];
        existingItems.forEach(item => {
          if (item.titleLower) {
            seenTitles.add(item.titleLower);
          }
        });

        console.log('既存市場データ:', existingItems.length, '件');

        // 新しいデータを追加
        items.forEach(item => {
          const titleLower = (item.title || '').toLowerCase().trim();

          if (!titleLower) return;

          if (seenTitles.has(titleLower)) {
            duplicates++;
            return;
          }

          seenTitles.add(titleLower);
          const record = {
            ...item,
            titleLower,
            capturedAt
          };

          const addReq = store.add(record);
          addReq.onsuccess = () => added++;
          addReq.onerror = (e) => {
            if (e.target.error?.name === 'ConstraintError') {
              duplicates++;
            }
            e.preventDefault();
          };
        });
      };

      tx.oncomplete = () => {
        db.close();
        console.log(`Market data saved: ${added} added, ${duplicates} duplicates`);
        resolve({ added, duplicates });
      };

      tx.onerror = () => {
        db.close();
        reject(new Error('トランザクションエラー'));
      };
    };
  });
}
