/**
 * 活动服务
 * 提供活动相关的功能接口
 */

const app = getApp();
const util = require('../../utils/util');

/**
 * 获取活动列表
 * @param {Object} params 查询参数
 * @return {Promise} 查询结果
 */
const getActivityList = (params = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getActivityList',
        params
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '获取活动列表失败' });
      }
    })
    .catch(err => {
      console.error('调用活动云函数出错:', err);
      reject({ code: -1, message: '获取活动列表失败', error: err });
    });
  });
};

/**
 * 获取活动详情
 * @param {String} id 活动ID
 * @return {Promise} 活动详情
 */
const getActivityDetail = (id) => {
  return new Promise((resolve, reject) => {
    if (!id) {
      reject({ code: -1, message: '活动ID不能为空' });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getActivityDetail',
        id
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '获取活动详情失败' });
      }
    })
    .catch(err => {
      console.error('调用活动详情云函数出错:', err);
      reject({ code: -1, message: '获取活动详情失败', error: err });
    });
  });
};

/**
 * 处理活动封面图片路径
 * @param {String} coverUrl 封面图片路径
 * @return {String} 处理后的图片路径
 */
const processActivityCover = (coverUrl) => {
  if (!coverUrl) {
    // 使用默认封面
    return '/assets/images/default-activity-cover.jpg';
  }
  
  // 如果是相对路径，返回完整路径
  if (coverUrl.startsWith('/')) {
    return coverUrl;
  }
  
  // 如果是云存储相对路径，添加域名
  if (coverUrl.startsWith('cloud://')) {
    return coverUrl;
  }
  
  // 如果已经是完整URL，直接返回
  if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
    return coverUrl;
  }
  
  // 其他情况将其视为用户上传文件ID，返回完整路径
  return coverUrl;
};

/**
 * 获取热门活动
 * @param {Object} params 查询参数
 * @return {Promise} 热门活动
 */
const getHotActivities = (params = {}) => {
  return new Promise((resolve, reject) => {
    // 构造查询参数
    const queryParams = {
      ...params,
      isHot: true,
      pageSize: params.pageSize || 10
    };
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getActivityList',
        params: queryParams
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        // 处理活动数据
        const activities = res.result.data?.list || [];
        
        // 处理每个活动的封面图片
        const processedActivities = activities.map(activity => ({
          ...activity,
          coverUrl: processActivityCover(activity.coverUrl),
          tag: '热门',
          // 根据活动类型设置封面类型
          coverType: activity.type === 'offline' ? 'cover-large' : 'cover-normal'
        }));
        
        resolve({
          code: 0,
          data: {
            list: processedActivities,
            total: res.result.data?.total || 0
          }
        });
      } else {
        reject(res.result || { code: -1, message: '获取热门活动失败' });
      }
    })
    .catch(err => {
      console.error('调用热门活动云函数出错:', err);
      reject({ code: -1, message: '获取热门活动失败', error: err });
    });
  });
};

/**
 * 获取社区活动
 * @param {Object} params 查询参数
 * @return {Promise} 社区活动
 */
const getCommunityActivities = (params = {}) => {
  return new Promise((resolve, reject) => {
    // 构造查询参数
    const queryParams = {
      ...params,
      isCommunity: true,
      pageSize: params.pageSize || 10
    };
    
    // 如果有位置信息，添加到查询参数
    if (app.globalData.location) {
      queryParams.location = app.globalData.location;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getActivityList',
        params: queryParams
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        // 处理活动数据
        const activities = res.result.data?.list || [];
        
        // 处理每个活动的封面图片
        const processedActivities = activities.map(activity => ({
          ...activity,
          coverUrl: processActivityCover(activity.coverUrl),
          tag: '社区',
          // 根据活动类型设置封面类型
          coverType: activity.type === 'offline' ? 'cover-large' : 'cover-normal'
        }));
        
        resolve({
          code: 0,
          data: {
            list: processedActivities,
            total: res.result.data?.total || 0
          }
        });
      } else {
        reject(res.result || { code: -1, message: '获取社区活动失败' });
      }
    })
    .catch(err => {
      console.error('调用社区活动云函数出错:', err);
      reject({ code: -1, message: '获取社区活动失败', error: err });
    });
  });
};

