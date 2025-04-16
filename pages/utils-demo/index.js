// pages/utils-demo/index.js
const utils = require('../../src/utils/common.js');

Page({
  data: {
    testInput: '',
    testObject: { name: '张三', age: 25 },
    clonedObject: null,
    mergedObject: null,
    formattedDate: '',
    formattedNumber: '',
    randomNumber: 0,
    randomString: '',
    fileSize: '',
    
    // 防抖和节流测试
    debounceCount: 0,
    throttleCount: 0,
    lastTriggerTime: '',
    
    // 表单验证
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
    
    // 结果展示
    results: [],
    
    // 树形结构测试数据
    treeData: [
      { id: 1, parentId: 0, name: '水果' },
      { id: 2, parentId: 0, name: '蔬菜' },
      { id: 3, parentId: 1, name: '苹果' },
      { id: 4, parentId: 1, name: '香蕉' },
      { id: 5, parentId: 2, name: '胡萝卜' },
      { id: 6, parentId: 2, name: '白菜' },
      { id: 7, parentId: 3, name: '红富士' },
      { id: 8, parentId: 3, name: '青苹果' }
    ],
    treeResult: '',
    flattenResult: '',
    nodePath: ''
  },

  onLoad: function() {
    // 页面加载时初始化
    this.addResult('页面加载', '工具类测试页面初始化完成');
  },
  
  // 基础功能测试
  testIsEmpty: function() {
    const value = this.data.testInput;
    const result = utils.isEmpty(value);
    this.addResult('isEmpty测试', `输入值: "${value}", 结果: ${result}`);
  },
  
  testDeepClone: function() {
    const original = this.data.testObject;
    const cloned = utils.deepClone(original);
    cloned.name = '李四';
    cloned.age = 30;
    
    this.setData({
      clonedObject: cloned
    });
    
    this.addResult('deepClone测试', `原对象: ${JSON.stringify(original)}, 克隆后: ${JSON.stringify(cloned)}`);
  },
  
  testMerge: function() {
    const target = this.data.testObject;
    const source = { hobby: '读书', gender: '男' };
    const merged = utils.merge(target, source);
    
    this.setData({
      mergedObject: merged
    });
    
    this.addResult('merge测试', `合并结果: ${JSON.stringify(merged)}`);
  },
  
  testFormatDate: function() {
    const now = new Date();
    const formatted = utils.formatDate(now, 'YYYY-MM-DD HH:mm:ss');
    
    this.setData({
      formattedDate: formatted
    });
    
    this.addResult('formatDate测试', `当前时间格式化: ${formatted}`);
  },
  
  testFormatNumber: function() {
    const num = 12345.6789;
    const formatted = utils.formatNumber(num, 2, true);
    
    this.setData({
      formattedNumber: formatted
    });
    
    this.addResult('formatNumber测试', `数字 ${num} 格式化为: ${formatted}`);
  },
  
  testRandom: function() {
    const min = 1;
    const max = 100;
    const random = utils.random(min, max, true);
    
    this.setData({
      randomNumber: random
    });
    
    this.addResult('random测试', `生成 ${min} 到 ${max} 之间的随机整数: ${random}`);
  },
  
  testRandomString: function() {
    const length = 10;
    const random = utils.randomString(length);
    
    this.setData({
      randomString: random
    });
    
    this.addResult('randomString测试', `生成长度为 ${length} 的随机字符串: ${random}`);
  },
  
  testFormatFileSize: function() {
    const bytes = 1024 * 1024 * 3.5; // 3.5MB
    const formatted = utils.formatFileSize(bytes);
    
    this.setData({
      fileSize: formatted
    });
    
    this.addResult('formatFileSize测试', `${bytes} 字节格式化为: ${formatted}`);
  },
  
  // 防抖测试
  setupDebounce: function() {
    this.debouncedIncrement = utils.debounce(() => {
      const count = this.data.debounceCount + 1;
      const now = new Date();
      
      this.setData({
        debounceCount: count,
        lastTriggerTime: utils.formatDate(now, 'HH:mm:ss.SSS')
      });
      
      this.addResult('防抖测试', `触发计数: ${count}, 时间: ${this.data.lastTriggerTime}`);
    }, 1000);
  },
  
  testDebounce: function() {
    if (!this.debouncedIncrement) {
      this.setupDebounce();
    }
    this.debouncedIncrement();
  },
  
  // 节流测试
  setupThrottle: function() {
    this.throttledIncrement = utils.throttle(() => {
      const count = this.data.throttleCount + 1;
      const now = new Date();
      
      this.setData({
        throttleCount: count,
        lastTriggerTime: utils.formatDate(now, 'HH:mm:ss.SSS')
      });
      
      this.addResult('节流测试', `触发计数: ${count}, 时间: ${this.data.lastTriggerTime}`);
    }, 1000);
  },
  
  testThrottle: function() {
    if (!this.throttledIncrement) {
      this.setupThrottle();
    }
    this.throttledIncrement();
  },
  
  // 表单输入处理
  inputChange: function(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value,
      [`formErrors.${field}`]: ''
    });
  },
  
  submitForm: function() {
    let isValid = true;
    const formData = this.data.formData;
    const formErrors = {};
    
    // 用户名验证
    if (utils.isEmpty(formData.username)) {
      formErrors.username = '用户名不能为空';
      isValid = false;
    } else if (formData.username.length < 3) {
      formErrors.username = '用户名不能少于3个字符';
      isValid = false;
    }
    
    // 邮箱验证 (使用简单正则)
    if (!utils.isEmpty(formData.email) && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      formErrors.email = '邮箱格式不正确';
      isValid = false;
    }
    
    // 手机号验证
    if (!utils.isEmpty(formData.phone) && !/^1[3-9]\d{9}$/.test(formData.phone)) {
      formErrors.phone = '手机号格式不正确';
      isValid = false;
    }
    
    // 年龄验证
    if (!utils.isEmpty(formData.age)) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 120) {
        formErrors.age = '年龄必须是1-120之间的数字';
        isValid = false;
      }
    }
    
    this.setData({ formErrors });
    
    if (isValid) {
      this.addResult('表单验证', `验证通过，提交的数据: ${JSON.stringify(formData)}`);
    } else {
      this.addResult('表单验证', '验证失败，请检查表单错误提示');
    }
    
    return isValid;
  },
  
  // 树形结构测试
  testBuildTree: function() {
    const tree = utils.buildTree(this.data.treeData, {
      idKey: 'id',
      parentIdKey: 'parentId',
      childrenKey: 'children',
      rootParentId: 0
    });
    
    this.setData({
      treeResult: JSON.stringify(tree, null, 2)
    });
    
    this.addResult('buildTree测试', '成功构建树形结构，详细结果请查看树形结构测试区域');
  },
  
  testFlattenTree: function() {
    // 先构建树
    const tree = utils.buildTree(this.data.treeData, {
      idKey: 'id',
      parentIdKey: 'parentId',
      childrenKey: 'children',
      rootParentId: 0
    });
    
    // 再展平
    const flattened = utils.flattenTree(tree, {
      childrenKey: 'children'
    });
    
    this.setData({
      flattenResult: JSON.stringify(flattened, null, 2)
    });
    
    this.addResult('flattenTree测试', '成功展平树形结构，详细结果请查看树形结构测试区域');
  },
  
  testGetTreeNodePath: function() {
    // 先构建树
    const tree = utils.buildTree(this.data.treeData, {
      idKey: 'id',
      parentIdKey: 'parentId',
      childrenKey: 'children',
      rootParentId: 0
    });
    
    // 查找路径(例如查找"红富士"的路径)
    const targetNodeId = 7;
    const path = utils.getTreeNodePath(tree, targetNodeId, {
      idKey: 'id',
      childrenKey: 'children',
      pathSeparator: ' > '
    });
    
    this.setData({
      nodePath: path.map(node => node.name).join(' > ')
    });
    
    this.addResult('getTreeNodePath测试', `获取节点(ID=${targetNodeId})路径: ${this.data.nodePath}`);
  },
  
  // 通用方法 - 添加结果
  addResult: function(title, content) {
    const results = [{
      title,
      content,
      time: utils.formatDate(new Date(), 'HH:mm:ss')
    }, ...this.data.results].slice(0, 20); // 最多保留20条记录
    
    this.setData({ results });
  },
  
  // 清空结果
  clearResults: function() {
    this.setData({ results: [] });
  },
  
  // 输入框输入事件
  onInput: function(e) {
    this.setData({
      testInput: e.detail.value
    });
  }
});