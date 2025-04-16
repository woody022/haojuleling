# 好聚乐玲微信小程序

## 项目介绍

好聚乐玲微信小程序是一款为用户提供休闲娱乐服务的平台，旨在为用户提供丰富多彩的休闲活动和交友机会。本项目采用微信小程序原生框架开发，使用了组件化、模块化的开发方式，提供了良好的用户体验和性能优化。

## 技术栈

- 微信小程序原生框架
- ES6+
- TypeScript
- WXSS/SCSS
- 微信云开发

## 项目结构

```
haojuleling/
├── src/                     # 源代码目录
│   ├── app.js               # 小程序入口文件
│   ├── app.json             # 小程序全局配置
│   ├── app.wxss             # 小程序全局样式
│   ├── pages/               # 页面目录
│   ├── components/          # 组件目录
│   ├── utils/               # 工具类目录
│   │   ├── common.js        # 通用工具函数
│   │   ├── request.js       # 网络请求工具
│   │   ├── validate.js      # 表单验证工具
│   │   ├── storage.js       # 本地存储工具
│   │   └── index.js         # 工具类统一导出
│   ├── services/            # 服务层目录
│   ├── assets/              # 静态资源目录
│   ├── styles/              # 样式目录
│   └── config/              # 配置目录
├── typings/                 # 类型定义目录
├── project.config.json      # 项目配置文件
└── README.md                # 项目说明文档
```

## 工具类说明

### 1. 通用工具类 (`common.js`)

提供了各种通用的工具函数，方便开发中的常见操作。

主要函数：

- `isEmpty(value)`: 检查变量是否为空
- `deepClone(obj)`: 对象深拷贝
- `merge(target, source)`: 合并对象
- `formatDate(date, format)`: 日期格式化
- `formatNumber(number, decimals, addCommas)`: 数字格式化
- `random(min, max, isInteger)`: 生成随机数
- `debounce(fn, delay)`: 函数防抖
- `throttle(fn, delay)`: 函数节流
- `getUrlParam(name, url)`: 获取URL参数
- `buildUrlParams(params)`: 构建URL参数串
- `randomString(length, chars)`: 生成随机字符串
- `formatFileSize(bytes, decimals)`: 格式化文件大小
- `buildTree(data, options)`: 构建树形结构
- `flattenTree(tree, options)`: 扁平化树形结构
- `getTreeNodePath(tree, value, options)`: 获取树节点路径

使用示例：

```javascript
import { isEmpty, formatDate } from '@/utils/common';

// 检查变量是否为空
const empty = isEmpty('');  // true

// 格式化日期
const date = formatDate(new Date(), 'YYYY-MM-DD');  // 2023-04-16
```

### 2. 网络请求工具 (`request.js`)

封装了微信小程序的网络请求API，提供了更加便捷的请求方法和拦截器功能。

主要函数：

- `request(options)`: 基础请求方法
- `get(url, data, options)`: GET请求
- `post(url, data, options)`: POST请求
- `put(url, data, options)`: PUT请求
- `del(url, data, options)`: DELETE请求
- `uploadFile(url, filePath, name, formData, options)`: 上传文件
- `downloadFile(url, options)`: 下载文件
- `addRequestInterceptor(interceptor)`: 添加请求拦截器
- `addResponseInterceptor(interceptor)`: 添加响应拦截器

使用示例：

```javascript
import { get, post } from '@/utils/request';

// GET请求
get('/api/user/info').then(res => {
  console.log(res);
}).catch(err => {
  console.error(err);
});

// POST请求
post('/api/user/login', {
  username: 'test',
  password: '123456'
}).then(res => {
  console.log(res);
}).catch(err => {
  console.error(err);
});
```

### 3. 表单验证工具 (`validate.js`)

提供了常用的表单验证函数，方便表单数据的校验。

主要函数：

- `isPhoneNumber(value)`: 验证手机号码
- `isEmail(value)`: 验证邮箱
- `isIdCard(value)`: 验证身份证号码
- `isUrl(value)`: 验证URL
- `isPositiveInteger(value)`: 验证正整数
- `isNumber(value)`: 验证数字
- `isStrongPassword(value)`: 验证密码强度
- `validateForm(rules, values)`: 统一表单验证

使用示例：

```javascript
import validate from '@/utils/validate';

// 验证手机号
const isValidPhone = validate.isPhoneNumber('13800138000');  // true

// 统一表单验证
const rules = {
  username: [
    { type: 'required', message: '用户名不能为空' }
  ],
  phone: [
    { type: 'required', message: '手机号不能为空' },
    { type: 'phone', message: '手机号格式不正确' }
  ]
};

const values = {
  username: 'test',
  phone: '13800138000'
};

const result = validate.validateForm(rules, values);
console.log(result.isValid);  // true
console.log(result.errors);   // {}
```

### 4. 本地存储工具 (`storage.js`)

封装了微信小程序的本地存储API，提供了更加便捷的存储方法和过期控制功能。

主要函数：

- `set(key, value, expire)`: 设置缓存
- `get(key, def)`: 获取缓存
- `remove(key)`: 删除缓存
- `clear()`: 清空所有缓存
- `clearWithPrefix(prefix)`: 清空指定前缀的缓存
- `setSession(key, value)`: 设置会话缓存
- `getSession(key, def)`: 获取会话缓存
- `removeSession(key)`: 删除会话缓存
- `clearSession()`: 清空所有会话缓存

使用示例：

```javascript
import storage from '@/utils/storage';

// 设置缓存，7天后过期
storage.set('token', 'abcdef123456');

// 获取缓存
const token = storage.get('token');

// 设置永不过期的缓存
storage.set('userId', '123', null);

// 删除缓存
storage.remove('token');
```

## 开发指南

1. 克隆代码仓库
2. 安装依赖
3. 使用微信开发者工具打开项目
4. 开始开发

## 贡献指南

1. Fork 代码仓库
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 联系方式

如有问题或建议，请联系项目维护者：

- 邮箱：example@example.com
- 微信：wxid_example

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。