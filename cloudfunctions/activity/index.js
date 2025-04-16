// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;
const activityCollection = db.collection('activities');
const userCollection = db.collection('users');
const enrollCollection = db.collection('enrolls');
const favoriteCollection = db.collection('favorites');

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  
  // 获取请求参数
  const { action, params = {}, id, data = {} } = event;
  
  // 根据action参数分发不同的处理
  switch (action) {
    case 'getActivityList':
      return getActivityList(OPENID, params);
    case 'getActivityDetail':
      return getActivityDetail(OPENID, id);
    case 'createActivity':
      return createActivity(OPENID, data);
    case 'updateActivity':
      return updateActivity(OPENID, id, data);
    case 'deleteActivity':
      return deleteActivity(OPENID, id);
    case 'joinActivity':
      return joinActivity(OPENID, id, data);
    case 'cancelJoinActivity':
      return cancelJoinActivity(OPENID, id);
    case 'getEnrollList':
      return getEnrollList(OPENID, id, params);
    case 'favoriteActivity':
      return favoriteActivity(OPENID, id);
    case 'unfavoriteActivity':
      return unfavoriteActivity(OPENID, id);
    case 'getFavoriteList':
      return getFavoriteList(OPENID, params);
    case 'getUserActivities':
      return getUserActivities(OPENID, params);
    default:
      return {
        code: -1,
        message: '未知操作'
      };
  }
};

/**
 * 获取活动列表
 * @param {String} openid 用户openid
 * @param {Object} params 查询参数
 */
async function getActivityList(openid, params) {
  try {
    const { 
      page = 1, 
      pageSize = 10,
      isHot,
      isRecommend,
      isCommunity,
      searchKeyword,
      type,
      status,
      categoryId,
      startDate,
      endDate,
      distance,
      location,
      creatorId,
      includeCreator = false,
      includeJoinStatus = false
    } = params;
    
    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    let query = {};
    
    // 过滤已删除的活动
    query.isDeleted = false;
    
    // 热门活动
    if (isHot !== undefined) {
      query.isHot = isHot;
    }
    
    // 推荐活动
    if (isRecommend !== undefined) {
      query.isRecommend = isRecommend;
    }
    
    // 社区活动
    if (isCommunity !== undefined) {
      query.isCommunity = isCommunity;
    }
    
    // 按关键词搜索
    if (searchKeyword) {
      query.title = db.RegExp({
        regexp: searchKeyword,
        options: 'i'
      });
    }
    
    // 活动类型
    if (type) {
      query.type = type;
    }
    
    // 活动状态
    if (status) {
      query.status = status;
    }
    
    // 活动分类
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    // 创建者
    if (creatorId) {
      query.creatorId = creatorId;
    }
    
    // 活动开始日期范围
    if (startDate) {
      if (!query.startTime) {
        query.startTime = {};
      }
      query.startTime = _.gte(new Date(startDate));
    }
    
    if (endDate) {
      if (!query.startTime) {
        query.startTime = {};
      }
      query.startTime = _.lte(new Date(endDate));
    }
    
    // 查询总数
    const countResult = await activityCollection.where(query).count();
    
    // 查询活动列表
    let listQuery = activityCollection.where(query);
    
    // 排序规则，默认按创建时间倒序
    listQuery = listQuery.orderBy('createTime', 'desc');
    
    // 分页查询
    const listResult = await listQuery.skip(skip).limit(pageSize).get();
    
    // 处理查询结果
    let activities = listResult.data;
    
    // 如果需要包含创建者信息
    if (includeCreator) {
      activities = await Promise.all(activities.map(async (activity) => {
        // 获取创建者信息
        const creatorResult = await userCollection.where({
          openid: activity.creatorId
        }).get();
        
        const creator = creatorResult.data.length > 0 ? creatorResult.data[0] : null;
        
        return {
          ...activity,
          creator: creator ? {
            nickName: creator.nickName,
            avatarUrl: creator.avatarUrl,
            isVip: creator.isVip || false
          } : null
        };
      }));
    }
    
    // 如果需要包含当前用户是否已参与
    if (includeJoinStatus && openid) {
      activities = await Promise.all(activities.map(async (activity) => {
        // 查询用户是否已参与
        const enrollResult = await enrollCollection.where({
          activityId: activity._id,
          userId: openid,
          status: _.neq('cancelled')  // 排除已取消的报名
        }).count();
        
        // 查询用户是否已收藏
        const favoriteResult = await favoriteCollection.where({
          activityId: activity._id,
          userId: openid
        }).count();
        
        return {
          ...activity,
          isJoined: enrollResult.total > 0,
          isFavorite: favoriteResult.total > 0
        };
      }));
    }
    
    // 返回结果
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: activities,
        total: countResult.total,
        page,
        pageSize
      }
    };
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return {
      code: -1,
      message: '获取活动列表失败: ' + error.message
    };
  }
}

