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
    cachedUsers: {} // 用户信息缓存
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
    
    // 如果是组织用户，获取未读消息数量
    if (isOrgUser) {
      setTimeout(() => {
        this.getUnreadMessageCount();
      }, 1500);
    }
  },
  
  /**
   * 初始化后台预拉取
   */
  initBackgroundFetch() {
    // 如果用户已同意隐私协议，尝试开启后台预拉取
    if (this.globalData.isAgreedPrivacy) {
      try {
        // 尝试获取后台预拉取数据
        if (wx.getBackgroundFetchData) {
          wx.getBackgroundFetchData({
            fetchType: 'pre',
            success: res => {
              console.log('成功获取预拉取数据:', res);
              // 处理预拉取的数据
              if (res.fetchedData) {
                try {
                  const data = JSON.parse(res.fetchedData);
                  if (data && data.timestamp) {
                    console.log('预拉取数据时间戳:', new Date(data.timestamp));
                    // 设置到全局数据
                    this.globalData.prefetchData = data;
                  }
                } catch (error) {
                  console.error('解析预拉取数据失败:', error);
                }
              }
            },
            fail: err => {
              console.info('获取预拉取数据状态:', err.errMsg);
              
              // 数据不存在是正常的，不需要特殊处理
              if (err.errMsg && err.errMsg.includes('data not found')) {
                console.info('预拉取数据不存在，这是正常情况');
                
                // 设置默认的预拉取数据
                this.setDefaultPrefetchData();
              }
            }
          });
        } else {
          console.info('当前基础库不支持后台预拉取功能');
          // 不支持预拉取功能时，设置默认数据
          this.setDefaultPrefetchData();
        }
        
        // 设置后台预拉取配置
        if (wx.setBackgroundFetchToken) {
          try {
            const token = wx.getStorageSync('token') || '';
            wx.setBackgroundFetchToken({
              token: token,
              success: () => {
                console.log('后台预拉取token设置成功');
              },
              fail: (err) => {
                console.info('后台预拉取token设置失败:', err);
              }
            });
          } catch (error) {
            console.info('设置后台预拉取token时发生错误:', error);
          }
        }
      } catch (outerError) {
        console.info('后台预拉取初始化过程中发生错误:', outerError);
        // 确保设置默认数据
        this.setDefaultPrefetchData();
      }
    } else {
      console.info('用户未同意隐私政策，不初始化后台预拉取');
      this.setDefaultPrefetchData();
    }
  },
  
  /**
   * 设置默认的预拉取数据
   */
  setDefaultPrefetchData() {
    this.globalData.prefetchData = {
      timestamp: Date.now(),
      activities: [],
      banners: [],
      notices: []
    };
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
   * @param {String} sceneName 场景名称
   * @return {Boolean} 是否已同意
   */
  ensurePrivacyAgreement(callback, sceneName = '') {
    if (this.globalData.isAgreedPrivacy) {
      callback && callback();
      return true;
    }
    
    // 显示隐私协议弹窗
    this.showPrivacyAgreement(callback, sceneName);
    return false;
  },
  
  /**
   * 显示隐私协议弹窗
   * @param {Function} callback 同意后的回调
   * @param {String} sceneName 场景名称
   */
  showPrivacyAgreement(callback, sceneName = '') {
    // 检查是否支持小程序隐私信息API
    if (wx.requirePrivacyAuthorize && wx.getPrivacySetting) {
      // 使用小程序官方的隐私协议弹窗
      wx.getPrivacySetting({
        success: res => {
          if (res.needAuthorization) {
            // 需要弹窗授权
            wx.requirePrivacyAuthorize({
              success: () => {
                // 用户同意了隐私协议
                wx.setStorageSync('isAgreedPrivacy', true);
                this.globalData.isAgreedPrivacy = true;
                console.log('用户同意了隐私协议');
                
                // 初始化后台预拉取
                this.initBackgroundFetch();
                
                // 回调
                callback && callback();
              },
              fail: err => {
                // 用户拒绝了隐私协议
                console.log('用户拒绝了隐私协议:', err);
                wx.setStorageSync('isAgreedPrivacy', false);
                this.globalData.isAgreedPrivacy = false;
              }
            });
          } else {
            // 不需要弹窗，用户已同意
            wx.setStorageSync('isAgreedPrivacy', true);
            this.globalData.isAgreedPrivacy = true;
            callback && callback();
          }
        },
        fail: err => {
          console.error('获取隐私设置失败:', err);
          // 失败时使用传统的隐私协议弹窗
          this.showLegacyPrivacyAgreement(callback);
        }
      });
    } else {
      // 基础库版本低，使用自定义的隐私协议弹窗
      this.showLegacyPrivacyAgreement(callback);
    }
  },
  
  /**
   * 显示传统的隐私协议弹窗
   * @param {Function} callback 同意后的回调
   */
  showLegacyPrivacyAgreement(callback) {
    wx.showModal({
      title: '隐私授权提示',
      content: '欢迎使用好聚乐龄小程序！为了更好地为您提供服务，我们需要收集您的一些信息，包括设备信息、位置信息等。请点击“查看隐私协议”并同意继续使用我们的小程序。',
      confirmText: '同意并继续',
      cancelText: '不同意',
      success: (res) => {
        if (res.confirm) {
          // 用户点击同意并继续
          wx.setStorageSync('isAgreedPrivacy', true);
          this.globalData.isAgreedPrivacy = true;
          
          // 初始化后台预拉取
          this.initBackgroundFetch();
          
          // 回调
          callback && callback();
        } else {
          // 用户点击不同意
          wx.setStorageSync('isAgreedPrivacy', false);
          this.globalData.isAgreedPrivacy = false;
        }
      }
    });
  },
  
  /**
   * 验证token是否有效
   * @param {String} token 要验证的token
   * @return {Promise<Boolean>} 验证结果
   */
  verifyToken(token) {
    return new Promise((resolve) => {
      // 如果没有token，直接返回失败
      if (!token) {
        resolve(false);
        return;
      }
      
      // 调用云函数验证token
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'verifyToken',
          token
        }
      })
      .then(res => {
        if (res.result && res.result.code === 0) {
          resolve(true);
        } else {
          this.clearLoginState();
          resolve(false);
        }
      })
      .catch(() => {
        this.clearLoginState();
        resolve(false);
      });
    });
  },
  
  /**
   * 清除登录状态
   */
  clearLoginState() {
    // 清除存储的登录状态
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    // 重置全局状态
    this.globalData.isLogin = false;
    this.globalData.isLoggedIn = false;
    this.globalData.userInfo = null;
    this.globalData.userId = null;
    this.globalData.isVip = false;
    this.globalData.vipExpireTime = null;
    
    console.log('登录状态已清除');
  },
  
  /**
   * 检查VIP状态
   */
  checkVipStatus() {
    return new Promise((resolve, reject) => {
      // 如果未登录，直接返回非VIP
      if (!this.globalData.isLogin) {
        this.globalData.isVip = false;
        this.globalData.vipExpireTime = null;
        resolve({
          isVip: false,
          vipExpireTime: null
        });
        return;
      }
      
      // 调用云函数获取VIP状态
      wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'getVipStatus'
        }
      })
      .then(res => {
        if (res.result && res.result.code === 0) {
          const { isVip, vipExpireTime } = res.result.data;
          
          // 更新全局状态
          this.globalData.isVip = isVip;
          this.globalData.vipExpireTime = vipExpireTime;
          
          resolve({
            isVip,
            vipExpireTime
          });
        } else {
          this.globalData.isVip = false;
          this.globalData.vipExpireTime = null;
          reject(res.result || { code: -1, message: '获取VIP状态失败' });
        }
      })
      .catch(err => {
        console.error('检查VIP状态出错:', err);
        this.globalData.isVip = false;
        this.globalData.vipExpireTime = null;
        reject({ code: -1, message: '获取VIP状态失败', error: err });
      });
    });
  },
  
  /**
   * 获取未读消息数量
   * @param {Function} callback 回调函数
   */
  getUnreadMessageCount(callback) {
    // 如果未登录，不获取消息数量
    if (!this.globalData.isLogin) {
      this.globalData.totalUnreadMessages = 0;
      callback && callback(0);
      return;
    }
    
    // 调用云函数获取未读消息数量
    wx.cloud.callFunction({
      name: 'notification',
      data: {
        action: 'getUnreadCount'
      }
    })
    .then(res => {
      if (res.result && res.result.code === 0) {
        const count = res.result.count || 0;
        this.globalData.totalUnreadMessages = count;
        
        // 更新底部菜单消息小红点
        this.updateMessageBadge(count);
        
        callback && callback(count);
        
        console.log('获取到未读消息数量:', count);
      } else {
        console.error('获取未读消息数量失败:', res);
        callback && callback(0);
      }
    })
    .catch(err => {
      console.error('获取未读消息数量出错:', err);
      callback && callback(0);
    });
  },
  
  /**
   * 更新底部菜单消息小红点
   * @param {Number} count 消息数量
   */
  updateMessageBadge(count) {
    if (typeof count !== 'number') {
      count = 0;
    }
    
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      
      // 更新当前页面的TabBar
      if (currentPage && typeof currentPage.getTabBar === 'function') {
        const tabBar = currentPage.getTabBar();
        if (tabBar) {
          tabBar.setData({
            unreadCount: count
          });
        }
      }
      
      // 设置微信消息数量标记
      if (count > 0) {
        if (count > 99) {
          wx.setTabBarBadge({
            index: 1,  // 消息标签索引
            text: '99+'
          });
        } else {
          wx.setTabBarBadge({
            index: 1,
            text: count.toString()
          });
        }
      } else {
        wx.removeTabBarBadge({
          index: 1
        });
      }
    } catch (error) {
      console.error('更新消息小红点失败:', error);
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