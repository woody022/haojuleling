/**
 * 基础网络请求封装
 */

const BASE_URL = 'https://api.haojuleling.com/api';

/**
 * 封装微信请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {String} method 请求方法
 * @param {Boolean} loading 是否显示加载中
 * @returns {Promise} Promise对象
 */
export const request = (url, data = {}, method = 'GET', loading = true) => {
  if (loading) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
  }
  
  return new Promise((resolve, reject) => {
    // 获取本地存储的token
    const token = wx.getStorageSync('token') || '';
    
    wx.request({
      url: `${BASE_URL}${url}`,
      data,
      method,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 请求成功
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            // 业务逻辑错误
            wx.showToast({
              title: res.data.message || '服务器错误',
              icon: 'none',
              duration: 2000
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // token失效，需要重新登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none',
            duration: 2000
          });
          // 跳转到登录页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }, 1000);
          reject(res);
        } else {
          // HTTP错误
          wx.showToast({
            title: `网络错误(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      },
      complete: () => {
        if (loading) {
          wx.hideLoading();
        }
      }
    });
  });
};

/**
 * GET请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Boolean} loading 是否显示加载中
 */
export const get = (url, data = {}, loading = true) => {
  return request(url, data, 'GET', loading);
};

/**
 * POST请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Boolean} loading 是否显示加载中
 */
export const post = (url, data = {}, loading = true) => {
  return request(url, data, 'POST', loading);
};

/**
 * PUT请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Boolean} loading 是否显示加载中
 */
export const put = (url, data = {}, loading = true) => {
  return request(url, data, 'PUT', loading);
};

/**
 * DELETE请求
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Boolean} loading 是否显示加载中
 */
export const del = (url, data = {}, loading = true) => {
  return request(url, data, 'DELETE', loading);
};

/**
 * 上传文件
 * @param {String} url 上传地址
 * @param {String} filePath 文件路径
 * @param {String} name 文件对应的key
 * @param {Object} formData 额外的表单数据
 * @returns {Promise} Promise对象
 */
export const uploadFile = (url, filePath, name = 'file', formData = {}) => {
  wx.showLoading({
    title: '上传中...',
    mask: true
  });
  
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token') || '';
    
    wx.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data);
          } else {
            wx.showToast({
              title: data.message || '上传失败',
              icon: 'none',
              duration: 2000
            });
            reject(data);
          }
        } else {
          wx.showToast({
            title: `上传失败(${res.statusCode})`,
            icon: 'none',
            duration: 2000
          });
          reject(res);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000
        });
        reject(err);
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  });
};