/**
 * 本地存储工具类
 * 封装微信小程序的本地存储API，提供更便捷的使用方式
 * 支持数据过期时间设置、前缀管理等功能
 */

import config from '../config/index';

// 存储前缀
const PREFIX = config.STORAGE.PREFIX;

/**
 * 获取完整存储键名（添加前缀）
 * @param {string} key - 原始键名
 * @returns {string} 添加前缀后的完整键名
 */
const getFullKey = (key) => {
  return `${PREFIX}${key}`;
};

/**
 * 设置存储
 * @param {string} key - 键名
 * @param {any} value - 要存储的数据
 * @param {number} [expires] - 过期时间（毫秒），不传则永不过期
 */
const set = (key, value, expires) => {
  const fullKey = getFullKey(key);
  
  try {
    // 存储数据对象，包含数据本身、存储时间、过期时间
    const data = {
      value,
      createTime: Date.now(),
      expires
    };
    
    // 序列化数据
    wx.setStorageSync(fullKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('存储数据失败', error);
    return false;
  }
};

/**
 * 获取存储数据
 * @param {string} key - 键名
 * @returns {any} 存储的数据，如果不存在或已过期返回null
 */
const get = (key) => {
  const fullKey = getFullKey(key);
  
  try {
    // 获取原始存储数据
    const dataStr = wx.getStorageSync(fullKey);
    if (!dataStr) return null;
    
    // 解析数据
    const data = JSON.parse(dataStr);
    const { value, createTime, expires } = data;
    
    // 判断是否已过期
    if (expires && Date.now() - createTime > expires) {
      // 已过期，删除该条数据
      remove(key);
      return null;
    }
    
    return value;
  } catch (error) {
    console.error('获取存储数据失败', error);
    return null;
  }
};

/**
 * 删除存储数据
 * @param {string} key - 键名
 * @returns {boolean} 操作是否成功
 */
const remove = (key) => {
  const fullKey = getFullKey(key);
  
  try {
    wx.removeStorageSync(fullKey);
    return true;
  } catch (error) {
    console.error('删除存储数据失败', error);
    return false;
  }
};

/**
 * 清除所有存储数据
 * @param {boolean} [onlyWithPrefix=true] - 是否只清除带前缀的存储
 * @returns {boolean} 操作是否成功
 */
const clear = (onlyWithPrefix = true) => {
  try {
    if (onlyWithPrefix) {
      // 只清除带前缀的存储
      const keys = wx.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(PREFIX)) {
          wx.removeStorageSync(key);
        }
      });
    } else {
      // 清除所有存储
      wx.clearStorageSync();
    }
    return true;
  } catch (error) {
    console.error('清除存储数据失败', error);
    return false;
  }
};

/**
 * 获取存储信息
 * @returns {object|null} 存储信息对象
 */
const getInfo = () => {
  try {
    return wx.getStorageInfoSync();
  } catch (error) {
    console.error('获取存储信息失败', error);
    return null;
  }
};

/**
 * 检查键是否存在且未过期
 * @param {string} key - 键名
 * @returns {boolean} 是否存在且未过期
 */
const has = (key) => {
  return get(key) !== null;
};

/**
 * 设置带过期时间的存储（语法糖，方便使用）
 * @param {string} key - 键名
 * @param {any} value - 要存储的数据
 * @param {number} days - 过期天数
 */
const setWithExpires = (key, value, days) => {
  const expires = days * 24 * 60 * 60 * 1000;
  return set(key, value, expires);
};

// Token相关存储操作
const token = {
  /**
   * 设置Token
   * @param {string} value - Token值
   */
  set: (value) => {
    return set(config.STORAGE.TOKEN_KEY, value, config.STORAGE.EXPIRES.TOKEN);
  },
  
  /**
   * 获取Token
   * @returns {string|null} Token值
   */
  get: () => {
    return get(config.STORAGE.TOKEN_KEY);
  },
  
  /**
   * 删除Token
   */
  remove: () => {
    return remove(config.STORAGE.TOKEN_KEY);
  }
};

// 用户信息相关存储操作
const userInfo = {
  /**
   * 设置用户信息
   * @param {object} value - 用户信息对象
   */
  set: (value) => {
    return set(config.STORAGE.USER_INFO_KEY, value, config.STORAGE.EXPIRES.USER_INFO);
  },
  
  /**
   * 获取用户信息
   * @returns {object|null} 用户信息对象
   */
  get: () => {
    return get(config.STORAGE.USER_INFO_KEY);
  },
  
  /**
   * 删除用户信息
   */
  remove: () => {
    return remove(config.STORAGE.USER_INFO_KEY);
  }
};

export default {
  set,
  get,
  remove,
  clear,
  getInfo,
  has,
  setWithExpires,
  token,
  userInfo
};