// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const notificationCollection = db.collection('notifications');
const userCollection = db.collection('users');

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  // 获取请求参数
  const { action, data = {} } = event;
  
  // 根据action参数分发不同的处理
  switch (action) {
    case 'getNotifications':
      return getNotifications(OPENID, data);
    case 'getUnreadCount':
      return getUnreadCount(OPENID);
    case 'markAsRead':
      return markAsRead(OPENID, data);
    case 'markAllAsRead':
      return markAllAsRead(OPENID);
    case 'deleteNotification':
      return deleteNotification(OPENID, data);
    case 'sendNotification':
      return sendNotification(data);
    default:
      return {
        code: -1,
        message: '未知操作'
      };
  }
};

/**
 * 获取通知列表
 * @param {String} openid 用户openid
 * @param {Object} data 查询参数
 */
async function getNotifications(openid, data) {
  try {
    const { page = 1, size = 10, type } = data;
    const skip = (page - 1) * size;
    
    // 构建查询条件
    let query = notificationCollection.where({
      receiverId: openid
    });
    
    // 如果指定了通知类型，添加到查询条件
    if (type) {
      query = query.where({
        type
      });
    }
    
    // 查询总数
    const countResult = await query.count();
    
    // 查询分页数据
    const listResult = await query
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(size)
      .get();
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: listResult.data,
        total: countResult.total,
        page,
        size
      }
    };
  } catch (error) {
    console.error('获取通知列表失败:', error);
    return {
      code: -1,
      message: '获取通知列表失败: ' + error.message
    };
  }
}

/**
 * 获取未读消息数量
 * @param {String} openid 用户openid
 */
async function getUnreadCount(openid) {
  try {
    // 查询未读通知数量
    const countResult = await notificationCollection.where({
      receiverId: openid,
      isRead: false
    }).count();
    
    return {
      code: 0,
      message: '获取成功',
      count: countResult.total
    };
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    return {
      code: -1,
      message: '获取未读消息数量失败: ' + error.message,
      count: 0
    };
  }
}

/**
 * 标记通知为已读
 * @param {String} openid 用户openid
 * @param {Object} data 操作数据
 */
async function markAsRead(openid, data) {
  try {
    const { id } = data;
    
    if (!id) {
      return {
        code: -1,
        message: '通知ID不能为空'
      };
    }
    
    // 查询通知是否存在
    const notificationResult = await notificationCollection.doc(id).get();
    
    if (!notificationResult.data) {
      return {
        code: -1,
        message: '通知不存在'
      };
    }
    
    // 检查通知接收者是否为当前用户
    if (notificationResult.data.receiverId !== openid) {
      return {
        code: -1,
        message: '无权操作该通知'
      };
    }
    
    // 标记为已读
    await notificationCollection.doc(id).update({
      data: {
        isRead: true,
        readTime: db.serverDate()
      }
    });
    
    return {
      code: 0,
      message: '标记成功'
    };
  } catch (error) {
    console.error('标记通知已读失败:', error);
    return {
      code: -1,
      message: '标记通知已读失败: ' + error.message
    };
  }
}

/**
 * 标记所有通知为已读
 * @param {String} openid 用户openid
 */
async function markAllAsRead(openid) {
  try {
    // 查询所有未读通知
    const unreadResult = await notificationCollection.where({
      receiverId: openid,
      isRead: false
    }).get();
    
    if (unreadResult.data.length === 0) {
      return {
        code: 0,
        message: '没有未读通知'
      };
    }
    
    // 批量更新时间
    const now = db.serverDate();
    
    // 批量更新通知状态
    const promises = unreadResult.data.map(notification => {
      return notificationCollection.doc(notification._id).update({
        data: {
          isRead: true,
          readTime: now
        }
      });
    });
    
    await Promise.all(promises);
    
    return {
      code: 0,
      message: '标记成功',
      count: unreadResult.data.length
    };
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    return {
      code: -1,
      message: '标记所有通知已读失败: ' + error.message
    };
  }
}

/**
 * 删除通知
 * @param {String} openid 用户openid
 * @param {Object} data 操作数据
 */
async function deleteNotification(openid, data) {
  try {
    const { id } = data;
    
    if (!id) {
      return {
        code: -1,
        message: '通知ID不能为空'
      };
    }
    
    // 查询通知是否存在
    const notificationResult = await notificationCollection.doc(id).get();
    
    if (!notificationResult.data) {
      return {
        code: -1,
        message: '通知不存在'
      };
    }
    
    // 检查通知接收者是否为当前用户
    if (notificationResult.data.receiverId !== openid) {
      return {
        code: -1,
        message: '无权操作该通知'
      };
    }
    
    // 删除通知
    await notificationCollection.doc(id).remove();
    
    return {
      code: 0,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除通知失败:', error);
    return {
      code: -1,
      message: '删除通知失败: ' + error.message
    };
  }
}

/**
 * 发送通知
 * @param {Object} data 通知数据
 */
async function sendNotification(data) {
  try {
    const { title, content, type, receiverId, senderId, targetId, targetType } = data;
    
    if (!title || !content || !type || !receiverId) {
      return {
        code: -1,
        message: '参数不完整'
      };
    }
    
    // 检查接收者是否存在
    const receiverResult = await userCollection.where({
      openid: receiverId
    }).get();
    
    if (receiverResult.data.length === 0) {
      return {
        code: -1,
        message: '接收者不存在'
      };
    }
    
    // 检查发送者是否存在（如果有）
    if (senderId) {
      const senderResult = await userCollection.where({
        openid: senderId
      }).get();
      
      if (senderResult.data.length === 0) {
        return {
          code: -1,
          message: '发送者不存在'
        };
      }
    }
    
    // 创建通知
    const notification = {
      title,
      content,
      type,
      receiverId,
      senderId: senderId || '',
      targetId: targetId || '',
      targetType: targetType || '',
      isRead: false,
      readTime: null,
      createTime: db.serverDate()
    };
    
    // 添加到数据库
    const addResult = await notificationCollection.add({
      data: notification
    });
    
    return {
      code: 0,
      message: '发送成功',
      data: {
        id: addResult._id
      }
    };
  } catch (error) {
    console.error('发送通知失败:', error);
    return {
      code: -1,
      message: '发送通知失败: ' + error.message
    };
  }
}