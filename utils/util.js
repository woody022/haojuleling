// 通用工具函数

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式字符串，例如：'YYYY-MM-DD HH:mm:ss'
 * @return {String} 格式化后的时间字符串
 */
const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  format = format.replace('YYYY', year);
  format = format.replace('MM', month.toString().padStart(2, '0'));
  format = format.replace('DD', day.toString().padStart(2, '0'));
  format = format.replace('HH', hour.toString().padStart(2, '0'));
  format = format.replace('mm', minute.toString().padStart(2, '0'));
  format = format.replace('ss', second.toString().padStart(2, '0'));

  return format;
};

/**
 * 格式化相对时间
 * @param {Date|String|Number} dateTime 日期对象或时间戳
 * @return {String} 相对时间字符串
 */
const formatRelativeTime = (dateTime) => {
  if (!dateTime) return '';
  
  const date = typeof dateTime === 'object' ? dateTime : new Date(dateTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  }
  
  // 小于30天
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
  }
  
  // 大于30天，显示具体日期
  return formatTime(date, 'YYYY-MM-DD');
};

/**
 * 显示提示信息
 * @param {String} title 提示内容
 * @param {String} icon 图标类型
 * @param {Number} duration 提示持续时间（毫秒）
 */
const showToast = (title, icon = 'none', duration = 1500) => {
  wx.showToast({
    title,
    icon,
    duration
  });
};

/**
 * 显示加载提示
 * @param {String} title 提示内容
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
};

/**
 * 隐藏加载提示
 */
const hideLoading = () => {
  wx.hideLoading();
};

/**
 * 显示确认对话框
 * @param {String} title 标题
 * @param {String} content 内容
 * @param {Function} confirmCallback 确认回调
 * @param {Function} cancelCallback 取消回调
 */
const showConfirm = (title, content, confirmCallback, cancelCallback) => {
  wx.showModal({
    title,
    content,
    success: (res) => {
      if (res.confirm) {
        confirmCallback && confirmCallback();
      } else if (res.cancel) {
        cancelCallback && cancelCallback();
      }
    }
  });
};

/**
 * 跳转到指定页面
 * @param {String} url 页面路径
 * @param {Boolean} redirect 是否重定向
 */
const navigateTo = (url, redirect = false) => {
  if (redirect) {
    wx.redirectTo({ url });
  } else {
    wx.navigateTo({ url });
  }
};

/**
 * 生成随机ID
 * @param {Number} length ID长度
 * @return {String} 随机ID
 */
const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间（毫秒）
 * @return {Function} 防抖后的函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} interval 时间间隔（毫秒）
 * @return {Function} 节流后的函数
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 深拷贝对象
 * @param {Object} obj 要拷贝的对象
 * @return {Object} 拷贝后的对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const clone = Array.isArray(obj) ? [] : {};
  
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
};

/**
 * 检查用户是否登录
 * @return {Boolean} 是否登录
 */
const checkIsLogin = () => {
  const token = wx.getStorageSync('token');
  return !!token;
};

/**
 * 检查登录状态，并提示登录
 * @param {Function} callback 登录后的回调函数
 * @return {Boolean} 是否已登录
 */
const checkAndTipLogin = (callback) => {
  const isLogin = checkIsLogin();
  if (!isLogin) {
    wx.showModal({
      title: '提示',
      content: '请先登录',
      confirmText: '去登录',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/login',
          });
        }
      }
    });
  } else {
    callback && callback();
  }
  return isLogin;
};

// 导出工具函数
module.exports = {
  formatTime,
  formatRelativeTime,
  showToast,
  showLoading,
  hideLoading,
  showConfirm,
  navigateTo,
  generateId,
  debounce,
  throttle,
  deepClone,
  checkIsLogin,
  checkAndTipLogin
}