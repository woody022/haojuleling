/**
 * 微信小程序网络请求封装
 * 统一处理请求、响应拦截和错误处理
 */

import config from '../config/index';

/**
 * 请求配置
 */
const DEFAULT_OPTIONS = {
  // 是否显示loading
  showLoading: false,
  // loading提示文本
  loadingText: '加载中...',
  // 是否显示错误提示
  showError: true,
  // 请求超时时间
  timeout: config.request.timeout,
  // 自定义请求头
  header: {
    'content-type': 'application/json'
  }
};

/**
 * 请求计数器，用于处理并发请求的loading显示
 */
let requestCount = 0;

/**
 * 显示loading
 * @param {string} title loading标题
 */
function showLoading(title) {
  if (requestCount === 0) {
    wx.showLoading({
      title,
      mask: true
    });
  }
  requestCount++;
}

/**
 * 隐藏loading
 */
function hideLoading() {
  requestCount--;
  if (requestCount === 0) {
    wx.hideLoading();
  }
}

/**
 * 显示错误提示
 * @param {string} msg 错误信息
 */
function showErrorToast(msg) {
  wx.showToast({
    title: msg || '请求失败',
    icon: 'none',
    duration: 2000
  });
}

/**
 * 获取完整请求URL
 * @param {string} url 请求地址
 * @returns {string} 完整请求地址
 */
function getFullUrl(url) {
  if (url.startsWith('http')) {
    return url;
  }
  return `${config.request.baseUrl}${url}`;
}

/**
 * 请求拦截器
 * @param {Object} options 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(options) {
  // 获取本地存储的token
  const token = wx.getStorageSync(config.storage.token);
  
  // 添加token到请求头
  if (token) {
    options.header = {
      ...options.header,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // 添加其他公共参数
  options.header = {
    ...options.header,
    'X-Client-Version': config.version,
    'X-Client-Platform': 'WeChat-MiniProgram'
  };
  
  return options;
}

/**
 * 响应拦截器
 * @param {Object} response 响应结果
 * @param {Object} options 请求配置
 * @returns {Promise} 处理后的响应结果
 */
function responseInterceptor(response, options) {
  const { statusCode, data } = response;
  
  // 请求成功
  if (statusCode >= 200 && statusCode < 300) {
    // 业务状态处理
    if (data.code === 0 || data.code === 200) {
      return Promise.resolve(data.data);
    }
    
    // 登录失效/未登录
    if (data.code === 401) {
      // 清空登录信息
      wx.removeStorageSync(config.storage.token);
      wx.removeStorageSync(config.storage.userInfo);
      
      // 跳转到登录页
      wx.navigateTo({
        url: config.pages.login
      });
      
      return Promise.reject(data);
    }
    
    // 其他业务错误
    if (options.showError) {
      showErrorToast(data.message || '操作失败');
    }
    return Promise.reject(data);
  }
  
  // 请求失败
  if (options.showError) {
    if (statusCode === 404) {
      showErrorToast('请求的资源不存在');
    } else if (statusCode === 500) {
      showErrorToast('服务器内部错误');
    } else if (statusCode === 502) {
      showErrorToast('服务暂时不可用');
    } else if (statusCode === 503) {
      showErrorToast('服务器正在维护');
    } else {
      showErrorToast('网络请求失败');
    }
  }
  
  return Promise.reject(response);
}

/**
 * 请求错误处理
 * @param {Object} error 错误信息
 * @param {Object} options 请求配置
 * @returns {Promise} 错误结果
 */
function errorHandler(error, options) {
  if (options.showError) {
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        showErrorToast('请求超时');
      } else if (error.errMsg.includes('fail')) {
        showErrorToast('网络连接失败');
      } else {
        showErrorToast(error.errMsg);
      }
    } else {
      showErrorToast('请求失败');
    }
  }
  
  return Promise.reject(error);
}

/**
 * 发起网络请求
 * @param {string} method 请求方法
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 请求配置
 * @returns {Promise} 返回Promise对象
 */
function request(method, url, data = {}, options = {}) {
  // 合并请求配置
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  // 显示loading
  if (mergedOptions.showLoading) {
    showLoading(mergedOptions.loadingText);
  }
  
  // 执行请求拦截
  const interceptedOptions = requestInterceptor(mergedOptions);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: getFullUrl(url),
      method,
      data,
      header: interceptedOptions.header,
      timeout: interceptedOptions.timeout,
      success: (res) => {
        // 响应拦截
        responseInterceptor(res, interceptedOptions)
          .then(resolve)
          .catch(reject);
      },
      fail: (err) => {
        // 错误处理
        errorHandler(err, interceptedOptions)
          .then(resolve)
          .catch(reject);
      },
      complete: () => {
        // 隐藏loading
        if (interceptedOptions.showLoading) {
          hideLoading();
        }
      }
    });
  });
}

/**
 * 上传文件
 * @param {string} url 上传地址
 * @param {Object} data 上传参数
 * @param {Object} options 请求配置
 * @returns {Promise} 返回Promise对象
 */
function uploadFile(url, data = {}, options = {}) {
  // 合并请求配置
  const mergedOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  // 显示loading
  if (mergedOptions.showLoading) {
    showLoading(mergedOptions.loadingText || '上传中...');
  }
  
  // 执行请求拦截
  const interceptedOptions = requestInterceptor(mergedOptions);
  
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: getFullUrl(url),
      filePath: data.filePath,
      name: data.name || 'file',
      formData: data.formData || {},
      header: interceptedOptions.header,
      timeout: interceptedOptions.timeout,
      success: (res) => {
        // 将返回的JSON字符串转为对象
        if (typeof res.data === 'string') {
          try {
            res.data = JSON.parse(res.data);
          } catch (e) {
            // 解析失败
          }
        }
        
        // 响应拦截
        responseInterceptor(res, interceptedOptions)
          .then(resolve)
          .catch(reject);
      },
      fail: (err) => {
        // 错误处理
        errorHandler(err, interceptedOptions)
          .then(resolve)
          .catch(reject);
      },
      complete: () => {
        // 隐藏loading
        if (interceptedOptions.showLoading) {
          hideLoading();
        }
      }
    });
    
    // 监听上传进度
    if (typeof data.onProgress === 'function') {
      uploadTask.onProgressUpdate((res) => {
        data.onProgress(res);
      });
    }
  });
}

// 导出请求方法
export default {
  /**
   * GET请求
   * @param {string} url 请求地址
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  get(url, options = {}) {
    return request('GET', url, options.params, options);
  },
  
  /**
   * POST请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  post(url, data = {}, options = {}) {
    return request('POST', url, data, options);
  },
  
  /**
   * PUT请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  put(url, data = {}, options = {}) {
    return request('PUT', url, data, options);
  },
  
  /**
   * DELETE请求
   * @param {string} url 请求地址
   * @param {Object} data 请求数据
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  delete(url, data = {}, options = {}) {
    return request('DELETE', url, data, options);
  },
  
  /**
   * 上传文件
   * @param {string} url 上传地址
   * @param {Object} data 上传参数
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  uploadFile
};