/**
 * 获取活动详情
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 */
async function getActivityDetail(openid, id) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动详情
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    let activity = activityResult.data;
    
    // 如果活动已删除，只有创建者和管理员可以查看
    if (activity.isDeleted && activity.creatorId !== openid) {
      // 检查是否为管理员
      const userResult = await userCollection.where({
        openid,
        isAdmin: true
      }).get();
      
      if (userResult.data.length === 0) {
        return {
          code: -1,
          message: '该活动已删除'
        };
      }
    }
    
    // 获取创建者信息
    const creatorResult = await userCollection.where({
      openid: activity.creatorId
    }).get();
    
    const creator = creatorResult.data.length > 0 ? creatorResult.data[0] : null;
    
    // 获取已报名人数
    const enrollResult = await enrollCollection.where({
      activityId: id,
      status: _.neq('cancelled')  // 排除已取消的报名
    }).count();
    
    // 获取已收藏人数
    const favoriteResult = await favoriteCollection.where({
      activityId: id
    }).count();
    
    // 查询当前用户是否已参与
    let isJoined = false;
    let isFavorite = false;
    let joinInfo = null;
    
    if (openid) {
      // 查询用户是否已参与
      const userEnrollResult = await enrollCollection.where({
        activityId: id,
        userId: openid,
        status: _.neq('cancelled')  // 排除已取消的报名
      }).get();
      
      isJoined = userEnrollResult.data.length > 0;
      joinInfo = userEnrollResult.data.length > 0 ? userEnrollResult.data[0] : null;
      
      // 查询用户是否已收藏
      const userFavoriteResult = await favoriteCollection.where({
        activityId: id,
        userId: openid
      }).count();
      
      isFavorite = userFavoriteResult.total > 0;
    }
    
    // 处理返回数据
    const result = {
      ...activity,
      creator: creator ? {
        id: creator._id,
        openid: creator.openid,
        nickName: creator.nickName,
        avatarUrl: creator.avatarUrl,
        isVip: creator.isVip || false
      } : null,
      enrollCount: enrollResult.total,
      favoriteCount: favoriteResult.total,
      isJoined,
      isFavorite,
      joinInfo
    };
    
    return {
      code: 0,
      message: '获取成功',
      data: result
    };
  } catch (error) {
    console.error('获取活动详情失败:', error);
    return {
      code: -1,
      message: '获取活动详情失败: ' + error.message
    };
  }
}

/**
 * 创建活动
 * @param {String} openid 用户openid
 * @param {Object} data 活动数据
 */
async function createActivity(openid, data) {
  try {
    // 查询用户信息
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
    
    // 基本数据校验
    if (!data.title || !data.type) {
      return {
        code: -1,
        message: '标题和类型不能为空'
      };
    }
    
    // 创建活动数据
    const activityData = {
      title: data.title,
      type: data.type,
      content: data.content || '',
      coverUrl: data.coverUrl || '',
      images: data.images || [],
      categoryId: data.categoryId || '',
      location: data.location || null,
      address: data.address || '',
      startTime: data.startTime ? new Date(data.startTime) : null,
      endTime: data.endTime ? new Date(data.endTime) : null,
      maxParticipants: data.maxParticipants || 0,
      price: data.price || 0,
      creatorId: openid,
      creatorNickName: user.nickName,
      creatorAvatarUrl: user.avatarUrl,
      isHot: false,
      isRecommend: false,
      isCommunity: data.isCommunity || false,
      status: 'pending', // 待审核
      statusReason: '',
      isDeleted: false,
      createTime: db.serverDate(),
      updateTime: db.serverDate(),
      enrollCount: 0,
      favoriteCount: 0
    };
    
    // 添加到数据库
    const addResult = await activityCollection.add({
      data: activityData
    });
    
    // 获取创建后的完整活动信息
    const newActivityResult = await activityCollection.doc(addResult._id).get();
    
    return {
      code: 0,
      message: '创建成功',
      data: newActivityResult.data
    };
  } catch (error) {
    console.error('创建活动失败:', error);
    return {
      code: -1,
      message: '创建活动失败: ' + error.message
    };
  }
}

