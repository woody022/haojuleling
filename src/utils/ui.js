/**
 * UI相关工具方法
 */

/**
 * 显示消息提示框
 * @param {string} title 提示的内容
 * @param {Object} options 配置选项
 * @returns {Promise} Promise对象
 */
export const showToast = (title, options = {}) => {
  const defaultOptions = {
    icon: 'none',         // 图标类型，有效值 'success', 'loading', 'none'
    duration: 1500,       // 提示的延迟时间，单位ms
    mask: false,          // 是否显示透明蒙层
    image: '',            // 自定义图标的本地路径，image 的优先级高于 icon
  };

  return new Promise((resolve) => {
    wx.showToast({
      title: title || '操作成功',
      ...defaultOptions,
      ...options,
      success: resolve,
      fail: resolve,
      complete: resolve,
    });
  });
};

/**
 * 显示成功提示
 * @param {string} title 提示的内容
 * @param {number} duration 提示的延迟时间
 * @returns {Promise} Promise对象
 */
export const showSuccess = (title, duration = 1500) => {
  return showToast(title, { icon: 'success', duration });
};

/**
 * 显示加载提示
 * @param {string} title 提示的内容
 * @param {boolean} mask 是否显示透明蒙层
 * @returns {Promise} Promise对象
 */
export const showLoading = (title = '加载中...', mask = true) => {
  return new Promise((resolve) => {
    wx.showLoading({
      title,
      mask,
      success: resolve,
      fail: resolve,
    });
  });
};

/**
 * 隐藏加载提示
 * @returns {Promise} Promise对象
 */
export const hideLoading = () => {
  return new Promise((resolve) => {
    wx.hideLoading({
      success: resolve,
      fail: resolve,
    });
  });
};

/**
 * 显示模态对话框
 * @param {Object} options 配置选项
 * @returns {Promise} Promise对象，返回用户点击的按钮（confirm/cancel）
 */
export const showModal = (options = {}) => {
  const defaultOptions = {
    title: '提示',
    content: '',
    showCancel: true,
    cancelText: '取消',
    cancelColor: '#000000',
    confirmText: '确定',
    confirmColor: '#576B95',
  };

  return new Promise((resolve, reject) => {
    wx.showModal({
      ...defaultOptions,
      ...options,
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else if (res.cancel) {
          resolve(false);
        } else {
          reject(new Error('未知操作'));
        }
      },
      fail: reject,
    });
  });
};

/**
 * 显示确认对话框
 * @param {string} content 提示内容
 * @param {string} title 标题
 * @returns {Promise<boolean>} Promise对象，返回用户是否点击了确认按钮
 */
export const showConfirm = (content, title = '提示') => {
  return showModal({ title, content });
};

/**
 * 显示操作菜单
 * @param {Array} itemList 按钮的文字数组
 * @param {Object} options 配置选项
 * @returns {Promise<number>} Promise对象，返回用户点击的按钮序号，从0开始
 */
export const showActionSheet = (itemList, options = {}) => {
  const defaultOptions = {
    itemColor: '#000000',
  };

  return new Promise((resolve, reject) => {
    wx.showActionSheet({
      itemList,
      ...defaultOptions,
      ...options,
      success: (res) => {
        resolve(res.tapIndex);
      },
      fail: (err) => {
        // 点击取消按钮时，触发fail回调，但不应该当作错误处理
        if (err.errMsg.indexOf('cancel') !== -1) {
          resolve(-1);
        } else {
          reject(err);
        }
      },
    });
  });
};

/**
 * 设置导航栏标题
 * @param {string} title 页面标题
 * @returns {Promise} Promise对象
 */
