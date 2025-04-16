# 好聚乐龄 通用工具类

本文档介绍了好聚乐龄小程序中的通用工具类（`common.js`）的使用方法。这些工具函数可以帮助开发者更高效地完成常见的操作，如数据验证、格式化、数组处理等。

## 使用方法

在需要使用工具类的文件中，首先导入：

```javascript
import * as common from '../../src/utils/common.js';
// 或者按需导入
import { isEmpty, formatDate } from '../../src/utils/common.js';
```

## 功能列表

### 1. 数据验证

#### isEmpty(value)

判断一个值是否为空（null、undefined、空字符串、空数组、空对象等）。

```javascript
common.isEmpty(""); // 返回 true
common.isEmpty("Hello"); // 返回 false
common.isEmpty([]); // 返回 true
common.isEmpty([1, 2]); // 返回 false
common.isEmpty({}); // 返回 true
common.isEmpty({name: "张三"}); // 返回 false
common.isEmpty(null); // 返回 true
common.isEmpty(undefined); // 返回 true
```

### 2. 对象操作

#### deepClone(obj)

创建一个对象的深拷贝，解决引用类型数据共享内存的问题。

```javascript
const original = {
  name: "张三",
  age: 25,
  hobbies: ["读书", "游泳"],
  address: {
    city: "北京",
    district: "朝阳区"
  }
};

const clone = common.deepClone(original);
clone.name = "李四"; // 修改克隆对象不会影响原对象
clone.address.city = "上海";
console.log(original.name); // 输出: "张三"
console.log(original.address.city); // 输出: "北京"
```

#### merge(target, source)

合并两个对象，返回一个新对象，不会修改原对象。

```javascript
const target = { name: "张三", age: 25 };
const source = { age: 30, gender: "男" };
const result = common.merge(target, source);
console.log(result); // 输出: { name: "张三", age: 30, gender: "男" }
```

### 3. 日期和数字格式化

#### formatDate(date, format)

根据指定的格式将日期对象格式化为字符串。

```javascript
const date = new Date("2023-05-15T14:30:00");
common.formatDate(date, "YYYY-MM-DD"); // 返回: "2023-05-15"
common.formatDate(date, "YYYY年MM月DD日"); // 返回: "2023年05月15日"
common.formatDate(date, "YYYY-MM-DD HH:mm:ss"); // 返回: "2023-05-15 14:30:00"
```

支持的格式占位符：
- YYYY: 四位年份
- MM: 两位月份
- DD: 两位日期
- HH: 两位小时（24小时制）
- mm: 两位分钟
- ss: 两位秒
- SSS: 三位毫秒

#### formatNumber(number, decimals, addCommas)

格式化数字，可以指定小数位数和是否添加千位分隔符。

```javascript
common.formatNumber(12345.6789, 2, true); // 返回: "12,345.68"
common.formatNumber(12345.6789, 2, false); // 返回: "12345.68"
common.formatNumber(12345, 0, true); // 返回: "12,345"
```

#### formatFileSize(bytes, decimals)

将字节数转换为更易读的文件大小格式。

```javascript
common.formatFileSize(1024); // 返回: "1.00 KB"
common.formatFileSize(1048576, 2); // 返回: "1.00 MB"
common.formatFileSize(1073741824, 1); // 返回: "1.0 GB"
```

### 4. 随机值生成

#### random(min, max, isInteger)

生成指定范围内的随机数。

```javascript
common.random(1, 10, true); // 返回1到10之间的随机整数
common.random(0, 1, false); // 返回0到1之间的随机浮点数
```

#### randomString(length, chars)

生成指定长度的随机字符串。

```javascript
common.randomString(8); // 返回长度为8的随机字符串
common.randomString(10, "abcdef123456"); // 返回只包含指定字符的随机字符串
```

### 5. 函数控制

#### debounce(fn, delay)

创建一个防抖函数，适合处理连续触发的事件（如搜索框输入）。

```javascript
// 在输入框中应用防抖
const handleInput = common.debounce(function(e) {
  // 执行搜索操作
  this.searchKeyword(e.detail.value);
}, 500);

// 在WXML中绑定
// <input bindinput="handleInput" />
```

#### throttle(fn, delay)

创建一个节流函数，适合处理高频事件（如滚动、拖拽）。

```javascript
// 在滚动事件中应用节流
const handleScroll = common.throttle(function() {
  // 执行滚动处理逻辑
  this.checkScroll();
}, 200);

// 在页面onPageScroll中调用
onPageScroll: function(e) {
  this.handleScroll();
}
```

### 6. URL处理

#### getUrlParam(name, url)

从URL中获取指定参数的值。

```javascript
// 假设当前URL为: https://example.com?id=123&name=张三
common.getUrlParam("id"); // 返回: "123"
common.getUrlParam("name"); // 返回: "张三"
```

#### buildUrlParams(params)

将对象转换为URL查询字符串。

```javascript
const params = {
  id: 123,
  name: "张三",
  age: 25
};
common.buildUrlParams(params); // 返回: "id=123&name=张三&age=25"
```

### 7. 树结构操作

#### buildTree(data, options)

将扁平数组转换为树形结构。

```javascript
const data = [
  { id: 1, name: "北京", pid: 0 },
  { id: 2, name: "上海", pid: 0 },
  { id: 3, name: "广州", pid: 0 },
  { id: 4, name: "朝阳区", pid: 1 },
  { id: 5, name: "海淀区", pid: 1 },
  { id: 6, name: "浦东新区", pid: 2 },
  { id: 7, name: "黄浦区", pid: 2 }
];

const options = {
  idKey: "id",
  pidKey: "pid",
  childrenKey: "children"
};

const tree = common.buildTree(data, options);
console.log(tree);
/*
输出:
[
  {
    id: 1,
    name: "北京",
    pid: 0,
    children: [
      { id: 4, name: "朝阳区", pid: 1 },
      { id: 5, name: "海淀区", pid: 1 }
    ]
  },
  {
    id: 2,
    name: "上海",
    pid: 0,
    children: [
      { id: 6, name: "浦东新区", pid: 2 },
      { id: 7, name: "黄浦区", pid: 2 }
    ]
  },
  { id: 3, name: "广州", pid: 0, children: [] }
]
*/
```

#### flattenTree(tree, options)

将树形结构转换为扁平数组。

```javascript
const options = { childrenKey: "children" };
const flatArray = common.flattenTree(tree, options);
console.log(flatArray);
// 输出扁平化后的数组
```

#### getTreeNodePath(tree, value, options)

获取树中指定节点的路径。

```javascript
const options = {
  idKey: "id",
  childrenKey: "children"
};
// 查找id为4的节点（朝阳区）的路径
const path = common.getTreeNodePath(tree, 4, options);
console.log(path); 
// 输出: [{ id: 1, name: "北京", ... }, { id: 4, name: "朝阳区", ... }]
```

## 示例页面

我们提供了一个完整的工具类示例页面，您可以在微信开发者工具中访问：`pages/utils-demo/index`页面查看各个工具函数的实际使用效果。

## 注意事项

1. 工具函数的路径可能需要根据实际项目结构进行调整
2. 某些功能可能需要根据实际需求进行自定义扩展
3. 使用深拷贝等操作时，注意可能存在的性能影响，尤其是数据量较大时

## 贡献指南

如果您有新的工具函数需求或发现了问题，请联系开发团队进行讨论和改进。