/**
 * API接口统一管理
 */
import request from '../utils/request';

/**
 * 用户相关接口
 */
export const userApi = {
  // 用户登录
  login(data) {
    return request.post('/user/login', data);
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info');
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data);
  },
  
  // 更新用户头像
  updateAvatar(filePath) {
    return request.upload('/user/avatar', {
      filePath,
      name: 'avatar'
    });
  },
  
  // 获取用户地址列表
  getAddressList() {
    return request.get('/user/address/list');
  },
  
  // 添加收货地址
  addAddress(data) {
    return request.post('/user/address', data);
  },
  
  // 更新收货地址
  updateAddress(id, data) {
    return request.put(`/user/address/${id}`, data);
  },
  
  // 删除收货地址
  deleteAddress(id) {
    return request.delete(`/user/address/${id}`);
  },
  
  // 设置默认地址
  setDefaultAddress(id) {
    return request.put(`/user/address/${id}/default`);
  },
};

/**
 * 商品相关接口
 */
export const goodsApi = {
  // 获取商品分类
  getCategories() {
    return request.get('/goods/categories');
  },
  
  // 获取商品列表
  getGoodsList(params) {
    return request.get('/goods/list', params);
  },
  
  // 获取商品详情
  getGoodsDetail(id) {
    return request.get(`/goods/detail/${id}`);
  },
  
  // 搜索商品
  searchGoods(params) {
    return request.get('/goods/search', params);
  },
  
  // 获取推荐商品
  getRecommendGoods(params) {
    return request.get('/goods/recommend', params);
  },
  
  // 获取商品评价列表
  getGoodsReviews(id, params) {
    return request.get(`/goods/${id}/reviews`, params);
  },
};

/**
 * 购物车相关接口
 */
export const cartApi = {
  // 获取购物车列表
  getCartList() {
    return request.get('/cart/list');
  },
  
  // 添加商品到购物车
  addToCart(data) {
    return request.post('/cart/add', data);
  },
  
  // 更新购物车商品数量
  updateCartItemQuantity(id, quantity) {
    return request.put(`/cart/item/${id}/quantity`, { quantity });
  },
  
  // 删除购物车商品
  removeCartItem(id) {
    return request.delete(`/cart/item/${id}`);
  },
  
  // 清空购物车
  clearCart() {
    return request.delete('/cart/clear');
  },
  
  // 选择/取消选择购物车商品
  selectCartItem(id, selected) {
    return request.put(`/cart/item/${id}/selected`, { selected });
  },
  
  // 全选/取消全选购物车商品
  selectAllCartItems(selected) {
    return request.put('/cart/selectAll', { selected });
  },
};

/**
 * 订单相关接口
 */
export const orderApi = {
  // 创建订单
  createOrder(data) {
    return request.post('/order/create', data);
  },
  
  // 获取订单列表
  getOrderList(params) {
    return request.get('/order/list', params);
  },
  
  // 获取订单详情
  getOrderDetail(id) {
    return request.get(`/order/detail/${id}`);
  },
  
  // 取消订单
  cancelOrder(id, reason) {
    return request.put(`/order/${id}/cancel`, { reason });
  },
  
  // 支付订单
  payOrder(id, data) {
    return request.post(`/order/${id}/pay`, data);
  },
  
  // 确认收货
  confirmReceipt(id) {
    return request.put(`/order/${id}/confirm`);
  },
  
  // 申请退款
  applyRefund(id, data) {
    return request.post(`/order/${id}/refund`, data);
  },
  
  // 删除订单
  deleteOrder(id) {
    return request.delete(`/order/${id}`);
  },
  
  // 提交订单评价
  submitReview(orderId, data) {
    return request.post(`/order/${orderId}/review`, data);
  },
};

/**
 * 支付相关接口
 */
export const paymentApi = {
  // 获取支付参数
  getPayParams(orderId) {
    return request.get(`/payment/params/${orderId}`);
  },
  
  // 查询支付结果
  queryPayResult(orderId) {
    return request.get(`/payment/result/${orderId}`);
  },
};

/**
 * 首页相关接口
 */
export const homeApi = {
  // 获取轮播图
  getBanners() {
    return request.get('/home/banners');
  },
  
  // 获取公告
  getNotices() {
    return request.get('/home/notices');
  },
  
  // 获取专题
  getTopics() {
    return request.get('/home/topics');
  },
  
  // 获取活动
  getActivities() {
    return request.get('/home/activities');
  },
};

/**
 * 系统相关接口
 */
export const systemApi = {
  // 获取系统配置
  getConfig() {
    return request.get('/system/config');
  },
  
  // 获取地区数据
  getRegions(parentId) {
    return request.get('/system/regions', { parentId });
  },
  
  // 意见反馈
  feedback(data) {
    return request.post('/system/feedback', data);
  },
  
  // 检查更新
  checkUpdate() {
    return request.get('/system/check-update');
  },
};

// 导出所有API接口
export default {
  user: userApi,
  goods: goodsApi,
  cart: cartApi,
  order: orderApi,
  payment: paymentApi,
  home: homeApi,
  system: systemApi,
};