/**
 * ぶんせき君 - IndexedDB ラッパー
 * 大量データ（10万件以上）に対応するためのストレージ
 */

const BunsekiDB = {
  dbName: 'BunsekiKunDB',
  dbVersion: 1,
  db: null,

  /**
   * データベースを初期化
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 出品中データ（Active Listings）
        if (!db.objectStoreNames.contains('activeListings')) {
          const activeStore = db.createObjectStore('activeListings', { keyPath: 'id', autoIncrement: true });
          activeStore.createIndex('title', 'title', { unique: false });
          activeStore.createIndex('brand', 'brand', { unique: false });
          activeStore.createIndex('category', 'category', { unique: false });
          activeStore.createIndex('startDate', 'startDate', { unique: false });
        }

        // 販売済データ（Sold Items）
        if (!db.objectStoreNames.contains('soldItems')) {
          const soldStore = db.createObjectStore('soldItems', { keyPath: 'id', autoIncrement: true });
          soldStore.createIndex('title', 'title', { unique: false });
          soldStore.createIndex('brand', 'brand', { unique: false });
          soldStore.createIndex('category', 'category', { unique: false });
          soldStore.createIndex('saleDate', 'saleDate', { unique: false });
        }

        // 市場データ（Market Data）- 蓄積可能
        if (!db.objectStoreNames.contains('marketData')) {
          const marketStore = db.createObjectStore('marketData', { keyPath: 'id', autoIncrement: true });
          marketStore.createIndex('title', 'title', { unique: false });
          marketStore.createIndex('titleLower', 'titleLower', { unique: true }); // 重複チェック用
          marketStore.createIndex('brand', 'brand', { unique: false });
          marketStore.createIndex('capturedAt', 'capturedAt', { unique: false });
        }

        // 分析結果キャッシュ
        if (!db.objectStoreNames.contains('analysisCache')) {
          db.createObjectStore('analysisCache', { keyPath: 'key' });
        }

        console.log('IndexedDB schema created/updated');
      };
    });
  },

  /**
   * トランザクションを取得
   */
  getTransaction(storeNames, mode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(storeNames, mode);
  },

  /**
   * オブジェクトストアを取得
   */
  getStore(storeName, mode = 'readonly') {
    const tx = this.getTransaction(storeName, mode);
    return tx.objectStore(storeName);
  },

  // ========================================
  // Active Listings 操作
  // ========================================

  /**
   * 出品中データを全件追加（既存データはクリア）
   */
  async setActiveListings(items) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');

      // 既存データをクリア
      store.clear();

      // 新しいデータを追加
      let addedCount = 0;
      items.forEach((item, index) => {
        const record = {
          ...item,
          id: index + 1,
          startDate: item.startDate ? new Date(item.startDate).toISOString() : null
        };
        store.add(record);
        addedCount++;
      });

      tx.oncomplete = () => {
        console.log(`Active listings saved: ${addedCount} items`);
        resolve(addedCount);
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 出品中データを全件取得
   */
  async getActiveListings() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('activeListings');
      const request = store.getAll();

      request.onsuccess = () => {
        // 日付をDateオブジェクトに戻す
        const items = request.result.map(item => ({
          ...item,
          startDate: item.startDate ? new Date(item.startDate) : null
        }));
        resolve(items);
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 出品中データの件数を取得
   */
  async getActiveListingsCount() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('activeListings');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 出品中データをクリア
   */
  async clearActiveListings() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');
      store.clear();

      tx.oncomplete = () => {
        console.log('Active listings cleared');
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  // ========================================
  // Sold Items 操作
  // ========================================

  /**
   * 販売済データを全件追加（既存データはクリア）
   */
  async setSoldItems(items) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');

      // 既存データをクリア
      store.clear();

      // 新しいデータを追加
      let addedCount = 0;
      items.forEach((item, index) => {
        const record = {
          ...item,
          id: index + 1,
          saleDate: item.saleDate ? new Date(item.saleDate).toISOString() : null
        };
        store.add(record);
        addedCount++;
      });

      tx.oncomplete = () => {
        console.log(`Sold items saved: ${addedCount} items`);
        resolve(addedCount);
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 販売済データを全件取得
   */
  async getSoldItems() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('soldItems');
      const request = store.getAll();

      request.onsuccess = () => {
        // 日付をDateオブジェクトに戻す
        const items = request.result.map(item => ({
          ...item,
          saleDate: item.saleDate ? new Date(item.saleDate) : null
        }));
        resolve(items);
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 販売済データの件数を取得
   */
  async getSoldItemsCount() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('soldItems');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 販売済データをクリア
   */
  async clearSoldItems() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');
      store.clear();

      tx.oncomplete = () => {
        console.log('Sold items cleared');
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  // ========================================
  // Market Data 操作（蓄積機能付き）
  // ========================================

  /**
   * 市場データを追加（重複は除外して蓄積）
   * @returns {Object} { added: 追加件数, duplicates: 重複件数 }
   */
  async addMarketData(items) {
    await this.init();

    // 空の配列の場合
    if (!items || items.length === 0) {
      return { added: 0, duplicates: 0 };
    }

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');

      let added = 0;
      let duplicates = 0;
      let pending = 0;
      const capturedAt = new Date().toISOString();
      const seenTitles = new Set(); // メモリ内で重複チェック

      // 既存のタイトルを先に取得
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        // 既存データのタイトルをSetに追加
        const existingItems = getAllRequest.result || [];
        existingItems.forEach(item => {
          if (item.titleLower) {
            seenTitles.add(item.titleLower);
          }
        });

        console.log('既存市場データ:', existingItems.length, '件');

        // 新しいアイテムを追加
        items.forEach(item => {
          const titleLower = (item.title || '').toLowerCase().trim();

          if (!titleLower) {
            return;
          }

          if (seenTitles.has(titleLower)) {
            duplicates++;
            return;
          }

          // 重複なし → 追加
          seenTitles.add(titleLower);
          const record = {
            ...item,
            titleLower,
            capturedAt
          };

          const addRequest = store.add(record);
          pending++;

          addRequest.onsuccess = () => {
            added++;
            pending--;
          };

          addRequest.onerror = (e) => {
            // ConstraintError（重複）は無視
            if (e.target.error && e.target.error.name === 'ConstraintError') {
              duplicates++;
            }
            pending--;
            e.preventDefault(); // エラーを伝播させない
          };
        });
      };

      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };

      tx.oncomplete = () => {
        console.log(`Market data: ${added} added, ${duplicates} duplicates skipped`);
        resolve({ added, duplicates });
      };

      tx.onerror = (e) => {
        console.error('Transaction error:', e.target.error);
        // ConstraintErrorの場合は成功として扱う
        if (e.target.error && e.target.error.name === 'ConstraintError') {
          resolve({ added, duplicates });
        } else {
          reject(tx.error);
        }
      };
    });
  },

  /**
   * 市場データを全件取得
   */
  async getMarketData() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('marketData');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 市場データの件数を取得
   */
  async getMarketDataCount() {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('marketData');
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 市場データをクリア
   */
  async clearMarketData() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      store.clear();

      tx.oncomplete = () => {
        console.log('Market data cleared');
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  // ========================================
  // Analysis Cache 操作
  // ========================================

  /**
   * 分析キャッシュを保存
   */
  async saveAnalysisCache(key, data) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('analysisCache', 'readwrite');
      const store = tx.objectStore('analysisCache');

      const record = {
        key,
        data,
        savedAt: new Date().toISOString()
      };

      store.put(record);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 分析キャッシュを取得
   */
  async getAnalysisCache(key) {
    await this.init();

    return new Promise((resolve, reject) => {
      const store = this.getStore('analysisCache');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // ========================================
  // ユーティリティ
  // ========================================

  /**
   * 全データをクリア
   */
  async clearAll() {
    await this.init();

    const stores = ['activeListings', 'soldItems', 'marketData', 'analysisCache'];

    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const tx = this.getTransaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    console.log('All IndexedDB data cleared');
  },

  /**
   * データベースの容量情報を取得
   */
  async getStorageInfo() {
    const counts = {
      activeListings: await this.getActiveListingsCount(),
      soldItems: await this.getSoldItemsCount(),
      marketData: await this.getMarketDataCount()
    };

    // ストレージ使用量を推定
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        ...counts,
        total: counts.activeListings + counts.soldItems + counts.marketData,
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercent: Math.round((estimate.usage / estimate.quota) * 100)
      };
    }

    return {
      ...counts,
      total: counts.activeListings + counts.soldItems + counts.marketData
    };
  }
};

// グローバルに公開
window.BunsekiDB = BunsekiDB;
