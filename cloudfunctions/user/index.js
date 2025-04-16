// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const userCollection = db.collection('users');

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID, UNIONID, APPID } = cloud.getWXContext();
  
  // 获取请求参数
  const { action, data = {} } = event;
  
  // 根据action参数分发不同的处理
  switch (action) {
    case 'login':
      return login(OPENID, UNIONID, data);
    case 'getUserInfo':
      return getUserInfo(OPENID);
    case 'updateUserInfo':
      return updateUserInfo(OPENID, data);
    case 'getVipStatus':
      return getVipStatus(OPENID);
    case 'verifyToken':
      return verifyToken(data.token);
    default:
      return {
        code: -1,
        message: '未知操作'
      };
  }
};

/**
 * 用户登录
 * @param {String} openid 用户openid
 * @param {String} unionid 用户unionid
 * @param {Object} data 登录数据
 */
async function login(openid, unionid, data) {
  try {
    // 查询用户是否已存在
    const userResult = await userCollection.where({
      openid
    }).get();
    
    // 生成token
    const token = generateToken(openid);
    
    if (userResult.data.length === 0) {
      // 用户不存在，创建新用户
      const userInfo = {
        openid,
        unionid: unionid || '',
        nickName: data.nickName || '用户' + openid.substr(-4),
        avatarUrl: data.avatarUrl || '',
        gender: data.gender || 0,
        country: data.country || '',
        province: data.province || '',
        city: data.city || '',
        language: data.language || 'zh_CN',
        isVip: false,
        vipExpireTime: null,
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        token,
        lastLoginTime: db.serverDate()
      };
      
      // 添加用户到数据库
      const addResult = await userCollection.add({
        data: userInfo
      });
      
      // 获取添加后的用户完整信息
      const newUserResult = await userCollection.doc(addResult._id).get();
      
      return {
        code: 0,
        message: '登录成功',
        data: {
          token,
          userInfo: newUserResult.data
        }
      };
    } else {
      // 用户已存在，更新登录时间和token
      const user = userResult.data[0];
      
      await userCollection.doc(user._id).update({
        data: {
          token,
          lastLoginTime: db.serverDate(),
          updateTime: db.serverDate(),
          // 如果有新的用户信息，更新用户信息
          nickName: data.nickName || user.nickName,
          avatarUrl: data.avatarUrl || user.avatarUrl,
          gender: data.gender !== undefined ? data.gender : user.gender,
          country: data.country || user.country,
          province: data.province || user.province,
          city: data.city || user.city,
          language: data.language || user.language
        }
      });
      
      // 获取更新后的用户信息
      const updatedUserResult = await userCollection.doc(user._id).get();
      
      return {
        code: 0,
        message: '登录成功',
        data: {
          token,
          userInfo: updatedUserResult.data
        }
      };
    }
  } catch (error) {
    console.error('登录失败:', error);
    return {
      code: -1,
      message: '登录失败: ' + error.message
    };
  }
}

/**
 * 获取用户信息
 * @param {String} openid 用户openid
 */
async function getUserInfo(openid) {
  try {
    // 根据openid查询用户
    const userResult = await userCollection.where({
      openid
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      };
    }
    
    // 返回用户信息
    return {
      code: 0,
      message: '获取成功',
      data: userResult.data[0]
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return {
      code: -1,
      message: '获取用户信息失败: ' + error.message
    };
  }
}

/**
 * 更新用户信息
 * @param {String} openid 用户openid
 * @param {Object} data 要更新的用户数据
 */
async function updateUserInfo(openid, data) {
  try {
    // 查询用户是否已存在
    const userResult = await userCollection.where({
      openid
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    
    // 防止更新敏感字段
    delete data.openid;
    delete data.unionid;
    delete data.isVip;
    delete data.vipExpireTime;
    delete data.token;
    delete data.createTime;
    
    // 添加更新时间
    data.updateTime = db.serverDate();
    
    // 更新用户信息
    await userCollection.doc(user._id).update({
      data
    });
    
    // 获取更新后的用户信息
    const updatedUserResult = await userCollection.doc(user._id).get();
    
    return {
      code: 0,
      message: '更新成功',
      data: updatedUserResult.data
    };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      code: -1,
      message: '更新用户信息失败: ' + error.message
    };
  }
}

/**
 * 获取用户VIP状态
 * @param {String} openid 用户openid
 */
async function getVipStatus(openid) {
  try {
    // 根据openid查询用户
    const userResult = await userCollection.where({
      openid
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: '用户不存在'
      };
    }
    
    const user = userResult.data[0];
    
    // 检查VIP状态
    let isVip = user.isVip || false;
    let vipExpireTime = user.vipExpireTime;
    
    // 如果VIP已过期，更新状态
    if (isVip && vipExpireTime && new Date(vipExpireTime) < new Date()) {
      isVip = false;
      vipExpireTime = null;
      
      // 更新数据库中的VIP状态
      await userCollection.doc(user._id).update({
        data: {
          isVip,
          vipExpireTime
        }
      });
    }
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        isVip,
        vipExpireTime
      }
    };
  } catch (error) {
    console.error('获取VIP状态失败:', error);
    return {
      code: -1,
      message: '获取VIP状态失败: ' + error.message
    };
  }
}

/**
 * 验证token是否有效
 * @param {String} token 要验证的token
 */
async function verifyToken(token) {
  try {
    if (!token) {
      return {
        code: -1,
        message: 'token不能为空'
      };
    }
    
    // 根据token查询用户
    const userResult = await userCollection.where({
      token
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        code: -1,
        message: 'token无效'
      };
    }
    
    return {
      code: 0,
      message: 'token有效',
      data: {
        isValid: true
      }
    };
  } catch (error) {
    console.error('验证token失败:', error);
    return {
      code: -1,
      message: '验证token失败: ' + error.message
    };
  }
}

/**
 * 生成token
 * @param {String} openid 用户openid
 */
function generateToken(openid) {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 8);
  const base = openid + timestamp + random;
  
  // 简单的加密方式，实际应用中应使用更复杂的加密算法
  return Buffer.from(base).toString('base64');
}