/**
 * 项目全局配置文件
 * 包括API接口地址、版本号、请求超时时间等配置
 */

// 环境配置
const ENV = {
  DEV: 'development',
  PROD: 'production'
};

// 当前环境
const CURRENT_ENV = ENV.DEV;

// 基础配置
const config = {
  // 项目版本号
  VERSION: '1.0.0',
  
  // 当前环境
  ENV: CURRENT_ENV,
  
  // 是否为开发环境
  IS_DEV: CURRENT_ENV === ENV.DEV,
  
  // 是否为生产环境
  IS_PROD: CURRENT_ENV === ENV.PROD,
  
  // API相关配置
  API: {
    // 开发环境API地址
    DEV_BASE_URL: 'https://dev-api.example.com',
    
    // 生产环境API地址
    PROD_BASE_URL: 'https://api.example.com',
    
    // 根据环境获取基础URL
    get BASE_URL() {
      return config.IS_DEV ? this.DEV_BASE_URL : this.PROD_BASE_URL;
    }
  },
  
  // 请求相关配置
  REQUEST: {
    // 请求超时时间（毫秒）
    TIMEOUT: 30000,
    
    // 登录过期后是否自动跳转到登录页
    AUTO_REDIRECT_LOGIN: true,
    
    // 是否开启请求日志
    ENABLE_LOG: true
  },
  
  // 本地存储相关配置
  STORAGE: {
    // 存储前缀，避免与其他小程序冲突
    PREFIX: 'HJL_',
    
    // Token存储key
    TOKEN_KEY: 'TOKEN',
    
    // 用户信息存储key
    USER_INFO_KEY: 'USER_INFO',
    
    // 默认缓存时间（7天，单位：毫秒）
    DEFAULT_EXPIRES: 7 * 24 * 60 * 60 * 1000
  },
  
  // 主题配置
  THEME: {
    // 主色调
    PRIMARY_COLOR: '#1989fa',
    
    // 辅助色
    SUCCESS_COLOR: '#07c160',
    WARNING_COLOR: '#ff976a',
    DANGER_COLOR: '#ee0a24',
    
    // 文本颜色
    TEXT_COLOR: '#323233',
    TEXT_COLOR_LIGHT: '#969799'
  },
  
  // 页面路径配置
  PAGES: {
    // 首页
    HOME: '/pages/index/index',
    
    // 登录页
    LOGIN: '/pages/login/index',
    
    // 个人中心页
    PROFILE: '/pages/profile/index',
    
    // 404页面
    NOT_FOUND: '/pages/notFound/index'
  },
  
  // 分享默认配置
  SHARE: {
    // 默认分享标题
    TITLE: '好橘乐零',
    
    // 默认分享图片
    IMAGE_URL: '/static/images/share.png',
    
    // 默认分享路径
    PATH: '/pages/index/index'
  }
};

export default config;