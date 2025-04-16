// pages/utils-demo/index.js
const commonUtils = require('../../utils/common');

Page({
  data: {
    results: [],
    formData: {
      username: '',
      phone: '',
      email: ''
    },
    errors: {
      username: '',
      phone: '',
      email: ''
    },
    networkResult: ''
  },

  onLoad() {
    // 页面加载时的初始化操作
    this.testIsEmpty();
  },

  // 清空结果列表
  clearResults() {
    this.setData({
      results: []
    });
  },

  // 添加测试结果
  addResult(title, result) {
    const formattedResult = typeof result === 'object' 
      ? JSON.stringify(result) 
      : String(result);
    
    this.setData({
      results: [...this.data.results, `${title}: ${formattedResult}`]
    });
  },

  // 测试isEmpty方法
  testIsEmpty() {
    this.clearResults();
    this.addResult('空字符串', commonUtils.isEmpty(''));
    this.addResult('null', commonUtils.isEmpty(null));
    this.addResult('undefined', commonUtils.isEmpty(undefined));
    this.addResult('空数组', commonUtils.isEmpty([]));
    this.addResult('空对象', commonUtils.isEmpty({}));
    this.addResult('有值字符串', commonUtils.isEmpty('测试'));
    this.addResult('有值数组', commonUtils.isEmpty([1, 2, 3]));
  },

  // 测试deepClone方法
  testDeepClone() {
    this.clearResults();
    const original = {
      name: '小程序',
      info: {
        version: '1.0.0',
        features: ['工具类', '示例页']
      }
    };
    const clone = commonUtils.deepClone(original);
    clone.info.version = '2.0.0';
    
    this.addResult('原始对象', original);
    this.addResult('克隆对象', clone);
    this.addResult('版本不同', original.info.version !== clone.info.version);
  },

  // 测试merge方法
  testMerge() {
    this.clearResults();
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    const merged = commonUtils.merge(obj1, obj2);
    
    this.addResult('对象1', obj1);
    this.addResult('对象2', obj2);
    this.addResult('合并结果', merged);
  },

  // 测试formatDate方法
  testFormatDate() {
    this.clearResults();
    const now = new Date();
    
    this.addResult('默认格式', commonUtils.formatDate(now));
    this.addResult('年月日', commonUtils.formatDate(now, 'YYYY-MM-DD'));
    this.addResult('完整时间', commonUtils.formatDate(now, 'YYYY-MM-DD HH:mm:ss'));
    this.addResult('自定义格式', commonUtils.formatDate(now, 'MM月DD日 HH时mm分'));
  },

  // 测试formatNumber方法
  testFormatNumber() {
    this.clearResults();
    
    this.addResult('两位小数', commonUtils.formatNumber(1234.5678, 2));
    this.addResult('带千分位', commonUtils.formatNumber(1234567.89, 2, true));
    this.addResult('无小数', commonUtils.formatNumber(1234, 0, true));
  },

  // 测试random方法
  testRandom() {
    this.clearResults();
    
    this.addResult('浮点数(0-1)', commonUtils.random(0, 1));
    this.addResult('整数(1-100)', commonUtils.random(1, 100, true));
    this.addResult('浮点数(0-10,两位小数)', parseFloat(commonUtils.random(0, 10).toFixed(2)));
  },

  // 测试debounce和throttle需要按钮快速点击事件，这里简化测试
  testDebounceThrottle() {
    this.clearResults();
    this.addResult('防抖节流', '请通过快速点击下方按钮测试');
    
    // 正常点击计数
    this.normalCount = 0;
    // 防抖函数计数
    this.debounceCount = 0;
    // 节流函数计数
    this.throttleCount = 0;
    
    // 使用防抖包装点击处理函数
    this.debouncedClick = commonUtils.debounce(() => {
      this.debounceCount++;
      this.updateCounts();
    }, 500);
    
    // 使用节流包装点击处理函数
    this.throttledClick = commonUtils.throttle(() => {
      this.throttleCount++;
      this.updateCounts();
    }, 500);
  },
  
  // 按钮点击测试防抖节流
  handleTestClick() {
    this.normalCount++;
    this.debouncedClick();
    this.throttledClick();
    this.updateCounts();
  },
  
  // 更新测试计数结果
  updateCounts() {
    this.setData({
      results: [
        `正常点击: ${this.normalCount}次`,
        `防抖处理: ${this.debounceCount}次`,
        `节流处理: ${this.throttleCount}次`
      ]
    });
  },

  // 测试URL相关方法
  testUrlMethods() {
    this.clearResults();
    const testUrl = 'https://example.com/page?id=123&name=测试&active=true';
    
    this.addResult('获取URL参数id', commonUtils.getUrlParam('id', testUrl));
    this.addResult('获取URL参数name', commonUtils.getUrlParam('name', testUrl));
    
    const params = { page: 1, size: 20, keyword: '小程序' };
    this.addResult('构建URL参数', commonUtils.buildUrlParams(params));
  },

  // 测试randomString方法
  testRandomString() {
    this.clearResults();
    
    this.addResult('默认随机字符串(8位)', commonUtils.randomString(8));
    this.addResult('数字随机字符串(6位)', commonUtils.randomString(6, '0123456789'));
    this.addResult('自定义字符随机字符串', commonUtils.randomString(10, 'abcdef123456'));
  },

  // 测试formatFileSize方法
  testFormatFileSize() {
    this.clearResults();
    
    this.addResult('1024字节', commonUtils.formatFileSize(1024));
    this.addResult('1048576字节', commonUtils.formatFileSize(1048576));
    this.addResult('1073741824字节', commonUtils.formatFileSize(1073741824));
    this.addResult('自定义小数位数', commonUtils.formatFileSize(1550000, 0));
  },

  // 测试树结构相关方法
  testTreeMethods() {
    this.clearResults();
    
    const flatData = [
      { id: 1, name: '一级菜单A', parentId: 0 },
      { id: 2, name: '一级菜单B', parentId: 0 },
      { id: 3, name: '二级菜单A-1', parentId: 1 },
      { id: 4, name: '二级菜单A-2', parentId: 1 },
      { id: 5, name: '二级菜单B-1', parentId: 2 },
      { id: 6, name: '三级菜单A-1-1', parentId: 3 }
    ];
    
    // 构建树结构
    const tree = commonUtils.buildTree(flatData, {
      idKey: 'id',
      parentIdKey: 'parentId',
      childrenKey: 'children',
      rootParentId: 0
    });
    
    this.addResult('构建树结构', tree);
    
    // 拍平树结构
    const flattened = commonUtils.flattenTree(tree, {
      childrenKey: 'children'
    });
    
    this.addResult('拍平树结构', flattened);
    
    // 获取节点路径
    const path = commonUtils.getTreeNodePath(tree, 6, {
      idKey: 'id',
      childrenKey: 'children'
    });
    
    this.addResult('节点6的路径', path);
  },

  // 表单输入处理函数
  handleInput(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 表单验证
  validateForm() {
    let isValid = true;
    const errors = {
      username: '',
      phone: '',
      email: ''
    };
    
    // 用户名验证
    if (commonUtils.isEmpty(this.data.formData.username)) {
      errors.username = '用户名不能为空';
      isValid = false;
    }
    
    // 手机号验证 (简单的11位数字验证)
    if (!(/^1\d{10}$/.test(this.data.formData.phone))) {
      errors.phone = '请输入有效的11位手机号码';
      isValid = false;
    }
    
    // 邮箱验证
    if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(this.data.formData.email))) {
      errors.email = '请输入有效的邮箱地址';
      isValid = false;
    }
    
    this.setData({ errors });
    return isValid;
  },

  // 提交表单
  submitForm() {
    if (this.validateForm()) {
      // 模拟网络请求
      wx.showLoading({ title: '提交中...' });
      
      setTimeout(() => {
        wx.hideLoading();
        this.setData({
          networkResult: '表单提交成功！用户名: ' + this.data.formData.username
        });
      }, 1500);
    }
  }
});