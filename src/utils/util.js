/**
 * 通用工具函数
 */

/**
 * 格式化时间
 * @param {Date|String|Number} date 日期对象/日期字符串/时间戳
 * @param {String} format 格式化模式 如：'YYYY-MM-DD HH:mm:ss'
 * @returns {String} 格式化后的日期字符串
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  date = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  const formatObj = {
    YYYY: date.getFullYear(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    DD: date.getDate().toString().padStart(2, '0'),
    HH: date.getHours().toString().padStart(2, '0'),
    mm: date.getMinutes().toString().padStart(2, '0'),
    ss: date.getSeconds().toString().padStart(2, '0'),
  };
  
  return format.replace(/(YYYY|MM|DD|HH|mm|ss)/g, (match) => formatObj[match]);
}

/**
 * 价格格式化
 * @param {Number} price 价格
 * @param {Number} digit 小数位数
 * @returns {String} 格式化后的价格
 */
export function formatPrice(price, digit = 2) {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return price.toFixed(digit);
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间，单位毫秒
 * @returns {Function} 节流后的函数
 */
export function throttle(fn, delay = 500) {
  let timer = null;
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间，单位毫秒
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 500) {
  let timer = null;
  
  return function(...args) {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 获取文件扩展名
 * @param {String} filename 文件名
 * @returns {String} 文件扩展名
 */
export function getFileExt(filename) {
  if (!filename) return '';
  return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
}

/**
 * 生成UUID
 * @returns {String} UUID
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 深拷贝
 * @param {Object|Array} obj 要拷贝的对象
 * @returns {Object|Array} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const result = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  
  return result;
}

/**
 * 对象转URL参数
 * @param {Object} obj 参数对象
 * @returns {String} URL参数字符串
 */
export function objectToParams(obj) {
  if (!obj) return '';
  
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&');
}

/**
 * URL参数转对象
 * @param {String} url URL字符串
 * @returns {Object} 参数对象
 */
export function paramsToObject(url) {
  const result = {};
  const search = url.split('?')[1];
  
  if (!search) return result;
  
  const params = search.split('&');
  
  for (let i = 0; i < params.length; i++) {
    const param = params[i].split('=');
    const key = decodeURIComponent(param[0]);
    const value = param.length > 1 ? decodeURIComponent(param[1]) : '';
    
    result[key] = value;
  }
  
  return result;
}

/**
 * 将对象转为FormData
 * @param {Object} obj 对象
 * @returns {FormData} FormData对象
 */
export function objectToFormData(obj) {
  const formData = new FormData();
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      formData.append(key, obj[key]);
    }
  });
  
  return formData;
}

/**
 * 判断是否为空值
 * @param {*} value 需要判断的值
 * @returns {Boolean} 是否为空
 */
export function isEmpty(value) {
  return value === undefined || value === null || value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0);
}

/**
 * 获取数据类型
 * @param {*} value 需要获取类型的值
 * @returns {String} 类型名称
 */
export function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * 手机号脱敏
 * @param {String} phone 手机号
 * @returns {String} 脱敏后的手机号
 */
export function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 姓名脱敏
 * @param {String} name 姓名
 * @returns {String} 脱敏后的姓名
 */
export function maskName(name) {
  if (!name) return name;
  if (name.length <= 1) return name;
  if (name.length === 2) return name.substr(0, 1) + '*';
  return name.substr(0, 1) + '*'.repeat(name.length - 2) + name.substr(-1);
}

/**
 * 身份证号脱敏
 * @param {String} idCard 身份证号
 * @returns {String} 脱敏后的身份证号
 */
export function maskIdCard(idCard) {
  if (!idCard || idCard.length < 15) return idCard;
  return idCard.replace(/^(.{4})(?:\d+)(.{4})$/, '$1**********$2');
}