/**
 * 工具类统一导出
 */

// 导入原始工具类模块
const util = require('./util');
const cloudRequest = require('./cloudRequest');
const pageHelper = require('./pageHelper');
const uiManager = require('./uiManager');
const WxValidate = require('./WxValidate');
const userUtils = require('./userUtils');

// 导入增强版工具类模块
const commonUtils = require('./common-new');
const requestUtils = require('./request-new');
const validateUtils = require('./validate-new');
const storageUtils = require('./storage-new');

// 将增强版常用工具函数合并到原始工具中
const mergedUtils = {
  ...util,
  ...commonUtils,
  
  // 额外保留一些可能冲突的原始函数
  formatTimeOld: util.formatTime, // 保留原始的时间格式化函数
  formatDateNew: commonUtils.formatDate, // 增强版日期格式化函数
  
  isEmpty: commonUtils.isEmpty,
  deepClone: commonUtils.deepClone,
  merge: commonUtils.merge,
  formatNumber: commonUtils.formatNumber,
  random: commonUtils.random,
  debounce: commonUtils.debounce,
  throttle: commonUtils.throttle,
  getUrlParam: commonUtils.getUrlParam,
  buildUrlParams: commonUtils.buildUrlParams,
  randomString: commonUtils.randomString,
  formatFileSize: commonUtils.formatFileSize,
  buildTree: commonUtils.buildTree,
  flattenTree: commonUtils.flattenTree,
  getTreeNodePath: commonUtils.getTreeNodePath
};

// 网络请求模块
const request = {
  ...cloudRequest,
  ...requestUtils,
  
  // 兼容云函数调用
  cloud: cloudRequest.request,
  http: requestUtils.request,
  
  // 常用HTTP方法
  get: requestUtils.get,
  post: requestUtils.post,
  put: requestUtils.put,
  del: requestUtils.del,
  uploadFile: requestUtils.uploadFile,
  downloadFile: requestUtils.downloadFile
};

// 表单验证模块
const validate = {
  ...validateUtils,
  WxValidate  // 保留原始的WxValidate类
};

// 存储模块
const storage = {
  ...storageUtils
};

// 统一导出
module.exports = {
  // 原始工具模块
  util: mergedUtils,
  pageHelper,
  uiManager,
  userUtils,
  
  // 增强版工具模块
  common: commonUtils,
  request,
  validate,
  storage,
  
  // 常用函数快捷访问
  isEmpty: commonUtils.isEmpty,
  formatDate: commonUtils.formatDate,
  showToast: commonUtils.showToast,
  showModal: commonUtils.showModal,
  
  // 网络请求快捷方法
  get: requestUtils.get,
  post: requestUtils.post,
  
  // 存储快捷方法
  setStorage: storageUtils.set,
  getStorage: storageUtils.get,
  removeStorage: storageUtils.remove
};