/**
 * API接口集合
 */
import { get, post, put, del, uploadFile } from './request';

/**
 * 用户相关接口
 */
export const userApi = {
  /**
   * 登录接口
   * @param {Object} data 登录数据
   * @returns {Promise}
   */
  login: (data) => post('/user/login', data),

  /**
   * 获取用户信息
   * @returns {Promise}
   */
  getUserInfo: () => get('/user/info'),
  
  /**
   * 更新用户信息
   * @param {Object} data 用户数据
   * @returns {Promise}
   */
  updateUserInfo: (data) => put('/user/info', data),

  /**
   * 上传用户头像
   * @param {String} filePath 图片路径
   * @returns {Promise}
   */
  uploadAvatar: (filePath) => uploadFile('/user/avatar', filePath, 'avatar')
};

/**
 * 商品相关接口
 */
export const goodsApi = {
  /**
   * 获取商品列表
   * @param {Object} params 查询参数
   * @returns {Promise}
   */
  getGoodsList: (params) => get('/goods/list', params),
  
  /**
   * 获取商品详情
   * @param {String} id 商品ID
   * @returns {Promise}
   */
  getGoodsDetail: (id) => get(`/goods/detail/${id}`),
  
  /**
   * 获取商品分类
   * @returns {Promise}
   */
  getCategories: () => get('/goods/categories')
};

/**
 * 订单相关接口
 */
export const orderApi = {
  /**
   * 创建订单
   * @param {Object} data 订单数据
   * @returns {Promise}
   */
  createOrder: (data) => post('/order/create', data),
  
  /**
   * 获取订单列表
   * @param {Object} params 查询参数
   * @returns {Promise}
   */
  getOrderList: (params) => get('/order/list', params),
  
  /**
   * 获取订单详情
   * @param {String} id 订单ID
   * @returns {Promise}
   */
  getOrderDetail: (id) => get(`/order/detail/${id}`),
  
  /**
   * 取消订单
   * @param {String} id 订单ID
   * @returns {Promise}
   */
  cancelOrder: (id) => put(`/order/cancel/${id}`),
  
  /**
   * 支付订单
   * @param {String} id 订单ID
   * @returns {Promise}
   */
  payOrder: (id) => post(`/order/pay/${id}`),
  
  /**
   * 确认收货
   * @param {String} id 订单ID
   * @returns {Promise}
   */
  confirmOrder: (id) => put(`/order/confirm/${id}`)
};

/**
 * 购物车相关接口
 */
export const cartApi = {
  /**
   * 获取购物车列表
   * @returns {Promise}
   */
  getCartList: () => get('/cart/list'),
  
  /**
   * 添加商品到购物车
   * @param {Object} data 购物车数据
   * @returns {Promise}
   */
  addToCart: (data) => post('/cart/add', data),
  
  /**
   * 更新购物车商品数量
   * @param {String} id 购物车项ID
   * @param {Number} quantity 数量
   * @returns {Promise}
   */
  updateCartItem: (id, quantity) => put('/cart/update', { id, quantity }),
  
  /**
   * 删除购物车商品
   * @param {String} id 购物车项ID
   * @returns {Promise}
   */
  removeCartItem: (id) => del(`/cart/remove/${id}`),
  
  /**
   * 清空购物车
   * @returns {Promise}
   */
  clearCart: () => del('/cart/clear')
};

/**
 * 收货地址相关接口
 */
export const addressApi = {
  /**
   * 获取收货地址列表
   * @returns {Promise}
   */
  getAddressList: () => get('/address/list'),
  
  /**
   * 添加收货地址
   * @param {Object} data 地址数据
   * @returns {Promise}
   */
  addAddress: (data) => post('/address/add', data),
  
  /**
   * 更新收货地址
   * @param {Object} data 地址数据
   * @returns {Promise}
   */
  updateAddress: (data) => put('/address/update', data),
  
  /**
   * 删除收货地址
   * @param {String} id 地址ID
   * @returns {Promise}
   */
  deleteAddress: (id) => del(`/address/delete/${id}`),
  
  /**
   * 设置默认收货地址
   * @param {String} id 地址ID
   * @returns {Promise}
   */
  setDefaultAddress: (id) => put(`/address/default/${id}`)
};

/**
 * 评论相关接口
 */
export const commentApi = {
  /**
   * 获取商品评论列表
   * @param {String} goodsId 商品ID
   * @param {Object} params 查询参数
   * @returns {Promise}
   */
  getCommentList: (goodsId, params) => get(`/comment/list/${goodsId}`, params),
  
  /**
   * 添加评论
   * @param {Object} data 评论数据
   * @returns {Promise}
   */
  addComment: (data) => post('/comment/add', data),
  
  /**
   * 上传评论图片
   * @param {String} filePath 图片路径
   * @returns {Promise}
   */
  uploadCommentImage: (filePath) => uploadFile('/comment/upload', filePath, 'image')
};