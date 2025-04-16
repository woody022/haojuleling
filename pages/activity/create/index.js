// pages/activity/create/index.js
const app = getApp()
const utils = require('../../../src/utils/common.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    formData: {
      title: '',
      type: '',
      description: '',
      location: {
        name: '',
        address: '',
        latitude: 0,
        longitude: 0
      },
      startTime: '',
      endTime: '',
      maxParticipants: 10,
      minParticipants: 2,
      tags: [],
      coverImage: '',
      images: [],
      isPublic: true,
      needReview: false
    },
    
    // 表单错误
    formErrors: {
      title: '',
      type: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      tags: '',
      coverImage: ''
    },
    
    // 类型选项
    activityTypes: ['户外活动', '文化交流', '学习研讨', '体育运动', '志愿服务', '其他'],
    
    // 临时标签输入
    tagInput: '',
    
    // 描述字数限制
    descMaxLength: 500,
    
    // 是否显示时间选择器
    showTimePicker: false,
    
    // 当前选择的时间类型（开始或结束）
    currentTimeType: 'start',
    
    // 时间选择器数据
    timePickerData: {
      date: '',
      time: ''
    },
    
    // 日期时间数组
    dateArray: [],
    timeArray: [],
    
    // 表单是否提交中
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initDateTimeArrays()
  },

  /**
   * 初始化日期和时间数组
   */
  initDateTimeArrays: function () {
    const now = new Date()
    const dateArray = []
    const timeArray = []
    
    // 生成30天的日期选项
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
      
      dateArray.push({
        label: `${month}月${day}日 ${weekDay}`,
        value: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      })
    }
    
    // 生成时间选项（每半小时一个选项）
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const hourStr = hour.toString().padStart(2, '0')
        const minuteStr = minute.toString().padStart(2, '0')
        timeArray.push({
          label: `${hourStr}:${minuteStr}`,
          value: `${hourStr}:${minuteStr}`
        })
      }
    }
    
    this.setData({
      dateArray,
      timeArray
    })
  },

  /**
   * 输入标题
   */
  onTitleInput: function (e) {
    const title = e.detail.value
    this.setData({
      'formData.title': title,
      'formErrors.title': title ? '' : '请输入活动标题'
    })
  },

  /**
   * 选择活动类型
   */
  onTypeChange: function (e) {
    const typeIndex = e.detail.value
    const type = this.data.activityTypes[typeIndex]
    
    this.setData({
      'formData.type': type,
      'formErrors.type': ''
    })
  },

  /**
   * 输入描述
   */
  onDescriptionInput: function (e) {
    const description = e.detail.value
    const descMaxLength = this.data.descMaxLength
    
    if (description.length <= descMaxLength) {
      this.setData({
        'formData.description': description,
        'formErrors.description': ''
      })
    }
  },

  /**
   * 输入地点
   */
  onLocationInput: function (e) {
    const name = e.detail.value
    
    this.setData({
      'formData.location.name': name,
      'formErrors.location': name ? '' : '请输入活动地点'
    })
  },

  /**
   * 选择地点
   */
  chooseLocation: function () {
    wx.chooseLocation({
      success: (res) => {
        const { name, address, latitude, longitude } = res
        
        this.setData({
          'formData.location': { name, address, latitude, longitude },
          'formErrors.location': ''
        })
      }
    })
  },

  /**
   * 打开时间选择器
   */
  openTimePicker: function (e) {
    const timeType = e.currentTarget.dataset.type
    
    this.setData({
      showTimePicker: true,
      currentTimeType: timeType
    })
  },

  /**
   * 关闭时间选择器
   */
  closeTimePicker: function () {
    this.setData({
      showTimePicker: false
    })
  },

  /**
   * 日期选择改变
   */
  onDateChange: function (e) {
    const index = e.detail.value
    const date = this.data.dateArray[index].value
    
    this.setData({
      'timePickerData.date': date
    })
  },

  /**
   * 时间选择改变
   */
  onTimeChange: function (e) {
    const index = e.detail.value
    const time = this.data.timeArray[index].value
    
    this.setData({
      'timePickerData.time': time
    })
  },

  /**
   * 确认时间选择
   */
  confirmTimePicker: function () {
    const { date, time } = this.data.timePickerData
    
    if (!date || !time) {
      wx.showToast({
        title: '请选择完整的日期和时间',
        icon: 'none'
      })
      return
    }
    
    const selectedTime = `${date} ${time}`
    const timeType = this.data.currentTimeType
    
    // 设置开始或结束时间
    if (timeType === 'start') {
      this.setData({
        'formData.startTime': selectedTime,
        'formErrors.startTime': ''
      })
    } else {
      this.setData({
        'formData.endTime': selectedTime,
        'formErrors.endTime': ''
      })
    }
    
    // 验证开始时间必须早于结束时间
    this.validateTimeRange()
    
    this.closeTimePicker()
  },

  /**
   * 验证时间范围
   */
  validateTimeRange: function () {
    const { startTime, endTime } = this.data.formData
    
    if (startTime && endTime) {
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)
      
      if (startDate >= endDate) {
        this.setData({
          'formErrors.endTime': '结束时间必须晚于开始时间'
        })
      } else {
        this.setData({
          'formErrors.endTime': ''
        })
      }
    }
  },

  /**
   * 设置最大参与人数
   */
  onMaxParticipantsChange: function (e) {
    const value = e.detail.value
    
    this.setData({
      'formData.maxParticipants': value
    })
  },

  /**
   * 设置最小参与人数
   */
  onMinParticipantsChange: function (e) {
    const value = e.detail.value
    
    this.setData({
      'formData.minParticipants': value
    })
  },

  /**
   * 标签输入
   */
  onTagInput: function (e) {
    this.setData({
      tagInput: e.detail.value
    })
  },

  /**
   * 添加标签
   */
  addTag: function () {
    const { tagInput, formData } = this.data
    
    if (!tagInput.trim()) {
      wx.showToast({
        title: '请输入标签',
        icon: 'none'
      })
      return
    }
    
    // 标签长度限制
    if (tagInput.length > 10) {
      wx.showToast({
        title: '标签最多10个字',
        icon: 'none'
      })
      return
    }
    
    // 标签数量限制
    if (formData.tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      })
      return
    }
    
    // 验证标签唯一性
    if (formData.tags.includes(tagInput)) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      })
      return
    }
    
    const newTags = [...formData.tags, tagInput]
    
    this.setData({
      'formData.tags': newTags,
      'formErrors.tags': '',
      tagInput: ''
    })
  },

  /**
   * 删除标签
   */
  removeTag: function (e) {
    const index = e.currentTarget.dataset.index
    const tags = [...this.data.formData.tags]
    
    tags.splice(index, 1)
    
    this.setData({
      'formData.tags': tags
    })
  },

  /**
   * 上传封面图片
   */
  uploadCoverImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        
        // 在实际应用中，这里应该先将图片上传到服务器
        // 这里为了演示，直接使用临时路径
        this.setData({
          'formData.coverImage': tempFilePath,
          'formErrors.coverImage': ''
        })
      }
    })
  },

  /**
   * 移除封面图片
   */
  removeCoverImage: function () {
    this.setData({
      'formData.coverImage': ''
    })
  },

  /**
   * 上传活动图片
   */
  uploadActivityImage: function () {
    const { images } = this.data.formData
    
    if (images.length >= 9) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      })
      return
    }
    
    wx.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        
        // 在实际应用中，这里应该先将图片上传到服务器
        // 这里为了演示，直接使用临时路径
        this.setData({
          'formData.images': [...images, ...tempFilePaths]
        })
      }
    })
  },

  /**
   * 移除活动图片
   */
  removeActivityImage: function (e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.formData.images]
    
    images.splice(index, 1)
    
    this.setData({
      'formData.images': images
    })
  },

  /**
   * 切换公开/私密设置
   */
  togglePublic: function (e) {
    this.setData({
      'formData.isPublic': e.detail.value
    })
  },

  /**
   * 切换是否需要审核参与者
   */
  toggleNeedReview: function (e) {
    this.setData({
      'formData.needReview': e.detail.value
    })
  },

  /**
   * 表单验证
   */
  validateForm: function () {
    const { formData } = this.data
    let isValid = true
    const errors = {}
    
    // 验证标题
    if (!formData.title.trim()) {
      errors.title = '请输入活动标题'
      isValid = false
    }
    
    // 验证类型
    if (!formData.type) {
      errors.type = '请选择活动类型'
      isValid = false
    }
    
    // 验证描述
    if (!formData.description.trim()) {
      errors.description = '请输入活动描述'
      isValid = false
    }
    
    // 验证地点
    if (!formData.location.name) {
      errors.location = '请输入活动地点'
      isValid = false
    }
    
    // 验证开始时间
    if (!formData.startTime) {
      errors.startTime = '请选择活动开始时间'
      isValid = false
    }
    
    // 验证结束时间
    if (!formData.endTime) {
      errors.endTime = '请选择活动结束时间'
      isValid = false
    } else if (formData.startTime) {
      // 验证开始时间早于结束时间
      const startDate = new Date(formData.startTime)
      const endDate = new Date(formData.endTime)
      
      if (startDate >= endDate) {
        errors.endTime = '结束时间必须晚于开始时间'
        isValid = false
      }
    }
    
    // 验证至少有一个标签
    if (formData.tags.length === 0) {
      errors.tags = '请至少添加一个标签'
      isValid = false
    }
    
    // 验证封面图片
    if (!formData.coverImage) {
      errors.coverImage = '请上传活动封面图片'
      isValid = false
    }
    
    // 更新错误状态
    this.setData({
      formErrors: errors
    })
    
    return isValid
  },

  /**
   * 提交表单
   */
  submitForm: function () {
    // 防止重复提交
    if (this.data.isSubmitting) {
      return
    }
    
    // 表单验证
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      })
      return
    }
    
    this.setData({
      isSubmitting: true
    })
    
    // 假设这里是提交到服务器的逻辑
    // 在实际应用中，应该使用wx.request等API与后端通信
    setTimeout(() => {
      wx.showToast({
        title: '活动创建成功',
        icon: 'success',
        duration: 2000,
        complete: () => {
          // 返回上一页或跳转到活动详情页
          setTimeout(() => {
            wx.navigateBack()
          }, 2000)
        }
      })
      
      this.setData({
        isSubmitting: false
      })
    }, 1500)
  },

  /**
   * 取消创建
   */
  cancelCreate: function () {
    wx.showModal({
      title: '提示',
      content: '确定要放弃创建活动吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
  }
})