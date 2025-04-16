// pages/activity/detail/index.js
const app = getApp()
const util = require('../../../utils/common.js')

Page({
  data: {
    // 活动ID
    activityId: null,
    
    // 活动详情数据
    activityDetail: {
      id: 1,
      title: '周末太极拳学习班',
      coverImage: '/images/activity/taichi.jpg',
      type: '运动健身',
      startTime: '2023-06-10 09:00',
      endTime: '2023-06-10 11:00',
      address: '北京市海淀区中关村公园',
      latitude: 39.9,
      longitude: 116.3,
      registrationDeadline: '2023-06-09 18:00',
      participantsCount: 28,
      maxParticipants: 30,
      description: '太极拳是中国传统武术之一，具有强身健体、修身养性的功效。本次活动邀请了资深太极拳教练进行指导，适合各年龄段人群参与，尤其适合中老年人。\n\n活动内容：\n1. 太极拳基本动作讲解\n2. 太极拳基本套路教学\n3. 太极拳呼吸方法\n4. 太极拳养生理念分享\n\n请穿着宽松舒适的衣服参加活动，建议自带水杯和毛巾。',
      imageList: [
        '/images/activity/taichi1.jpg',
        '/images/activity/taichi2.jpg',
        '/images/activity/taichi3.jpg'
      ],
      organizer: {
        id: 101,
        name: '李师傅',
        avatar: '/images/avatars/organizer1.jpg',
        description: '太极拳教练，从事太极拳教学20年',
        enableContact: true
      },
      participants: [
        { id: 1, name: '张三', avatar: '/images/avatars/user1.jpg' },
        { id: 2, name: '李四', avatar: '/images/avatars/user2.jpg' },
        { id: 3, name: '王五', avatar: '/images/avatars/user3.jpg' },
        { id: 4, name: '赵六', avatar: '/images/avatars/user4.jpg' },
        { id: 5, name: '钱七', avatar: '/images/avatars/user5.jpg' },
        { id: 6, name: '孙八', avatar: '/images/avatars/user6.jpg' },
        { id: 7, name: '周九', avatar: '/images/avatars/user7.jpg' },
        { id: 8, name: '吴十', avatar: '/images/avatars/user8.jpg' }
      ],
      statusText: '报名中',
      statusClass: 'status-recruiting'
    },
    
    // 评论数据
    comments: [
      {
        id: 1,
        userId: 1,
        userName: '张三',
        userAvatar: '/images/avatars/user1.jpg',
        content: '太极拳真的很适合我们这个年龄段的人锻炼，期待参加！',
        createTime: '2023-06-01 10:25',
        likeCount: 5,
        replies: []
      },
      {
        id: 2,
        userId: 3,
        userName: '王五',
        userAvatar: '/images/avatars/user3.jpg',
        content: '请问需要提前准备什么吗？',
        createTime: '2023-06-02 15:40',
        likeCount: 2,
        replies: [
          {
            id: 3,
            userId: 101,
            userName: '李师傅',
            userAvatar: '/images/avatars/organizer1.jpg',
            content: '只需穿着舒适的衣服，自带水杯即可。',
            createTime: '2023-06-02 16:10',
            targetUserName: '王五'
          }
        ]
      }
    ],
    
    // 评论相关
    commentContent: '',
    commentFocus: false,
    replyTo: '',
    replyUserId: null,
    
    // 用户状态
    isLogin: true,
    isFavorite: false,
    isSignedUp: false,
    isSignupDisabled: false,
    signupBtnText: '立即报名',
    
    // 弹窗状态
    showSignupSuccess: false,
    showCancelSignup: false,
    showShare: false
  },

  onLoad(options) {
    // 获取活动ID
    const activityId = options.id
    this.setData({
      activityId
    })
    
    // 获取活动详情
    this.getActivityDetail(activityId)
    
    // 获取评论列表
    this.getComments(activityId)
    
    // 检查用户是否已登录
    this.checkLoginStatus()
    
    // 检查用户是否已收藏
    this.checkFavoriteStatus(activityId)
    
    // 检查用户是否已报名
    this.checkSignupStatus(activityId)
  },
  
  // 获取活动详情
  getActivityDetail(activityId) {
    // 实际项目中应该从服务器获取数据
    // 这里使用模拟数据，数据已在data中定义
    
    // 根据活动状态设置按钮文本和禁用状态
    this.setSignupBtnStatus(this.data.activityDetail)
  },
  
  // 设置报名按钮状态
  setSignupBtnStatus(activity) {
    let isSignupDisabled = false
    let signupBtnText = '立即报名'
    
    // 根据活动状态设置按钮
    switch (activity.statusText) {
      case '报名中':
        if (activity.participantsCount >= activity.maxParticipants) {
          isSignupDisabled = true
          signupBtnText = '名额已满'
        } else {
          // 检查是否超过报名截止时间
          const deadlineTime = new Date(activity.registrationDeadline.replace(/-/g, '/'))
          const now = new Date()
          if (now > deadlineTime) {
            isSignupDisabled = true
            signupBtnText = '报名截止'
          }
        }
        break
      case '进行中':
        isSignupDisabled = true
        signupBtnText = '活动进行中'
        break
      case '已结束':
        isSignupDisabled = true
        signupBtnText = '活动已结束'
        break
      case '已取消':
        isSignupDisabled = true
        signupBtnText = '活动已取消'
        break
    }
    
    // 如果用户已报名，则显示取消报名按钮
    if (this.data.isSignedUp) {
      signupBtnText = '取消报名'
    }
    
    this.setData({
      isSignupDisabled,
      signupBtnText
    })
  },
  
  // 获取评论列表
  getComments(activityId) {
    // 实际项目中应该从服务器获取数据
    // 这里使用模拟数据，数据已在data中定义
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const isLogin = !!app.globalData.userInfo
    
    this.setData({
      isLogin
    })
  },
  
  // 检查收藏状态
  checkFavoriteStatus(activityId) {
    // 实际项目中应该从服务器或本地存储获取
    // 这里使用模拟数据
    const isFavorite = false
    
    this.setData({
      isFavorite
    })
  },
  
  // 检查报名状态
  checkSignupStatus(activityId) {
    // 实际项目中应该从服务器获取
    // 这里使用模拟数据
    const isSignedUp = false
    
    this.setData({
      isSignedUp
    })
    
    // 更新报名按钮状态
    this.setSignupBtnStatus(this.data.activityDetail)
  },
  
  // 打开位置地图
  openLocation() {
    const { latitude, longitude, address } = this.data.activityDetail
    
    wx.openLocation({
      latitude,
      longitude,
      name: address,
      scale: 18
    })
  },
  
  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.activityDetail.imageList
    
    wx.previewImage({
      current: images[index],
      urls: images
    })
  },
  
  // 显示所有参与者
  showAllParticipants() {
    wx.navigateTo({
      url: `/pages/activity/participants/index?id=${this.data.activityId}`
    })
  },
  
  // 评论输入
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    })
  },
  
  // 回复评论
  replyComment(e) {
    const { userId, userName } = e.detail
    
    this.setData({
      replyTo: userName,
      replyUserId: userId,
      commentFocus: true
    })
  },
  
  // 提交评论
  submitComment() {
    if (!this.data.commentContent.trim()) {
      return
    }
    
    const newComment = {
      id: this.data.comments.length + 1,
      userId: app.globalData.userInfo.id || 999,
      userName: app.globalData.userInfo.nickName || '用户',
      userAvatar: app.globalData.userInfo.avatarUrl || '/images/avatars/default.jpg',
      content: this.data.commentContent,
      createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
      likeCount: 0,
      replies: []
    }
    
    // 如果是回复评论
    if (this.data.replyTo) {
      // 找到被回复的评论
      const comments = this.data.comments
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].userId === this.data.replyUserId) {
          // 添加回复
          const replyId = comments[i].replies ? comments[i].replies.length + 1 : 1
          const reply = {
            id: replyId,
            userId: app.globalData.userInfo.id || 999,
            userName: app.globalData.userInfo.nickName || '用户',
            userAvatar: app.globalData.userInfo.avatarUrl || '/images/avatars/default.jpg',
            content: this.data.commentContent,
            createTime: util.formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
            targetUserName: this.data.replyTo
          }
          
          if (!comments[i].replies) {
            comments[i].replies = []
          }
          
          comments[i].replies.push(reply)
          
          this.setData({
            comments,
            commentContent: '',
            replyTo: '',
            replyUserId: null
          })
          
          return
        }
      }
    }
    
    // 添加新评论
    this.setData({
      comments: [newComment, ...this.data.comments],
      commentContent: '',
      replyTo: '',
      replyUserId: null
    })
  },
  
  // 切换收藏状态
  toggleFavorite() {
    if (!this.data.isLogin) {
      this.goLogin()
      return
    }
    
    const isFavorite = !this.data.isFavorite
    
    // 实际项目中应该调用服务器API
    this.setData({
      isFavorite
    })
    
    wx.showToast({
      title: isFavorite ? '收藏成功' : '已取消收藏',
      icon: 'success'
    })
  },
  
  // 切换报名状态
  toggleSignup() {
    if (!this.data.isLogin) {
      this.goLogin()
      return
    }
    
    if (this.data.isSignupDisabled && !this.data.isSignedUp) {
      return
    }
    
    if (this.data.isSignedUp) {
      // 已报名，显示取消报名弹窗
      this.setData({
        showCancelSignup: true
      })
    } else {
      // 未报名，直接报名
      this.signup()
    }
  },
  
  // 确认取消报名
  confirmCancelSignup() {
    // 实际项目中应该调用服务器API
    
    // 更新报名状态
    this.setData({
      isSignedUp: false,
      showCancelSignup: false
    })
    
    // 更新报名人数
    const activityDetail = this.data.activityDetail
    activityDetail.participantsCount -= 1
    
    // 更新参与者列表（移除当前用户）
    const currentUserId = app.globalData.userInfo.id || 999
    const participants = activityDetail.participants.filter(item => item.id !== currentUserId)
    activityDetail.participants = participants
    
    this.setData({
      activityDetail
    })
    
    // 更新报名按钮状态
    this.setSignupBtnStatus(activityDetail)
    
    wx.showToast({
      title: '已取消报名',
      icon: 'success'
    })
  },
  
  // 报名
  signup() {
    // 实际项目中应该调用服务器API
    
    // 更新报名状态
    this.setData({
      isSignedUp: true
    })
    
    // 更新报名人数
    const activityDetail = this.data.activityDetail
    activityDetail.participantsCount += 1
    
    // 更新参与者列表（添加当前用户）
    const currentUser = {
      id: app.globalData.userInfo.id || 999,
      name: app.globalData.userInfo.nickName || '用户',
      avatar: app.globalData.userInfo.avatarUrl || '/images/avatars/default.jpg'
    }
    
    activityDetail.participants.unshift(currentUser)
    
    this.setData({
      activityDetail,
      showSignupSuccess: true
    })
    
    // 更新报名按钮状态
    this.setSignupBtnStatus(activityDetail)
  },
  
  // 隐藏弹窗
  hideModal() {
    this.setData({
      showSignupSuccess: false,
      showCancelSignup: false
    })
  },
  
  // 显示分享选项
  showShareOptions() {
    this.setData({
      showShare: true
    })
  },
  
  // 隐藏分享弹窗
  hideShareModal() {
    this.setData({
      showShare: false
    })
  },
  
  // 分享到朋友圈（生成海报）
  shareToMoments() {
    wx.showToast({
      title: '正在生成海报...',
      icon: 'loading',
      duration: 2000
    })
    
    // 实际项目中应该生成海报
    setTimeout(() => {
      wx.hideToast()
      
      wx.showModal({
        title: '提示',
        content: '海报已生成，请保存后分享到朋友圈',
        showCancel: false
      })
      
      this.hideShareModal()
    }, 2000)
  },
  
  // 复制链接
  copyLink() {
    const path = `/pages/activity/detail/index?id=${this.data.activityId}`
    const link = `https://example.com${path}`
    
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        })
        
        this.hideShareModal()
      }
    })
  },
  
  // 跳转到登录页
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },
  
  // 阻止事件冒泡
  stopPropagation() {
    return false
  },
  
  // 页面分享
  onShareAppMessage() {
    const { title, coverImage } = this.data.activityDetail
    
    return {
      title: title,
      path: `/pages/activity/detail/index?id=${this.data.activityId}`,
      imageUrl: coverImage
    }
  },
  
  // 分享到朋友圈
  onShareTimeline() {
    const { title, coverImage } = this.data.activityDetail
    
    return {
      title: title,
      query: `id=${this.data.activityId}`,
      imageUrl: coverImage
    }
  },
  
  // 页面上拉触底
  onReachBottom() {
    // 加载更多评论
  },
  
  // 页面下拉刷新
  onPullDownRefresh() {
    // 刷新活动详情
    this.getActivityDetail(this.data.activityId)
    
    // 刷新评论列表
    this.getComments(this.data.activityId)
    
    wx.stopPullDownRefresh()
  }
})