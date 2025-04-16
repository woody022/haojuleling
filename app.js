// app.js
const util = require('./utils/util');
const cloudbaseAdapter = require('./utils/cloudbase-adapter');

App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    isLogin: false, // 增加一个兼容属性，和 isLoggedIn 保持同步
    isVip: false,
    vipExpireTime: null,
    systemInfo: null,
    statusBarHeight: 0,
    version: '1.0.0', // 应用版本号
    prefetchData: null, // 后台预拉取的数据
    isAgreedPrivacy: false,
    isOrgUser: false, // 是否是组织用户
    orgInfo: null, // 组织信息
    isAdmin: false, // 是否是管理员
    isSuperAdmin: false, // 是否是超级管理员
    userId: null, // 添加用户ID字段
    tabBarIndex: 0, // 底部菜单选中状态
    location: null, // 用户位置信息
    hasLocationAuth: false, // 是否有位置权限
    isGettingLocation: false, // 添加一个标志位，表示正在获取位置
    totalUnreadMessages: 0, // 未读消息总数
  },
  
  onLaunch() {
    // 检查隐私协议状态
    this.checkPrivacyAgreement();
    console.log('隐私协议同意状态:', this.globalData.isAgreedPrivacy);

    // 初始化 CloudBase 适配器兼容层
    cloudbaseAdapter.initCloudBaseAdapter();
    
    // 初始化云环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud-env-id',
        traceUser: true
      });
    } else {
      console.error('当前基础库版本过低，请升级微信或基础库版本');
    }

    // 获取状态栏高度（使用新的 API）
    try {
      const windowInfo = wx.getWindowInfo();
      this.globalData.statusBarHeight = windowInfo.statusBarHeight || 0;
      console.log('状态栏高度:', this.globalData.statusBarHeight);
    } catch (e) {
       console.error("获取窗口信息失败 (getWindowInfo):", e);
       this.globalData.statusBarHeight = 0; // Default value on error
    }
    
    // 注册微信用户隐私协议变更回调
    if (wx.onUserPrivacySettingChange) {
      wx.onUserPrivacySettingChange(res => {
        console.log('用户隐私设置变更:', res);
        
        // 更新本地隐私协议状态
        if (res.hasSensitiveAsset === false) {
          wx.setStorageSync('isAgreedPrivacy', false);
          // 用户关闭了敏感权限，清除登录状态
          this.clearLoginState();
        } else if (res.hasSensitiveAsset === true) {
          // 用户同意了敏感权限
          wx.setStorageSync('isAgreedPrivacy', true);
        }
      });
    }
    
    // 已同意隐私，则初始化后台预拉取
    if (this.globalData.isAgreedPrivacy) {
      this.initBackgroundFetch();
    }
    
    // 初始化检查登录状态
    this.checkLoginStatus();

    // 初始化用户信息
    this.initUserInfo();

    // 检查组织登录状态（确保在云环境初始化后调用）
    const isOrgUser = this.checkOrgLoginStatus();
    
    // 检查位置权限并获取位置
    this.checkLocationAuth();
  },
  
  /**
   * 检查隐私协议状态
   */
  checkPrivacyAgreement() {
    const isAgreedPrivacy = wx.getStorageSync('isAgreedPrivacy') || false;
    this.globalData.isAgreedPrivacy = isAgreedPrivacy;
    return isAgreedPrivacy;
  },
  
  /**
   * 确保隐私协议已同意
   * @param {Function} callback 同意后的回调
   * @return {Boolean} 是否已同意
   */
  ensurePrivacyAgreement(callback) {
    if (this.globalData.isAgreedPrivacy) {
      callback && callback();
      return true;
    }
    
    // 显示隐私协议弹窗
    this.showPrivacyAgreement(callback);
    return false;
  },
  
  /**
   * 检查登录状态
   */
  async checkLoginStatus() {
    try {
      // 获取存储的token
      const token = wx.getStorageSync('token');
      if (!token) {
        this.globalData.isLogin = false;
        this.globalData.isLoggedIn = false;
        return false;
      }
      
      // 验证token是否有效
      const isValid = await this.verifyToken(token);
      
      // 根据验证结果设置登录状态
      this.globalData.isLogin = isValid;
      this.globalData.isLoggedIn = isValid;
      return isValid;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.globalData.isLogin = false;
      this.globalData.isLoggedIn = false;
      return false;
    }
  },
  
  /**
   * 初始化用户信息
   */
  initUserInfo() {
    try {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        this.globalData.userId = userInfo._id || userInfo.userId;
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error);
    }
  },
  
  /**
   * 检查组织登录状态
   */
  checkOrgLoginStatus() {
    try {
      // 从本地存储获取组织信息
      const orgInfo = wx.getStorageSync('orgInfo');
      const isOrgUser = !!orgInfo;
      
      this.globalData.isOrgUser = isOrgUser;
      this.globalData.orgInfo = orgInfo;
      
      console.log('组织登录状态:', isOrgUser);
      return isOrgUser;
    } catch (error) {
      console.error('检查组织登录状态失败:', error);
      return false;
    }
  },
  
  /**
   * 检查位置权限
   */
  checkLocationAuth() {
    wx.getSetting({
      success: (res) => {
        // 判断是否有位置权限
        const hasLocationAuth = res.authSetting['scope.userLocation'] === true;
        this.globalData.hasLocationAuth = hasLocationAuth;
        
        console.log('位置权限状态:', hasLocationAuth);
        
        // 如果有位置权限，尝试获取位置
        if (hasLocationAuth) {
          this.getLocation();
        }
      },
      fail: (err) => {
        console.error('获取设置信息失败:', err);
      }
    });
  },
  
  /**
   * 获取地理位置
   */
  getLocation() {
    // 如果正在获取位置，不重复获取
    if (this.globalData.isGettingLocation) return;
    
    this.globalData.isGettingLocation = true;
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.globalData.location = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        console.log('获取位置成功:', this.globalData.location);
      },
      fail: (err) => {
        console.error('获取位置失败:', err);
        this.globalData.hasLocationAuth = false;
      },
      complete: () => {
        this.globalData.isGettingLocation = false;
      }
    });
  }
});