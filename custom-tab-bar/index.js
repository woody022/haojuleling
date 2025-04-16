Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "/assets/images/tabbar/home.png",
        selectedIconPath: "/assets/images/tabbar/home-active.png"
      },
      {
        pagePath: "/pages/activity/activity",
        text: "活动",
        iconPath: "/assets/images/tabbar/message.png",
        selectedIconPath: "/assets/images/tabbar/message-active.png"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "/assets/images/tabbar/profile.png",
        selectedIconPath: "/assets/images/tabbar/profile-active.png"
      },
      {
        pagePath: "/pages/community/community",
        text: "社区",
        iconPath: "/assets/images/tabbar/hot.png",
        selectedIconPath: "/assets/images/tabbar/hot-active.png"
      }
    ],
    unreadCount: 0, // 未读消息数量
    color: "#999999",
    selectedColor: "#3B82F6"
  },
  lifetimes: {
    attached: function() {
      // 组件就绪时获取全局未读消息数量
      const app = getApp();
      if (app && app.globalData) {
        this.setData({
          unreadCount: app.globalData.totalUnreadMessages || 0,
          selected: app.globalData.tabBarIndex || 0
        });
      }
    }
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const app = getApp();
      const index = data.index;
      const path = data.path;

      // 如果是中间的发布按钮
      if (index === -1) {
        // 检查登录状态
        if (app.globalData.isLogin) {
          // 已登录，显示操作选项
          wx.showActionSheet({
            itemList: ['发布活动'],
            success: (res) => {
              if (res.tapIndex === 0) {
                // 跳转到活动发布页面
                wx.navigateTo({
                  url: '/packageActivity/pages/activityCreate/activityCreate'
                });
              }
            }
          });
        } else {
          // 未登录，提示登录
          wx.showModal({
            title: '提示',
            content: '发布活动需要登录，是否前往登录？',
            confirmText: '去登录',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/login/login'
                });
              }
            }
          });
        }
        return;
      }
      
      // 更新全局选中状态
      if (app.globalData) {
        app.globalData.tabBarIndex = index;
      }
      
      // 切换到对应页面
      if (this.data.selected !== index) {
        wx.switchTab({ url: path });
      }
    },
    
    /**
     * 更新TabBar数据
     * 主要用于外部调用更新选中状态或未读消息数
     */
    setTabData(data) {
      this.setData(data);
    }
  }
});