/**
 * 网络请求工具类
 */
import config from '../config/index';
import { getToken, removeToken } from './auth';
import { showToast, showLoading, hideLoading } from './ui';

// 请求队列，用于处理重复请求
const requestQueue = [];

// 默认请求配置
const defaultOptions = {
  showLoading: true,    // 是否显示加载提示
  loadingText: '加载中...',  // 加载提示文本
  showError: true,      // 是否显示错误提示
  retry: 1,             // 请求失败重试次数
  retryDelay: 1000,     // 重试延迟时间(ms)
  timeout: 30000,       // 超时时间(ms)
};

// 状态码对应的错误信息
const codeMessage = {
  400: '发出的请求有错误',
  401: '用户未授权',
  403: '服务器拒绝访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

/**
 * 获取完整URL
 * @param {string} url 请求路径
 * @returns {string} 完整URL
 */
const getFullUrl = (url) => {
  // 如果是完整URL，直接返回
  if (url.startsWith('http')) {
    return url;
  }
  
  // 拼接基础URL
  const baseUrl = config.env.BASE_URL;
  return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
};

/**
 * 处理请求参数
 * @param {Object} options 请求选项 
 * @returns {Object} 处理后的选项
 */
const processOptions = (options) => {
  const token = getToken();
  
  // 合并默认请求头
  const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.header,
  };
  
  // 设置认证token
  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }
  
  return {
    ...defaultOptions,
    ...options,
    header,
  };
};

/**
 * 处理请求响应
 * @param {Object} response 请求响应
 * @param {Object} options 请求选项
 * @returns {Promise} 处理后的响应
 */
const handleResponse = (response, options) => {
  return new Promise((resolve, reject) => {
    const { statusCode, data } = response;
    
    // 如果有全局loading，隐藏
    if (options.showLoading) {
      hideLoading();
    }
    
    // 移除请求队列中的请求
    const requestIndex = requestQueue.findIndex(item => item === options.url);
    if (requestIndex !== -1) {
      requestQueue.splice(requestIndex, 1);
    }
    
    // 处理成功响应
    if (statusCode >= 200 && statusCode < 300) {
      // 解构API返回数据（通常是 {code, data, message} 的格式）
      const { code, data: responseData, message } = data;
      
      // 业务状态码判断
      if (code === config.request.SUCCESS_CODE) {
        resolve(responseData); // 只返回实际数据部分
      } else if (code === config.request.UNAUTHORIZED_CODE) {
        // 未授权，跳转到登录
        if (options.showError) {
          showToast(message || '登录已过期，请重新登录');
        }
        
        // 清除token
        removeToken();
        
        // 延迟跳转到登录页
        setTimeout(() => {
          wx.navigateTo({
            url: config.pages.LOGIN_PAGE
          });
        }, 1500);
        
        reject(new Error(message || '登录已过期'));
      } else {
        // 其他业务错误
        if (options.showError) {
          showToast(message || '操作失败');
        }
        reject(new Error(message || '操作失败'));
      }
    } else {
      // 处理HTTP错误
      const errorText = codeMessage[statusCode] || '请求失败';
      
      if (options.showError) {
        showToast(errorText);
      }
      
      // 401未授权，跳转到登录页
      if (statusCode === 401) {
        // 清除token
        removeToken();
        
        // 延迟跳转到登录页
        setTimeout(() => {
          wx.navigateTo({
            url: config.pages.LOGIN_PAGE
          });
        }, 1500);
      }
      
      reject(new Error(errorText));
    }
  });
};

/**
 * 处理请求错误
 * @param {Error} error 错误对象
 * @param {Object} options 请求选项
 * @param {Function} makeRequest 发起请求的函数
 * @returns {Promise} 处理后的结果
 */
const handleError = (error, options, makeRequest) => {
  // 隐藏loading
  if (options.showLoading) {
    hideLoading();
  }
  
  // 移除请求队列中的请求
  const requestIndex = requestQueue.findIndex(item => item === options.url);
  if (requestIndex !== -1) {
    requestQueue.splice(requestIndex, 1);
  }
  
  // 网络错误处理
  const errMsg = error.errMsg || error.message || '网络异常';
  if (options.showError) {
    showToast(errMsg);
  }
  
  // 请求超时或网络错误时，可以进行重试
  if ((errMsg.includes('timeout') || errMsg.includes('net::ERR') || errMsg.includes('fail')) 
      && options.retry > 0) {
    // 重试次数减一
    options.retry--;
    
    // 延迟重试
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(makeRequest(options));
      }, options.retryDelay);
    });
  }
  
  return Promise.reject(error);
};

