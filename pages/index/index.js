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
      wx.stopPullDownRefresh();
    }).catch(() => {
      this.setData({
        refreshing: false
      });
      wx.stopPullDownRefresh();
    });
  },
  
  /**
   * 页面上拉触底事件处理函数
   */
  onReachBottom: function () {
    // 如果还有更多数据且不在加载中，加载下一页
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreActivities();
    }
  },
  
  /**
   * 加载更多活动
   */
  loadMoreActivities: function() {
    // 增加页码
    this.setData({
      page: this.data.page + 1
    });
    
    // 加载数据
    this.loadActivities();
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
    
    // 同步到全局数据
    if (app.globalData) {
      app.globalData.isLogin = isLogin;
      if (isLogin && !app.globalData.userInfo) {
        app.globalData.userInfo = wx.getStorageSync('userInfo');
      }
    }
  },
  
  /**
   * 获取用户信息
   */
  fetchUserInfo: function() {
    if (!this.data.isLogin) return Promise.resolve(null);
    
    return wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'getUserInfo'
      }
    }).then(res => {
      if (res.result && res.result.code === 0) {
        const userInfo = res.result.data;
        
        // 更新存储的用户信息
        wx.setStorageSync('userInfo', userInfo);
        
        // 更新页面数据
        this.setData({
          userInfo
        });
        
        // 更新全局数据
        app.globalData.userInfo = userInfo;
        app.globalData.userId = userInfo._id || userInfo.userId;
        
        return userInfo;
      }
      return null;
    }).catch(err => {
      console.error('获取用户信息失败:', err);
      return null;
    });
  },
  
  /**
   * 获取未读消息数量
   */
  getUnreadCount: function() {
    if (!this.data.isLogin) return Promise.resolve(0);
    
    // 从云函数获取未读消息数量
    return wx.cloud.callFunction({
      name: 'notification',
      data: {
        action: 'getUnreadCount'
      }
    }).then(res => {
      if (res.result && res.result.count !== undefined) {
        const unreadCount = res.result.count || 0;
        this.setData({
          unreadCount
        });
        return unreadCount;
      }
      return 0;
    }).catch(err => {
      console.error('获取未读消息数量失败', err);
      return 0;
    });
  },

  /**
   * 加载活动
   */
  loadActivities: function() {
    if (this.data.loading || !this.data.hasMore) return Promise.resolve();

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

  /**
   * 加载推荐活动
   */
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
          return activities;
        } else {
          console.error('获取推荐活动失败:', res);
          wx.showToast({
            title: res?.message || '获取推荐活动失败',
            icon: 'none'
          });
          return [];
        }
      })
      .catch(err => {
        console.error('加载推荐活动出错:', err);
        throw err;
      });
  },

  /**
   * 处理返回的活动数据，实现瀑布流布局
   * @param {Array} activities 活动数组
   */
  processActivities: function(activities) {
    if (!activities || activities.length === 0) {
      this.setData({ hasMore: false });
      return;
    }
    
    let { leftActivities, rightActivities, totalCount } = this.data;
    let leftHeight = 0;
    let rightHeight = 0;
    
    // 如果是第一页，重置列表
    if (this.data.page === 1) {
      leftActivities = [];
      rightActivities = [];
      leftHeight = 0;
      rightHeight = 0;
    }
    
    // 处理每个活动数据
    activities.forEach(activity => {
      // 确保活动对象包含所有必要字段
      if (!activity.id && activity._id) {
        activity.id = activity._id;
      }
      
      // 根据活动类型计算卡片高度（这里简化处理，实际应该根据内容量计算）
      const isLarge = activity.type === 'offline' || (activity.images && activity.images.length > 2);
      const cardHeight = isLarge ? 450 : 380; // 模拟不同卡片的高度
      
      // 处理活动数据，添加额外属性
      const processedActivity = {
        ...activity,
        coverUrl: activityService.processActivityCover(activity.coverUrl),
        tag: activity.isHot ? '热门' : (activity.isRecommend ? '推荐' : '新发布'),
        coverType: isLarge ? 'cover-large' : 'cover-normal',
        cardHeight,
        // 确保enrollCount有值
        enrollCount: activity.enrollCount || 0,
        // 确保organizer有值
        organizer: activity.organizer || (activity.creator ? activity.creator.nickName : '主办方')
      };
      
      // 将活动添加到高度较低的一列
      if (leftHeight <= rightHeight) {
        leftActivities.push(processedActivity);
        leftHeight += cardHeight;
      } else {
        rightActivities.push(processedActivity);
        rightHeight += cardHeight;
      }
    });
    
    // 更新页面数据
    this.setData({
      leftActivities,
      rightActivities,
      totalCount: totalCount + activities.length,
      hasMore: activities.length >= this.data.pageSize
    });
  },
  
  /**
   * 获取热门活动
   */
  fetchHotActivities: function() {
    return activityService.getHotActivities({ pageSize: 6 })
      .then(res => {
        if (res && res.code === 0) {
          // 确保数据中包含必要字段
          const activities = (res.data.list || []).map(item => {
            if (!item.id && item._id) {
              item.id = item._id;
            }
            return {
              ...item,
              enrollCount: item.enrollCount || 0,
              organizer: item.organizer || (item.creator ? item.creator.nickName : '主办方')
            };
          });
          
          this.setData({
            hotActivities: activities
          });
          return activities;
        } else {
          console.error('获取热门活动失败:', res);
          return [];
        }
      })
      .catch(err => {
        console.error('获取热门活动出错:', err);
        return [];
      });
  },
  
  /**
   * 获取社区活动
   */
  fetchCommunityActivities: function() {
    return activityService.getCommunityActivities({ pageSize: 6 })
      .then(res => {
        if (res && res.code === 0) {
          // 确保数据中包含必要字段
          const activities = (res.data.list || []).map(item => {
            if (!item.id && item._id) {
              item.id = item._id;
            }
            return {
              ...item,
              enrollCount: item.enrollCount || 0,
              organizer: item.organizer || (item.creator ? item.creator.nickName : '主办方')
            };
          });
          
          this.setData({
            communityActivities: activities
          });
          return activities;
        } else {
          console.error('获取社区活动失败:', res);
          return [];
        }
      })
      .catch(err => {
        console.error('获取社区活动出错:', err);
        return [];
      });
  },
  
  /**
   * 加载轮播图数据
   */
  loadBannerData: function() {
    return activityService.getBanners()
      .then(res => {
        if (res && res.code === 0) {
          // 确保轮播图数据有完整的字段
          const banners = (res.data || []).map(banner => {
            return {
              ...banner,
              // 设置默认值，避免未定义错误
              category: banner.category || '活动',
              title: banner.title || '精彩活动',
              price: banner.price || '免费'
            };
          });
          
          this.setData({
            bannerList: banners
          });
          return banners;
        } else {
          console.error('获取轮播图数据失败:', res);
          return [];
        }
      })
      .catch(err => {
        console.error('获取轮播图数据出错:', err);
        return [];
      });
  },
  
  /**
   * 轮播图切换事件
   */
  onBannerChange: function(e) {
    this.setData({
      currentBannerIndex: e.detail.current
    });
  },
  
  /**
   * 点击轮播图
   */
  onBannerTap: function(e) {
    const { id } = e.currentTarget.dataset;
    if (id) {
      // 如果是活动ID，跳转到活动详情
      routerService.openActivityDetail(id);
    }
  },
  
  /**
   * 切换导航类型
   */
  switchNavType: function(e) {
    const { type } = e.currentTarget.dataset;
    console.log('切换导航类型:', type);
    
    // 根据类型跳转到相应页面
    if (type === 'hot') {
      // 热门活动
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'hot' });
    } else if (type === 'recommend') {
      // 推荐活动
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'recommend' });
    } else if (type === 'nearby') {
      // 附近活动
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'nearby' });
    } else if (type === 'soon') {
      // 即将开始
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'soon' });
    }
  },
  
  /**
   * 查看更多活动
   */
  viewMoreActivities: function(e) {
    const { type } = e.currentTarget.dataset;
    console.log('查看更多:', type);
    
    // 根据类型跳转到相应页面
    if (type === 'hot') {
      // 热门活动
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'hot' });
    } else if (type === 'community') {
      // 社区活动
      routerService.navigateTo('/packageActivity/pages/activityList/activityList', { type: 'community' });
    }
  },
  
  /**
   * 跳转到活动详情
   */
  navigateToActivityDetail: function(e) {
    const { id } = e.currentTarget.dataset;
    if (!id) {
      console.error('缺少活动ID');
      return;
    }
    routerService.openActivityDetail(id);
  },
  
  /**
   * 前往消息页面
   */
  navigateToMessages: function() {
    if (!this.data.isLogin) {
      return checkAndTipLogin(() => {
        routerService.openMessages();
      });
    }
    routerService.openMessages();
  },
  
  /**
   * 切换底部标签
   */
  switchTab: function(e) {
    const { index } = e.currentTarget.dataset;
    routerService.switchTab(parseInt(index, 10));
  },
  
  /**
   * 显示发布选项
   */
  showPublishOptions: function() {
    // 检查登录状态
    if (!this.data.isLogin) {
      return checkAndTipLogin(() => {
        this.showPublishOptions();
      });
    }
    
    wx.showActionSheet({
      itemList: ['发布活动'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 发布活动
          routerService.openActivityCreate();
        }
      }
    });
  },
  
  /**
   * 图片加载错误处理
   */
  onImageError: function(e) {
    const { index } = e.currentTarget.dataset;
    console.log('图片加载错误:', index);
    
    // 解析索引，格式例如 "hot-0"
    const [type, idx] = index.split('-');
    const i = parseInt(idx, 10);
    
    if (type === 'hot' && this.data.hotActivities[i]) {
      // 更新热门活动列表中的图片路径为默认图片
      const newHotActivities = [...this.data.hotActivities];
      newHotActivities[i].coverUrl = '/assets/images/default-activity-cover.jpg';
      this.setData({
        hotActivities: newHotActivities
      });
    } else if (type === 'community' && this.data.communityActivities[i]) {
      // 更新社区活动列表中的图片路径为默认图片
      const newCommunityActivities = [...this.data.communityActivities];
      newCommunityActivities[i].coverUrl = '/assets/images/default-activity-cover.jpg';
      this.setData({
        communityActivities: newCommunityActivities
      });
    }
  }
});