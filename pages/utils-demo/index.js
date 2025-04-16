// pages/utils-demo/index.js
const utils = require('../../src/utils/common.js');

Page({
  data: {
    results: [],
    formData: {
      username: '',
      phone: '',
      email: ''
    },
    formErrors: {
      username: '',
      phone: '',
      email: ''
    },
    networkResult: ''
  },
  
  onLoad() {
    // 页面加载时执行一些简单的工具类示例
    this.addResult('页面加载完成，开始测试工具类...');
    
    // 测试判空函数
    this.addResult(`isEmpty(''): ${utils.isEmpty('')}`);
    this.addResult(`isEmpty(null): ${utils.isEmpty(null)}`);
    this.addResult(`isEmpty([]): ${utils.isEmpty([])}`);
    this.addResult(`isEmpty({a: 1}): ${utils.isEmpty({a: 1})}`);
    
    // 测试日期格式化
    const now = new Date();
    this.addResult(`当前时间格式化: ${utils.formatDate(now, 'YYYY-MM-DD HH:mm:ss')}`);
    
    // 测试数字格式化
    this.addResult(`formatNumber(12345.6789, 2, true): ${utils.formatNumber(12345.6789, 2, true)}`);
    
    // 测试随机数生成
    this.addResult(`random(1, 100, true): ${utils.random(1, 100, true)}`);
    
    // 测试随机字符串
    this.addResult(`randomString(10): ${utils.randomString(10)}`);
    
    // 测试文件大小格式化
    this.addResult(`formatFileSize(1024): ${utils.formatFileSize(1024)}`);
    this.addResult(`formatFileSize(1048576): ${utils.formatFileSize(1048576)}`);
  },
  
  // 添加结果到列表
  addResult(message) {
    const results = this.data.results;
    results.push({
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      text: message
    });
    
    // 保持最多显示15条结果
    if (results.length > 15) {
      results.shift();
    }
    
    this.setData({
      results: results
    });
  },
  
  // 清空结果列表
  clearResults() {
    this.setData({
      results: []
    });
  },
  
  // 输入框变化处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },
  
  // 表单验证和提交
  submitForm() {
    const { formData } = this.data;
    let isValid = true;
    let formErrors = {
      username: '',
      phone: '',
      email: ''
    };
    
    // 用户名验证
    if (utils.isEmpty(formData.username)) {
      formErrors.username = '用户名不能为空';
      isValid = false;
    } else if (formData.username.length < 3) {
      formErrors.username = '用户名长度不能少于3个字符';
      isValid = false;
    }
    
    // 手机号验证
    if (!utils.isEmpty(formData.phone)) {
      const phoneReg = /^1[3-9]\d{9}$/;
      if (!phoneReg.test(formData.phone)) {
        formErrors.phone = '请输入有效的手机号码';
        isValid = false;
      }
    }
    
    // 邮箱验证
    if (!utils.isEmpty(formData.email)) {
      const emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailReg.test(formData.email)) {
        formErrors.email = '请输入有效的邮箱地址';
        isValid = false;
      }
    }
    
    this.setData({ formErrors });
    
    if (isValid) {
      this.addResult(`表单验证通过: ${JSON.stringify(formData)}`);
      
      // 使用防抖函数模拟网络请求
      const simulateRequest = utils.debounce((data) => {
        this.addResult(`模拟网络请求提交数据: ${JSON.stringify(data)}`);
        
        // 模拟请求完成
        setTimeout(() => {
          this.setData({
            networkResult: '表单提交成功！时间戳: ' + Date.now()
          });
        }, 1000);
      }, 500);
      
      simulateRequest(formData);
    } else {
      this.addResult('表单验证失败，请检查输入');
    }
  },
  
  // 深克隆测试
  testDeepClone() {
    const original = {
      name: '测试对象',
      age: 25,
      hobbies: ['读书', '编程'],
      address: {
        city: '北京',
        detail: '朝阳区'
      }
    };
    
    const clone = utils.deepClone(original);
    clone.name = '已修改';
    clone.hobbies.push('运动');
    clone.address.city = '上海';
    
    this.addResult('原始对象: ' + JSON.stringify(original));
    this.addResult('克隆对象: ' + JSON.stringify(clone));
    this.addResult('深度克隆测试: ' + (original.name !== clone.name && 
                                  original.address.city !== clone.address.city ? '通过' : '失败'));
  },
  
  // 对象合并测试
  testMerge() {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    
    const merged = utils.merge(obj1, obj2);
    
    this.addResult('对象1: ' + JSON.stringify(obj1));
    this.addResult('对象2: ' + JSON.stringify(obj2));
    this.addResult('合并结果: ' + JSON.stringify(merged));
  }
});