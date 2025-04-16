# 工具类使用说明

本目录包含了小程序开发中常用的工具类函数，为开发提供便利。

## 文件说明

### 原始工具类
- `util.js` - 基础工具函数集合
- `cloudRequest.js` - 云函数请求封装
- `pageHelper.js` - 页面辅助函数
- `WxValidate.js` - 表单验证类
- `userUtils.js` - 用户信息相关工具函数

### 增强版工具类
- `common-new.js` - 增强版通用工具函数集合
- `request-new.js` - 增强版网络请求工具（同时支持HTTP请求和云函数调用）
- `validate-new.js` - 增强版表单验证工具
- `storage-new.js` - 增强版本地存储工具
- `index-new.js` - 增强版工具类统一导出

## 使用方法

### 如何引入

```javascript
// 引入增强版工具类
const utils = require('../../utils/index-new');

// 使用通用工具函数
const isEmpty = utils.isEmpty('');  // true

// 使用HTTP请求
utils.get('/api/user/info').then(res => {
  console.log(res);
});

// 使用云函数调用
utils.request({
  name: 'user',
  data: { action: 'getInfo' }
}).then(res => {
  console.log(res);
});

// 使用表单验证
const rules = {
  phone: [
    { type: 'required', message: '手机号不能为空' },
    { type: 'phone', message: '手机号格式不正确' }
  ]
};
const values = { phone: '13800138000' };
const result = utils.validate.validateForm(rules, values);

// 使用本地存储
utils.storage.set('userInfo', { id: 1, name: '张三' });
const userInfo = utils.storage.get('userInfo');
```

## 注意事项

1. 增强版工具类（以`-new.js`结尾的文件）是对原有工具类的扩展和增强，提供了更多功能和更好的兼容性。
2. 建议通过`index-new.js`统一引入所有工具类，避免重复引入。
3. 如果遇到功能冲突，可以使用原始工具类提供的函数。例如：
   ```javascript
   // 使用原始的时间格式化函数
   const formattedTime = utils.util.formatTime(new Date());
   
   // 使用增强版的日期格式化函数
   const formattedDate = utils.formatDate(new Date(), 'YYYY-MM-DD');
   ```

## 工具类功能概述

### 通用工具（common-new.js）
- 数据判空、深拷贝、对象合并
- 日期格式化、数字格式化
- 随机数生成、随机字符串生成
- 防抖函数、节流函数
- URL参数处理
- 文件大小格式化
- 树形数据处理

### 网络请求（request-new.js）
- HTTP请求（GET、POST、PUT、DELETE）
- 文件上传下载
- 云函数调用
- 请求/响应拦截器

### 表单验证（validate-new.js）
- 手机号、邮箱、身份证、URL等常用验证
- 数字、整数、中文、英文等类型验证
- 密码强度验证
- 统一表单验证功能

### 本地存储（storage-new.js）
- 数据存储与读取
- 缓存过期控制
- 会话存储
- 前缀管理和批量操作