/**
 * 更新活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 * @param {Object} data 更新数据
 */
async function updateActivity(openid, id, data) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动是否存在
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    const activity = activityResult.data;
    
    // 检查是否有权限更新活动
    if (activity.creatorId !== openid) {
      // 检查是否为管理员
      const userResult = await userCollection.where({
        openid,
        isAdmin: true
      }).get();
      
      if (userResult.data.length === 0) {
        return {
          code: -1,
          message: '无权更新该活动'
        };
      }
    }
    
    // 不允许更新的字段
    delete data.creatorId;
    delete data.creatorNickName;
    delete data.creatorAvatarUrl;
    delete data.createTime;
    delete data.enrollCount;
    delete data.favoriteCount;
    
    // 格式化时间字段
    if (data.startTime) {
      data.startTime = new Date(data.startTime);
    }
    
    if (data.endTime) {
      data.endTime = new Date(data.endTime);
    }
    
    // 添加更新时间
    data.updateTime = db.serverDate();
    
    // 更新活动
    await activityCollection.doc(id).update({
      data
    });
    
    // 获取更新后的活动信息
    const updatedActivityResult = await activityCollection.doc(id).get();
    
    return {
      code: 0,
      message: '更新成功',
      data: updatedActivityResult.data
    };
  } catch (error) {
    console.error('更新活动失败:', error);
    return {
      code: -1,
      message: '更新活动失败: ' + error.message
    };
  }
}

/**
 * 删除活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 */
async function deleteActivity(openid, id) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动是否存在
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    const activity = activityResult.data;
    
    // 检查是否有权限删除活动
    if (activity.creatorId !== openid) {
      // 检查是否为管理员
      const userResult = await userCollection.where({
        openid,
        isAdmin: true
      }).get();
      
      if (userResult.data.length === 0) {
        return {
          code: -1,
          message: '无权删除该活动'
        };
      }
    }
    
    // 软删除活动
    await activityCollection.doc(id).update({
      data: {
        isDeleted: true,
        updateTime: db.serverDate()
      }
    });
    
    return {
      code: 0,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除活动失败:', error);
    return {
      code: -1,
      message: '删除活动失败: ' + error.message
    };
  }
}

/**
 * 参加活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 * @param {Object} data 参与数据
 */
async function joinActivity(openid, id, data) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动是否存在
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    const activity = activityResult.data;
    
    // 检查活动状态
    if (activity.status !== 'approved') {
      return {
        code: -1,
        message: '活动未审核通过，无法参加'
      };
    }
    
    // 检查活动是否已删除
    if (activity.isDeleted) {
      return {
        code: -1,
        message: '活动已删除，无法参加'
      };
    }
    
    // 检查活动是否已满员
    if (activity.maxParticipants > 0) {
      const enrollResult = await enrollCollection.where({
        activityId: id,
        status: _.neq('cancelled')  // 排除已取消的报名
      }).count();
      
      if (enrollResult.total >= activity.maxParticipants) {
        return {
          code: -1,
          message: '活动已满员'
        };
      }
    }
    
    // 检查用户是否已参与
    const userEnrollResult = await enrollCollection.where({
      activityId: id,
      userId: openid,
      status: _.neq('cancelled')  // 排除已取消的报名
    }).get();
    
    if (userEnrollResult.data.length > 0) {
      return {
        code: -1,
        message: '您已参加该活动'
      };
    }
    
    // 获取用户信息
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
    
    // 创建参与记录
    const enrollData = {
      activityId: id,
      activityTitle: activity.title,
      activityCoverUrl: activity.coverUrl,
      userId: openid,
      userNickName: user.nickName,
      userAvatarUrl: user.avatarUrl,
      userPhone: data.phone || '',
      userName: data.name || '',
      userAge: data.age || 0,
      userIdCard: data.idCard || '',
      userGender: data.gender || 0,
      userRemark: data.remark || '',
      status: 'enrolled',  // 已报名
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    };
    
    // 添加到数据库
    const addResult = await enrollCollection.add({
      data: enrollData
    });
    
    // 更新活动报名人数
    await activityCollection.doc(id).update({
      data: {
        enrollCount: _.inc(1)
      }
    });
    
    return {
      code: 0,
      message: '参加成功',
      data: {
        id: addResult._id
      }
    };
  } catch (error) {
    console.error('参加活动失败:', error);
    return {
      code: -1,
      message: '参加活动失败: ' + error.message
    };
  }
}

