/**
 * 项目全局配置文件
 * 包含环境配置、API接口配置、缓存键配置等
 */

// 环境配置
const ENV = {
  // 开发环境
  development: {
    baseUrl: 'https://dev-api.example.com',
    env: 'development',
    debug: true
  },
  // 测试环境
  testing: {
    baseUrl: 'https://test-api.example.com',
    env: 'testing',
    debug: true
  },
  // 生产环境
  production: {
    baseUrl: 'https://api.example.com',
    env: 'production',
    debug: false
  }
};

// 当前环境，可根据需要切换
const CURRENT_ENV = ENV.development;

/**
 * 全局配置
 */
export default {
  // 项目信息
  appName: '好橘了榴',
  version: '1.0.0',
  
  // 当前环境配置
  env: CURRENT_ENV.env,
  debug: CURRENT_ENV.debug,
  
  // 请求配置
  request: {
    baseUrl: CURRENT_ENV.baseUrl,
    timeout: 30000, // 请求超时时间，单位毫秒
    contentType: 'application/json',
    errorRetry: 1, // 请求失败重试次数
  },
  
  // 本地存储键
  storage: {
    token: 'token', // 用户登录凭证
    userInfo: 'userInfo', // 用户信息
    cartInfo: 'cartInfo', // 购物车信息
    searchHistory: 'searchHistory', // 搜索历史
    addressList: 'addressList', // 地址列表
    systemInfo: 'systemInfo', // 系统信息
    setting: 'setting', // 系统设置
  },
  
  // 页面路径
  pages: {
    home: '/pages/home/index',
    login: '/pages/login/index',
    mine: '/pages/mine/index',
    cart: '/pages/cart/index',
    goodsDetail: '/pages/goods/detail/index',
    orderList: '/pages/order/list/index',
    orderDetail: '/pages/order/detail/index',
    addressList: '/pages/address/list/index',
    addressEdit: '/pages/address/edit/index',
  },
  
  // 微信小程序相关配置
  mp: {
    appId: 'wx1234567890abcdef', // 小程序AppID
    shareTitle: '好橘了榴 - 新鲜橘子水果店', // 默认分享标题
    shareImageUrl: '/static/images/share.jpg', // 默认分享图片
  },
  
  // 业务配置
  business: {
    // 支付相关
    payment: {
      timeOut: 15 * 60 * 1000, // 支付超时时间，单位毫秒
    },
    // 订单状态
    orderStatus: {
      PENDING_PAYMENT: 10, // 待支付
      PAID: 20, // 已支付
      SHIPPED: 30, // 已发货
      COMPLETED: 40, // 已完成
      CANCELLED: 50, // 已取消
      REFUNDING: 60, // 退款中
      REFUNDED: 70, // 已退款
    },
    // 配送方式
    deliveryType: {
      EXPRESS: 1, // 快递配送
      SELF_PICKUP: 2, // 到店自提
    },
  },
  
  // UI相关配置
  ui: {
    // 主题色
    primaryColor: '#FF8C00',
    // 辅助色
    secondaryColor: '#FFA500',
    // 成功色
    successColor: '#67C23A',
    // 警告色
    warningColor: '#E6A23C',
    // 错误色
    dangerColor: '#F56C6C',
    // 信息色
    infoColor: '#909399',
    // 背景色
    backgroundColor: '#F8F8F8',
    // 文本主色
    textMainColor: '#303133',
    // 文本常规色
    textRegularColor: '#606266',
    // 文本次要色
    textSecondaryColor: '#909399',
    // 文本占位符
    textPlaceholderColor: '#C0C4CC',
    // 边框色
    borderColor: '#DCDFE6',
    // 图片占位图
    placeholderImage: '/static/images/placeholder.png',
  },
  
  // 常量定义
  constants: {
    // 性别
    GENDER: {
      UNKNOWN: 0, // 未知
      MALE: 1, // 男
      FEMALE: 2, // 女
    },
    // 每页数据条数
    PAGE_SIZE: 10,
    // 最大收货地址数量
    MAX_ADDRESS_COUNT: 20,
    // 购物车最大商品数量
    MAX_CART_GOODS_COUNT: 99,
    // 单个商品最大购买数量
    MAX_PURCHASE_COUNT: 99,
  },
};