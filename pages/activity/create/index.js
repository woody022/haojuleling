// pages/activity/create/index.js
const app = getApp()

Page({
  data: {
    activity: {
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
      coverImage: '',
      category: '',
      isPublic: true,
      tags: []
    },
    categories: ['运动', '社交', '学习', '文化', '公益', '其他'],
    tagInput: '',
    datePickerStart: {
      show: false,
      currentDate: new Date().getTime(),
    },
    datePickerEnd: {
      show: false,
      currentDate: new Date().getTime(),
    },
    rules: {
      title: [{ required: true, message: '请输入活动标题' }],
      description: [{ required: true, message: '请输入活动描述' }],
      location: [{ required: true, message: '请输入活动地点' }],
      startTime: [{ required: true, message: '请选择开始时间' }],
      endTime: [{ required: true, message: '请选择结束时间' }],
      maxParticipants: [{ required: true, message: '请输入人数上限' }],
      category: [{ required: true, message: '请选择活动类型' }]
    },
    submitting: false,
    uploadProgress: 0,
    previewImages: []
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({
        isEditMode: true,
        activityId: options.id
      })
      this.fetchActivityDetail(options.id)
    }
  },

  // 获取活动详情
  fetchActivityDetail(id) {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'activity',
      data: {
        action: 'getActivityDetail',
        id: id
      }
    }).then(res => {
      wx.hideLoading()
      if (res.result && res.result.success) {
        const activity = res.result.data
        
        // 格式化时间显示
        activity.startTimeText = this.formatTimeText(new Date(activity.startTime))
        activity.endTimeText = this.formatTimeText(new Date(activity.endTime))
        
        // 预览图片处理
        const previewImages = activity.images ? activity.images : []
        
        this.setData({
          activity,
          'datePickerStart.currentDate': new Date(activity.startTime).getTime(),
          'datePickerEnd.currentDate': new Date(activity.endTime).getTime(),
          previewImages
        })
      } else {
        wx.showToast({
          title: '活动不存在或已删除',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      console.error('获取活动详情失败', err)
    })
  },

  // 表单输入处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`activity.${field}`]: value
    })
  },

  // 选择器变更处理
  onPickerChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`activity.${field}`]: this.data.categories[value]
    })
  },

  // 开关变更处理
  onSwitchChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`activity.${field}`]: value
    })
  },

  // 标签输入处理
  onTagInput(e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  // 添加标签
  addTag() {
    const tag = this.data.tagInput.trim()
    if (!tag) return
    
    if (this.data.activity.tags.includes(tag)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      })
      return
    }
    
    const tags = [...this.data.activity.tags, tag]
    this.setData({
      'activity.tags': tags,
      tagInput: ''
    })
  },

  // 删除标签
  removeTag(e) {
    const { index } = e.currentTarget.dataset
    const tags = [...this.data.activity.tags]
    tags.splice(index, 1)
    
    this.setData({
      'activity.tags': tags
    })
  },

  // 显示日期时间选择器
  showDatePicker(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      [`datePicker${type}.show`]: true
    })
  },

  // 日期时间选择器取消
  onDatePickerCancel(e) {
    const { type } = e.currentTarget.dataset
    this.setData({
      [`datePicker${type}.show`]: false
    })
  },

  // 日期时间选择器确认
  onDatePickerConfirm(e) {
    const { type } = e.currentTarget.dataset
    const { detail } = e
    
    const date = new Date(detail)
    const timeText = this.formatTimeText(date)
    
    // 验证开始时间不能晚于结束时间
    if (type === 'Start' && this.data.activity.endTime && detail > new Date(this.data.activity.endTime).getTime()) {
      wx.showToast({
        title: '开始时间不能晚于结束时间',
        icon: 'none'
      })
      return
    }
    
    // 验证结束时间不能早于开始时间
    if (type === 'End' && this.data.activity.startTime && detail < new Date(this.data.activity.startTime).getTime()) {
      wx.showToast({
        title: '结束时间不能早于开始时间',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      [`activity.${type.toLowerCase()}Time`]: date.toISOString(),
      [`activity.${type.toLowerCase()}TimeText`]: timeText,
      [`datePicker${type}.show`]: false,
      [`datePicker${type}.currentDate`]: detail
    })
  },

  // 格式化时间显示
  formatTimeText(date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 选择封面图片
  chooseCoverImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: res => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({
          'activity.coverImage': tempPath
        })
      }
    })
  },

  // 选择活动图片
  chooseImages() {
    const currentCount = this.data.previewImages.length
    const remainCount = 9 - currentCount
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多添加9张图片',
        icon: 'none'
      })
      return
    }
    
    wx.chooseMedia({
      count: remainCount,
      mediaType: ['image'],
      sizeType: ['compressed'],
      success: res => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          previewImages: [...this.data.previewImages, ...tempFiles]
        })
      }
    })
  },

  // 删除活动图片
  removeImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.previewImages]
    images.splice(index, 1)
    
    this.setData({
      previewImages: images
    })
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const { previewImages } = this.data
    
    wx.previewImage({
      current: previewImages[index],
      urls: previewImages
    })
  },

  // 验证表单
  validateForm() {
    const { activity } = this.data
    const errorMsgs = []
    
    // 必填项验证
    if (!activity.title) errorMsgs.push('请输入活动标题')
    if (!activity.description) errorMsgs.push('请输入活动描述')
    if (!activity.location) errorMsgs.push('请输入活动地点')
    if (!activity.startTime) errorMsgs.push('请选择开始时间')
    if (!activity.endTime) errorMsgs.push('请选择结束时间')
    if (!activity.maxParticipants) errorMsgs.push('请输入人数上限')
    if (!activity.category) errorMsgs.push('请选择活动类型')
    
    // 封面图必填验证
    if (!activity.coverImage) errorMsgs.push('请上传活动封面')
    
    // 人数验证
    if (activity.maxParticipants && (isNaN(Number(activity.maxParticipants)) || Number(activity.maxParticipants) <= 0)) {
      errorMsgs.push('人数上限必须是大于0的数字')
    }
    
    if (errorMsgs.length > 0) {
      wx.showToast({
        title: errorMsgs[0],
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 上传图片
  async uploadImages() {
    const { previewImages, activity } = this.data
    const uploadTasks = []
    const cloudPath = 'activity-images'
    const timestamp = new Date().getTime()
    
    // 上传封面图
    if (activity.coverImage && activity.coverImage.startsWith('wxfile://') || activity.coverImage.startsWith('http://tmp/')) {
      const coverExt = activity.coverImage.split('.').pop()
      const coverCloudPath = `${cloudPath}/${app.globalData.openid}_${timestamp}_cover.${coverExt}`
      
      const coverUploadTask = wx.cloud.uploadFile({
        cloudPath: coverCloudPath,
        filePath: activity.coverImage,
      })
      
      uploadTasks.push(coverUploadTask)
    }
    
    // 上传活动图片
    for (let i = 0; i < previewImages.length; i++) {
      const filePath = previewImages[i]
      // 仅上传本地文件，云存储文件不需要再次上传
      if (filePath.startsWith('wxfile://') || filePath.startsWith('http://tmp/')) {
        const ext = filePath.split('.').pop()
        const cloudPath = `${cloudPath}/${app.globalData.openid}_${timestamp}_${i}.${ext}`
        
        const uploadTask = wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath,
        })
        
        uploadTasks.push(uploadTask)
      } else {
        // 已经是云文件，直接添加到结果中
        uploadTasks.push(Promise.resolve({ fileID: filePath }))
      }
    }
    
    // 等待所有图片上传完成
    const uploadResults = await Promise.all(uploadTasks)
    
    // 更新活动数据中的图片链接
    const coverResult = uploadResults.shift()
    let coverImageUrl = activity.coverImage
    
    // 如果封面是新上传的，使用返回的云文件ID
    if (coverResult && coverResult.fileID) {
      coverImageUrl = coverResult.fileID
    }
    
    // 收集所有图片的云文件ID
    const imageUrls = uploadResults.map(res => {
      return res.fileID || res // 已有的云文件可能是直接的文件ID
    })
    
    return {
      coverImage: coverImageUrl,
      images: imageUrls
    }
  },

  // 提交表单
  async onSubmit() {
    if (!this.validateForm()) return
    
    try {
      this.setData({ submitting: true })
      
      wx.showLoading({
        title: '正在提交...',
        mask: true
      })
      
      // 处理图片上传
      const { coverImage, images } = await this.uploadImages()
      
      // 构建活动数据
      const activityData = { ...this.data.activity }
      activityData.coverImage = coverImage
      activityData.images = images
      activityData.maxParticipants = Number(activityData.maxParticipants)
      
      // 创建或更新活动
      const functionName = 'activity'
      const action = this.data.isEditMode ? 'updateActivity' : 'createActivity'
      const callData = {
        action,
        activity: activityData
      }
      
      // 如果是编辑模式，添加活动ID
      if (this.data.isEditMode) {
        callData.id = this.data.activityId
      }
      
      // 调用云函数
      const res = await wx.cloud.callFunction({
        name: functionName,
        data: callData
      })
      
      if (res.result && res.result.success) {
        wx.hideLoading()
        wx.showToast({
          title: this.data.isEditMode ? '更新成功' : '创建成功',
          icon: 'success'
        })
        
        // 跳转到活动详情页
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/activity/detail/index?id=${res.result.data._id || this.data.activityId}`
          })
        }, 1500)
      } else {
        throw new Error(res.result ? res.result.message : '操作失败')
      }
    } catch (error) {
      wx.hideLoading()
      wx.showToast({
        title: error.message || '提交失败，请重试',
        icon: 'none'
      })
      console.error('提交活动数据失败', error)
    } finally {
      this.setData({ submitting: false })
    }
  }
})