// pages/utils-demo/index.js
import * as common from '../../src/utils/common.js';

Page({
  data: {
    results: [],
    // isEmpty测试数据
    isEmptyValue: '',
    isEmptyResult: '',
    
    // deepClone测试数据
    deepCloneObject: '{"name":"张三","age":25,"hobbies":["读书","游泳"],"address":{"city":"北京","district":"朝阳区"}}',
    deepCloneResult: '',
    
    // merge测试数据
    mergeTarget: '{"name":"张三","age":25}',
    mergeSource: '{"age":30,"gender":"男"}',
    mergeResult: '',
    
    // formatDate测试数据
    formatDateValue: '',
    formatDateFormat: 'YYYY-MM-DD HH:mm:ss',
    formatDateResult: '',
    
    // formatNumber测试数据
    formatNumberValue: 12345.6789,
    formatNumberDecimals: 2,
    formatNumberAddCommas: true,
    formatNumberResult: '',
    
    // random测试数据
    randomMin: 1,
    randomMax: 100,
    randomIsInteger: true,
    randomResult: '',
    
    // randomString测试数据
    randomStringLength: 8,
    randomStringChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    randomStringResult: '',
    
    // formatFileSize测试数据
    formatFileSizeBytes: 1048576,
    formatFileSizeDecimals: 2,
    formatFileSizeResult: '',
    
    // 表单验证测试数据
    form: {
      username: '',
      email: '',
      phone: ''
    },
    formErrors: {
      username: '',
      email: '',
      phone: ''
    },
    
    // 树结构测试数据
    treeData: [
      { id: 1, name: '北京', pid: 0 },
      { id: 2, name: '上海', pid: 0 },
      { id: 3, name: '广州', pid: 0 },
      { id: 4, name: '朝阳区', pid: 1 },
      { id: 5, name: '海淀区', pid: 1 },
      { id: 6, name: '浦东新区', pid: 2 },
      { id: 7, name: '黄浦区', pid: 2 }
    ],
    treeResult: '',
    flattenTreeResult: '',
    treeNodePath: ''
  },

  onLoad: function(options) {
    // 页面加载时，初始化一些默认值
    this.setData({
      formatDateValue: new Date().toString(),
      formatDateResult: common.formatDate(new Date(), this.data.formatDateFormat)
    });
    
    // 初始化树结构结果
    this.testBuildTree();
  },

  // isEmpty测试
  testIsEmpty: function() {
    const value = this.data.isEmptyValue;
    const result = common.isEmpty(value);
    this.setData({
      isEmptyResult: result.toString()
    });
    this.addResult('isEmpty', `测试值: "${value}", 结果: ${result}`);
  },

  // deepClone测试
  testDeepClone: function() {
    try {
      const obj = JSON.parse(this.data.deepCloneObject);
      const clone = common.deepClone(obj);
      // 修改克隆对象的属性
      clone.name = '李四';
      clone.age = 30;
      clone.hobbies.push('跑步');
      clone.address.district = '海淀区';
      
      this.setData({
        deepCloneResult: JSON.stringify({
          original: obj,
          clone: clone
        }, null, 2)
      });
      this.addResult('deepClone', '深拷贝成功，原对象与拷贝对象互不影响');
    } catch (e) {
      this.setData({
        deepCloneResult: '解析JSON失败: ' + e.message
      });
      this.addResult('deepClone', '测试失败: ' + e.message);
    }
  },

  // merge测试
  testMerge: function() {
    try {
      const target = JSON.parse(this.data.mergeTarget);
      const source = JSON.parse(this.data.mergeSource);
      const result = common.merge(target, source);
      
      this.setData({
        mergeResult: JSON.stringify(result, null, 2)
      });
      this.addResult('merge', `合并结果: ${JSON.stringify(result)}`);
    } catch (e) {
      this.setData({
        mergeResult: '解析JSON失败: ' + e.message
      });
      this.addResult('merge', '测试失败: ' + e.message);
    }
  },

  // formatDate测试
  testFormatDate: function() {
    try {
      const date = new Date(this.data.formatDateValue);
      const format = this.data.formatDateFormat;
      const result = common.formatDate(date, format);
      
      this.setData({
        formatDateResult: result
      });
      this.addResult('formatDate', `日期: ${date}, 格式: ${format}, 结果: ${result}`);
    } catch (e) {
      this.setData({
        formatDateResult: '格式化日期失败: ' + e.message
      });
      this.addResult('formatDate', '测试失败: ' + e.message);
    }
  },

  // formatNumber测试
  testFormatNumber: function() {
    try {
      const number = parseFloat(this.data.formatNumberValue);
      const decimals = parseInt(this.data.formatNumberDecimals);
      const addCommas = this.data.formatNumberAddCommas;
      const result = common.formatNumber(number, decimals, addCommas);
      
      this.setData({
        formatNumberResult: result
      });
      this.addResult('formatNumber', `数字: ${number}, 小数位: ${decimals}, 添加逗号: ${addCommas}, 结果: ${result}`);
    } catch (e) {
      this.setData({
        formatNumberResult: '格式化数字失败: ' + e.message
      });
      this.addResult('formatNumber', '测试失败: ' + e.message);
    }
  },

  // random测试
  testRandom: function() {
    try {
      const min = parseInt(this.data.randomMin);
      const max = parseInt(this.data.randomMax);
      const isInteger = this.data.randomIsInteger;
      const result = common.random(min, max, isInteger);
      
      this.setData({
        randomResult: result
      });
      this.addResult('random', `最小值: ${min}, 最大值: ${max}, 整数: ${isInteger}, 结果: ${result}`);
    } catch (e) {
      this.setData({
        randomResult: '生成随机数失败: ' + e.message
      });
      this.addResult('random', '测试失败: ' + e.message);
    }
  },

  // randomString测试
  testRandomString: function() {
    try {
      const length = parseInt(this.data.randomStringLength);
      const chars = this.data.randomStringChars;
      const result = common.randomString(length, chars);
      
      this.setData({
        randomStringResult: result
      });
      this.addResult('randomString', `长度: ${length}, 字符集: ${chars ? '自定义' : '默认'}, 结果: ${result}`);
    } catch (e) {
      this.setData({
        randomStringResult: '生成随机字符串失败: ' + e.message
      });
      this.addResult('randomString', '测试失败: ' + e.message);
    }
  },

  // formatFileSize测试
  testFormatFileSize: function() {
    try {
      const bytes = parseInt(this.data.formatFileSizeBytes);
      const decimals = parseInt(this.data.formatFileSizeDecimals);
      const result = common.formatFileSize(bytes, decimals);
      
      this.setData({
        formatFileSizeResult: result
      });
      this.addResult('formatFileSize', `字节数: ${bytes}, 小数位: ${decimals}, 结果: ${result}`);
    } catch (e) {
      this.setData({
        formatFileSizeResult: '格式化文件大小失败: ' + e.message
      });
      this.addResult('formatFileSize', '测试失败: ' + e.message);
    }
  },

  // 测试防抖函数
  clickCount: 0,
  debounceClick: function() {
    this.clickCount++;
    this.handleDebounceClick();
    this.addResult('点击计数', `点击了 ${this.clickCount} 次`);
  },
  
  handleDebounceClick: common.debounce(function() {
    this.addResult('debounce', '防抖函数执行了！只在停止点击后1秒执行一次');
  }, 1000),

  // 测试节流函数
  throttleClickCount: 0,
  throttleClick: function() {
    this.throttleClickCount++;
    this.handleThrottleClick();
    this.addResult('节流点击计数', `点击了 ${this.throttleClickCount} 次`);
  },
  
  handleThrottleClick: common.throttle(function() {
    this.addResult('throttle', '节流函数执行了！每1秒最多执行一次');
  }, 1000),

  // 表单输入处理
  handleInput: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 表单验证
  validateForm: function() {
    const { username, email, phone } = this.data.form;
    let errors = {
      username: '',
      email: '',
      phone: ''
    };
    let isValid = true;
    
    // 用户名验证
    if (common.isEmpty(username)) {
      errors.username = '用户名不能为空';
      isValid = false;
    } else if (username.length < 3) {
      errors.username = '用户名不能少于3个字符';
      isValid = false;
    }
    
    // 邮箱验证
    if (common.isEmpty(email)) {
      errors.email = '邮箱不能为空';
      isValid = false;
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      errors.email = '邮箱格式不正确';
      isValid = false;
    }
    
    // 手机号验证
    if (common.isEmpty(phone)) {
      errors.phone = '手机号不能为空';
      isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      errors.phone = '手机号格式不正确';
      isValid = false;
    }
    
    this.setData({ formErrors: errors });
    
    if (isValid) {
      this.addResult('表单验证', '验证通过，数据: ' + JSON.stringify(this.data.form));
    } else {
      this.addResult('表单验证', '验证失败，请检查表单信息');
    }
    
    return isValid;
  },

  // 测试buildTree函数
  testBuildTree: function() {
    const data = this.data.treeData;
    const options = { idKey: 'id', pidKey: 'pid', childrenKey: 'children' };
    const treeResult = common.buildTree(data, options);
    
    this.setData({
      treeResult: JSON.stringify(treeResult, null, 2)
    });
    this.addResult('buildTree', '构建树结构成功');
    
    // 测试flattenTree
    this.testFlattenTree(treeResult);
  },

  // 测试flattenTree函数
  testFlattenTree: function(tree) {
    const options = { childrenKey: 'children' };
    const result = common.flattenTree(tree, options);
    
    this.setData({
      flattenTreeResult: JSON.stringify(result, null, 2)
    });
    this.addResult('flattenTree', '展平树结构成功');
  },

  // 测试getTreeNodePath函数
  testGetTreeNodePath: function() {
    const tree = JSON.parse(this.data.treeResult);
    const options = { 
      idKey: 'id', 
      childrenKey: 'children' 
    };
    // 寻找"朝阳区"的路径
    const path = common.getTreeNodePath(tree, 4, options);
    
    this.setData({
      treeNodePath: JSON.stringify(path, null, 2)
    });
    this.addResult('getTreeNodePath', `找到节点路径: ${JSON.stringify(path.map(item => item.name))}`);
  },

  // 添加结果到列表
  addResult: function(title, content) {
    const results = this.data.results;
    results.unshift({
      id: Date.now(),
      title,
      content,
      time: common.formatDate(new Date(), 'HH:mm:ss')
    });
    
    // 只保留最新的20条记录
    if (results.length > 20) {
      results.pop();
    }
    
    this.setData({ results });
  },

  // 清除结果列表
  clearResults: function() {
    this.setData({ results: [] });
  }
});