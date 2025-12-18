/**
 * 設定ページスクリプト
 * ぶんせき君 v4.0.0
 */

// デフォルト設定
const DEFAULT_SETTINGS = {
  openaiApiKey: '',
  claudeApiKey: '',
  geminiApiKey: ''
};

// DOM要素
const elements = {
  openaiApiKey: document.getElementById('openaiApiKey'),
  claudeApiKey: document.getElementById('claudeApiKey'),
  geminiApiKey: document.getElementById('geminiApiKey'),
  openaiStatus: document.getElementById('openaiStatus'),
  claudeStatus: document.getElementById('claudeStatus'),
  geminiStatus: document.getElementById('geminiStatus'),
  saveBtn: document.getElementById('saveBtn'),
  resetBtn: document.getElementById('resetBtn'),
  alert: document.getElementById('alert'),
  // アカウント関連
  secretCode: document.getElementById('secretCode'),
  activateCodeBtn: document.getElementById('activateCodeBtn'),
  codeStatus: document.getElementById('codeStatus'),
  purchaseBtn: document.getElementById('purchaseBtn'),
  accountStatusBox: document.getElementById('accountStatusBox'),
  accountIcon: document.getElementById('accountIcon'),
  accountType: document.getElementById('accountType'),
  accountDesc: document.getElementById('accountDesc'),
  accountBadge: document.getElementById('accountBadge')
};

/**
 * 初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadAccountStatus();
  initEventListeners();
});

/**
 * 設定を読み込み
 */
async function loadSettings() {
  try {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    elements.openaiApiKey.value = settings.openaiApiKey || '';
    elements.claudeApiKey.value = settings.claudeApiKey || '';
    elements.geminiApiKey.value = settings.geminiApiKey || '';

    // 状態を更新
    updateAllStatus(settings);
  } catch (error) {
    console.error('Failed to load settings:', error);
    showAlert('error', '設定の読み込みに失敗しました');
  }
}

/**
 * 全APIの状態を更新
 */
function updateAllStatus(settings) {
  updateApiStatus('openai', settings.openaiApiKey ? 'success' : 'pending',
    settings.openaiApiKey ? '設定済み' : '未設定');
  updateApiStatus('claude', settings.claudeApiKey ? 'success' : 'pending',
    settings.claudeApiKey ? '設定済み' : '未設定');
  updateApiStatus('gemini', settings.geminiApiKey ? 'success' : 'pending',
    settings.geminiApiKey ? '設定済み' : '未設定');
}

/**
 * イベントリスナー初期化
 */
function initEventListeners() {
  // パスワード表示切り替え
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        btn.textContent = input.type === 'password' ? '👁' : '🙈';
      }
    });
  });

  // 接続テスト
  document.querySelectorAll('[data-test]').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.test;
      testApiConnection(provider);
    });
  });

  // 保存
  elements.saveBtn.addEventListener('click', saveSettings);

  // リセット
  elements.resetBtn.addEventListener('click', resetSettings);

  // シークレットコード認証
  if (elements.activateCodeBtn) {
    elements.activateCodeBtn.addEventListener('click', activateSecretCode);
  }

  // 購入ボタン
  if (elements.purchaseBtn) {
    elements.purchaseBtn.addEventListener('click', openPurchasePage);
  }
}

/**
 * API接続テスト
 */
async function testApiConnection(provider) {
  const keyElement = document.getElementById(`${provider}ApiKey`);
  const apiKey = keyElement?.value.trim();

  if (!apiKey) {
    showAlert('error', 'APIキーを入力してください');
    return;
  }

  updateApiStatus(provider, 'pending', 'テスト中...');

  try {
    let response;

    switch (provider) {
      case 'openai':
        response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        break;

      case 'claude':
        // Claude APIのテスト（messages APIを使用）
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
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
        break;

      case 'gemini':
        // Gemini APIのテスト
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
          method: 'GET'
        });
        break;

      default:
        throw new Error('Unknown provider');
    }

    if (response.ok) {
      updateApiStatus(provider, 'success', '接続成功');
      showAlert('success', `${provider.toUpperCase()} APIキーが有効です`);
    } else {
      const error = await response.json().catch(() => ({}));
      updateApiStatus(provider, 'error', '接続失敗');
      showAlert('error', `APIエラー: ${error.error?.message || response.status}`);
    }
  } catch (error) {
    updateApiStatus(provider, 'error', '接続失敗');
    showAlert('error', `接続エラー: ${error.message}`);
  }
}

/**
 * API状態を更新
 */
function updateApiStatus(provider, status, text) {
  const badge = document.getElementById(`${provider}Status`);
  if (badge) {
    badge.className = `status-badge ${status}`;
    badge.textContent = text;
  }
}

/**
 * 設定を保存
 */
