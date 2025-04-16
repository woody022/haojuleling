/**
 * 全局配置文件
 * 根据环境不同可以切换不同的配置
 */

// 环境变量
const ENV = {
  DEV: 'development',  // 开发环境
  TEST: 'testing',     // 测试环境
  PROD: 'production'   // 生产环境
};

// 当前环境
const CUR_ENV = ENV.DEV;

// 各环境API地址配置
const API_URL = {
  [ENV.DEV]: 'https://dev-api.example.com',
  [ENV.TEST]: 'https://test-api.example.com',
  [ENV.PROD]: 'https://api.example.com'
};

// CDN地址配置
const CDN_URL = {
  [ENV.DEV]: 'https://dev-cdn.example.com',
  [ENV.TEST]: 'https://test-cdn.example.com',
  [ENV.PROD]: 'https://cdn.example.com'
};

// WebSocket地址配置
const WS_URL = {
  [ENV.DEV]: 'wss://dev-ws.example.com',
  [ENV.TEST]: 'wss://test-ws.example.com',
  [ENV.PROD]: 'wss://ws.example.com'
};

// 小程序版本信息
const VERSION = {
  NUMBER: '1.0.0',  // 版本号
  BUILD: '20250416'  // 构建号
};

// 请求配置
const REQUEST = {
  TIMEOUT: 10000,  // 请求超时时间（毫秒）
  RETRY_COUNT: 3,  // 请求失败重试次数
  RETRY_DELAY: 1000  // 重试间隔时间（毫秒）
};

// 缓存配置
const STORAGE = {
  PREFIX: 'haojuleling_',  // 缓存键前缀
  TOKEN_KEY: 'token',      // token缓存键
  USER_INFO_KEY: 'userInfo',  // 用户信息缓存键
  EXPIRES: {
    TOKEN: 7 * 24 * 60 * 60 * 1000,  // token过期时间（毫秒）
    USER_INFO: 7 * 24 * 60 * 60 * 1000,  // 用户信息过期时间（毫秒）
    COMMON: 24 * 60 * 60 * 1000  // 普通缓存过期时间（毫秒）
  }
};

// 分享配置
const SHARE = {
  TITLE: '好橘了了 - 您的智能生活助手',
  IMAGE_URL: '/assets/images/share.png',
  PATH: '/pages/index/index'
};

// 第三方服务配置
const THIRD_PARTY = {
  MAP: {
    KEY: 'YOUR_MAP_KEY',  // 地图服务密钥
    REFERER: 'miniprogram.example.com'  // 域名白名单
  },
  PUSH: {
    APP_ID: 'YOUR_PUSH_APP_ID',  // 推送服务APP ID
    APP_KEY: 'YOUR_PUSH_APP_KEY'  // 推送服务APP KEY
  }
};

// 导出配置
export default {
  ENV,
  CUR_ENV,
  IS_DEV: CUR_ENV === ENV.DEV,
  IS_TEST: CUR_ENV === ENV.TEST,
  IS_PROD: CUR_ENV === ENV.PROD,
  API_URL: API_URL[CUR_ENV],
  CDN_URL: CDN_URL[CUR_ENV],
  WS_URL: WS_URL[CUR_ENV],
  VERSION,
  REQUEST,
  STORAGE,
  SHARE,
  THIRD_PARTY
};