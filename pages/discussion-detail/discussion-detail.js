// 讨论详情页逻辑
Page({
  data: {
    loading: true,
    discussion: null,
    discussionId: '',
    // 点赞状态
    isLiked: false,
    // 评论相关状态
    commentText: '',
    comments: []
  },

  onLoad(options) {
    console.log('讨论详情页加载:', options);
    const id = options.id;
    this.setData({ discussionId: id });
    this.loadDiscussionDetail(id);
  },

  // 加载讨论详情
  loadDiscussionDetail(id) {
    this.setData({ loading: true });
    
    // 从后端API获取讨论详情
    wx.request({
      url: `http://localhost:3001/api/discussions/${id}`,
      method: 'GET',
      success: (res) => {
        console.log('获取讨论详情成功:', res.data);
        if (res.data) {
          // 格式化时间
          const formattedDiscussion = {
            ...res.data,
            time: this.formatTime(res.data.time)
          };
          
          this.setData({ discussion: formattedDiscussion });
          // 加载评论
          this.loadComments(id);
        } else {
          this.setData({ discussion: null });
        }
      },
      fail: (err) => {
        console.error('获取讨论详情失败:', err);
        this.setData({ discussion: null });
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 加载评论
  loadComments(discussionId) {
    wx.request({
      url: `http://localhost:3001/api/discussions/${discussionId}/comments`,
      method: 'GET',
      success: (res) => {
        console.log('获取评论成功:', res.data);
        if (res.data && Array.isArray(res.data)) {
          // 格式化时间
          const formattedComments = res.data.map(comment => ({
            ...comment,
            time: this.formatTime(comment.time)
          }));
          this.setData({ comments: formattedComments });
        }
      },
      fail: (err) => {
        console.error('获取评论失败:', err);
      }
    });
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 点赞讨论
  likeDiscussion() {
    const isLiked = !this.data.isLiked;
    const discussion = { ...this.data.discussion };
    const discussionId = this.data.discussionId;
    
    if (isLiked) {
      // 调用点赞API
      wx.request({
        url: `http://localhost:3001/api/discussions/${discussionId}/like`,
        method: 'POST',
        success: (res) => {
          if (res.data.success) {
            discussion.likes += 1;
            this.setData({ isLiked: true, discussion: discussion });
            wx.showToast({ title: '点赞成功', icon: 'success' });
          }
        },
        fail: (err) => {
          console.error('点赞失败:', err);
        }
      });
    } else {
      // 调用取消点赞API
      wx.request({
        url: `http://localhost:3001/api/discussions/${discussionId}/unlike`,
        method: 'POST',
        success: (res) => {
          if (res.data.success) {
            discussion.likes = Math.max(0, discussion.likes - 1);
            this.setData({ isLiked: false, discussion: discussion });
            wx.showToast({ title: '取消点赞', icon: 'none' });
          }
        },
        fail: (err) => {
          console.error('取消点赞失败:', err);
        }
      });
    }
  },

  // 处理评论输入
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 提交评论
  submitComment() {
    const commentText = this.data.commentText.trim();
    if (!commentText) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    const discussionId = this.data.discussionId;
    
    // 模拟用户信息（实际项目中应该从登录状态获取）
    const userInfo = {
      id: 1,
      name: '我',
      avatar: '我'
    };

    // 调用添加评论API
    wx.request({
      url: `http://localhost:3001/api/discussions/${discussionId}/comments`,
      method: 'POST',
      data: {
        userId: userInfo.id,
        userName: userInfo.name,
        userAvatar: userInfo.avatar,
        content: commentText
      },
      success: (res) => {
        if (res.data.success) {
          // 创建新评论
          const newComment = {
            id: Date.now(),
            user: {
              name: userInfo.name,
              avatar: userInfo.avatar
            },
            content: commentText,
            time: '刚刚'
          };

          // 更新评论列表
          const comments = [newComment, ...this.data.comments];
          
          // 更新评论计数
          const discussion = { ...this.data.discussion };
          discussion.comments += 1;

          // 更新状态
          this.setData({
            comments: comments,
            discussion: discussion,
            commentText: ''
          });

          wx.showToast({ title: '评论成功', icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('评论失败:', err);
        wx.showToast({ title: '评论失败', icon: 'none' });
      }
    });
  },

  // 分享讨论
  shareDiscussion() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 分享到好友
  onShareAppMessage() {
    if (!this.data.discussion) return {};
    
    return {
      title: this.data.discussion.title,
      path: `/pages/discussion-detail/discussion-detail?id=${this.data.discussionId}`,
      imageUrl: this.data.discussion.image || ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    if (!this.data.discussion) return {};
    
    return {
      title: this.data.discussion.title,
      imageUrl: this.data.discussion.image || ''
    };
  },

  // 格式化时间
  formatTime(timeStr) {
    if (!timeStr) return '';
    
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
});