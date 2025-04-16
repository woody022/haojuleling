/**
 * 路由服务
 * 提供小程序页面跳转相关功能
 */

/**
 * 根据路径和参数跳转到对应页面
 * @param {String} path 页面路径
 * @param {Object} params 页面参数
 * @param {Object} options 跳转选项
 */
const navigateTo = (path, params = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    // 处理参数
    let url = path;
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => {
          // 对参数进行编码
          const value = typeof params[key] === 'object' 
            ? JSON.stringify(params[key]) 
            : params[key];
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');
      url = `${path}?${queryString}`;
    }
    
    // 检查页面是否需要登录
    if (options.needLogin === true) {
      const app = getApp();
      if (!app.globalData.isLogin) {
        // 如果需要登录但未登录，跳转到登录页面
        wx.navigateTo({
          url: `/pages/login/login?redirect=${encodeURIComponent(url)}`,
          success: resolve,
          fail: reject
        });
        return;
      }
    }
    
    // 默认跳转行为
    const navigateAction = options.redirect ? wx.redirectTo : wx.navigateTo;
    
    // 执行页面跳转
    navigateAction({
      url,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 切换到 tabBar 页面
 * @param {String|Number} pageIndex 页面索引或路径
 */
const switchTab = (pageIndex) => {
  return new Promise((resolve, reject) => {
    let url;
    
    // 处理不同类型的入参
    if (typeof pageIndex === 'number') {
      // 如果是数字索引，根据索引获取路径
      const tabBarPages = [
        '/pages/index/index',
        '/pages/activity/activity',
        '/pages/profile/profile',
        '/pages/community/community'
      ];
      url = tabBarPages[pageIndex] || '/pages/index/index';
    } else if (typeof pageIndex === 'string') {
      // 如果是字符串，直接使用
      url = pageIndex;
    } else {
      reject(new Error('无效的页面索引'));
      return;
    }
    
    // 执行切换
    wx.switchTab({
      url,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 返回上一页面
 * @param {Object} params 页面参数
 */
const navigateBack = (params = {}) => {
  return new Promise((resolve, reject) => {
    // 如果有参数，则传给上一页
    if (Object.keys(params).length > 0) {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2]; // 上一页
      
      if (prevPage) {
        // 调用上一页的设置数据方法
        prevPage.setData(params);
      }
    }
    
    // 返回上一页
    wx.navigateBack({
      delta: 1,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param {String} path 页面路径
 * @param {Object} params 页面参数
 */
const redirectTo = (path, params = {}) => {
  return navigateTo(path, params, { redirect: true });
};

/**
 * 关闭所有页面，打开到应用内的某个页面
 * @param {String} path 页面路径
 * @param {Object} params 页面参数
 */
const reLaunch = (path, params = {}) => {
  return new Promise((resolve, reject) => {
    // 处理参数
    let url = path;
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => {
          const value = typeof params[key] === 'object' 
            ? JSON.stringify(params[key]) 
            : params[key];
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join('&');
      url = `${path}?${queryString}`;
    }
    
    // 重新启动应用并打开页面
    wx.reLaunch({
      url,
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 打开微信内置Web页面
 * @param {String} url 网页链接
 */
const openWebview = (url) => {
  return navigateTo('/pages/webview/webview', { url });
};

/**
 * 打开活动详情页
 * @param {String|Object} activity 活动ID或活动对象
 */
const openActivityDetail = (activity) => {
  // 支持传入活动ID或活动对象
  const activityId = typeof activity === 'object' ? activity.id || activity._id : activity;
  
  return navigateTo('/pages/activity-detail/activity-detail', { id: activityId });
};

/**
 * 打开活动报名页面
 * @param {String} activityId 活动ID
 */
const openActivityJoin = (activityId) => {
  return navigateTo('/packageActivity/pages/activityJoin/activityJoin', { id: activityId }, { needLogin: true });
};

/**
 * 打开活动参与者列表
 * @param {String} activityId 活动ID
 */
const openParticipantsList = (activityId) => {
  return navigateTo('/packageActivity/pages/participants/participants', { id: activityId });
};

/**
 * 打开活动发布页面
 */
const openActivityCreate = () => {
  return navigateTo('/packageActivity/pages/activityCreate/activityCreate', {}, { needLogin: true });
};

/**
 * 打开我的活动页面
 * @param {Number} tabIndex 标签页索引
 */
const openMyActivities = (tabIndex = 0) => {
  return navigateTo('/packageActivity/pages/myActivities/myActivities', { tabIndex }, { needLogin: true });
};

/**
 * 打开我的收藏页面
 */
const openMyFavorites = () => {
  return navigateTo('/packageMine/pages/myFavorites/myFavorites', {}, { needLogin: true });
};

/**
 * 打开个人信息编辑页面
 */
const openProfileEdit = () => {
  return navigateTo('/packageMine/pages/profile-edit/profile-edit', {}, { needLogin: true });
};

/**
 * 打开消息页面
 */
const openMessages = () => {
  return navigateTo('/pages/messages/messages', {}, { needLogin: true });
};

/**
 * 打开VIP中心
 */
const openVipCenter = () => {
  return navigateTo('/packageVip/pages/vipCenter/vipCenter', {}, { needLogin: true });
};

/**
 * 打开VIP权益页面
 */
const openVipBenefits = () => {
  return navigateTo('/packageVip/pages/vipBenefits/vipBenefits');
};

/**
 * 打开登录页面
 * @param {String} redirect 登录后跳转的页面路径
 */
const openLogin = (redirect) => {
  const params = redirect ? { redirect } : {};
  return navigateTo('/pages/login/login', params);
};

/**
 * 打开关于页面
 */
const openAbout = () => {
  return navigateTo('/pages/about/about');
};

/**
 * 打开反馈页面
 */
const openFeedback = () => {
  return navigateTo('/pages/feedback/feedback', {}, { needLogin: true });
};

/**
 * 打开设置页面
 */
const openSettings = () => {
  return navigateTo('/packageMine/pages/settings/settings');
};

/**
 * 打开活动海报页面
 * @param {String} activityId 活动ID
 */
const openActivityPoster = (activityId) => {
  return navigateTo('/packageActivity/pages/poster/poster', { id: activityId });
};

// 导出所有路由方法
module.exports = {
  navigateTo,
  switchTab,
  navigateBack,
  redirectTo,
  reLaunch,
  openWebview,
  openActivityDetail,
  openActivityJoin,
  openParticipantsList,
  openActivityCreate,
  openMyActivities,
  openMyFavorites,
  openProfileEdit,
  openMessages,
  openVipCenter,
  openVipBenefits,
  openLogin,
  openAbout,
  openFeedback,
  openSettings,
  openActivityPoster
};