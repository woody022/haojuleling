const app = getApp();
const { checkIsLogin, checkAndTipLogin } = require('../../utils/util');
const api = require('../../api/index');
const util = require('../../utils/util');
// 导入路由服务
const routerService = require('../../common/services/routerService');
// 导入活动服务
const activityService = require('../../common/services/activityService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 通用数据
    isLogin: false,
    userInfo: null,
    unreadCount: 0,
    
    leftActivities: [],
    rightActivities: [],
    loading: false,
    hasMore: true,
    refreshing: false,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    isLikeOpeating: false, // 收藏操作中标志
    showTopBtn: false, // 控制返回顶部按钮显示

    // 热门活动数据
    hotActivities: [],
    
    // 社区活动数据
    communityActivities: [],
    
    // 轮播图当前索引
    currentBannerIndex: 0,
    bannerList: [] // 轮播图列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化用户缓存
    if (!app.globalData.cachedUsers) {
      app.globalData.cachedUsers = {};
    }
    
    this.checkLoginStatus();
    this.loadActivities();
    this.fetchUserInfo();
    this.fetchHotActivities(); // 获取热门活动数据
    this.fetchCommunityActivities(); // 获取社区活动数据
    this.loadBannerData(); // 加载轮播图数据
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 设置底部菜单选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setTabData({
        selected: 0  // 首页索引
      });
    }
    
    // 检查登录状态，可能从其他页面登录后返回
    this.checkLoginStatus();
    
    // 刷新未读消息数量
    this.getUnreadCount();
    
    // 检查活动数据是否为空，如果为空则自动刷新
    if ((this.data.leftActivities.length === 0 && this.data.rightActivities.length === 0) && !this.data.loading) {
      console.log('活动列表为空，自动刷新');
      this.loadActivities();
    }

    // 刷新热门活动数据和社区活动数据
    this.fetchHotActivities();
    this.fetchCommunityActivities();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      leftActivities: [],
      rightActivities: [],
      page: 1,
      hasMore: true,
      refreshing: true
    });
    
    this.loadActivities().then(() => {
      this.setData({
        refreshing: false
      });
    });
  },
  
  /**
   * 检查登录状态
   */
  checkLoginStatus: function() {
    const isLogin = checkIsLogin();
    this.setData({
      isLogin,
      userInfo: isLogin ? wx.getStorageSync('userInfo') : null
    });
  },
  
  /**
   * 获取未读消息数量
   */
  getUnreadCount: function() {
    if (!this.data.isLogin) return;
    
    // 从云函数获取未读消息数量
    wx.cloud.callFunction({
      name: 'notification',
      data: {
        action: 'getUnreadCount'
      }
    }).then(res => {
      if (res.result && res.result.count !== undefined) {
        this.setData({
          unreadCount: res.result.count || 0
        });
      }
    }).catch(err => {
      console.error('获取未读消息数量失败', err);
    });
  },

  // 加载活动
  loadActivities: function() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    // 加载首页推荐活动
    return this.loadRecommendedActivities().then(() => {
      this.setData({ loading: false });
    }).catch(err => {
      console.error('加载活动失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    });
  },

  // 加载推荐活动
  loadRecommendedActivities: function() {
    // 构建查询参数
    const params = {
      page: this.data.page,
      pageSize: this.data.pageSize,
      isRecommend: true,
      includeCreator: true
    };
    
    // 使用活动服务获取精选活动
    return activityService.getActivityList(params)
      .then(res => {
        console.log('加载推荐活动返回:', res);
        
        // 处理返回的活动数据
        if (res && res.code === 0) {
          const activities = res.data?.list || [];
          console.log(`获取到${activities.length}个推荐活动`);
          
          // 处理活动数据
          this.processActivities(activities);
        } else {
          console.error('获取推荐活动失败:', res);
          wx.showToast({
            title: res?.message || '获取推荐活动失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('加载推荐活动出错:', err);
        throw err;
      });
  },

  // 处理返回的活动数据
  processActivities: function(activities) {
    if (!activities || activities.length === 0) {
      this.setData({ hasMore: false });
      return;
    }
  }
});