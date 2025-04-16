/**
 * API接口统一管理
 * 所有API接口地址统一在此文件中管理
 */

import request from '../utils/request';

/**
 * 通用模块API
 */
export const commonApi = {
  /**
   * 获取小程序配置信息
   * @returns {Promise} 返回Promise对象
   */
  getConfig() {
    return request.get('/api/config');
  },
  
  /**
   * 上传文件
   * @param {Object} data 上传参数
   * @param {Object} options 请求配置
   * @returns {Promise} 返回Promise对象
   */
  uploadFile(data, options = {}) {
    return request.uploadFile('/api/upload', data, {
      ...options,
      showLoading: true
    });
  }
};

/**
 * 用户模块API
 */
export const userApi = {
  /**
   * 用户登录
   * @param {Object} data 登录参数
   * @returns {Promise} 返回Promise对象
   */
  login(data) {
    return request.post('/api/user/login', data);
  },
  
  /**
   * 获取用户信息
   * @returns {Promise} 返回Promise对象
   */
  getUserInfo() {
    return request.get('/api/user/info');
  },
  
  /**
   * 更新用户信息
   * @param {Object} data 用户信息
   * @returns {Promise} 返回Promise对象
   */
  updateUserInfo(data) {
    return request.put('/api/user/info', data);
  },
  
  /**
   * 用户注销
   * @returns {Promise} 返回Promise对象
   */
  logout() {
    return request.post('/api/user/logout');
  }
};

/**
 * 商品模块API
 */
export const goodsApi = {
  /**
   * 获取商品列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @param {string} params.keyword 搜索关键词
   * @param {number} params.categoryId 分类ID
   * @returns {Promise} 返回Promise对象
   */
  getGoodsList(params) {
    return request.get('/api/goods/list', { params });
  },
  
  /**
   * 获取商品详情
   * @param {string|number} id 商品ID
   * @returns {Promise} 返回Promise对象
   */
  getGoodsDetail(id) {
    return request.get(`/api/goods/detail/${id}`);
  },
  
  /**
   * 获取商品分类
   * @returns {Promise} 返回Promise对象
   */
  getCategories() {
    return request.get('/api/goods/categories');
  }
};

/**
 * 订单模块API
 */
export const orderApi = {
  /**
   * 创建订单
   * @param {Object} data 订单数据
   * @returns {Promise} 返回Promise对象
   */
  createOrder(data) {
    return request.post('/api/order/create', data);
  },
  
  /**
   * 获取订单列表
   * @param {Object} params 查询参数
   * @param {number} params.page 页码
   * @param {number} params.pageSize 每页数量
   * @param {number} params.status 订单状态
   * @returns {Promise} 返回Promise对象
   */
  getOrderList(params) {
    return request.get('/api/order/list', { params });
  },
  
  /**
   * 获取订单详情
   * @param {string|number} id 订单ID
   * @returns {Promise} 返回Promise对象
   */
  getOrderDetail(id) {
    return request.get(`/api/order/detail/${id}`);
  },
  
  /**
   * 取消订单
   * @param {string|number} id 订单ID
   * @returns {Promise} 返回Promise对象
   */
  cancelOrder(id) {
    return request.post(`/api/order/cancel/${id}`);
  },
  
  /**
   * 支付订单
   * @param {string|number} id 订单ID
   * @returns {Promise} 返回Promise对象
   */
  payOrder(id) {
    return request.post(`/api/order/pay/${id}`);
  }
};

// 默认导出所有API
export default {
  commonApi,
  userApi,
  goodsApi,
  orderApi
};