/**
 * 发起网络请求
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
const request = (options) => {
  // 处理选项
  const processedOptions = processOptions(options);
  const { url, method, data, showLoading, loadingText } = processedOptions;
  
  // 完整请求路径
  const fullUrl = getFullUrl(url);
  processedOptions.url = fullUrl;
  
  // 防止重复请求
  if (requestQueue.includes(fullUrl)) {
    return Promise.reject(new Error('请勿重复请求'));
  }
  
  // 将请求加入队列
  requestQueue.push(fullUrl);
  
  // 显示loading
  if (showLoading) {
    showLoading(loadingText);
  }
  
  // 打印请求信息
  if (config.env.DEBUG) {
    console.log(`【请求】${method} ${fullUrl}`, data);
  }
  
  // 发起请求
  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method: method.toUpperCase(),
      data,
      header: processedOptions.header,
      timeout: processedOptions.timeout,
      success: (response) => {
        // 打印响应信息
        if (config.env.DEBUG) {
          console.log(`【响应】${method} ${fullUrl}`, response.data);
        }
        
        // 处理响应
        handleResponse(response, processedOptions)
          .then(resolve)
          .catch(reject);
      },
      fail: (error) => {
        // 打印错误信息
        if (config.env.DEBUG) {
          console.error(`【错误】${method} ${fullUrl}`, error);
        }
        
        // 处理错误
        handleError(error, processedOptions, request)
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url 请求路径
 * @param {Object} params 查询参数
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
request.get = (url, params = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data: params,
    ...options
  });
};

/**
 * POST请求
 * @param {string} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
request.post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * PUT请求
 * @param {string} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
request.put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * DELETE请求
 * @param {string} url 请求路径
 * @param {Object} data 请求数据
 * @param {Object} options 请求选项
 * @returns {Promise} 请求结果
 */
request.delete = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
};

/**
 * 文件上传
 * @param {string} url 上传路径
 * @param {Object} options 上传选项
 * @returns {Promise} 上传结果
 */
request.upload = (url, options = {}) => {
  const {
    filePath,          // 文件路径
    name = 'file',     // 文件对应的 key
    header = {},       // 请求头
    formData = {},     // 额外的表单数据
    showLoading = true,
    loadingText = '上传中...',
    showError = true,
  } = options;
  
  // 完整请求路径
  const fullUrl = getFullUrl(url);
  
  // 防止重复请求
  if (requestQueue.includes(fullUrl)) {
    return Promise.reject(new Error('请勿重复请求'));
  }
  
  // 将请求加入队列
  requestQueue.push(fullUrl);
  
  // 显示loading
  if (showLoading) {
    showLoading(loadingText);
  }
  
  // 处理请求头
  const token = getToken();
  const processedHeader = {
    'Content-Type': 'multipart/form-data',
    ...header,
  };
  
  if (token) {
    processedHeader['Authorization'] = `Bearer ${token}`;
  }
  
  // 打印请求信息
  if (config.env.DEBUG) {
    console.log(`【上传】${fullUrl}`, { filePath, formData });
  }
  
  // 发起上传
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: fullUrl,
      filePath,
      name,
      header: processedHeader,
      formData,
      success: (response) => {
        // 隐藏loading
        if (showLoading) {
          hideLoading();
        }
        
        // 移除请求队列中的请求
        const requestIndex = requestQueue.findIndex(item => item === fullUrl);
        if (requestIndex !== -1) {
          requestQueue.splice(requestIndex, 1);
        }
        
        // 解析响应数据
        let responseData;
        try {
          responseData = JSON.parse(response.data);
        } catch (error) {
          responseData = response.data;
        }
        
        // 打印响应信息
        if (config.env.DEBUG) {
          console.log(`【上传响应】${fullUrl}`, responseData);
        }
        
        // 处理业务状态码
        const { code, data, message } = responseData;
        
        if (code === config.request.SUCCESS_CODE) {
          resolve(data);
        } else if (code === config.request.UNAUTHORIZED_CODE) {
          // 未授权，跳转到登录
          if (showError) {
            showToast(message || '登录已过期，请重新登录');
          }
          
          // 清除token
          removeToken();
          
          // 延迟跳转到登录页
          setTimeout(() => {
            wx.navigateTo({
              url: config.pages.LOGIN_PAGE
            });
          }, 1500);
          
          reject(new Error(message || '登录已过期'));
        } else {
          // 其他业务错误
          if (showError) {
            showToast(message || '上传失败');
          }
          reject(new Error(message || '上传失败'));
        }
      },
      fail: (error) => {
        // 隐藏loading
        if (showLoading) {
          hideLoading();
        }
        
        // 移除请求队列中的请求
        const requestIndex = requestQueue.findIndex(item => item === fullUrl);
        if (requestIndex !== -1) {
          requestQueue.splice(requestIndex, 1);
        }
        
        // 打印错误信息
        if (config.env.DEBUG) {
          console.error(`【上传错误】${fullUrl}`, error);
        }
        
        // 处理错误
        const errMsg = error.errMsg || '上传失败';
        if (showError) {
          showToast(errMsg);
        }
        reject(new Error(errMsg));
      }
    });
    
    // 监听上传进度
    uploadTask.onProgressUpdate((res) => {
      const { progress, totalBytesSent, totalBytesExpectedToSend } = res;
      
      // 回调上传进度
      if (typeof options.onProgress === 'function') {
        options.onProgress({
          progress,
          totalBytesSent,
          totalBytesExpectedToSend
        });
      }
      
      // 打印上传进度
      if (config.env.DEBUG && progress % 20 === 0) {
        console.log(`【上传进度】${progress}%`);
      }
    });
  });
};

export default request;