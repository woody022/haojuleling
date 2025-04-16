/**
 * 网络请求工具类
 * 封装微信小程序网络请求API，提供更方便的使用方式
 * 支持请求拦截、响应拦截、统一错误处理等功能
 */

import config from '../config/index';
import storage from './storage';

// 请求队列，用于处理重复请求
const pendingRequests = new Map();

// 生成请求唯一标识
const generateRequestKey = (config) => {
  const { url, method, data } = config;
  return `${method}-${url}-${JSON.stringify(data)}`;
};

// 取消重复请求
const removePendingRequest = (key) => {
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key);
    controller.abort(); // 取消请求
    pendingRequests.delete(key);
  }
};

/**
 * 请求拦截器
 * @param {object} requestConfig - 请求配置
 * @returns {object} 处理后的请求配置
 */
const requestInterceptor = (requestConfig) => {
  // 添加公共请求头
  requestConfig.header = {
    ...requestConfig.header,
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': config.VERSION,
    'X-Client-Platform': 'MiniProgram'
  };
  
  // 添加token到请求头
  const token = storage.token.get();
  if (token) {
    requestConfig.header.Authorization = `Bearer ${token}`;
  }
  
  // 处理请求超时
  if (!requestConfig.timeout) {
    requestConfig.timeout = config.REQUEST.TIMEOUT;
  }
  
  // 创建取消请求的控制器
  if (requestConfig.cancelDuplicated !== false) {
    const requestKey = generateRequestKey(requestConfig);
    removePendingRequest(requestKey);
    
    const controller = new AbortController();
    requestConfig.signal = controller.signal;
    pendingRequests.set(requestKey, controller);
  }
  
  return requestConfig;
};

/**
 * 响应拦截器
 * @param {object} response - 响应对象
 * @param {object} requestConfig - 请求配置
 * @returns {object|Promise} 处理后的响应数据或错误对象
 */
const responseInterceptor = (response, requestConfig) => {
  // 从请求队列中移除已完成的请求
  if (requestConfig.cancelDuplicated !== false) {
    const requestKey = generateRequestKey(requestConfig);
    pendingRequests.delete(requestKey);
  }
  
  // 请求成功
  if (response.statusCode >= 200 && response.statusCode < 300) {
    return response.data;
  }
  
  // 处理不同错误状态码
  const error = {
    code: response.statusCode,
    message: response.data?.message || '请求失败，请稍后再试',
    data: response.data
  };
  
  // 处理特定状态码
  switch (response.statusCode) {
    case 401:
      // 未授权，清除本地token
      storage.token.remove();
      // 跳转到登录页
      if (config.REQUEST.AUTO_REDIRECT_LOGIN) {
        wx.navigateTo({ url: '/pages/login/index' });
      }
      error.message = '登录已过期，请重新登录';
      break;
    case 403:
      error.message = '没有权限访问该资源';
      break;
    case 404:
      error.message = '请求的资源不存在';
      break;
    case 500:
      error.message = '服务器错误，请稍后再试';
      break;
  }
  
  // 是否显示错误提示
  if (requestConfig.showError !== false) {
    wx.showToast({
      title: error.message,
      icon: 'none',
      duration: 2000
    });
  }
  
  return Promise.reject(error);
};

/**
 * 发送请求的核心方法
 * @param {object} options - 请求配置
 * @returns {Promise} 请求结果
 */
