// components/comment-item/index.js
Component({
  properties: {
    // 评论数据
    comment: {
      type: Object,
      value: {}
    }
  },
  
  data: {
    // 是否点赞
    isLiked: false,
    // 点赞数量
    likeCount: 0,
    // 是否显示所有回复
    showAllReplies: false,
    // 要展示的回复列表（处理显示部分回复的逻辑）
    displayReplies: []
  },
  
  lifetimes: {
    attached() {
      // 初始化点赞数量
      this.setData({
        likeCount: this.properties.comment.likeCount || 0
      })
      
      // 处理回复展示逻辑
      this.handleRepliesDisplay()
    }
  },
  
  observers: {
    'comment.likeCount': function(newVal) {
      this.setData({
        likeCount: newVal || 0
      })
    },
    'comment.replies': function() {
      this.handleRepliesDisplay()
    }
  },
  
  methods: {
    // 处理回复展示逻辑
    handleRepliesDisplay() {
      const { replies } = this.properties.comment
      if (replies && replies.length > 0) {
        // 如果回复超过3条且未选择展开全部，则只显示前3条
        if (replies.length > 3 && !this.data.showAllReplies) {
          this.setData({
            displayReplies: replies.slice(0, 3)
          })
        } else {
          this.setData({
            displayReplies: replies
          })
        }
      }
    },
    
    // 点赞
    onLike() {
      const isLiked = !this.data.isLiked
      let likeCount = this.data.likeCount
      
      if (isLiked) {
        likeCount += 1
      } else {
        likeCount = Math.max(0, likeCount - 1)
      }
      
      this.setData({
        isLiked,
        likeCount
      })
      
      // 触发点赞事件
      this.triggerEvent('like', {
        commentId: this.properties.comment.id,
        isLiked: isLiked
      })
    },
    
    // 回复主评论
    onReply() {
      // 触发回复事件
      this.triggerEvent('reply', {
        userId: this.properties.comment.userId,
        userName: this.properties.comment.userName
      })
    },
    
    // 回复子回复
    onReplyToReply(e) {
      const index = e.currentTarget.dataset.index
      const reply = this.properties.comment.replies[index]
      
      // 触发回复事件
      this.triggerEvent('reply', {
        userId: reply.userId,
        userName: reply.userName
      })
    },
    
    // 切换显示所有回复
    toggleReplies() {
      const showAllReplies = !this.data.showAllReplies
      
      this.setData({
        showAllReplies
      })
      
      this.handleRepliesDisplay()
    }
  }
})