async function saveSettings() {
  const openaiApiKey = elements.openaiApiKey.value.trim();
  const claudeApiKey = elements.claudeApiKey.value.trim();
  const geminiApiKey = elements.geminiApiKey.value.trim();

  try {
    await chrome.storage.sync.set({
      openaiApiKey,
      claudeApiKey,
      geminiApiKey
    });

    showAlert('success', '設定を保存しました');

    // 状態を更新
    updateAllStatus({ openaiApiKey, claudeApiKey, geminiApiKey });
  } catch (error) {
    console.error('Failed to save settings:', error);
    showAlert('error', '設定の保存に失敗しました');
  }
}

/**
 * 設定をリセット
 */
async function resetSettings() {
  if (!confirm('すべてのAPIキーをリセットしてもよろしいですか？')) {
    return;
  }

  try {
    await chrome.storage.sync.set(DEFAULT_SETTINGS);

    elements.openaiApiKey.value = '';
    elements.claudeApiKey.value = '';
    elements.geminiApiKey.value = '';

    updateAllStatus(DEFAULT_SETTINGS);
    showAlert('success', '設定をリセットしました');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showAlert('error', '設定のリセットに失敗しました');
  }
}

/**
 * アラート表示
 */
function showAlert(type, message) {
  const alert = elements.alert;
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.style.display = 'block';

  // 5秒後に非表示
  setTimeout(() => {
    alert.style.display = 'none';
  }, 5000);
}

// ========================================
// アカウント・ライセンス関連
// ========================================

/**
 * アカウント状態を読み込み・表示
 */
async function loadAccountStatus() {
  try {
    if (typeof BunsekiAuth === 'undefined') {
      console.warn('BunsekiAuth not loaded');
      return;
    }

    const userType = await BunsekiAuth.getUserType();
    updateAccountDisplay(userType);
  } catch (error) {
    console.error('Failed to load account status:', error);
  }
}

/**
 * アカウント表示を更新
 */
function updateAccountDisplay(userType) {
  if (!elements.accountStatusBox) return;

  switch (userType) {
    case 'member':
      elements.accountStatusBox.classList.add('premium');
      elements.accountIcon.textContent = '🎓';
      elements.accountType.textContent = 'スクール会員';
      elements.accountDesc.textContent = '全機能が利用可能です';
      elements.accountBadge.className = 'status-badge success';
      elements.accountBadge.textContent = 'Member';
      // シークレットコード入力欄を非表示
      hideSecretCodeSection();
      break;

    case 'paid':
      elements.accountStatusBox.classList.add('premium');
      elements.accountIcon.textContent = '👑';
      elements.accountType.textContent = 'フルバージョン';
      elements.accountDesc.textContent = '全機能が利用可能です';
      elements.accountBadge.className = 'status-badge success';
      elements.accountBadge.textContent = 'Premium';
      // 購入セクションを非表示
      hidePurchaseSection();
      break;

    default: // free
      elements.accountStatusBox.classList.remove('premium');
      elements.accountIcon.textContent = '🔒';
      elements.accountType.textContent = '無料プラン';
      elements.accountDesc.textContent = '一部機能のみ利用可能';
      elements.accountBadge.className = 'status-badge pending';
      elements.accountBadge.textContent = 'Free';
      break;
  }
}

/**
 * シークレットコードで認証
 */
async function activateSecretCode() {
  const code = elements.secretCode?.value.trim();

  if (!code) {
    updateCodeStatus('error', 'コードを入力してください');
    return;
  }

  try {
    const result = await BunsekiAuth.activateWithSecretCode(code);

    if (result.success) {
      updateCodeStatus('success', '✓ ' + result.message);
      showAlert('success', result.message);
      // 表示を更新
      await loadAccountStatus();
    } else {
      updateCodeStatus('error', '✗ ' + result.message);
      showAlert('error', result.message);
    }
  } catch (error) {
    console.error('Activation error:', error);
    updateCodeStatus('error', '認証に失敗しました');
    showAlert('error', '認証処理中にエラーが発生しました');
  }
}

/**
 * コード認証状態を更新
 */
function updateCodeStatus(type, message) {
  if (elements.codeStatus) {
    elements.codeStatus.className = `code-status ${type}`;
    elements.codeStatus.textContent = message;
  }
}

/**
 * 購入ページを開く
 */
async function openPurchasePage() {
  try {
    // ExtensionPay導入後に実装
    // await BunsekiAuth.openPaymentPage();

    // 仮実装：メッセージを表示
    showAlert('error', '購入機能は準備中です。シークレットコードをお持ちの方はそちらをご利用ください。');
  } catch (error) {
    console.error('Purchase error:', error);
    showAlert('error', '購入処理中にエラーが発生しました');
  }
}

/**
 * シークレットコードセクションを非表示
 */
function hideSecretCodeSection() {
  const section = elements.secretCode?.closest('.api-section');
  if (section) {
    section.style.display = 'none';
  }
}

/**
 * 購入セクションを非表示
 */
function hidePurchaseSection() {
  const section = elements.purchaseBtn?.closest('.api-section');
  if (section) {
    section.style.display = 'none';
  }
}