const request = (options) => {
  // 合并默认配置和用户配置
  const requestConfig = {
    url: '',
    method: 'GET',
    data: {},
    header: {},
    dataType: 'json',
    responseType: 'text',
    showError: true,
    cancelDuplicated: true,
    ...options
  };
  
  // 处理基础URL
  if (!requestConfig.url.startsWith('http')) {
    requestConfig.url = `${config.API.BASE_URL}${requestConfig.url}`;
  }
  
  // 应用请求拦截器
  const processedConfig = requestInterceptor(requestConfig);
  
  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      ...processedConfig,
      success: (res) => {
        try {
          const result = responseInterceptor(res, processedConfig);
          // 如果是Promise.reject，会被catch捕获
          if (result instanceof Promise) {
            result.catch(reject);
          } else {
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        // 处理请求失败（网络错误等）
        const errorMsg = err.errMsg || '网络异常，请检查网络设置';
        
        // 判断是否为取消请求
        if (errorMsg.includes('abort')) {
          reject({ code: -1, message: '请求已取消' });
          return;
        }
        
        // 显示错误提示
        if (requestConfig.showError !== false) {
          wx.showToast({
            title: '网络异常，请检查网络设置',
            icon: 'none',
            duration: 2000
          });
        }
        
        reject({
          code: -1,
          message: errorMsg,
          data: err
        });
      },
      complete: () => {
        // 请求完成时的处理
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url - 请求地址
 * @param {object} [data] - 请求参数
 * @param {object} [options] - 其他配置
 * @returns {Promise} 请求结果
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * POST请求
 * @param {string} url - 请求地址
 * @param {object} [data] - 请求数据
 * @param {object} [options] - 其他配置
 * @returns {Promise} 请求结果
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {string} url - 请求地址
 * @param {object} [data] - 请求数据
 * @param {object} [options] - 其他配置
 * @returns {Promise} 请求结果
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {string} url - 请求地址
 * @param {object} [data] - 请求数据
 * @param {object} [options] - 其他配置
 * @returns {Promise} 请求结果
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

/**
 * 上传文件
 * @param {string} url - 请求地址
 * @param {string} filePath - 本地文件路径
 * @param {string} [name='file'] - 文件对应的key
 * @param {object} [formData] - 其他表单数据
 * @param {object} [options] - 其他配置
 * @returns {Promise} 上传结果
 */
const uploadFile = (url, filePath, name = 'file', formData = {}, options = {}) => {
  // 处理基础URL
  if (!url.startsWith('http')) {
    url = `${config.API.BASE_URL}${url}`;
  }
  
  // 获取token
  const token = storage.token.get();
  const header = {
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': config.VERSION,
    'X-Client-Platform': 'MiniProgram'
  };
  
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 上传成功
          let data = res.data;
          try {
            // 尝试解析JSON
            if (typeof data === 'string') {
              data = JSON.parse(data);
            }
            resolve(data);
          } catch (error) {
            resolve(data);
          }
        } else {
          // 上传失败
          const error = {
            code: res.statusCode,
            message: '文件上传失败',
            data: res.data
          };
          
          if (options.showError !== false) {
            wx.showToast({
              title: error.message,
              icon: 'none',
              duration: 2000
            });
          }
          
          reject(error);
        }
      },
      fail: (err) => {
        const error = {
          code: -1,
          message: '文件上传失败',
          data: err
        };
        
        if (options.showError !== false) {
          wx.showToast({
            title: error.message,
            icon: 'none',
            duration: 2000
          });
        }
        
        reject(error);
      }
    });
    
    // 上传进度监听
    if (options.onProgress) {
      uploadTask.onProgressUpdate(options.onProgress);
    }
    
    // 返回上传任务，方便外部控制取消
    if (options.getTask) {
      options.getTask(uploadTask);
    }
  });
};

/**
 * 下载文件
 * @param {string} url - 文件地址
 * @param {object} [options] - 其他配置
 * @returns {Promise} 下载结果
 */
const downloadFile = (url, options = {}) => {
  // 处理基础URL
  if (!url.startsWith('http')) {
    url = `${config.API.BASE_URL}${url}`;
  }
  
  return new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url,
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res);
        } else {
          const error = {
            code: res.statusCode,
            message: '文件下载失败',
            data: res
          };
          
          if (options.showError !== false) {
            wx.showToast({
              title: error.message,
              icon: 'none',
              duration: 2000
            });
          }
          
          reject(error);
        }
      },
      fail: (err) => {
        const error = {
          code: -1,
          message: '文件下载失败',
          data: err
        };
        
        if (options.showError !== false) {
          wx.showToast({
            title: error.message,
            icon: 'none',
            duration: 2000
          });
        }
        
        reject(error);
      }
    });
    
    // 下载进度监听
    if (options.onProgress) {
      downloadTask.onProgressUpdate(options.onProgress);
    }
    
    // 返回下载任务，方便外部控制取消
    if (options.getTask) {
      options.getTask(downloadTask);
    }
  });
};

export default {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile,
  downloadFile
};