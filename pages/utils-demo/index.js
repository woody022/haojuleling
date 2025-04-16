// pages/utils-demo/index.js
const utils = require('../../utils/common.js');

Page({
  data: {
    results: [],
    debounceCount: 0,
    throttleCount: 0,
    formData: {
      username: '',
      email: '',
      phone: '',
      age: ''
    },
    formErrors: {
      username: '',
      email: '',
      phone: '',
      age: ''
    },
    networkResult: ''
  },

  onLoad: function() {
    // 页面加载时初始化
    this.setData({
      results: [{
        title: '工具类加载成功',
        result: '可以开始测试各项功能'
      }]
    });
    
    // 创建防抖和节流函数
    this.debouncedClick = utils.debounce(() => {
      this.setData({
        debounceCount: this.data.debounceCount + 1
      });
    }, 500);
    
    this.throttledClick = utils.throttle(() => {
      this.setData({
        throttleCount: this.data.throttleCount + 1
      });
    }, 500);
  },
  
  // 清空结果
  clearResults() {
    this.setData({
      results: []
    });
  },
  
  // 添加一条结果
  addResult(title, result) {
    let resultValue;
    
    if (typeof result === 'object') {
      try {
        resultValue = JSON.stringify(result);
      } catch (e) {
        resultValue = '[复杂对象]';
      }
    } else {
      resultValue = String(result);
    }
    
    let newResults = [{
      title: title,
      result: resultValue
    }, ...this.data.results];
    
    if (newResults.length > 20) {
      newResults = newResults.slice(0, 20);
    }
    
    this.setData({
      results: newResults
    });
  },
  
  // 测试isEmpty函数
  testIsEmpty() {
    const testCases = [
      '', null, undefined, {}, [], 0, '0', false, true, 'hello', { a: 1 }, [1, 2, 3]
    ];
    
    testCases.forEach(value => {
      const result = utils.isEmpty(value);
      this.addResult(`isEmpty(${String(value)})`, result);
    });
  },
  
  // 测试深拷贝
  testDeepClone() {
    const original = {
      name: 'test',
      age: 25,
      hobbies: ['reading', 'gaming'],
      address: {
        city: 'Beijing',
        street: 'Wangfujing'
      }
    };
    
    const cloned = utils.deepClone(original);
    cloned.name = 'modified';
    cloned.hobbies.push('running');
    cloned.address.city = 'Shanghai';
    
    this.addResult('原始对象', original);
    this.addResult('深拷贝后的对象', cloned);
  },
  
  // 测试对象合并
  testMerge() {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    
    const merged = utils.merge(obj1, obj2);
    
    this.addResult('obj1', obj1);
    this.addResult('obj2', obj2);
    this.addResult('合并结果', merged);
  },
  
  // 测试日期格式化
  testFormatDate() {
    const now = new Date();
    
    const formats = [
      'YYYY-MM-DD',
      'YYYY年MM月DD日',
      'YYYY-MM-DD hh:mm:ss',
      'hh:mm:ss',
      'MM/DD/YYYY'
    ];
    
    formats.forEach(format => {
      const result = utils.formatDate(now, format);
      this.addResult(`formatDate(${format})`, result);
    });
  },
  
  // 测试数字格式化
  testFormatNumber() {
    const numbers = [
      1234.5678,
      0,
      -1000.123,
      9999999.99
    ];
    
    numbers.forEach(num => {
      const withDecimals = utils.formatNumber(num, 2);
      const withCommas = utils.formatNumber(num, 2, true);
      
      this.addResult(`formatNumber(${num}, 2)`, withDecimals);
      this.addResult(`formatNumber(${num}, 2, true)`, withCommas);
    });
  },
  
  // 测试随机数生成
  testRandom() {
    for (let i = 0; i < 5; i++) {
      const randomInt = utils.random(1, 100, true);
      const randomFloat = utils.random(1, 100, false);
      
      this.addResult(`随机整数(1-100)`, randomInt);
      this.addResult(`随机浮点数(1-100)`, randomFloat);
    }
  },
  
  // 测试URL参数提取
  testGetUrlParam() {
    const url = 'https://example.com?id=123&name=test&active=true';
    
    const id = utils.getUrlParam('id', url);
    const name = utils.getUrlParam('name', url);
    const active = utils.getUrlParam('active', url);
    const notExist = utils.getUrlParam('notExist', url);
    
    this.addResult('URL', url);
    this.addResult('id参数', id);
    this.addResult('name参数', name);
    this.addResult('active参数', active);
    this.addResult('notExist参数', notExist);
  },
  
  // 测试URL参数构建
  testBuildUrlParams() {
    const params = {
      id: 123,
      name: 'test',
      active: true,
      tags: ['a', 'b', 'c']
    };
    
    const urlParams = utils.buildUrlParams(params);
    
    this.addResult('参数对象', params);
    this.addResult('构建的URL参数', urlParams);
  },
  
  // 测试随机字符串生成
  testRandomString() {
    // 默认字符集
    const str1 = utils.randomString(10);
    // 指定字符集
    const str2 = utils.randomString(8, 'abcdef123456');
    // 纯数字
    const str3 = utils.randomString(6, '0123456789');
    
    this.addResult('随机字符串(10位)', str1);
    this.addResult('随机字符串(8位,自定义字符集)', str2);
    this.addResult('随机数字(6位)', str3);
  },
  
  // 测试文件大小格式化
  testFormatFileSize() {
    const sizes = [
      0,
      1024,
      1024 * 1024,
      1024 * 1024 * 1024,
      1024 * 1024 * 1024 * 10.5
    ];
    
    sizes.forEach(size => {
      const formatted = utils.formatFileSize(size);
      this.addResult(`格式化文件大小(${size}字节)`, formatted);
    });
  },
  
  // 测试防抖函数
  handleDebounceClick() {
    this.debouncedClick();
  },
  
  // 测试节流函数
  handleThrottleClick() {
    this.throttledClick();
  },
  
  // 处理表单输入
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },
  
  // 表单验证
  validateForm() {
    const { username, email, phone, age } = this.data.formData;
    const errors = {};
    let isValid = true;
    
    // 验证用户名
    if (utils.isEmpty(username)) {
      errors.username = '用户名不能为空';
      isValid = false;
    }
    
    // 验证邮箱
    if (!utils.isEmpty(email) && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
      errors.email = '邮箱格式不正确';
      isValid = false;
    }
    
    // 验证手机号
    if (!utils.isEmpty(phone) && !/^1[3-9]\d{9}$/.test(phone)) {
      errors.phone = '手机号格式不正确';
      isValid = false;
    }
    
    // 验证年龄
    if (!utils.isEmpty(age)) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        errors.age = '年龄必须是1-120之间的数字';
        isValid = false;
      }
    }
    
    this.setData({
      formErrors: errors
    });
    
    return isValid;
  },
  
  // 提交表单
  submitForm() {
    if (this.validateForm()) {
      // 模拟网络请求
      this.setData({
        networkResult: '提交中...'
      });
      
      setTimeout(() => {
        this.setData({
          networkResult: '表单提交成功！数据：' + JSON.stringify(this.data.formData)
        });
      }, 1500);
    }
  },
  
  // 测试树结构构建和扁平化
  testTreeOperations() {
    const items = [
      { id: 1, name: '水果', parentId: 0 },
      { id: 2, name: '蔬菜', parentId: 0 },
      { id: 3, name: '苹果', parentId: 1 },
      { id: 4, name: '香蕉', parentId: 1 },
      { id: 5, name: '白菜', parentId: 2 },
      { id: 6, name: '青菜', parentId: 2 },
      { id: 7, name: '红富士', parentId: 3 },
      { id: 8, name: '国光', parentId: 3 }
    ];
    
    // 构建树
    const tree = utils.buildTree(items, {
      idKey: 'id',
      parentIdKey: 'parentId',
      rootValue: 0
    });
    
    this.addResult('原始数据', items);
    this.addResult('构建的树结构', tree);
    
    // 扁平化树
    const flattened = utils.flattenTree(tree, {
      childrenKey: 'children'
    });
    
    this.addResult('扁平化后的树', flattened);
    
    // 获取节点路径
    const path = utils.getTreeNodePath(tree, 7, {
      idKey: 'id',
      childrenKey: 'children'
    });
    
    this.addResult('节点id=7的路径', path);
  }
});