/**
 * 获取轮播图数据
 * @return {Promise} 轮播图数据
 */
const getBanners = () => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'common',
      data: {
        action: 'getBanners'
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        // 处理轮播图数据
        const banners = res.result.data || [];
        
        // 设置每个轮播图的背景色渐变
        const gradientColors = [
          'linear-gradient(45deg, #3B82F6, #60A5FA)',  // 蓝色渐变
          'linear-gradient(45deg, #10B981, #34D399)',  // 绿色渐变
          'linear-gradient(45deg, #F59E0B, #FBBF24)',  // 黄色渐变
          'linear-gradient(45deg, #EF4444, #F87171)'   // 红色渐变
        ];
        
        const processedBanners = banners.map((banner, index) => ({
          ...banner,
          imageUrl: processActivityCover(banner.imageUrl),
          gradientColor: banner.gradientColor || gradientColors[index % gradientColors.length]
        }));
        
        resolve({
          code: 0,
          data: processedBanners
        });
      } else {
        reject(res.result || { code: -1, message: '获取轮播图数据失败' });
      }
    })
    .catch(err => {
      console.error('调用轮播图云函数出错:', err);
      reject({ code: -1, message: '获取轮播图数据失败', error: err });
    });
  });
};

/**
 * 参加活动
 * @param {String} activityId 活动ID
 * @param {Object} data 参与信息
 * @return {Promise} 参加结果
 */
const joinActivity = (activityId, data = {}) => {
  return new Promise((resolve, reject) => {
    if (!activityId) {
      reject({ code: -1, message: '活动ID不能为空' });
      return;
    }
    
    // 检查登录状态
    if (!app.globalData.isLogin) {
      reject({ code: 401, message: '请先登录' });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'joinActivity',
        activityId,
        data
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '参加活动失败' });
      }
    })
    .catch(err => {
      console.error('调用参加活动云函数出错:', err);
      reject({ code: -1, message: '参加活动失败', error: err });
    });
  });
};

/**
 * 取消参加活动
 * @param {String} activityId 活动ID
 * @return {Promise} 取消结果
 */
const cancelJoinActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    if (!activityId) {
      reject({ code: -1, message: '活动ID不能为空' });
      return;
    }
    
    // 检查登录状态
    if (!app.globalData.isLogin) {
      reject({ code: 401, message: '请先登录' });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'cancelJoinActivity',
        activityId
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '取消参加活动失败' });
      }
    })
    .catch(err => {
      console.error('调用取消参加活动云函数出错:', err);
      reject({ code: -1, message: '取消参加活动失败', error: err });
    });
  });
};

/**
 * 收藏活动
 * @param {String} activityId 活动ID
 * @return {Promise} 收藏结果
 */
const favoriteActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    if (!activityId) {
      reject({ code: -1, message: '活动ID不能为空' });
      return;
    }
    
    // 检查登录状态
    if (!app.globalData.isLogin) {
      reject({ code: 401, message: '请先登录' });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'favoriteActivity',
        activityId
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '收藏活动失败' });
      }
    })
    .catch(err => {
      console.error('调用收藏活动云函数出错:', err);
      reject({ code: -1, message: '收藏活动失败', error: err });
    });
  });
};

/**
 * 取消收藏活动
 * @param {String} activityId 活动ID
 * @return {Promise} 取消收藏结果
 */
const unfavoriteActivity = (activityId) => {
  return new Promise((resolve, reject) => {
    if (!activityId) {
      reject({ code: -1, message: '活动ID不能为空' });
      return;
    }
    
    // 检查登录状态
    if (!app.globalData.isLogin) {
      reject({ code: 401, message: '请先登录' });
      return;
    }
    
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'unfavoriteActivity',
        activityId
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        resolve(res.result);
      } else {
        reject(res.result || { code: -1, message: '取消收藏活动失败' });
      }
    })
    .catch(err => {
      console.error('调用取消收藏活动云函数出错:', err);
      reject({ code: -1, message: '取消收藏活动失败', error: err });
    });
  });
};

// 导出请求方法
module.exports = {
  getActivityList,
  getActivityDetail,
  getHotActivities,
  getCommunityActivities,
  getBanners,
  joinActivity,
  cancelJoinActivity,
  favoriteActivity,
  unfavoriteActivity,
  processActivityCover
};