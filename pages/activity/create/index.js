// pages/activity/create/index.js
const utils = require('../../../src/utils/common.js');

Page({
  data: {
    // 基本信息
    title: '',
    type: '',
    description: '',
    descriptionLength: 0,
    maxDescriptionLength: 500,
    
    // 活动类型选项
    activityTypes: ['聚餐', '旅行', '运动', '学习', '交友', '其他'],
    
    // 时间地点
    location: '',
    address: '',
    latitude: 0,
    longitude: 0,
    startTime: '',
    endTime: '',
    
    // 选择器状态
    showStartPicker: false,
    showEndPicker: false,
    pickerTitle: '',
    currentPickerType: '',
    
    // 参与人数
    minParticipants: 2,
    maxParticipants: 20,
    
    // 标签
    tagInput: '',
    tags: [],
    
    // 图片
    coverImage: '',
    activityImages: [],
    maxImageCount: 9,
    
    // 设置
    isPrivate: false,
    needsReview: false,
    
    // 表单验证
    errors: {
      title: '',
      type: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      coverImage: ''
    },
    
    // 是否正在提交
    submitting: false
  },

  onLoad: function(options) {
    // 设置默认时间（当前时间往后推1小时）
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    
    this.setData({
      startTime: this.formatDateTime(startTime),
      endTime: this.formatDateTime(endTime)
    });
  },

  // 标题输入事件
  onTitleInput: function(e) {
    this.setData({
      title: e.detail.value,
      'errors.title': ''
    });
  },

  // 选择活动类型
  onTypeChange: function(e) {
    this.setData({
      type: this.data.activityTypes[e.detail.value],
      'errors.type': ''
    });
  },

  // 描述输入事件
  onDescriptionInput: function(e) {
    const value = e.detail.value;
    const length = value.length;
    
    this.setData({
      description: value,
      descriptionLength: length,
      'errors.description': ''
    });
  },

  // 地点输入事件
  onLocationInput: function(e) {
    this.setData({
      location: e.detail.value,
      'errors.location': ''
    });
  },

  // 选择位置
  chooseLocation: function() {
    const that = this;
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          location: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
          'errors.location': ''
        });
      },
      fail: function(err) {
        console.error('选择位置失败', err);
        if (err.errMsg.indexOf('auth deny') >= 0) {
          wx.showModal({
            title: '提示',
            content: '请授权位置权限以选择活动地点',
            showCancel: false,
            success: function() {
              wx.openSetting();
            }
          });
        }
      }
    });
  },

  // 显示日期时间选择器
  showTimePicker: function(e) {
    const type = e.currentTarget.dataset.type;
    let title = '选择开始时间';
    
    if (type === 'end') {
      title = '选择结束时间';
    }
    
    this.setData({
      showStartPicker: type === 'start',
      showEndPicker: type === 'end',
      pickerTitle: title,
      currentPickerType: type
    });
  },

  // 取消选择时间
  cancelDatePicker: function() {
    this.setData({
      showStartPicker: false,
      showEndPicker: false
    });
  },

  // 确认选择时间
  confirmDatePicker: function(e) {
    const type = this.data.currentPickerType;
    const time = e.detail.value;
    
    if (type === 'start') {
      this.setData({
        startTime: time,
        showStartPicker: false,
        'errors.startTime': ''
      });
    } else {
      this.setData({
        endTime: time,
        showEndPicker: false,
        'errors.endTime': ''
      });
    }
  },

  // 标签输入事件
  onTagInput: function(e) {
    this.setData({
      tagInput: e.detail.value
    });
  },

  // 添加标签
  addTag: function() {
    const tag = this.data.tagInput.trim();
    
    if (!tag) {
      wx.showToast({
        title: '标签不能为空',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.tags.includes(tag)) {
      wx.showToast({
        title: '该标签已存在',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.tags.length >= 5) {
      wx.showToast({
        title: '最多添加5个标签',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      tags: [...this.data.tags, tag],
      tagInput: ''
    });
  },

  // 删除标签
  removeTag: function(e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.tags];
    
    tags.splice(index, 1);
    
    this.setData({
      tags: tags
    });
  },

  // 选择封面图片
  chooseCoverImage: function() {
    const that = this;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          coverImage: res.tempFilePaths[0],
          'errors.coverImage': ''
        });
      }
    });
  },

  // 删除封面图片
  removeCoverImage: function() {
    this.setData({
      coverImage: ''
    });
  },

  // 选择活动图片
  chooseActivityImages: function() {
    const that = this;
    const remainCount = this.data.maxImageCount - this.data.activityImages.length;
    
    if (remainCount <= 0) {
      wx.showToast({
        title: '最多上传9张图片',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: remainCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        that.setData({
          activityImages: [...that.data.activityImages, ...res.tempFilePaths]
        });
      }
    });
  },

  // 删除活动图片
  removeActivityImage: function(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.activityImages];
    
    images.splice(index, 1);
    
    this.setData({
      activityImages: images
    });
  },

  // 切换隐私设置
  togglePrivate: function(e) {
    this.setData({
      isPrivate: e.detail.value
    });
  },

  // 切换审核设置
  toggleReview: function(e) {
    this.setData({
      needsReview: e.detail.value
    });
  },

  // 提交表单
  submitForm: function() {
    if (this.data.submitting) {
      return;
    }
    
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({
      submitting: true
    });
    
    // 模拟请求
    wx.showLoading({
      title: '正在创建...',
      mask: true
    });
    
    // 这里应该是上传图片和提交表单的逻辑
    // 由于我们暂时没有后端，所以使用setTimeout来模拟请求
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showModal({
        title: '创建成功',
        content: '活动已成功创建',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 跳转到活动详情页或活动列表页
            wx.navigateBack();
          }
        }
      });
      
      this.setData({
        submitting: false
      });
    }, 2000);
  },

  // 表单验证
  validateForm: function() {
    let isValid = true;
    const errors = {
      title: '',
      type: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
      coverImage: ''
    };
    
    // 验证标题
    if (!this.data.title.trim()) {
      errors.title = '请输入活动标题';
      isValid = false;
    } else if (this.data.title.length < 5) {
      errors.title = '标题至少5个字符';
      isValid = false;
    }
    
    // 验证类型
    if (!this.data.type) {
      errors.type = '请选择活动类型';
      isValid = false;
    }
    
    // 验证描述
    if (!this.data.description.trim()) {
      errors.description = '请输入活动描述';
      isValid = false;
    } else if (this.data.description.length < 10) {
      errors.description = '描述至少10个字符';
      isValid = false;
    }
    
    // 验证地点
    if (!this.data.location.trim()) {
      errors.location = '请输入活动地点';
      isValid = false;
    }
    
    // 验证时间
    if (!this.data.startTime) {
      errors.startTime = '请选择开始时间';
      isValid = false;
    }
    
    if (!this.data.endTime) {
      errors.endTime = '请选择结束时间';
      isValid = false;
    }
    
    // 验证封面图片
    if (!this.data.coverImage) {
      errors.coverImage = '请上传活动封面图片';
      isValid = false;
    }
    
    this.setData({
      errors: errors
    });
    
    if (!isValid) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
    }
    
    return isValid;
  },

  // 格式化日期时间
  formatDateTime: function(date) {
    return utils.formatDate(date, 'yyyy-MM-dd HH:mm');
  }
});