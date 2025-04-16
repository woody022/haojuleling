// pages/activity/create/index.js
const app = getApp();
const util = require('../../../src/utils/common.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit: false,
    activityId: '',
    isSubmitting: false,
    
    // 基本信息
    title: '',
    type: '',
    typeIndex: 0,
    typeOptions: ['线下活动', '线上会议', '课程讲座', '其他'],
    description: '',
    
    // 时间地点
    address: '',
    longitude: 0,
    latitude: 0,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    maxParticipants: '',
    
    // 标签
    tagInput: '',
    tags: [],
    
    // 图片
    coverImage: '',
    activityImages: [],
    
    // 设置
    isPublic: true,
    
    // 计数器
    descriptionCount: 0,
    maxDescriptionLength: 200,
    
    // 日期选择器
    showDatePicker: false,
    datePickerType: '', // 'start' 或 'end'
    datePickerValue: null,
    currentDate: new Date(),
    
    // 错误提示
    errors: {
      title: '',
      type: '',
      address: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
      coverImage: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 判断是创建还是编辑
    if (options.id) {
      this.setData({
        isEdit: true,
        activityId: options.id
      });
      this.loadActivityData(options.id);
    } else {
      // 设置默认开始和结束时间
      const now = new Date();
      const start = new Date(now.getTime() + 3600 * 1000); // 1小时后
      const end = new Date(now.getTime() + 3600 * 1000 * 3); // 3小时后
      
      this.setData({
        startDate: this.formatDate(start),
        startTime: this.formatTime(start),
        endDate: this.formatDate(end),
        endTime: this.formatTime(end)
      });
    }
  },

  /**
   * 加载活动数据
   */
  loadActivityData: function (activityId) {
    wx.showLoading({
      title: '加载中',
    });
    
    // 调用云函数或API获取活动数据
    // 这里是示例，实际中需要替换为真实API调用
    setTimeout(() => {
      // 模拟数据
      const activityData = {
        title: '示例活动',
        type: '线下活动',
        description: '这是一个示例活动描述...',
        address: '北京市海淀区清华大学',
        longitude: 116.32,
        latitude: 40.00,
        startTime: new Date(Date.now() + 24 * 3600 * 1000),
        endTime: new Date(Date.now() + 30 * 3600 * 1000),
        maxParticipants: 50,
        tags: ['科技', '教育', '公益'],
        coverImage: 'temp/cover.jpg',
        activityImages: ['temp/img1.jpg', 'temp/img2.jpg'],
        isPublic: true
      };
      
      // 更新类型索引
      const typeIndex = this.data.typeOptions.findIndex(t => t === activityData.type);
      
      this.setData({
        title: activityData.title,
        type: activityData.type,
        typeIndex: typeIndex >= 0 ? typeIndex : 0,
        description: activityData.description,
        descriptionCount: activityData.description.length,
        address: activityData.address,
        longitude: activityData.longitude,
        latitude: activityData.latitude,
        startDate: this.formatDate(activityData.startTime),
        startTime: this.formatTime(activityData.startTime),
        endDate: this.formatDate(activityData.endTime),
        endTime: this.formatTime(activityData.endTime),
        maxParticipants: String(activityData.maxParticipants),
        tags: activityData.tags,
        coverImage: activityData.coverImage,
        activityImages: activityData.activityImages,
        isPublic: activityData.isPublic
      });
      
      wx.hideLoading();
    }, 1000);
  },
  
  /**
   * 输入标题
   */
  onTitleInput: function (e) {
    this.setData({
      title: e.detail.value,
      'errors.title': ''
    });
  },
  
  /**
   * 选择活动类型
   */
  onTypeChange: function (e) {
    const typeIndex = e.detail.value;
    this.setData({
      typeIndex: typeIndex,
      type: this.data.typeOptions[typeIndex],
      'errors.type': ''
    });
  },
  
  /**
   * 输入描述
   */
  onDescriptionInput: function (e) {
    const value = e.detail.value;
    const length = value.length;
    
    this.setData({
      description: value,
      descriptionCount: length
    });
  },
  
  /**
   * 输入地址
   */
  onAddressInput: function (e) {
    this.setData({
      address: e.detail.value,
      'errors.address': ''
    });
  },
  
  /**
   * 选择位置
   */
  chooseLocation: function () {
    const that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          address: res.address,
          longitude: res.longitude,
          latitude: res.latitude,
          'errors.address': ''
        });
      }
    });
  },
  
  /**
   * 显示日期选择器
   */
  showDatePicker: function (e) {
    const type = e.currentTarget.dataset.type;
    let currentValue;
    
    if (type === 'start') {
      currentValue = this.getDateTimeValue(this.data.startDate, this.data.startTime);
    } else {
      currentValue = this.getDateTimeValue(this.data.endDate, this.data.endTime);
    }
    
    this.setData({
      showDatePicker: true,
      datePickerType: type,
      datePickerValue: currentValue
    });
  },
  
  /**
   * 关闭日期选择器
   */
  closeDatePicker: function () {
    this.setData({
      showDatePicker: false
    });
  },
  
  /**
   * 日期选择器 - 改变值
   */
  onDatePickerChange: function (e) {
    this.setData({
      datePickerValue: e.detail.value
    });
  },
  
  /**
   * 日期选择器 - 确认
   */
  confirmDatePicker: function () {
    const date = new Date(this.data.datePickerValue);
    
    if (this.data.datePickerType === 'start') {
      this.setData({
        startDate: this.formatDate(date),
        startTime: this.formatTime(date),
        'errors.startTime': ''
      });
      
      // 如果结束时间早于开始时间，则自动调整结束时间
      const startDateTime = new Date(this.getDateTimeValue(this.data.startDate, this.data.startTime));
      const endDateTime = new Date(this.getDateTimeValue(this.data.endDate, this.data.endTime));
      
      if (endDateTime <= startDateTime) {
        const newEndTime = new Date(startDateTime.getTime() + 3600 * 1000 * 2); // 开始时间后2小时
        this.setData({
          endDate: this.formatDate(newEndTime),
          endTime: this.formatTime(newEndTime)
        });
      }
    } else {
      this.setData({
        endDate: this.formatDate(date),
        endTime: this.formatTime(date),
        'errors.endTime': ''
      });
    }
    
    this.closeDatePicker();
  },
  
  /**
   * 输入人数限制
   */
  onMaxParticipantsInput: function (e) {
    const value = e.detail.value;
    
    // 只允许输入数字
    if (!/^\d*$/.test(value)) {
      return;
    }
    
    this.setData({
      maxParticipants: value,
      'errors.maxParticipants': ''
    });
  },
  
  /**
   * 输入标签
   */
  onTagInput: function (e) {
    this.setData({
      tagInput: e.detail.value
    });
  },
  
  /**
   * 添加标签
   */
  addTag: function () {
    const tagInput = this.data.tagInput.trim();
    if (!tagInput) return;
    
    // 检查是否已存在相同标签
    if (this.data.tags.includes(tagInput)) {
      wx.showToast({
        title: '该标签已存在',
        icon: 'none'
      });
      return;
    }
    
    // 限制标签数量
    if (this.data.tags.length >= 10) {
      wx.showToast({
        title: '最多添加10个标签',
        icon: 'none'
      });
      return;
    }
    
    const tags = [...this.data.tags, tagInput];
    this.setData({
      tags,
      tagInput: ''
    });
  },
  
  /**
   * 移除标签
   */
  removeTag: function (e) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.tags];
    tags.splice(index, 1);
    this.setData({
      tags
    });
  },
  
  /**
   * 选择封面图片
   */
  chooseCoverImage: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          coverImage: res.tempFilePaths[0],
          'errors.coverImage': ''
        });
      }
    });
  },
  
  /**
   * 选择活动图片
   */
  chooseActivityImage: function () {
    const that = this;
    const currentCount = that.data.activityImages.length;
    const remainCount = 9 - currentCount;
    
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
      success: function (res) {
        that.setData({
          activityImages: [...that.data.activityImages, ...res.tempFilePaths]
        });
      }
    });
  },
  
  /**
   * 删除图片
   */
  removeImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const activityImages = [...this.data.activityImages];
    activityImages.splice(index, 1);
    this.setData({
      activityImages
    });
  },
  
  /**
   * 删除封面图
   */
  removeCoverImage: function () {
    this.setData({
      coverImage: ''
    });
  },
  
  /**
   * 切换公开设置
   */
  togglePublic: function (e) {
    this.setData({
      isPublic: e.detail.value
    });
  },
  
  /**
   * 表单验证
   */
  validateForm: function () {
    let isValid = true;
    const errors = {
      title: '',
      type: '',
      address: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
      coverImage: ''
    };
    
    // 验证标题
    if (!this.data.title.trim()) {
      errors.title = '请输入活动标题';
      isValid = false;
    }
    
    // 验证类型
    if (!this.data.type) {
      errors.type = '请选择活动类型';
      isValid = false;
    }
    
    // 验证地址
    if (!this.data.address.trim()) {
      errors.address = '请输入活动地点';
      isValid = false;
    }
    
    // 验证开始时间
    const now = new Date();
    const startDateTime = new Date(this.getDateTimeValue(this.data.startDate, this.data.startTime));
    
    if (startDateTime < now) {
      errors.startTime = '开始时间不能早于当前时间';
      isValid = false;
    }
    
    // 验证结束时间
    const endDateTime = new Date(this.getDateTimeValue(this.data.endDate, this.data.endTime));
    
    if (endDateTime <= startDateTime) {
      errors.endTime = '结束时间必须晚于开始时间';
      isValid = false;
    }
    
    // 验证人数限制
    if (this.data.maxParticipants && (parseInt(this.data.maxParticipants) <= 0 || parseInt(this.data.maxParticipants) > 10000)) {
      errors.maxParticipants = '请输入合理的人数限制(1-10000)';
      isValid = false;
    }
    
    // 验证封面图
    if (!this.data.coverImage) {
      errors.coverImage = '请上传活动封面图';
      isValid = false;
    }
    
    this.setData({ errors });
    return isValid;
  },
  
  /**
   * 提交表单
   */
  submitForm: function () {
    if (!this.validateForm()) {
      wx.showToast({
        title: '请完善表单信息',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isSubmitting: true });
    
    // 构造活动数据
    const activityData = {
      title: this.data.title,
      type: this.data.type,
      description: this.data.description,
      address: this.data.address,
      longitude: this.data.longitude,
      latitude: this.data.latitude,
      startTime: this.getDateTimeValue(this.data.startDate, this.data.startTime),
      endTime: this.getDateTimeValue(this.data.endDate, this.data.endTime),
      maxParticipants: this.data.maxParticipants ? parseInt(this.data.maxParticipants) : 0,
      tags: this.data.tags,
      coverImage: this.data.coverImage,
      activityImages: this.data.activityImages,
      isPublic: this.data.isPublic
    };
    
    // 如果是编辑模式，添加活动ID
    if (this.data.isEdit) {
      activityData.id = this.data.activityId;
    }
    
    console.log('提交的活动数据:', activityData);
    
    // 上传图片并提交表单
    this.uploadImagesAndSubmit(activityData);
  },
  
  /**
   * 上传图片并提交表单
   */
  uploadImagesAndSubmit: function (activityData) {
    // 在这里实现图片上传逻辑
    // 上传完成后调用创建/更新活动的API
    
    // 示例代码，实际项目中需要替换为真实的上传和API调用
    setTimeout(() => {
      wx.showToast({
        title: this.data.isEdit ? '活动更新成功' : '活动创建成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            // 返回上一页或跳转到活动详情页
            if (this.data.isEdit) {
              wx.navigateBack();
            } else {
              wx.redirectTo({
                url: '/pages/activity/detail/index?id=新创建的活动ID'
              });
            }
          }, 2000);
        }
      });
      
      this.setData({ isSubmitting: false });
    }, 2000);
  },
  
  /**
   * 格式化日期 (YYYY-MM-DD)
   */
  formatDate: function (date) {
    date = new Date(date);
    return util.formatDate(date, 'YYYY-MM-DD');
  },
  
  /**
   * 格式化时间 (HH:mm)
   */
  formatTime: function (date) {
    date = new Date(date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },
  
  /**
   * 获取完整的日期时间值
   */
  getDateTimeValue: function (dateStr, timeStr) {
    if (!dateStr || !timeStr) return new Date();
    
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
    const [hours, minutes] = timeStr.split(':').map(num => parseInt(num));
    
    return new Date(year, month - 1, day, hours, minutes, 0);
  }
});