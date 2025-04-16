/**
 * API请求模块
 */

const baseUrl = 'https://api.example.com'; // 替换为实际的API域名

/**
 * 通用的请求函数
 * @param {Object} options 请求参数
 * @return {Promise} 请求结果
 */
const request = (options = {}) => {
  // 获取token
  const token = wx.getStorageSync('token') || '';
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url || '',
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': options.contentType || 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        // 判断是否为200成功状态码
        if (res.statusCode === 200) {
          // 业务判断是否成功
          if (res.data.code === 0) {
            resolve(res.data);
          } else {
            // 判断是否是登录过期
            if (res.data.code === 401) {
              // 清除本地登录状态
              wx.removeStorageSync('token');
              wx.removeStorageSync('userInfo');
              
              // 弹窗提示登录过期
              wx.showModal({
                title: '登录已过期',
                content: '请重新登录',
                showCancel: false,
                success: () => {
                  wx.navigateTo({
                    url: '/pages/login/login'
                  });
                }
              });
            } else {
              reject(res.data);
            }
          }
        } else {
          reject({
            code: res.statusCode,
            message: res.data.message || '网络错误'
          });
        }
      },
      fail: (err) => {
        reject({
          code: -1,
          message: err.errMsg || '网络错误'
        });
      }
    });
  });
};

/**
 * 请求封装 - GET
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @return {Promise} 请求结果
 */
const get = (url, data = {}, options = {}) => {
  return request({
    url: `${baseUrl}${url}`,
    method: 'GET',
    data,
    ...options
  });
};

/**
 * 请求封装 - POST
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @return {Promise} 请求结果
 */
const post = (url, data = {}, options = {}) => {
  return request({
    url: `${baseUrl}${url}`,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * 请求封装 - PUT
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @return {Promise} 请求结果
 */
const put = (url, data = {}, options = {}) => {
  return request({
    url: `${baseUrl}${url}`,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * 请求封装 - DELETE
 * @param {String} url 请求地址
 * @param {Object} data 请求参数
 * @param {Object} options 其他选项
 * @return {Promise} 请求结果
 */
const del = (url, data = {}, options = {}) => {
  return request({
    url: `${baseUrl}${url}`,
    method: 'DELETE',
    data,
    ...options
  });
};

/**
 * 用户登录
 * @param {Object} data 登录参数
 * @return {Promise} 登录结果
 */
const login = (data) => {
  return post('/api/user/login', data);
};

/**
 * 获取用户信息
 * @return {Promise} 用户信息
 */
const getUserInfo = () => {
  return get('/api/user/info');
};

/**
 * 获取活动列表
 * @param {Object} params 查询参数
 * @return {Promise} 活动列表
 */
const getActivities = (params = {}) => {
  return get('/api/activities', params);
};

/**
 * 获取活动详情
 * @param {String} id 活动ID
 * @return {Promise} 活动详情
 */
const getActivityDetail = (id) => {
  return get(`/api/activities/${id}`);
};

/**
 * 参加活动
 * @param {String} id 活动ID
 * @param {Object} data 参加数据
 * @return {Promise} 参加结果
 */
const joinActivity = (id, data = {}) => {
  return post(`/api/activities/${id}/join`, data);
};

/**
 * 取消参加活动
 * @param {String} id 活动ID
 * @return {Promise} 取消结果
 */
const cancelJoinActivity = (id) => {
  return post(`/api/activities/${id}/cancel`);
};

/**
 * 收藏活动
 * @param {String} id 活动ID
 * @return {Promise} 收藏结果
 */
const favoriteActivity = (id) => {
  return post(`/api/activities/${id}/favorite`);
};

/**
 * 取消收藏活动
 * @param {String} id 活动ID
 * @return {Promise} 取消收藏结果
 */
const unfavoriteActivity = (id) => {
  return post(`/api/activities/${id}/unfavorite`);
};

/**
 * 评论活动
 * @param {String} id 活动ID
 * @param {Object} data 评论数据
 * @return {Promise} 评论结果
 */
const commentActivity = (id, data) => {
  return post(`/api/activities/${id}/comment`, data);
};

/**
 * 获取评论列表
 * @param {String} id 活动ID
 * @param {Object} params 查询参数
 * @return {Promise} 评论列表
 */
const getComments = (id, params = {}) => {
  return get(`/api/activities/${id}/comments`, params);
};

/**
 * 获取轮播图数据
 * @return {Promise} 轮播图数据
 */
const getBanners = () => {
  return get('/api/banners');
};

/**
 * 获取热门活动
 * @param {Object} params 查询参数
 * @return {Promise} 热门活动
 */
const getHotActivities = (params = {}) => {
  return get('/api/activities/hot', params);
};

/**
 * 获取社区活动
 * @param {Object} params 查询参数
 * @return {Promise} 社区活动
 */
const getCommunityActivities = (params = {}) => {
  return get('/api/activities/community', params);
};

/**
 * 获取未读消息数量
 * @return {Promise} 未读消息数量
 */
const getUnreadMessageCount = () => {
  return get('/api/messages/unread/count');
};

/**
 * 获取消息列表
 * @param {Object} params 查询参数
 * @return {Promise} 消息列表
 */
const getMessages = (params = {}) => {
  return get('/api/messages', params);
};

/**
 * 标记消息已读
 * @param {String} id 消息ID
 * @return {Promise} 标记结果
 */
const markMessageRead = (id) => {
  return put(`/api/messages/${id}/read`);
};

/**
 * 获取我的活动
 * @param {Object} params 查询参数
 * @return {Promise} 我的活动
 */
const getMyActivities = (params = {}) => {
  return get('/api/user/activities', params);
};

/**
 * 获取我的收藏
 * @param {Object} params 查询参数
 * @return {Promise} 我的收藏
 */
const getMyFavorites = (params = {}) => {
  return get('/api/user/favorites', params);
};

/**
 * 跳转到小程序内部页面
 * @param {String} url 要跳转的页面路径
 * @param {Object} params 页面参数
 */
const navigateTo = (url, params = {}) => {
  let queryString = '';
  
  // 将参数对象转为查询字符串
  if (Object.keys(params).length > 0) {
    queryString = '?' + Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
  }
  
  // 执行跳转
  wx.navigateTo({
    url: `${url}${queryString}`
  });
};

// 导出所有API方法
module.exports = {
  get,
  post,
  put,
  del,
  login,
  getUserInfo,
  getActivities,
  getActivityDetail,
  joinActivity,
  cancelJoinActivity,
  favoriteActivity,
  unfavoriteActivity,
  commentActivity,
  getComments,
  getBanners,
  getHotActivities,
  getCommunityActivities,
  getUnreadMessageCount,
  getMessages,
  markMessageRead,
  getMyActivities,
  getMyFavorites,
  navigateTo
};