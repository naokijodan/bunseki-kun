/**
 * ぶんせき君 - 認証・課金管理モジュール
 *
 * ユーザータイプ:
 * - free: 無料ユーザー（制限あり）
 * - member: スクール会員（シークレットコードで認証）
 * - paid: 課金ユーザー（ExtensionPayで購入）
 */

const BunsekiAuth = {
  // シークレットコード（スクール会員用）
  // 本番環境では環境変数やサーバーから取得することを推奨
  SECRET_CODES: ['MGOOSE2025'],

  // ストレージキー
  STORAGE_KEYS: {
    USER_TYPE: 'bunseki_user_type',
    SECRET_CODE: 'bunseki_secret_code',
    ACTIVATED_AT: 'bunseki_activated_at'
  },

  // 機能アクセス権の定義
  FEATURES: {
    // 無料ユーザーが使える機能
    free: {
      tabs: ['my-data', 'my-analysis'],
      maxSheets: 1,
      description: '自分のデータ分析のみ'
    },
    // 会員・課金ユーザーが使える機能
    premium: {
      tabs: ['my-data', 'market-data', 'my-analysis', 'market-analysis', 'ai-suggestions'],
      maxSheets: 10,
      description: '全機能利用可能'
    }
  },

  /**
   * 初期化 - ページ読み込み時に呼び出す
   */
  async init() {
    const userType = await this.getUserType();
    console.log('[Auth] Initialized. User type:', userType);
    return userType;
  },

  /**
   * 現在のユーザータイプを取得
   * @returns {Promise<string>} 'free' | 'member' | 'paid'
   */
  async getUserType() {
    try {
      const data = await chrome.storage.local.get([
        this.STORAGE_KEYS.USER_TYPE,
        this.STORAGE_KEYS.SECRET_CODE
      ]);

      // シークレットコードが有効かチェック
      if (data[this.STORAGE_KEYS.SECRET_CODE]) {
        if (this.validateSecretCode(data[this.STORAGE_KEYS.SECRET_CODE])) {
          return 'member';
        }
      }

      // ExtensionPay課金チェック（後で実装）
      // if (await this.checkExtensionPayStatus()) {
      //   return 'paid';
      // }

      return data[this.STORAGE_KEYS.USER_TYPE] || 'free';
    } catch (error) {
      console.error('[Auth] Error getting user type:', error);
      return 'free';
    }
  },

  /**
   * シークレットコードを検証
   * @param {string} code
   * @returns {boolean}
   */
  validateSecretCode(code) {
    if (!code) return false;
    return this.SECRET_CODES.includes(code.trim().toUpperCase());
  },

  /**
   * シークレットコードで認証
   * @param {string} code
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async activateWithSecretCode(code) {
    if (this.validateSecretCode(code)) {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.USER_TYPE]: 'member',
        [this.STORAGE_KEYS.SECRET_CODE]: code.trim().toUpperCase(),
        [this.STORAGE_KEYS.ACTIVATED_AT]: new Date().toISOString()
      });
      console.log('[Auth] Activated with secret code');
      return { success: true, message: '認証に成功しました！全機能が利用可能になりました。' };
    }
    return { success: false, message: 'コードが正しくありません。' };
  },

  /**
   * ExtensionPayで課金認証（後で実装）
   * @returns {Promise<boolean>}
   */
  async checkExtensionPayStatus() {
    // TODO: ExtensionPay導入時に実装
    // const extpay = ExtPay('bunseki-kun');
    // const user = await extpay.getUser();
    // return user.paid;
    return false;
  },

  /**
   * ExtensionPay支払いページを開く（後で実装）
   */
  async openPaymentPage() {
    // TODO: ExtensionPay導入時に実装
    // const extpay = ExtPay('bunseki-kun');
    // extpay.openPaymentPage();
    console.log('[Auth] Payment page not yet implemented');
  },

  /**
   * ユーザーがプレミアム機能を使えるか確認
   * @returns {Promise<boolean>}
   */
  async isPremium() {
    const userType = await this.getUserType();
    return userType === 'member' || userType === 'paid';
  },

  /**
   * 特定のタブにアクセスできるか確認
   * @param {string} tabId
   * @returns {Promise<boolean>}
   */
  async canAccessTab(tabId) {
    const userType = await this.getUserType();
    const isPremium = userType === 'member' || userType === 'paid';
    const features = isPremium ? this.FEATURES.premium : this.FEATURES.free;
    return features.tabs.includes(tabId);
  },

  /**
   * 使用可能な最大シート数を取得
   * @returns {Promise<number>}
   */
  async getMaxSheets() {
    const isPremium = await this.isPremium();
    return isPremium ? this.FEATURES.premium.maxSheets : this.FEATURES.free.maxSheets;
  },

  /**
   * 認証をリセット（デバッグ用）
   */
  async reset() {
    await chrome.storage.local.remove([
      this.STORAGE_KEYS.USER_TYPE,
      this.STORAGE_KEYS.SECRET_CODE,
      this.STORAGE_KEYS.ACTIVATED_AT
    ]);
    console.log('[Auth] Reset complete');
  },

  /**
   * 現在の認証状態を取得（デバッグ用）
   */
  async getStatus() {
    const data = await chrome.storage.local.get([
      this.STORAGE_KEYS.USER_TYPE,
      this.STORAGE_KEYS.SECRET_CODE,
      this.STORAGE_KEYS.ACTIVATED_AT
    ]);
    return {
      userType: data[this.STORAGE_KEYS.USER_TYPE] || 'free',
      hasSecretCode: !!data[this.STORAGE_KEYS.SECRET_CODE],
      activatedAt: data[this.STORAGE_KEYS.ACTIVATED_AT] || null
    };
  }
};

// グローバルに公開
window.BunsekiAuth = BunsekiAuth;
