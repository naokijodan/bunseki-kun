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
  alert: document.getElementById('alert')
};

/**
 * 初期化
 */
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
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
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
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