export const setNavigationBarTitle = (title) => {
  return new Promise((resolve, reject) => {
    wx.setNavigationBarTitle({
      title,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 设置导航栏颜色
 * @param {Object} options 配置选项 
 * @returns {Promise} Promise对象
 */
export const setNavigationBarColor = (options) => {
  const defaultOptions = {
    frontColor: '#ffffff',  // 前景颜色值，包括按钮、标题、状态栏的颜色，仅支持 #ffffff 和 #000000
    backgroundColor: '#000000',  // 背景颜色值
    animation: {  // 动画效果
      duration: 400,  // 动画变化时间，单位ms
      timingFunc: 'easeIn',  // 动画变化方式，支持 linear、easeIn、easeOut、easeInOut
    },
  };

  return new Promise((resolve, reject) => {
    wx.setNavigationBarColor({
      ...defaultOptions,
      ...options,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 显示导航栏加载动画
 * @returns {Promise} Promise对象
 */
export const showNavigationBarLoading = () => {
  return new Promise((resolve) => {
    wx.showNavigationBarLoading({
      success: resolve,
      fail: resolve,
    });
  });
};

/**
 * 隐藏导航栏加载动画
 * @returns {Promise} Promise对象
 */
export const hideNavigationBarLoading = () => {
  return new Promise((resolve) => {
    wx.hideNavigationBarLoading({
      success: resolve,
      fail: resolve,
    });
  });
};

/**
 * 设置TabBar项的内容
 * @param {number} index tabBar的哪一项，从0开始
 * @param {Object} options 配置选项
 * @returns {Promise} Promise对象
 */
export const setTabBarItem = (index, options) => {
  return new Promise((resolve, reject) => {
    wx.setTabBarItem({
      index,
      ...options,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 设置TabBar的样式
 * @param {Object} options 配置选项
 * @returns {Promise} Promise对象
 */
export const setTabBarStyle = (options) => {
  return new Promise((resolve, reject) => {
    wx.setTabBarStyle({
      ...options,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 显示TabBar
 * @param {boolean} animation 是否需要动画效果
 * @returns {Promise} Promise对象
 */
export const showTabBar = (animation = true) => {
  return new Promise((resolve, reject) => {
    wx.showTabBar({
      animation,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 隐藏TabBar
 * @param {boolean} animation 是否需要动画效果
 * @returns {Promise} Promise对象
 */
export const hideTabBar = (animation = true) => {
  return new Promise((resolve, reject) => {
    wx.hideTabBar({
      animation,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 显示TabBar的红点
 * @param {number} index tabBar的哪一项，从0开始
 * @returns {Promise} Promise对象
 */
export const showTabBarRedDot = (index) => {
  return new Promise((resolve, reject) => {
    wx.showTabBarRedDot({
      index,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 隐藏TabBar的红点
 * @param {number} index tabBar的哪一项，从0开始
 * @returns {Promise} Promise对象
 */
export const hideTabBarRedDot = (index) => {
  return new Promise((resolve, reject) => {
    wx.hideTabBarRedDot({
      index,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 显示页面蒙层
 * @param {Object} options 蒙层配置
 * @returns {Function} 关闭蒙层的函数
 */
export const showPageMask = (options = {}) => {
  const {
    backgroundColor = 'rgba(0, 0, 0, 0.5)',
    zIndex = 999,
    duration = 300,
    onClick = null,
  } = options;

  // 创建蒙层元素
  const maskView = wx.createView({
    id: 'page-mask',
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor,
      zIndex,
      opacity: 0,
      transition: `opacity ${duration}ms ease`,
    },
  });

  // 渲染到页面
  wx.appendChild(maskView);

  // 添加动画
  setTimeout(() => {
    maskView.style.opacity = 1;
  }, 0);

  // 添加点击事件
  if (typeof onClick === 'function') {
    maskView.addEventListener('tap', onClick);
  }

  // 返回关闭函数
  return () => {
    maskView.style.opacity = 0;
    setTimeout(() => {
      wx.removeChild(maskView);
    }, duration);
  };
};

/**
 * 显示页面底部弹出层
 * @param {Object} options 配置选项
 * @returns {Object} 弹出层控制对象
 */
export const showBottomSheet = (options = {}) => {
  const {
    content,             // 弹出层内容（视图或组件）
    height = '50%',      // 弹出层高度
    backgroundColor = '#ffffff',  // 弹出层背景色
    borderRadius = '12px 12px 0 0',  // 弹出层圆角
    showMask = true,     // 是否显示蒙层
    maskClosable = true, // 点击蒙层是否可关闭
    zIndex = 1000,       // 弹出层层级
    duration = 300,      // 动画时长
    onOpen = null,       // 打开回调
    onClose = null,      // 关闭回调
  } = options;

  // 创建蒙层
  let closeMask = null;
  if (showMask) {
    closeMask = showPageMask({
      zIndex: zIndex - 1,
      duration,
      onClick: maskClosable ? () => sheetControl.close() : null,
    });
  }

  // 创建弹出层
  const sheetView = wx.createView({
    id: 'bottom-sheet',
    style: {
      position: 'fixed',
      left: 0,
      width: '100%',
      height,
      backgroundColor,
      borderRadius,
      bottom: `-${height}`,
      zIndex,
      transition: `bottom ${duration}ms ease`,
      boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
    },
  });

  // 添加内容
  if (content) {
    wx.appendChild(content, sheetView);
  }

  // 渲染到页面
  wx.appendChild(sheetView);

  // 打开弹出层
  setTimeout(() => {
    sheetView.style.bottom = '0';
    if (typeof onOpen === 'function') {
      onOpen();
    }
  }, 0);

  // 控制对象
  const sheetControl = {
    close: () => {
      sheetView.style.bottom = `-${height}`;
      if (closeMask) {
        closeMask();
      }
      setTimeout(() => {
        wx.removeChild(sheetView);
        if (typeof onClose === 'function') {
          onClose();
        }
      }, duration);
    },
    update: (newContent) => {
      // 清空内容
      sheetView.innerHTML = '';
      // 添加新内容
      if (newContent) {
        wx.appendChild(newContent, sheetView);
      }
    },
  };

  return sheetControl;
};