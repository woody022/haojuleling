/**
 * 工具类统一导出
 */

// 导入工具类模块
import * as commonUtils from './common';
import request, { get, post, put, del, uploadFile, downloadFile } from './request';
import validate from './validate';
import storage from './storage';

// 导出所有工具函数
export {
  // 通用工具函数
  commonUtils,
  
  // 网络请求相关
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  downloadFile,
  
  // 表单验证
  validate,
  
  // 本地存储
  storage
};

// 默认导出所有工具
export default {
  ...commonUtils,
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  downloadFile,
  validate,
  storage
};