// pages/utils-demo/index.js
// 引入增强版工具类
const utils = require('../../utils/index-new');

Page({
  data: {
    results: [],
    formData: {
      username: '',
      phone: '',
      email: ''
    },
    formErrors: {}
  },

  onLoad() {
    // 添加一条测试结果
    this.addResult('页面加载成功');
    
    // 测试工具类
    this.testUtils();
  },

  // 测试通用工具类
  testUtils() {
    try {
      // 测试isEmpty函数
      const emptyTest1 = utils.isEmpty('');
      const emptyTest2 = utils.isEmpty('Hello');
      this.addResult(`isEmpty(''): ${emptyTest1}`);
      this.addResult(`isEmpty('Hello'): ${emptyTest2}`);
      
      // 测试formatDate函数
      const now = new Date();
      const formattedDate = utils.formatDate(now, 'YYYY-MM-DD HH:mm');
      this.addResult(`当前日期格式化: ${formattedDate}`);
      
      // 测试随机数生成
      const randomNum = utils.random(1, 100);
      this.addResult(`1-100随机数: ${randomNum}`);
      
      // 测试本地存储
      utils.storage.set('testKey', '测试数据', 60000); // 1分钟过期
      const storedData = utils.storage.get('testKey');
      this.addResult(`存储测试: ${storedData}`);
      
      // 测试表单验证
      this.testFormValidation();
    } catch (error) {
      this.addResult(`测试出错: ${error.message}`);
    }
  },
  
  // 测试表单验证
  testFormValidation() {
    const validateRules = {
      username: [
        { type: 'required', message: '用户名不能为空' }
      ],
      phone: [
        { type: 'required', message: '手机号不能为空' },
        { type: 'phone', message: '手机号格式不正确' }
      ],
      email: [
        { type: 'email', message: '邮箱格式不正确' }
      ]
    };
    
    // 设置测试数据
    this.setData({
      formData: {
        username: '张三',
        phone: '13800138000',
        email: 'test@example.com'
      }
    });
    
    // 验证表单
    const result = utils.validate.validateForm(validateRules, this.data.formData);
    this.addResult(`表单验证通过: ${result.isValid}`);
    
    // 测试错误表单
    const invalidResult = utils.validate.validateForm(validateRules, {
      username: '',
      phone: '123',
      email: 'invalid-email'
    });
    this.addResult(`错误表单验证: ${invalidResult.isValid}`);
    this.setData({
      formErrors: invalidResult.errors
    });
  },
  
  // 测试HTTP请求
  testRequest() {
    // 模拟网络请求
    this.addResult('发起网络请求...');
    
    utils.request({
      name: 'user', // 使用云函数
      data: { action: 'getUserInfo' },
      showLoading: true
    }).then(res => {
      this.addResult(`请求成功: ${JSON.stringify(res)}`);
    }).catch(err => {
      this.addResult(`请求失败: ${err.message || '未知错误'}`);
    });
  },
  
  // 添加测试结果
  addResult(text) {
    const results = this.data.results;
    results.push(text);
    this.setData({ results });
  },
  
  // 清空测试结果
  clearResults() {
    this.setData({ results: [] });
  },
  
  // 表单输入
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },
  
  // 提交表单
  submitForm() {
    const validateRules = {
      username: [
        { type: 'required', message: '用户名不能为空' }
      ],
      phone: [
        { type: 'required', message: '手机号不能为空' },
        { type: 'phone', message: '手机号格式不正确' }
      ],
      email: [
        { type: 'email', message: '邮箱格式不正确' }
      ]
    };
    
    // 验证表单
    const result = utils.validate.validateForm(validateRules, this.data.formData);
    
    if (result.isValid) {
      utils.showToast('表单验证通过', 'success');
      this.addResult('表单提交成功');
    } else {
      utils.showToast('表单验证失败', 'error');
      this.setData({
        formErrors: result.errors
      });
    }
  },
  
  // 测试网络请求
  onRequestTest() {
    this.testRequest();
  }
})