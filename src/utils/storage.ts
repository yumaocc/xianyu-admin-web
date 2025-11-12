import { STORAGE_KEYS } from './constants';

// 通用存储类
class Storage {
  private prefix: string;

  constructor(prefix = 'xianyu_admin_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return this.prefix + key;
  }

  // 设置存储项
  set<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error('Failed to set storage item:', error);
    }
  }

  // 获取存储项
  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      if (item === null) {
        return defaultValue !== undefined ? defaultValue : null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to get storage item:', error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  // 移除存储项
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('Failed to remove storage item:', error);
    }
  }

  // 清除所有存储项
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  // 检查存储项是否存在
  has(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  // 获取所有键
  keys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keys.push(key.substring(this.prefix.length));
        }
      }
    } catch (error) {
      console.error('Failed to get storage keys:', error);
    }
    return keys;
  }

  // 获取存储使用情况
  getUsage(): { used: number; available: number } {
    let used = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          const value = localStorage.getItem(key);
          used += (key.length + (value?.length || 0)) * 2; // UTF-16 字符占用2字节
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage:', error);
    }

    // 大多数浏览器的localStorage限制是5-10MB
    const totalAvailable = 5 * 1024 * 1024; // 5MB
    return {
      used,
      available: totalAvailable - used,
    };
  }
}

// 创建默认存储实例
const storage = new Storage();

// 认证相关存储
export const authStorage = {
  setToken(token: string) {
    storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  getToken(): string | null {
    return storage.get(STORAGE_KEYS.AUTH_TOKEN);
  },

  removeToken() {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
  },

  setUserInfo(userInfo: any) {
    storage.set(STORAGE_KEYS.USER_INFO, userInfo);
  },

  getUserInfo(): any | null {
    return storage.get(STORAGE_KEYS.USER_INFO);
  },

  removeUserInfo() {
    storage.remove(STORAGE_KEYS.USER_INFO);
  },

  clear() {
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.USER_INFO);
  },
};

// 主题相关存储
export const themeStorage = {
  setTheme(theme: 'light' | 'dark') {
    storage.set(STORAGE_KEYS.THEME, theme);
  },

  getTheme(): 'light' | 'dark' {
    return storage.get(STORAGE_KEYS.THEME, 'light');
  },

  setSidebarCollapsed(collapsed: boolean) {
    storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  },

  getSidebarCollapsed(): boolean {
    return storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
  },
};

// 表格配置存储
export const tableStorage = {
  setColumns(tableKey: string, columns: any[]) {
    const key = `${STORAGE_KEYS.TABLE_COLUMNS}_${tableKey}`;
    storage.set(key, columns);
  },

  getColumns(tableKey: string): any[] | null {
    const key = `${STORAGE_KEYS.TABLE_COLUMNS}_${tableKey}`;
    return storage.get(key);
  },

  removeColumns(tableKey: string) {
    const key = `${STORAGE_KEYS.TABLE_COLUMNS}_${tableKey}`;
    storage.remove(key);
  },
};

// 筛选器存储
export const filterStorage = {
  setFilters(pageKey: string, filters: Record<string, any>) {
    const key = `${STORAGE_KEYS.FILTERS}_${pageKey}`;
    storage.set(key, filters);
  },

  getFilters(pageKey: string): Record<string, any> | null {
    const key = `${STORAGE_KEYS.FILTERS}_${pageKey}`;
    return storage.get(key);
  },

  removeFilters(pageKey: string) {
    const key = `${STORAGE_KEYS.FILTERS}_${pageKey}`;
    storage.remove(key);
  },
};

// 会话存储（使用sessionStorage）
class SessionStorage {
  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to set session storage item:', error);
    }
  }

  get<T>(key: string): T | null;
  get<T>(key: string, defaultValue: T): T;
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue !== undefined ? defaultValue : null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error('Failed to get session storage item:', error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove session storage item:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Failed to clear session storage:', error);
    }
  }

  has(key: string): boolean {
    return sessionStorage.getItem(key) !== null;
  }
}

export const sessionStorage = new SessionStorage();

// 缓存管理
export class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();

  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  remove(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats(): { size: number; keys: string[] } {
    this.cleanup();
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new CacheManager();

// 定期清理过期缓存
setInterval(() => cache.cleanup(), 5 * 60 * 1000); // 每5分钟清理一次

export default storage;