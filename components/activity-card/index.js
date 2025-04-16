// components/activity-card/index.js
Component({
  properties: {
    // 活动数据
    activity: {
      type: Object,
      value: {}
    },
    // 是否已收藏
    isFavorite: {
      type: Boolean,
      value: false
    }
  },
  
  methods: {
    // 点击卡片
    onCardClick() {
      const activityId = this.properties.activity.id
      
      // 触发点击事件并传递活动ID
      this.triggerEvent('click', { activityId })
      
      // 跳转到活动详情页
      wx.navigateTo({
        url: `/pages/activity/detail/index?id=${activityId}`
      })
    },
    
    // 点击收藏按钮
    onFavoriteClick(e) {
      // 阻止事件冒泡，防止触发卡片点击事件
      e.stopPropagation()
      
      const activityId = this.properties.activity.id
      const isFavorite = !this.properties.isFavorite
      
      // 触发收藏事件
      this.triggerEvent('favorite', {
        activityId,
        isFavorite
      })
      
      // 更新本地状态
      this.setData({
        isFavorite
      })
    },
    
    // 点击分享按钮
    onShareClick(e) {
      // 阻止事件冒泡，防止触发卡片点击事件
      e.stopPropagation()
      
      const activityId = this.properties.activity.id
      
      // 触发分享事件
      this.triggerEvent('share', { activityId })
      
      // 显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      })
    }
  }
})