/**
 * HTTP请求模块，封装微信小程序网络请求API
 */

// 基础URL，根据环境配置不同的接口地址
const BASE_URL = 'https://api.example.com';

// 超时时间（毫秒）
const TIMEOUT = 10000;

// 请求队列，用于处理重复请求
const pendingRequests = new Map();

/**
 * 生成请求的唯一标识
 * @param {Object} config 请求配置
 * @returns {String} 请求标识
 */
function generateRequestKey(config) {
  const { url, method, data } = config;
  return `${method}_${url}_${JSON.stringify(data || {})}`;
}

/**
 * 取消重复请求
 * @param {Object} config 请求配置
 */
function removePendingRequest(config) {
  const requestKey = generateRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller.abort();
    pendingRequests.delete(requestKey);
  }
}

/**
 * 添加请求到队列
 * @param {Object} config 请求配置
 */
function addPendingRequest(config) {
  const requestKey = generateRequestKey(config);
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);
}

/**
 * 请求拦截器
 * @param {Object} config 请求配置
 * @returns {Object} 处理后的请求配置
 */
function requestInterceptor(config) {
  // 取消重复请求
  removePendingRequest(config);
  
  // 添加到请求队列
  addPendingRequest(config);
  
  // 附加token到请求头
  const token = wx.getStorageSync('token');
  if (token) {
    config.header = {
      ...config.header,
      'Authorization': `Bearer ${token}`
    };
  }
  
  return config;
}

/**
 * 响应拦截器
 * @param {Object} response 响应对象
 * @returns {Promise} 处理后的响应数据
 */
function responseInterceptor(response) {
  // 从请求队列中移除
  removePendingRequest(response.config);
  
  // 统一处理响应
  const { statusCode, data } = response;
  
  // 请求成功
  if (statusCode >= 200 && statusCode < 300) {
    // 业务状态判断
    if (data.code === 0 || data.code === 200) {
      return Promise.resolve(data.data);
    } else {
      // 业务错误
      const error = new Error(data.message || '服务器响应异常');
      error.code = data.code;
      error.response = response;
      
      // 处理特定业务错误码
      if (data.code === 401) {
        // token过期，重新登录
        wx.removeStorageSync('token');
        wx.navigateTo({ url: '/pages/login/login' });
      }
      
      return Promise.reject(error);
    }
  } else {
    // HTTP错误
    const error = new Error('网络请求失败');
    error.code = statusCode;
    error.response = response;
    
    return Promise.reject(error);
  }
}

/**
 * 错误处理函数
 * @param {Error} error 错误对象
 * @returns {Promise} 错误信息
 */
function handleError(error) {
  // 取消请求
  if (error.message === 'Request aborted') {
    return Promise.reject(new Error('请求已取消'));
  }
  
  // 超时
  if (error.code === 'ECONNABORTED') {
    return Promise.reject(new Error('请求超时，请检查网络连接'));
  }
  
  // 网络错误
  if (!error.response) {
    return Promise.reject(new Error('网络异常，请检查您的网络连接'));
  }
  
  // 服务器错误
  if (error.code >= 500) {
    return Promise.reject(new Error('服务器错误，请稍后再试'));
  }
  
  return Promise.reject(error);
}

/**
 * 发送HTTP请求
 * @param {Object} options 请求配置
 * @returns {Promise} 请求结果
 */
function request(options) {
  const config = {
    url: options.url.startsWith('http') ? options.url : BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...options.header
    },
    timeout: options.timeout || TIMEOUT,
    dataType: options.dataType || 'json',
    responseType: options.responseType || 'text',
    enableHttp2: true,
    enableQuic: true,
    enableCache: true,
  };
  
  // 应用请求拦截器
  const interceptedConfig = requestInterceptor(config);
  
  return new Promise((resolve, reject) => {
    wx.request({
      ...interceptedConfig,
      success: (res) => {
        try {
          res.config = interceptedConfig;
          const result = responseInterceptor(res);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        err.config = interceptedConfig;
        reject(handleError(err));
      },
      complete: () => {
        // 请求完成后从队列中删除
        removePendingRequest(interceptedConfig);
      }
    });
  });
}

/**
 * GET请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置项
 * @returns {Promise} 请求结果
 */
export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置项
 * @returns {Promise} 请求结果
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置项
 * @returns {Promise} 请求结果
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置项
 * @returns {Promise} 请求结果
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 上传文件
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {String} name 文件对应的key
 * @param {Object} formData 额外的表单数据
 * @param {Function} progressCallback 上传进度回调
 * @returns {Promise} 上传结果
 */
export function upload(url, filePath, name = 'file', formData = {}, progressCallback) {
  const header = {};
  const token = wx.getStorageSync('token');
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }
  
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: url.startsWith('http') ? url : BASE_URL + url,
      filePath,
      name,
      formData,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          let data = res.data;
          if (typeof data === 'string') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              return reject(new Error('解析响应数据失败'));
            }
          }
          
          if (data.code === 0 || data.code === 200) {
            resolve(data.data);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } else {
          reject(new Error(`上传失败，状态码：${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '文件上传失败'));
      }
    });
    
    if (progressCallback && typeof progressCallback === 'function') {
      uploadTask.onProgressUpdate((res) => {
        progressCallback(res.progress);
      });
    }
  });
}

// 导出请求函数
export default {
  request,
  get,
  post,
  put,
  del,
  upload
};