/**
 * 取消参加活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 */
async function cancelJoinActivity(openid, id) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询用户是否已参与
    const enrollResult = await enrollCollection.where({
      activityId: id,
      userId: openid,
      status: _.neq('cancelled')  // 排除已取消的报名
    }).get();
    
    if (enrollResult.data.length === 0) {
      return {
        code: -1,
        message: '您未参加该活动'
      };
    }
    
    const enroll = enrollResult.data[0];
    
    // 更新报名状态
    await enrollCollection.doc(enroll._id).update({
      data: {
        status: 'cancelled',
        updateTime: db.serverDate()
      }
    });
    
    // 更新活动报名人数
    await activityCollection.doc(id).update({
      data: {
        enrollCount: _.inc(-1)
      }
    });
    
    return {
      code: 0,
      message: '取消参加成功'
    };
  } catch (error) {
    console.error('取消参加活动失败:', error);
    return {
      code: -1,
      message: '取消参加活动失败: ' + error.message
    };
  }
}

/**
 * 获取活动报名列表
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 * @param {Object} params 查询参数
 */
async function getEnrollList(openid, id, params) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动是否存在
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    const activity = activityResult.data;
    
    // 检查是否有权限查看报名列表
    if (activity.creatorId !== openid) {
      // 检查是否为管理员
      const userResult = await userCollection.where({
        openid,
        isAdmin: true
      }).get();
      
      if (userResult.data.length === 0) {
        return {
          code: -1,
          message: '无权查看报名列表'
        };
      }
    }
    
    const { page = 1, pageSize = 10, status } = params;
    const skip = (page - 1) * pageSize;
    
    // 构建查询条件
    let query = {
      activityId: id
    };
    
    // 如果指定了状态，添加到查询条件
    if (status) {
      query.status = status;
    }
    
    // 查询总数
    const countResult = await enrollCollection.where(query).count();
    
    // 查询报名列表
    const listResult = await enrollCollection
      .where(query)
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: listResult.data,
        total: countResult.total,
        page,
        pageSize
      }
    };
  } catch (error) {
    console.error('获取报名列表失败:', error);
    return {
      code: -1,
      message: '获取报名列表失败: ' + error.message
    };
  }
}

/**
 * 收藏活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 */
async function favoriteActivity(openid, id) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询活动是否存在
    const activityResult = await activityCollection.doc(id).get();
    
    if (!activityResult.data) {
      return {
        code: -1,
        message: '活动不存在'
      };
    }
    
    const activity = activityResult.data;
    
    // 检查用户是否已收藏
    const favoriteResult = await favoriteCollection.where({
      activityId: id,
      userId: openid
    }).get();
    
    if (favoriteResult.data.length > 0) {
      return {
        code: -1,
        message: '您已收藏该活动'
      };
    }
    
    // 创建收藏记录
    const favoriteData = {
      activityId: id,
      activityTitle: activity.title,
      activityCoverUrl: activity.coverUrl,
      userId: openid,
      createTime: db.serverDate()
    };
    
    // 添加到数据库
    const addResult = await favoriteCollection.add({
      data: favoriteData
    });
    
    // 更新活动收藏人数
    await activityCollection.doc(id).update({
      data: {
        favoriteCount: _.inc(1)
      }
    });
    
    return {
      code: 0,
      message: '收藏成功',
      data: {
        id: addResult._id
      }
    };
  } catch (error) {
    console.error('收藏活动失败:', error);
    return {
      code: -1,
      message: '收藏活动失败: ' + error.message
    };
  }
}

