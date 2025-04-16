// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync()
    
    // 获取胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect()
    
    // 计算导航栏高度
    const statusBarHeight = systemInfo.statusBarHeight
    const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height + statusBarHeight
    
    this.globalData.systemInfo = systemInfo
    this.globalData.menuButtonInfo = menuButtonInfo
    this.globalData.statusBarHeight = statusBarHeight
    this.globalData.navBarHeight = navBarHeight

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          // 登录成功，获取用户信息
          this.getUserInfo()
          
          // 这里可以调用后端接口，获取openId等信息
          // wx.request({
          //   url: 'https://example.com/api/login',
          //   data: {
          //     code: res.code
          //   },
          //   success: res => {
          //     this.globalData.openid = res.data.openid
          //     this.globalData.sessionKey = res.data.sessionKey
          //     
          //     // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          //     // 所以此处加入 callback 以防止这种情况
          //     if (this.userInfoReadyCallback) {
          //       this.userInfoReadyCallback(res.data)
          //     }
          //   }
          // })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
  },
  
  getUserInfo() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          // 未授权，跳转到授权页面
          // wx.navigateTo({
          //   url: '/pages/auth/index'
          // })
        }
      }
    })
  },
  
  // 全局数据
  globalData: {
    userInfo: null,
    openid: null,
    sessionKey: null,
    isLogin: false,
    systemInfo: null,
    menuButtonInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
    
    // 活动类型
    activityTypes: [
      { id: 1, name: '运动健身', icon: '/images/activity/sports.png' },
      { id: 2, name: '户外探险', icon: '/images/activity/outdoor.png' },
      { id: 3, name: '志愿服务', icon: '/images/activity/volunteer.png' },
      { id: 4, name: '文化艺术', icon: '/images/activity/culture.png' },
      { id: 5, name: '教育学习', icon: '/images/activity/education.png' },
      { id: 6, name: '社交聚会', icon: '/images/activity/social.png' },
      { id: 7, name: '其他', icon: '/images/activity/other.png' }
    ]
  }
})