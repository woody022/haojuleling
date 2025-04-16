/**
 * 增强版网络请求工具函数
 * 同时支持HTTP请求和云函数调用
 */

// 请求基础URL
const BASE_URL = 'https://api.example.com';

// 请求超时时间
const TIMEOUT = 10000;

// 请求头
const HEADERS = {
  'content-type': 'application/json'
};

// 请求拦截器
const requestInterceptors = [];

// 响应拦截器
const responseInterceptors = [];

/**
 * 添加请求拦截器
 * @param {Function} interceptor 拦截器函数
 */
function addRequestInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor);
  }
}

/**
 * 添加响应拦截器
 * @param {Function} interceptor 拦截器函数
 */
function addResponseInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor);
  }
}

/**
 * 执行请求拦截器
 * @param {Object} config 请求配置
 * @returns {Object} 处理后的请求配置
 */
function processRequestInterceptors(config) {
  let processedConfig = { ...config };
  
  for (const interceptor of requestInterceptors) {
    try {
      const result = interceptor(processedConfig);
      if (result) {
        processedConfig = result;
      }
    } catch (error) {
      console.error('请求拦截器执行失败:', error);
    }
  }
  
  return processedConfig;
}

/**
 * 执行响应拦截器
 * @param {Object} response 响应对象
 * @param {Object} config 请求配置
 * @returns {Object} 处理后的响应对象
 */
function processResponseInterceptors(response, config) {
  let processedResponse = { ...response };
  
  for (const interceptor of responseInterceptors) {
    try {
      const result = interceptor(processedResponse, config);
      if (result) {
        processedResponse = result;
      }
    } catch (error) {
      console.error('响应拦截器执行失败:', error);
    }
  }
  
  return processedResponse;
}

/**
 * HTTP请求封装
 * @param {Object} options 请求配置
 * @returns {Promise} 请求Promise对象
 */
function httpRequest(options = {}) {
  // 合并默认配置与用户配置
  const config = {
    url: '',
    method: 'GET',
    data: {},
    header: { ...HEADERS },
    timeout: TIMEOUT,
    ...options
  };
  
  // 处理URL
  if (!config.url.startsWith('http')) {
    config.url = BASE_URL + config.url;
  }
  
  // 执行请求拦截器
  const processedConfig = processRequestInterceptors(config);
  
  // 返回Promise
  return new Promise((resolve, reject) => {
    wx.request({
      url: processedConfig.url,
      data: processedConfig.data,
      method: processedConfig.method,
      header: processedConfig.header,
      timeout: processedConfig.timeout,
      success: (res) => {
        // 执行响应拦截器
        const processedResponse = processResponseInterceptors(res, processedConfig);
        resolve(processedResponse);
      },
      fail: (err) => {
        // 请求失败
        const error = {
          errMsg: err.errMsg,
          status: -1,
          config: processedConfig
        };
        
        // 执行响应拦截器
        const processedError = processResponseInterceptors(error, processedConfig);
        reject(processedError);
      }
    });
  });
}

/**
 * 云函数调用封装
 * @param {Object} options 请求配置
 * @returns {Promise} 请求Promise对象
 */
function cloudRequest(options = {}) {
  const { name, data = {}, showLoading = false } = options;
  
  // 显示加载中
  if (showLoading) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
  }
  
  // 执行请求拦截器
  const processedConfig = processRequestInterceptors(options);
  
  // 发起云函数调用
  return new Promise((resolve, reject) => {
    // 检查wx.cloud是否可用
    if (!wx.cloud || !wx.cloud.callFunction) {
      if (showLoading) {
        wx.hideLoading();
      }
      const error = {
        code: -2,
        message: '云开发环境未初始化',
        data: null
      };
      reject(error);
      return;
    }
    
    wx.cloud.callFunction({
      name: processedConfig.name,
      data: processedConfig.data,
      success: res => {
        if (showLoading) {
          wx.hideLoading();
        }
        
        // 处理响应
        const result = res.result !== undefined ? res.result : res;
        
        // 执行响应拦截器
        const processedResponse = processResponseInterceptors(result, processedConfig);
        
        resolve(processedResponse);
      },
      fail: err => {
        console.error(`[云函数调用失败] ${name}`, err);
        
        if (showLoading) {
          wx.hideLoading();
        }
        
        // 错误处理
        const error = {
          code: -1,
          message: '网络异常，请稍后再试',
          error: err
        };
        
        // 执行响应拦截器
        const processedError = processResponseInterceptors(error, processedConfig);
        
        reject(processedError);
      }
    });
  });
}

/**
 * 统一请求方法，自动判断使用HTTP请求还是云函数调用
 * @param {Object} options 请求配置
 * @returns {Promise} 请求Promise对象
 */
