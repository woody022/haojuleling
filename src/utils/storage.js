/**
 * 本地存储工具函数
 */

// 默认缓存前缀
const STORAGE_PREFIX = 'haojuleling_';

// 默认缓存时间（毫秒）：7天
const DEFAULT_CACHE_TIME = 7 * 24 * 60 * 60 * 1000;

/**
 * LocalStorage存储类
 */
class Storage {
  constructor(option = {}) {
    this.prefix = option.prefix || STORAGE_PREFIX;
    this.storage = wx.getStorageSync ? wx : window.localStorage;
    this.enableEncrypt = option.enableEncrypt || false;
    this.encryptKey = option.encryptKey || 'haojuleling_storage_key';
  }

  /**
   * 获取存储键名
   * @param {string} key 键名
   * @returns {string} 添加前缀后的键名
   */
  getKey(key) {
    return `${this.prefix}${key}`.toUpperCase();
  }

  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {*} value 缓存值
   * @param {number|null} expire 过期时间（毫秒），传null则永不过期
   */
  set(key, value, expire = DEFAULT_CACHE_TIME) {
    const stringData = JSON.stringify({
      value,
      expire: expire !== null ? new Date().getTime() + expire : null
    });

    const storageData = this.enableEncrypt 
      ? this.encrypt(stringData) 
      : stringData;

    try {
      if (this.storage.setStorageSync) {
        this.storage.setStorageSync(this.getKey(key), storageData);
      } else {
        this.storage.setItem(this.getKey(key), storageData);
      }
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @param {*} def 默认值
   * @returns {*} 缓存值
   */
  get(key, def = null) {
    const item = this.storage.getStorageSync 
      ? this.storage.getStorageSync(this.getKey(key))
      : this.storage.getItem(this.getKey(key));

    if (!item) return def;

    try {
      const decryptedData = this.enableEncrypt 
        ? this.decrypt(item) 
        : item;

      const data = JSON.parse(decryptedData);
      const { value, expire } = data;
      
      // 在有效期内直接返回
      if (expire === null || expire >= new Date().getTime()) {
        return value;
      }
      
      // 过期则删除该缓存
      this.remove(key);
      return def;
    } catch (error) {
      console.error('Storage get error:', error);
      return def;
    }
  }

  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  remove(key) {
    try {
      if (this.storage.removeStorageSync) {
        this.storage.removeStorageSync(this.getKey(key));
      } else {
        this.storage.removeItem(this.getKey(key));
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    try {
      if (this.storage.clearStorageSync) {
        this.storage.clearStorageSync();
      } else {
        this.storage.clear();
      }
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }

  /**
   * 清空指定前缀的缓存
   * @param {string} prefix 缓存前缀
   */
  clearWithPrefix(prefix) {
    const fullPrefix = this.getKey(prefix);
    
    if (this.storage.getStorageInfoSync) {
      try {
        const storageInfo = this.storage.getStorageInfoSync();
        const keys = storageInfo.keys;
        
        keys.forEach(key => {
          if (key.startsWith(fullPrefix)) {
            this.storage.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('Storage clearWithPrefix error:', error);
      }
    } else {
      // Web环境
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(fullPrefix)) {
          this.storage.removeItem(key);
        }
      }
    }
  }

  /**
   * 获取当前已用的缓存大小(KB)
   * @returns {number} 缓存大小(KB)
   */
  size() {
    try {
      if (this.storage.getStorageInfoSync) {
        const info = this.storage.getStorageInfoSync();
        return info.currentSize;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Storage size error:', error);
      return null;
    }
  }

  /**
   * 判断缓存是否存在
   * @param {string} key 缓存键
   * @returns {boolean} 是否存在
   */
  has(key) {
    const fullKey = this.getKey(key);
    
    try {
      if (this.storage.getStorageInfoSync) {
        const info = this.storage.getStorageInfoSync();
        return info.keys.includes(fullKey);
      } else {
        return this.storage.getItem(fullKey) !== null;
      }
    } catch (error) {
      console.error('Storage has error:', error);
      return false;
    }
  }

  /**
   * 数据加密
   * @param {string} data 数据
   * @returns {string} 加密后的数据
   * @private
   */
  encrypt(data) {
    // 简单的加密示例，实际项目中建议使用更安全的加密算法
    try {
      // 这里仅做示例，实际生产环境请使用更复杂的加密算法
      return btoa(
        encodeURIComponent(data).replace(/%([0-9A-F]{2})/g, (match, p1) => {
          return String.fromCharCode('0x' + p1);
        })
      );
    } catch (error) {
      console.error('Storage encrypt error:', error);
      return data;
    }
  }

  /**
   * 数据解密
   * @param {string} data 加密数据
   * @returns {string} 解密后的数据
   * @private
   */
  decrypt(data) {
    // 简单的解密示例，实际项目中建议使用更安全的解密算法
    try {
      // 这里仅做示例，实际生产环境请使用更复杂的解密算法
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(data), (c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
    } catch (error) {
      console.error('Storage decrypt error:', error);
      return data;
    }
  }

  /**
   * 设置会话缓存（小程序重启后失效）
   * @param {string} key 缓存键
   * @param {*} value 缓存值
   */
  setSession(key, value) {
    if (wx.setStorageSync) {
      try {
        const storageData = this.enableEncrypt 
          ? this.encrypt(JSON.stringify(value)) 
          : JSON.stringify(value);
        
        wx.setStorageSync(this.getKey(`session_${key}`), storageData);
      } catch (error) {
        console.error('Storage setSession error:', error);
      }
    } else {
      // Web环境使用sessionStorage
      try {
        const storageData = this.enableEncrypt 
          ? this.encrypt(JSON.stringify(value)) 
          : JSON.stringify(value);
        
        window.sessionStorage.setItem(this.getKey(key), storageData);
      } catch (error) {
        console.error('Storage setSession error:', error);
      }
    }
  }

  /**
   * 获取会话缓存
   * @param {string} key 缓存键
   * @param {*} def 默认值
   * @returns {*} 缓存值
   */
  getSession(key, def = null) {
    if (wx.getStorageSync) {
      const item = wx.getStorageSync(this.getKey(`session_${key}`));
      
      if (!item) return def;
      
      try {
        const decryptedData = this.enableEncrypt 
          ? this.decrypt(item) 
          : item;
          
        return JSON.parse(decryptedData);
      } catch (error) {
        console.error('Storage getSession error:', error);
        return def;
      }
    } else {
      // Web环境使用sessionStorage
      const item = window.sessionStorage.getItem(this.getKey(key));
      
      if (!item) return def;
      
      try {
        const decryptedData = this.enableEncrypt 
          ? this.decrypt(item) 
          : item;
          
        return JSON.parse(decryptedData);
      } catch (error) {
        console.error('Storage getSession error:', error);
        return def;
      }
    }
  }

  /**
   * 删除会话缓存
   * @param {string} key 缓存键
   */
  removeSession(key) {
    if (wx.removeStorageSync) {
      try {
        wx.removeStorageSync(this.getKey(`session_${key}`));
      } catch (error) {
        console.error('Storage removeSession error:', error);
      }
    } else {
      // Web环境使用sessionStorage
      try {
        window.sessionStorage.removeItem(this.getKey(key));
      } catch (error) {
        console.error('Storage removeSession error:', error);
      }
    }
  }

  /**
   * 清空所有会话缓存
   */
  clearSession() {
    if (wx.getStorageInfoSync) {
      try {
        const storageInfo = wx.getStorageInfoSync();
        const keys = storageInfo.keys;
        const sessionPrefix = this.getKey('session_');
        
        keys.forEach(key => {
          if (key.startsWith(sessionPrefix)) {
            wx.removeStorageSync(key);
          }
        });
      } catch (error) {
        console.error('Storage clearSession error:', error);
      }
    } else {
      // Web环境使用sessionStorage
      try {
        window.sessionStorage.clear();
      } catch (error) {
        console.error('Storage clearSession error:', error);
      }
    }
  }
}

// 创建默认实例
const storage = new Storage();

export default storage;