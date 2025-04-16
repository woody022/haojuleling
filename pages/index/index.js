// pages/index/index.js
const app = getApp()

Page({
  data: {
    // 定位信息
    location: {
      name: '北京市海淀区',
      latitude: 39.9,
      longitude: 116.3
    },
    
    // 轮播图数据
    banners: [
      {
        id: 1,
        imageUrl: '/images/banner/banner1.jpg',
        linkUrl: '/pages/activity/detail/index?id=1'
      },
      {
        id: 2,
        imageUrl: '/images/banner/banner2.jpg',
        linkUrl: '/pages/activity/detail/index?id=2'
      },
      {
        id: 3,
        imageUrl: '/images/banner/banner3.jpg',
        linkUrl: '/pages/activity/detail/index?id=3'
      }
    ],
    
    // 活动类型
    activityTypes: [
      { id: 1, name: '运动健身', icon: '/images/activity/sports.png' },
      { id: 2, name: '户外探险', icon: '/images/activity/outdoor.png' },
      { id: 3, name: '志愿服务', icon: '/images/activity/volunteer.png' },
      { id: 4, name: '文化艺术', icon: '/images/activity/culture.png' },
      { id: 5, name: '教育学习', icon: '/images/activity/education.png' },
      { id: 6, name: '社交聚会', icon: '/images/activity/social.png' },
      { id: 7, name: '其他', icon: '/images/activity/other.png' },
      { id: 8, name: '更多', icon: '/images/activity/more.png' }
    ],
    
    // 热门活动
    hotActivities: [
      {
        id: 1,
        title: '周末太极拳学习班',
        coverImage: '/images/activity/taichi.jpg',
        startTime: '2023-06-10 09:00',
        address: '北京市海淀区中关村公园',
        participantsCount: 28,
        status: '报名中'
      },
      {
        id: 2,
        title: '老年人数码产品使用指导',
        coverImage: '/images/activity/digital.jpg',
        startTime: '2023-06-12 14:00',
        address: '北京市朝阳区望京社区中心',
        participantsCount: 15,
        status: '报名中'
      },
      {
        id: 3,
        title: '社区花艺培训',
        coverImage: '/images/activity/flower.jpg',
        startTime: '2023-06-15 10:00',
        address: '北京市西城区德胜社区',
        participantsCount: 20,
        status: '已结束'
      }
    ],
    
    // 推荐活动
    recommendActivities: [
      {
        id: 4,
        title: '健康讲座：中老年常见疾病预防',
        coverImage: '/images/activity/health.jpg',
        startTime: '2023-06-18 15:00',
        address: '北京市海淀区五道口医院',
        participantsCount: 42,
        status: '报名中'
      },
      {
        id: 5,
        title: '书法爱好者交流会',
        coverImage: '/images/activity/calligraphy.jpg',
        startTime: '2023-06-20 09:30',
        address: '北京市东城区文化馆',
        participantsCount: 18,
        status: '报名中'
      },
      {
        id: 6,
        title: '社区老年人棋牌比赛',
        coverImage: '/images/activity/chess.jpg',
        startTime: '2023-06-25 13:00',
        address: '北京市丰台区花乡社区',
        participantsCount: 32,
        status: '报名中'
      }
    ]
  },

  onLoad() {
    // 获取定位
    this.getLocation()
    
    // 获取轮播图数据
    this.getBanners()
    
    // 获取活动类型
    this.getActivityTypes()
    
    // 获取热门活动
    this.getHotActivities()
    
    // 获取推荐活动
    this.getRecommendActivities()
  },
  
  // 获取定位
  getLocation() {
    const that = this
    
    // 检查是否有定位权限
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userLocation']) {
          // 获取定位
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              const latitude = res.latitude
              const longitude = res.longitude
              
              // 调用逆地理编码获取位置名称
              that.getLocationName(latitude, longitude)
            },
            fail() {
              wx.showToast({
                title: '获取位置失败',
                icon: 'none'
              })
            }
          })
        } else {
          // 请求定位权限
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              that.getLocation()
            },
            fail() {
              wx.showToast({
                title: '请开启位置权限以获取附近活动',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  },
  
  // 根据经纬度获取位置名称
  getLocationName(latitude, longitude) {
    // 实际项目中应该调用地图API获取位置名称
    // 这里使用模拟数据
    this.setData({
      'location.latitude': latitude,
      'location.longitude': longitude,
      'location.name': '北京市海淀区'
    })
  },
  
  // 选择位置
  chooseLocation() {
    const that = this
    wx.chooseLocation({
      success(res) {
        that.setData({
          location: {
            name: res.name || res.address,
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
        
        // 根据新位置获取附近活动
        that.getNearbyActivities()
      }
    })
  },
  
  // 获取附近活动
  getNearbyActivities() {
    // 实际项目中应该根据位置获取附近活动
    // 这里仅更新一下现有数据作为演示
    const hotActivities = this.data.hotActivities.map(item => {
      return {
        ...item,
        address: `${this.data.location.name}附近`
      }
    })
    
    this.setData({
      hotActivities
    })
  },
  
  // 获取轮播图数据
  getBanners() {
    // 实际项目中应该从服务器获取轮播图数据
    // 这里使用模拟数据，数据已在data中定义
  },
  
  // 获取活动类型
  getActivityTypes() {
    // 实际项目中应该从服务器获取活动类型
    // 这里使用全局数据
    if (app.globalData.activityTypes) {
      this.setData({
        activityTypes: app.globalData.activityTypes
      })
    }
  },
  
  // 获取热门活动
  getHotActivities() {
    // 实际项目中应该从服务器获取热门活动
    // 这里使用模拟数据，数据已在data中定义
  },
  
  // 获取推荐活动
  getRecommendActivities() {
    // 实际项目中应该从服务器获取推荐活动
    // 这里使用模拟数据，数据已在data中定义
  },
  
  // 跳转到搜索页面
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
  
  // 跳转到轮播图链接
  navigateToBanner(e) {
    const id = e.currentTarget.dataset.id
    const banner = this.data.banners.find(item => item.id === id)
    
    if (banner && banner.linkUrl) {
      wx.navigateTo({
        url: banner.linkUrl
      })
    }
  },
  
  // 跳转到分类页面
  navigateToCategory(e) {
    const id = e.currentTarget.dataset.id
    
    wx.navigateTo({
      url: `/pages/activity/list/index?categoryId=${id}`
    })
  },
  
  // 跳转到更多活动
  navigateToMore(e) {
    const type = e.currentTarget.dataset.type
    
    wx.navigateTo({
      url: `/pages/activity/list/index?type=${type}`
    })
  },
  
  // 跳转到活动详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    
    wx.navigateTo({
      url: `/pages/activity/detail/index?id=${id}`
    })
  },
  
  // 跳转到创建活动
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/activity/create/index'
    })
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 重新加载数据
    this.getBanners()
    this.getHotActivities()
    this.getRecommendActivities()
    
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  
  // 上拉加载更多
  onReachBottom() {
    // 加载更多推荐活动
    const newActivities = [
      {
        id: 7,
        title: '春季踏青健走活动',
        coverImage: '/images/activity/walking.jpg',
        startTime: '2023-07-01 08:00',
        address: '北京市昌平区蟒山国家森林公园',
        participantsCount: 50,
        status: '报名中'
      },
      {
        id: 8,
        title: '中老年时尚穿搭讲座',
        coverImage: '/images/activity/fashion.jpg',
        startTime: '2023-07-05 14:30',
        address: '北京市朝阳区三里屯太古里',
        participantsCount: 22,
        status: '报名中'
      }
    ]
    
    this.setData({
      recommendActivities: [...this.data.recommendActivities, ...newActivities]
    })
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '好聚乐龄 - 中老年人专属社交活动平台',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  }
})