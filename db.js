/**
 * ぶんせき君 - IndexedDB ラッパー
 * 大量データ（10万件以上）に対応するためのストレージ
 */

const BunsekiDB = {
  dbName: 'BunsekiKunDB',
  dbVersion: 9,  // バージョン9: シート独立データ強化
  db: null,
  currentSheetId: 'sheet1',  // 現在選択中のシート

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
        console.log('IndexedDB initialized (version 9)');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;
        const tx = event.target.transaction;

        // 出品中データ（Active Listings）
        if (!db.objectStoreNames.contains('activeListings')) {
          const activeStore = db.createObjectStore('activeListings', { keyPath: 'id', autoIncrement: true });
          activeStore.createIndex('title', 'title', { unique: false });
          activeStore.createIndex('brand', 'brand', { unique: false });
          activeStore.createIndex('category', 'category', { unique: false });
          activeStore.createIndex('startDate', 'startDate', { unique: false });
          activeStore.createIndex('sheetId', 'sheetId', { unique: false });
        } else if (oldVersion < 6) {
          // 既存ストアにsheetIdインデックスを追加
          const activeStore = tx.objectStore('activeListings');
          if (!activeStore.indexNames.contains('sheetId')) {
            activeStore.createIndex('sheetId', 'sheetId', { unique: false });
          }
        }

        // 販売済データ（Sold Items）
        if (!db.objectStoreNames.contains('soldItems')) {
          const soldStore = db.createObjectStore('soldItems', { keyPath: 'id', autoIncrement: true });
          soldStore.createIndex('title', 'title', { unique: false });
          soldStore.createIndex('brand', 'brand', { unique: false });
          soldStore.createIndex('category', 'category', { unique: false });
          soldStore.createIndex('saleDate', 'saleDate', { unique: false });
          soldStore.createIndex('sheetId', 'sheetId', { unique: false });
        } else if (oldVersion < 6) {
          const soldStore = tx.objectStore('soldItems');
          if (!soldStore.indexNames.contains('sheetId')) {
            soldStore.createIndex('sheetId', 'sheetId', { unique: false });
          }
        }

        // 市場データ（Market Data）- 蓄積可能
        if (!db.objectStoreNames.contains('marketData')) {
          const marketStore = db.createObjectStore('marketData', { keyPath: 'id', autoIncrement: true });
          marketStore.createIndex('title', 'title', { unique: false });
          marketStore.createIndex('titleLower', 'titleLower', { unique: false }); // sheetIdごとに同じタイトル可
          marketStore.createIndex('brand', 'brand', { unique: false });
          marketStore.createIndex('capturedAt', 'capturedAt', { unique: false });
          marketStore.createIndex('sheetId', 'sheetId', { unique: false });
        } else if (oldVersion < 6) {
          const marketStore = tx.objectStore('marketData');
          if (!marketStore.indexNames.contains('sheetId')) {
            marketStore.createIndex('sheetId', 'sheetId', { unique: false });
          }
        }

        // 分析結果キャッシュ
        if (!db.objectStoreNames.contains('analysisCache')) {
          db.createObjectStore('analysisCache', { keyPath: 'key' });
        }

        // バージョン9へのマイグレーション: 既存データをsheet1に移行
        if (oldVersion < 9 && oldVersion > 0) {
          console.log('Migrating data to version 9: setting sheetId=sheet1 for existing records...');

          // 各ストアの既存データにsheetId='sheet1'を付与
          ['activeListings', 'soldItems', 'marketData'].forEach(storeName => {
            const store = tx.objectStore(storeName);
            const cursorRequest = store.openCursor();
            let migratedCount = 0;

            cursorRequest.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                const record = cursor.value;
                // sheetIdがない、または'all'のデータをsheet1に移行
                if (!record.sheetId || record.sheetId === 'all') {
                  record.sheetId = 'sheet1';
                  cursor.update(record);
                  migratedCount++;
                }
                cursor.continue();
              } else {
                console.log(`${storeName}: ${migratedCount} records migrated to sheet1`);
              }
            };
          });
        }

        console.log('IndexedDB schema upgraded to version 9');
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
   * 出品中データを全件追加（現在のシートのデータのみクリアして追加）
   */
  async setActiveListings(items) {
    await this.init();

    // まず現在のシートのデータのみ削除
    await this.clearActiveListingsForSheet(this.currentSheetId);

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');

      // 新しいデータを追加（sheetIdを付加）
      let addedCount = 0;
      items.forEach((item) => {
        const record = {
          ...item,
          sheetId: this.currentSheetId,
          startDate: item.startDate ? new Date(item.startDate).toISOString() : null
        };
        delete record.id; // autoIncrementなのでidは削除
        store.add(record);
        addedCount++;
      });

      tx.oncomplete = () => {
        console.log(`Active listings saved: ${addedCount} items (sheet: ${this.currentSheetId})`);
        resolve(addedCount);
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 指定シートの出品中データをクリア
   */
  async clearActiveListingsForSheet(sheetId) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');
      const index = store.index('sheetId');
      const request = index.openCursor(IDBKeyRange.only(sheetId));

      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
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
   * 販売済データを全件追加（現在のシートのデータのみクリアして追加）
   */
  async setSoldItems(items) {
    await this.init();

    // まず現在のシートのデータのみ削除
    await this.clearSoldItemsForSheet(this.currentSheetId);

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');

      // 新しいデータを追加（sheetIdを付加）
      let addedCount = 0;
      items.forEach((item) => {
        const record = {
          ...item,
          sheetId: this.currentSheetId,
          saleDate: item.saleDate ? new Date(item.saleDate).toISOString() : null
        };
        delete record.id; // autoIncrementなのでidは削除
        store.add(record);
        addedCount++;
      });

      tx.oncomplete = () => {
        console.log(`Sold items saved: ${addedCount} items (sheet: ${this.currentSheetId})`);
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
   * 指定シートの販売済データをクリア
   */
  async clearSoldItemsForSheet(sheetId) {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');
      const index = store.index('sheetId');
      const request = index.openCursor(IDBKeyRange.only(sheetId));

      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
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
   * 市場データを追加（重複は除外して蓄積、現在のシートに保存）
   * @returns {Object} { added: 追加件数, duplicates: 重複件数 }
   */
  async addMarketData(items) {
    await this.init();

    // 空の配列の場合
    if (!items || items.length === 0) {
      return { added: 0, duplicates: 0 };
    }

    const targetSheetId = this.currentSheetId;

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');

      let added = 0;
      let duplicates = 0;
      const capturedAt = new Date().toISOString();
      const seenTitles = new Set(); // メモリ内で重複チェック

      // 既存のタイトルを先に取得
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        // 現在シートの既存データのタイトルをSetに追加
        const existingItems = getAllRequest.result || [];
        existingItems
          .filter(item => item.sheetId === targetSheetId)
          .forEach(item => {
            if (item.titleLower) {
              seenTitles.add(item.titleLower);
            }
          });

        console.log(`既存市場データ (${targetSheetId}):`, seenTitles.size, '件');

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
            sheetId: targetSheetId,
            capturedAt
          };

          const addRequest = store.add(record);

          addRequest.onsuccess = () => {
            added++;
          };

          addRequest.onerror = (e) => {
            // ConstraintError（重複）は無視
            if (e.target.error && e.target.error.name === 'ConstraintError') {
              duplicates++;
            }
            e.preventDefault(); // エラーを伝播させない
          };
        });
      };

      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };

      tx.oncomplete = () => {
        console.log(`Market data (${targetSheetId}): ${added} added, ${duplicates} duplicates skipped`);
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
   * 市場データをクリア（全シート）
   */
  async clearMarketData() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      store.clear();

      tx.oncomplete = () => {
        console.log('Market data cleared (all sheets)');
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 現在のシートの市場データをクリア
   */
  async clearMarketDataForCurrentSheet() {
    await this.init();
    const targetSheetId = this.currentSheetId;

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      const index = store.index('sheetId');
      const request = index.openCursor(IDBKeyRange.only(targetSheetId));

      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        console.log(`Market data cleared for sheet: ${targetSheetId}`);
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

  /**
   * 分析結果をクリア
   */
  async clearAnalysisCache() {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('analysisCache', 'readwrite');
      const store = tx.objectStore('analysisCache');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
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
  },

  // ========================================
  // シート管理
  // ========================================

  /**
   * 現在のシートIDを設定
   */
  setCurrentSheet(sheetId) {
    this.currentSheetId = sheetId || 'all';
  },

  /**
   * 現在のシートIDを取得
   */
  getCurrentSheet() {
    return this.currentSheetId;
  },

  /**
   * 指定シートの出品中データを保存
   */
  async setActiveListingsForSheet(items, sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');

      // 該当シートのデータを削除
      const deleteRequest = store.openCursor();
      deleteRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (!cursor.value.sheetId || cursor.value.sheetId === targetSheetId) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        // 新しいデータを追加
        const tx2 = this.getTransaction('activeListings', 'readwrite');
        const store2 = tx2.objectStore('activeListings');

        items.forEach(item => {
          const record = {
            ...item,
            sheetId: targetSheetId,
            startDate: item.startDate ? new Date(item.startDate).toISOString() : null
          };
          delete record.id;
          store2.add(record);
        });

        tx2.oncomplete = () => resolve(items.length);
        tx2.onerror = () => reject(tx2.error);
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 指定シートの出品中データを取得
   */
  async getActiveListingsForSheet(sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    return new Promise((resolve, reject) => {
      const store = this.getStore('activeListings');
      const request = store.getAll();

      request.onsuccess = () => {
        let items = request.result.filter(item =>
          item.sheetId === targetSheetId || (!item.sheetId && targetSheetId === 'all')
        );
        items = items.map(item => ({
          ...item,
          startDate: item.startDate ? new Date(item.startDate) : null
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 指定シートの販売済データを保存
   */
  async setSoldItemsForSheet(items, sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');

      // 該当シートのデータを削除
      const deleteRequest = store.openCursor();
      deleteRequest.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          if (!cursor.value.sheetId || cursor.value.sheetId === targetSheetId) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        }
      };

      tx.oncomplete = () => {
        // 新しいデータを追加
        const tx2 = this.getTransaction('soldItems', 'readwrite');
        const store2 = tx2.objectStore('soldItems');

        items.forEach(item => {
          const record = {
            ...item,
            sheetId: targetSheetId,
            saleDate: item.saleDate ? new Date(item.saleDate).toISOString() : null
          };
          delete record.id;
          store2.add(record);
        });

        tx2.oncomplete = () => resolve(items.length);
        tx2.onerror = () => reject(tx2.error);
      };

      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 指定シートの販売済データを取得
   */
  async getSoldItemsForSheet(sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    return new Promise((resolve, reject) => {
      const store = this.getStore('soldItems');
      const request = store.getAll();

      request.onsuccess = () => {
        let items = request.result.filter(item =>
          item.sheetId === targetSheetId || (!item.sheetId && targetSheetId === 'all')
        );
        items = items.map(item => ({
          ...item,
          saleDate: item.saleDate ? new Date(item.saleDate) : null
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * 指定シートに市場データを追加
   */
  async addMarketDataForSheet(items, sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    if (!items || items.length === 0) {
      return { added: 0, duplicates: 0 };
    }

    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');

      let added = 0;
      let duplicates = 0;
      const capturedAt = new Date().toISOString();
      const seenTitles = new Set();

      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        // 該当シートの既存データのタイトルを取得
        const existingItems = getAllRequest.result.filter(item =>
          item.sheetId === targetSheetId || (!item.sheetId && targetSheetId === 'all')
        );
        existingItems.forEach(item => {
          if (item.titleLower) {
            seenTitles.add(item.titleLower);
          }
        });

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
            sheetId: targetSheetId,
            capturedAt
          };

          const addRequest = store.add(record);
          addRequest.onsuccess = () => added++;
          addRequest.onerror = (e) => {
            duplicates++;
            e.preventDefault();
          };
        });
      };

      getAllRequest.onerror = () => reject(getAllRequest.error);

      tx.oncomplete = () => resolve({ added, duplicates });
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 指定シートの市場データを取得
   */
  async getMarketDataForSheet(sheetId) {
    await this.init();
    const targetSheetId = sheetId || this.currentSheetId;

    return new Promise((resolve, reject) => {
      const store = this.getStore('marketData');
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result.filter(item =>
          item.sheetId === targetSheetId || (!item.sheetId && targetSheetId === 'all')
        );
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // ========================================
  // 個別データ操作（削除・更新）
  // ========================================

  /**
   * 個別データを削除（activeListings）
   */
  async deleteActiveListingById(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 個別データを削除（soldItems）
   */
  async deleteSoldItemById(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 個別データを削除（marketData）
   */
  async deleteMarketDataById(id) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 個別データを更新（activeListings）
   */
  async updateActiveListingById(id, updates) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          const updatedRecord = { ...record, ...updates };
          store.put(updatedRecord);
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 個別データを更新（soldItems）
   */
  async updateSoldItemById(id, updates) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          const updatedRecord = { ...record, ...updates };
          store.put(updatedRecord);
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 個別データを更新（marketData）
   */
  async updateMarketDataById(id, updates) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          const updatedRecord = { ...record, ...updates };
          store.put(updatedRecord);
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 複数のデータを一括削除（activeListings）
   */
  async deleteActiveListingsByIds(ids) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('activeListings', 'readwrite');
      const store = tx.objectStore('activeListings');
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve(ids.length);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 複数のデータを一括削除（soldItems）
   */
  async deleteSoldItemsByIds(ids) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('soldItems', 'readwrite');
      const store = tx.objectStore('soldItems');
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve(ids.length);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 複数のデータを一括削除（marketData）
   */
  async deleteMarketDataByIds(ids) {
    await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.getTransaction('marketData', 'readwrite');
      const store = tx.objectStore('marketData');
      ids.forEach(id => store.delete(id));
      tx.oncomplete = () => resolve(ids.length);
      tx.onerror = () => reject(tx.error);
    });
  },

  /**
   * 指定シートのデータを全て削除
   */
  async clearSheetData(sheetId) {
    await this.init();
    const targetSheetId = sheetId;

    const stores = ['activeListings', 'soldItems', 'marketData'];

    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const tx = this.getTransaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        const cursorRequest = store.openCursor();
        cursorRequest.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            if (cursor.value.sheetId === targetSheetId) {
              store.delete(cursor.primaryKey);
            }
            cursor.continue();
          }
        };

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }
};

// グローバルに公開
window.BunsekiDB = BunsekiDB;