/**
 * 取消收藏活动
 * @param {String} openid 用户openid
 * @param {String} id 活动ID
 */
async function unfavoriteActivity(openid, id) {
  try {
    if (!id) {
      return {
        code: -1,
        message: '活动ID不能为空'
      };
    }
    
    // 查询用户是否已收藏
    const favoriteResult = await favoriteCollection.where({
      activityId: id,
      userId: openid
    }).get();
    
    if (favoriteResult.data.length === 0) {
      return {
        code: -1,
        message: '您未收藏该活动'
      };
    }
    
    const favorite = favoriteResult.data[0];
    
    // 删除收藏记录
    await favoriteCollection.doc(favorite._id).remove();
    
    // 更新活动收藏人数
    await activityCollection.doc(id).update({
      data: {
        favoriteCount: _.inc(-1)
      }
    });
    
    return {
      code: 0,
      message: '取消收藏成功'
    };
  } catch (error) {
    console.error('取消收藏活动失败:', error);
    return {
      code: -1,
      message: '取消收藏活动失败: ' + error.message
    };
  }
}

/**
 * 获取用户收藏列表
 * @param {String} openid 用户openid
 * @param {Object} params 查询参数
 */
async function getFavoriteList(openid, params) {
  try {
    const { page = 1, pageSize = 10 } = params;
    const skip = (page - 1) * pageSize;
    
    // 查询总数
    const countResult = await favoriteCollection.where({
      userId: openid
    }).count();
    
    // 查询收藏列表
    const listResult = await favoriteCollection
      .where({
        userId: openid
      })
      .orderBy('createTime', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get();
    
    // 获取活动详情
    const favorites = await Promise.all(listResult.data.map(async (favorite) => {
      // 查询活动详情
      const activityResult = await activityCollection.doc(favorite.activityId).get();
      const activity = activityResult.data;
      
      return {
        ...favorite,
        activity
      };
    }));
    
    return {
      code: 0,
      message: '获取成功',
      data: {
        list: favorites,
        total: countResult.total,
        page,
        pageSize
      }
    };
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return {
      code: -1,
      message: '获取收藏列表失败: ' + error.message
    };
  }
}

/**
 * 获取用户的活动（我发布的、我参与的）
 * @param {String} openid 用户openid
 * @param {Object} params 查询参数
 */
async function getUserActivities(openid, params) {
  try {
    const { page = 1, pageSize = 10, type = 'joined' } = params;
    const skip = (page - 1) * pageSize;
    
    // 根据类型查询不同的活动
    if (type === 'created') {
      // 查询用户创建的活动
      
      // 查询总数
      const countResult = await activityCollection.where({
        creatorId: openid,
        isDeleted: false
      }).count();
      
      // 查询活动列表
      const listResult = await activityCollection
        .where({
          creatorId: openid,
          isDeleted: false
        })
        .orderBy('createTime', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();
      
      return {
        code: 0,
        message: '获取成功',
        data: {
          list: listResult.data,
          total: countResult.total,
          page,
          pageSize
        }
      };
    } else if (type === 'joined') {
      // 查询用户参与的活动
      
      // 查询总数
      const countResult = await enrollCollection.where({
        userId: openid,
        status: _.neq('cancelled')  // 排除已取消的报名
      }).count();
      
      // 查询报名列表
      const enrollResult = await enrollCollection
        .where({
          userId: openid,
          status: _.neq('cancelled')  // 排除已取消的报名
        })
        .orderBy('createTime', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get();
      
      // 获取活动详情
      const enrolls = await Promise.all(enrollResult.data.map(async (enroll) => {
        // 查询活动详情
        const activityResult = await activityCollection.doc(enroll.activityId).get();
        const activity = activityResult.data;
        
        return {
          ...enroll,
          activity
        };
      }));
      
      return {
        code: 0,
        message: '获取成功',
        data: {
          list: enrolls,
          total: countResult.total,
          page,
          pageSize
        }
      };
    } else if (type === 'favorite') {
      // 调用获取收藏列表方法
      return getFavoriteList(openid, params);
    } else {
      return {
        code: -1,
        message: '不支持的活动类型'
      };
    }
  } catch (error) {
    console.error('获取用户活动失败:', error);
    return {
      code: -1,
      message: '获取用户活动失败: ' + error.message
    };
  }
}