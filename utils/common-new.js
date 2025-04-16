/**
 * 增强版通用工具函数
 */

// 判断变量是否为空
function isEmpty(value) {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0 && !(value instanceof Date)) {
    return true;
  }
  return false;
}

// 深拷贝对象
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // 处理普通对象
  const result = {};
  Object.keys(obj).forEach(key => {
    result[key] = deepClone(obj[key]);
  });
  
  return result;
}

// 对象合并
function merge(target, source) {
  if (!source) return target;
  
  const result = { ...target };
  
  Object.keys(source).forEach(key => {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      if (typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== null) {
        result[key] = merge(target[key], source[key]);
      } else {
        result[key] = deepClone(source[key]);
      }
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
}

// 格式化日期
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '';
  
  let dateObj;
  if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const seconds = dateObj.getSeconds();
  
  const formatMap = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hours.toString().padStart(2, '0'),
    'H': hours.toString(),
    'mm': minutes.toString().padStart(2, '0'),
    'm': minutes.toString(),
    'ss': seconds.toString().padStart(2, '0'),
    's': seconds.toString(),
  };
  
  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g, match => formatMap[match]);
}

// 格式化数字
function formatNumber(number, decimals = 2, addCommas = true) {
  if (number === undefined || number === null || isNaN(number)) {
    return '';
  }
  
  const num = parseFloat(number);
  const fixedNum = num.toFixed(decimals);
  
  if (!addCommas) {
    return fixedNum;
  }
  
  const parts = fixedNum.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// 生成指定范围内的随机数
function random(min, max, isInteger = true) {
  const result = Math.random() * (max - min) + min;
  return isInteger ? Math.floor(result) : result;
}

// 防抖函数
function debounce(fn, delay = 300) {
  let timer = null;
  
  return function(...args) {
    const context = this;
    
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      fn.apply(context, args);
      timer = null;
    }, delay);
  };
}

// 节流函数
function throttle(fn, delay = 300) {
  let timer = null;
  let lastExecTime = 0;
  
  return function(...args) {
    const context = this;
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime >= delay) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      fn.apply(context, args);
      lastExecTime = currentTime;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        lastExecTime = Date.now();
        timer = null;
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// 获取URL参数
function getUrlParam(name, url) {
  try {
    // 小程序环境
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage && currentPage.options) {
      return currentPage.options[name] || null;
    }
    return null;
  } catch (e) {
    // 其他错误
    console.error('获取URL参数失败:', e);
    return null;
  }
}

// 构建URL参数字符串
function buildUrlParams(params) {
  if (!params || typeof params !== 'object') {
    return '';
  }
  
  const parts = [];
  
  Object.keys(params).forEach(key => {
    if (params[key] != null && params[key] !== '') {
      const value = encodeURIComponent(params[key]);
      parts.push(`${encodeURIComponent(key)}=${value}`);
    }
  });
  
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

// 生成随机字符串
function randomString(length = 16, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  const charsLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
}

// 格式化文件大小
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// 构建数据树
function buildTree(data, options = {}) {
  const {
    idKey = 'id',          // ID字段名
    parentKey = 'parentId', // 父级ID字段名
    childrenKey = 'children', // 子节点字段名
    rootValue = null,      // 根节点的父级ID值
  } = options;
  
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // 创建节点映射表
  const nodeMap = {};
  data.forEach(item => {
    nodeMap[item[idKey]] = {
      ...item,
      [childrenKey]: [],
    };
  });
  
  // 构建树结构
  const result = [];
  data.forEach(item => {
    const id = item[idKey];
    const parentId = item[parentKey];
    const node = nodeMap[id];
    
    if (parentId === rootValue || !nodeMap[parentId]) {
      // 根节点
      result.push(node);
    } else {
      // 添加到父节点的children中
      nodeMap[parentId][childrenKey].push(node);
    }
  });
  
  return result;
}

// 扁平化树结构
function flattenTree(tree, options = {}) {
  const {
    childrenKey = 'children',  // 子节点字段名
    keepChildren = false,      // 是否保留children字段
  } = options;
  
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }
  
  const result = [];
  
  const flatten = (nodes) => {
    nodes.forEach(node => {
      const children = node[childrenKey];
      const nodeClone = { ...node };
      
      if (!keepChildren) {
        delete nodeClone[childrenKey];
      }
      
      result.push(nodeClone);
      
      if (Array.isArray(children) && children.length > 0) {
        flatten(children);
      }
    });
  };
  
  flatten(tree);
  return result;
}

// 获取树节点路径
function getTreeNodePath(tree, value, options = {}) {
  const {
    idKey = 'id',             // ID字段名
    childrenKey = 'children', // 子节点字段名
    includeSelf = true,       // 是否包含自身
  } = options;
  
  if (!Array.isArray(tree) || tree.length === 0 || value == null) {
    return [];
  }
  
  const path = [];
  
  const find = (nodes, parent) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const currentPath = parent ? [...parent] : [];
      
      if (includeSelf || node[idKey] !== value) {
        currentPath.push(node);
      }
      
      if (node[idKey] === value) {
        path.push(...currentPath);
        return true;
      }
      
      if (Array.isArray(node[childrenKey]) && node[childrenKey].length > 0) {
        if (find(node[childrenKey], currentPath)) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  find(tree, null);
  return path;
}

// 显示消息提示框
function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  });
}

// 显示模态对话框
function showModal(title, content, showCancel = true, confirmText = '确定', cancelText = '取消') {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      confirmText: confirmText,
      cancelText: cancelText,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 导出工具函数
module.exports = {
  isEmpty,
  deepClone,
  merge,
  formatDate,
  formatNumber,
  random,
  debounce,
  throttle,
  getUrlParam,
  buildUrlParams,
  randomString,
  formatFileSize,
  buildTree,
  flattenTree,
  getTreeNodePath,
  showToast,
  showModal
};