function request(options = {}) {
  // 判断是否为云函数调用
  if (options.name) {
    return cloudRequest(options);
  } else {
    return httpRequest(options);
  }
}

/**
 * GET请求
 * @param {string} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他配置
 * @returns {Promise} 请求Promise对象
 */
function get(url, data = {}, options = {}) {
  return httpRequest({
    url,
    method: 'GET',
    data,
    ...options
  });
}

/**
 * POST请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} 请求Promise对象
 */
function post(url, data = {}, options = {}) {
  return httpRequest({
    url,
    method: 'POST',
    data,
    ...options
  });
}

/**
 * PUT请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} 请求Promise对象
 */
function put(url, data = {}, options = {}) {
  return httpRequest({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

/**
 * DELETE请求
 * @param {string} url 请求地址
 * @param {Object} data 请求数据
 * @param {Object} options 其他配置
 * @returns {Promise} 请求Promise对象
 */
function del(url, data = {}, options = {}) {
  return httpRequest({
    url,
    method: 'DELETE',
    data,
    ...options
  });
}

/**
 * 上传文件
 * @param {string} url 上传地址
 * @param {string} filePath 文件路径
 * @param {string} name 文件对应的key
 * @param {Object} formData 其他表单数据
 * @param {Object} options 其他配置
 * @returns {Promise} 上传Promise对象
 */
function uploadFile(url, filePath, name = 'file', formData = {}, options = {}) {
  // 如果URL不是以http开头，添加基础URL
  if (!url.startsWith('http')) {
    url = BASE_URL + url;
  }
  
  const config = {
    url,
    filePath,
    name,
    formData,
    header: { ...HEADERS },
    timeout: TIMEOUT,
    ...options
  };
  
  // 执行请求拦截器
  const processedConfig = processRequestInterceptors(config);
  
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url: processedConfig.url,
      filePath: processedConfig.filePath,
      name: processedConfig.name,
      formData: processedConfig.formData,
      header: processedConfig.header,
      timeout: processedConfig.timeout,
      success: (res) => {
        // 尝试将返回的数据转换为JSON对象
        try {
          if (typeof res.data === 'string') {
            res.data = JSON.parse(res.data);
          }
        } catch (e) {
          // 转换失败，保持原样
        }
        
        // 执行响应拦截器
        const processedResponse = processResponseInterceptors(res, processedConfig);
        resolve(processedResponse);
      },
      fail: (err) => {
        const error = {
          errMsg: err.errMsg,
          status: -1,
          config: processedConfig
        };
        
        // 执行响应拦截器
        const processedError = processResponseInterceptors(error, processedConfig);
        reject(processedError);
      }
    });
    
    // 暴露上传任务对象
    if (options.getTask) {
      options.getTask(uploadTask);
    }
  });
}

/**
 * 下载文件
 * @param {string} url 下载地址
 * @param {Object} options 其他配置
 * @returns {Promise} 下载Promise对象
 */
function downloadFile(url, options = {}) {
  // 如果URL不是以http开头，添加基础URL
  if (!url.startsWith('http')) {
    url = BASE_URL + url;
  }
  
  const config = {
    url,
    header: { ...HEADERS },
    timeout: TIMEOUT,
    ...options
  };
  
  // 执行请求拦截器
  const processedConfig = processRequestInterceptors(config);
  
  return new Promise((resolve, reject) => {
    const downloadTask = wx.downloadFile({
      url: processedConfig.url,
      header: processedConfig.header,
      timeout: processedConfig.timeout,
      success: (res) => {
        // 执行响应拦截器
        const processedResponse = processResponseInterceptors(res, processedConfig);
        resolve(processedResponse);
      },
      fail: (err) => {
        const error = {
          errMsg: err.errMsg,
          status: -1,
          config: processedConfig
        };
        
        // 执行响应拦截器
        const processedError = processResponseInterceptors(error, processedConfig);
        reject(processedError);
      }
    });
    
    // 暴露下载任务对象
    if (options.getTask) {
      options.getTask(downloadTask);
    }
  });
}

// 添加默认响应拦截器，处理常见错误
addResponseInterceptor((response) => {
  // 网络请求成功，但业务状态码表示失败
  if (response.statusCode === 200 && response.data && response.data.code !== 0) {
    // 登录过期，跳转到登录页
    if (response.data.code === 401) {
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      
      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }, 1500);
    } else {
      // 其他业务错误，显示错误信息
      wx.showToast({
        title: response.data.message || '请求失败',
        icon: 'none'
      });
    }
  }
  
  return response;
});

// 导出请求配置
const requestConfig = {
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: HEADERS
};

// 导出工具函数
module.exports = {
  request,
  get,
  post,
  put,
  del,
  uploadFile,
  downloadFile,
  httpRequest,
  cloudRequest,
  addRequestInterceptor,
  addResponseInterceptor,
  requestConfig
};