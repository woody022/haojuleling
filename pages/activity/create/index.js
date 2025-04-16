// pages/activity/create/index.js
const app = getApp();
const util = require('../../../utils/common.js');

Page({
  data: {
    navBarHeight: app.globalData.navBarHeight || 88,
    statusBarHeight: app.globalData.statusBarHeight || 44,
    
    // 表单数据
    formData: {
      title: '',
      type: '',
      address: '',
      latitude: '',
      longitude: '',
      startTime: '',
      endTime: '',
      maxParticipants: '',
      registrationDeadline: '',
      description: '',
      coverImage: ''
    },
    
    // 表单错误信息
    errors: {},
    
    // 活动类型选项
    activityTypes: ['运动健身', '户外探险', '志愿服务', '文化艺术', '教育学习', '社交聚会', '其他'],
    typeIndex: -1,
    
    // 描述字数计数
    descriptionLength: 0,
    
    // 时间选择器状态
    startTimePickerVisible: false,
    endTimePickerVisible: false,
    registrationDeadlinePickerVisible: false,
    
    // 时间限制
    minDate: '',
    maxRegistrationDate: ''
  },

  onLoad() {
    // 设置最小日期为今天
    const today = this.formatDate(new Date());
    this.setData({
      minDate: today
    });
  },
  
  // 表单输入处理函数
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value,
      'errors.title': ''
    });
  },
  
  onTypeChange(e) {
    const index = e.detail.value;
    this.setData({
      typeIndex: index,
      'formData.type': this.data.activityTypes[index],
      'errors.type': ''
    });
  },
  
  onMaxParticipantsInput(e) {
    this.setData({
      'formData.maxParticipants': e.detail.value,
      'errors.maxParticipants': ''
    });
  },
  
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value,
      descriptionLength: e.detail.value.length,
      'errors.description': ''
    });
  },
  
  // 位置选择
  chooseLocation() {
    const that = this;
    wx.chooseLocation({
      success(res) {
        that.setData({
          'formData.address': res.address + res.name,
          'formData.latitude': res.latitude,
          'formData.longitude': res.longitude,
          'errors.address': ''
        });
      },
      fail(err) {
        if (err.errMsg !== 'chooseLocation:fail cancel') {
          wx.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
        }
      }
    });
  },
  
  // 上传封面图片
  uploadCoverImage() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePath = res.tempFilePaths[0];
        
        // 显示上传中
        wx.showLoading({
          title: '上传中...',
        });
        
        // 上传图片到服务器（此处使用临时路径模拟）
        setTimeout(() => {
          wx.hideLoading();
          that.setData({
            'formData.coverImage': tempFilePath,
            'errors.coverImage': ''
          });
        }, 1000);
        
        // 实际项目中应该使用 wx.uploadFile 上传到服务器
        // wx.uploadFile({
        //   url: 'https://example.com/upload',
        //   filePath: tempFilePath,
        //   name: 'file',
        //   success(res) {
        //     const data = JSON.parse(res.data);
        //     that.setData({
        //       'formData.coverImage': data.url,
        //       'errors.coverImage': ''
        //     });
        //   },
        //   fail() {
        //     wx.showToast({
        //       title: '上传失败',
        //       icon: 'none'
        //     });
        //   },
        //   complete() {
        //     wx.hideLoading();
        //   }
        // });
      }
    });
  },
  
  // 删除封面图片
  deleteCoverImage() {
    this.setData({
      'formData.coverImage': ''
    });
  },
  
  // 时间选择器相关函数
  showStartTimePicker() {
    this.setData({
      startTimePickerVisible: true
    });
  },
  
  showEndTimePicker() {
    // 如果未选择开始时间，提示先选择开始时间
    if (!this.data.formData.startTime) {
      wx.showToast({
        title: '请先选择开始时间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      endTimePickerVisible: true
    });
  },
  
  showRegistrationDeadlinePicker() {
    // 如果未选择开始时间，提示先选择开始时间
    if (!this.data.formData.startTime) {
      wx.showToast({
        title: '请先选择开始时间',
        icon: 'none'
      });
      return;
    }
    
    // 报名截止时间最大不能超过活动开始时间
    this.setData({
      registrationDeadlinePickerVisible: true,
      maxRegistrationDate: this.data.formData.startTime.split(' ')[0]
    });
  },
  
  onStartTimeConfirm(e) {
    const { dateTime } = e.detail;
    
    // 如果已经选择了结束时间，需要验证开始时间不能晚于结束时间
    if (this.data.formData.endTime) {
      const endDateTime = new Date(this.data.formData.endTime.replace(/-/g, '/'));
      const startDateTime = new Date(dateTime.replace(/-/g, '/'));
      
      if (startDateTime >= endDateTime) {
        wx.showToast({
          title: '开始时间不能晚于结束时间',
          icon: 'none'
        });
        return;
      }
    }
    
    // 如果已经选择了报名截止时间，需要验证报名截止时间不能晚于开始时间
    if (this.data.formData.registrationDeadline) {
      const registrationDateTime = new Date(this.data.formData.registrationDeadline.replace(/-/g, '/'));
      const startDateTime = new Date(dateTime.replace(/-/g, '/'));
      
      if (registrationDateTime > startDateTime) {
        // 报名截止时间需要重置
        this.setData({
          'formData.registrationDeadline': '',
          'errors.registrationDeadline': ''
        });
      }
    }
    
    this.setData({
      'formData.startTime': dateTime,
      'errors.startTime': '',
      startTimePickerVisible: false
    });
  },
  
  onEndTimeConfirm(e) {
    const { dateTime } = e.detail;
    
    // 验证结束时间不能早于开始时间
    const startDateTime = new Date(this.data.formData.startTime.replace(/-/g, '/'));
    const endDateTime = new Date(dateTime.replace(/-/g, '/'));
    
    if (endDateTime <= startDateTime) {
      wx.showToast({
        title: '结束时间不能早于开始时间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      'formData.endTime': dateTime,
      'errors.endTime': '',
      endTimePickerVisible: false
    });
  },
  
  onRegistrationDeadlineConfirm(e) {
    const { dateTime } = e.detail;
    
    // 验证报名截止时间不能晚于活动开始时间
    const startDateTime = new Date(this.data.formData.startTime.replace(/-/g, '/'));
    const deadlineDateTime = new Date(dateTime.replace(/-/g, '/'));
    
    if (deadlineDateTime > startDateTime) {
      wx.showToast({
        title: '报名截止时间不能晚于活动开始时间',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      'formData.registrationDeadline': dateTime,
      'errors.registrationDeadline': '',
      registrationDeadlinePickerVisible: false
    });
  },
  
  onTimePickerCancel() {
    this.setData({
      startTimePickerVisible: false,
      endTimePickerVisible: false,
      registrationDeadlinePickerVisible: false
    });
  },
  
  onTimePickerClose() {
    this.setData({
      startTimePickerVisible: false,
      endTimePickerVisible: false,
      registrationDeadlinePickerVisible: false
    });
  },
  
  // 表单提交
  submitForm(e) {
    const formData = e.detail.value;
    
    // 表单验证
    const errors = this.validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
      this.setData({ errors });
      
      // 显示第一个错误提示
      const firstError = Object.values(errors)[0];
      wx.showToast({
        title: firstError,
        icon: 'none',
        duration: 2000
      });
      
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    // 模拟请求
    setTimeout(() => {
      wx.hideLoading();
      
      wx.showToast({
        title: '创建成功',
        icon: 'success',
        duration: 2000
      });
      
      // 跳转到活动详情页
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/activity/detail/index?id=123'
        });
      }, 1500);
    }, 1500);
    
    // 实际项目中应该调用接口提交数据
    // wx.request({
    //   url: 'https://example.com/api/activity/create',
    //   method: 'POST',
    //   data: this.data.formData,
    //   success(res) {
    //     if (res.data.code === 0) {
    //       wx.showToast({
    //         title: '创建成功',
    //         icon: 'success'
    //       });
    //       
    //       setTimeout(() => {
    //         wx.navigateTo({
    //           url: \`/pages/activity/detail/index?id=\${res.data.data.id}\`
    //         });
    //       }, 1500);
    //     } else {
    //       wx.showToast({
    //         title: res.data.msg || '创建失败',
    //         icon: 'none'
    //       });
    //     }
    //   },
    //   fail() {
    //     wx.showToast({
    //       title: '网络异常，请重试',
    //       icon: 'none'
    //     });
    //   },
    //   complete() {
    //     wx.hideLoading();
    //   }
    // });
  },
  
  // 表单验证
  validateForm(formData) {
    const errors = {};
    
    // 标题验证
    if (!formData.title.trim()) {
      errors.title = '请输入活动标题';
    } else if (formData.title.length > 30) {
      errors.title = '活动标题不能超过30字';
    }
    
    // 活动类型验证
    if (!this.data.formData.type) {
      errors.type = '请选择活动类型';
    }
    
    // 活动地点验证
    if (!this.data.formData.address) {
      errors.address = '请选择活动地点';
    }
    
    // 活动时间验证
    if (!this.data.formData.startTime) {
      errors.startTime = '请选择活动开始时间';
    }
    
    if (!this.data.formData.endTime) {
      errors.endTime = '请选择活动结束时间';
    }
    
    // 人数限制验证（可选）
    if (formData.maxParticipants && !/^[1-9]\d*$/.test(formData.maxParticipants)) {
      errors.maxParticipants = '人数限制必须为正整数';
    }
    
    // 报名截止时间验证
    if (!this.data.formData.registrationDeadline) {
      errors.registrationDeadline = '请选择报名截止时间';
    }
    
    // 活动详情验证
    if (!formData.description.trim()) {
      errors.description = '请输入活动详情';
    } else if (formData.description.length > 500) {
      errors.description = '活动详情不能超过500字';
    }
    
    // 封面图片验证
    if (!this.data.formData.coverImage) {
      errors.coverImage = '请上传活动封面';
    }
    
    return errors;
  },
  
  // 导航返回
  navigateBack() {
    wx.navigateBack();
  },
  
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return \`\${year}-\${month}-\${day}\`;
  }
});