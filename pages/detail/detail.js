// 详情页逻辑
const api = require('../../utils/api');

Page({
  data: {
    loading: true,
    detail: null,
    type: '',
    id: '',
    // 点赞状态
    isLiked: false,
    // 收藏状态
    isCollected: false,
    // 评论相关状态
    commentText: '',
    comments: [],
    // 语音播放相关状态
    isPlaying: false,
    progress: 0,
    currentTime: '00:00',
    totalTime: '05:00',
    selectedDialect: '普通话',
    selectedStyle: '亲切',
    selectedEmotion: '平静',
    selectedVoice: '女声',
    showVoiceSettings: false,
    // 支持的方言列表
    dialects: ['普通话', '北京话', '上海话', '广东话', '四川话', '东北话'],
    // 支持的语音风格
    voiceStyles: ['正式', '亲切', '幽默', '温柔', '活泼'],
    // 支持的情感语调
    emotions: ['平静', '兴奋', '温柔', '严肃', '愉悦'],
    // 支持的声音类型
    voiceTypes: ['男声', '女声', '童声', '磁性男声', '甜美女声']
  },

  onLoad(options) {
    console.log('详情页加载', options);
    // 加载用户保存的语音设置
    this.loadVoiceSettings();
    this.setData({
      type: options.type,
      id: options.id
    });
    this.loadDetail(options.type, options.id);
  },

  loadDetail(type, id) {
    this.setData({ loading: true });
    
    // 从后端API获取数据
    let apiUrl = '';
    switch(type) {
      case 'strategy':
        apiUrl = `/api/strategies/${id}`;
        break;
      case 'scenic':
        apiUrl = `/api/scenics/${id}`;
        break;
      case 'history':
        apiUrl = `/api/history/${id}`;
        break;
      default:
        this.setData({ 
          detail: {
            id: id,
            title: '未知内容',
            content: '抱歉，未找到相关内容',
            images: []
          },
          loading: false
        });
        return;
    }
    
    wx.request({
      url: `http://localhost:3001${apiUrl}`,
      method: 'GET',
      success: (res) => {
        console.log('获取详情数据成功:', res.data);
        let detail = res.data;
        
        // 处理数据格式，确保与前端期望的格式一致
        if (type === 'strategy') {
          detail = {
            id: detail.id,
            title: detail.title,
            author: detail.author || '未知作者',
            avatar: detail.author ? detail.author.substring(0, 1) : '作',
            time: detail.created_at || this.formatTime(new Date(), 'date'),
            views: detail.views || 0,
            likes: detail.likes || 0,
            comments: detail.comments || 0,
            content: (detail.content || detail.description || '暂无内容').replace(/\n/g, '\n\n'),
            images: detail.images ? JSON.parse(detail.images) : [],
            tags: detail.tags ? detail.tags.split(',').map(tag => tag.trim()) : []
          };
        } else if (type === 'scenic') {
          detail = {
            id: detail.id,
            title: detail.name || detail.title,
            address: detail.address || '',
            rating: detail.rating || 0,
            reviews: detail.reviews || 0,
            author: '景点信息',
            avatar: '景',
            time: detail.created_at || this.formatTime(new Date(), 'date'),
            views: detail.views || 0,
            likes: detail.likes || 0,
            comments: detail.comments || 0,
            content: (detail.content || detail.description || '暂无内容').replace(/\n/g, '\n\n'),
            images: detail.images ? JSON.parse(detail.images) : [],
            tags: detail.tags ? detail.tags.split(',').map(tag => tag.trim()) : []
          };
        } else if (type === 'history') {
          detail = {
            id: detail.id,
            title: detail.title,
            author: detail.author || '历史学者',
            avatar: detail.author ? detail.author.substring(0, 1) : '历',
            time: detail.created_at || this.formatTime(new Date(), 'date'),
            views: detail.views || 0,
            likes: detail.likes || 0,
            comments: detail.comments || 0,
            content: (detail.content || detail.description || '暂无内容').replace(/\n/g, '\n\n'),
            images: detail.images ? JSON.parse(detail.images) : [],
            tags: detail.tags ? detail.tags.split(',').map(tag => tag.trim()) : []
          };
        }
        
        this.setData({ detail: detail, loading: false });

        // 检查用户是否已点赞
        this.checkLikeStatus();
        
        // 检查用户是否已收藏
        this.checkCollectStatus();
        
        // 加载评论列表
        this.loadComments();
      },
      fail: (err) => {
        console.error('获取详情数据失败:', err);
        // 加载失败时使用默认数据
        this.setData({ 
          detail: {
            id: id,
            title: '加载失败',
            content: '抱歉，加载内容失败，请重试',
            images: []
          },
          loading: false
        });
      }
    });
  },

  // 点赞
  likeDetail() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const isLiked = !this.data.isLiked;
    const detail = { ...this.data.detail };
    
    if (isLiked) {
      detail.likes = (detail.likes || 0) + 1;
      wx.showToast({ title: '点赞成功', icon: 'success' });
    } else {
      detail.likes = Math.max(0, (detail.likes || 1) - 1);
      wx.showToast({ title: '取消点赞', icon: 'none' });
    }

    this.setData({
      isLiked,
      detail
    });

    const likedItems = wx.getStorageSync('likedItems') || {};
    const key = `${userInfo.id}_${this.data.type}_${this.data.id}`;
    likedItems[key] = isLiked;
    wx.setStorageSync('likedItems', likedItems);

    const likeData = {
      userId: userInfo.id,
      contentId: this.data.id,
      contentType: this.data.type,
      isLiked
    };

    wx.request({
      url: 'http://localhost:3001/api/like',
      method: 'POST',
      data: likeData,
      success: (res) => {
        if (!res.data.success) {
          const rollbackIsLiked = !isLiked;
          const rollbackDetail = { ...detail };
          if (isLiked) {
            rollbackDetail.likes = Math.max(0, (rollbackDetail.likes || 1) - 1);
          } else {
            rollbackDetail.likes = (rollbackDetail.likes || 0) + 1;
          }
          this.setData({
            isLiked: rollbackIsLiked,
            detail: rollbackDetail
          });
          likedItems[key] = rollbackIsLiked;
          wx.setStorageSync('likedItems', likedItems);
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },

  // 评论
  showCommentDialog() {
    this.focusCommentInput();
  },

  // 聚焦评论输入框
  focusCommentInput() {
    // 这里可以添加逻辑，比如滚动到底部或显示评论输入框
    wx.showToast({ title: '请在下方输入评论', icon: 'none' });
  },

  // 收藏
  collectDetail() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const isCollected = !this.data.isCollected;
    const detail = this.data.detail;
    
    this.setData({ isCollected });

    if (isCollected) {
      wx.showToast({ title: '收藏成功', icon: 'success' });
      
      // 添加到收藏列表
      const collections = wx.getStorageSync('collections') || [];
      const newCollection = {
        id: detail.id,
        type: this.data.type,
        title: detail.title,
        image: detail.images && detail.images.length > 0 ? detail.images[0] : '',
        collectTime: this.formatTime(new Date(), 'date')
      };
      
      // 检查是否已存在
      const exists = collections.some(item => item.id == detail.id && item.type == this.data.type);
      if (!exists) {
        collections.push(newCollection);
        wx.setStorageSync('collections', collections);
      }
    } else {
      wx.showToast({ title: '取消收藏', icon: 'none' });
      
      // 从收藏列表中移除
      const collections = wx.getStorageSync('collections') || [];
      const updatedCollections = collections.filter(item => !(item.id == detail.id && item.type == this.data.type));
      wx.setStorageSync('collections', updatedCollections);
    }

    // 保存收藏状态到本地存储
    const collectedItems = wx.getStorageSync('collectedItems') || {};
    const key = `${userInfo.id}_${this.data.type}_${this.data.id}`;
    collectedItems[key] = isCollected;
    wx.setStorageSync('collectedItems', collectedItems);

    // 向后端发送收藏请求
    const collectData = {
      userId: userInfo.id,
      itemId: this.data.id,
      itemType: this.data.type
    };

    if (isCollected) {
      // 添加收藏
      wx.request({
        url: 'http://localhost:3001/api/collections',
        method: 'POST',
        data: collectData,
        success: (res) => {
          console.log('收藏请求结果:', res.data);
        },
        fail: (err) => {
          console.error('收藏请求失败:', err);
        }
      });
    } else {
      // 删除收藏
      // 这里需要先获取收藏ID，然后删除
      // 简化处理，只更新本地状态
    }
  },

  // 检查用户是否已收藏
  checkCollectStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      return;
    }

    // 从本地存储获取收藏状态
    const collectedItems = wx.getStorageSync('collectedItems') || {};
    const key = `${userInfo.id}_${this.data.type}_${this.data.id}`;
    const isCollected = collectedItems[key] || false;
    
    this.setData({ isCollected });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.detail.title,
      path: `/pages/detail/detail?type=${this.data.type}&id=${this.data.id}`
    };
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 检查用户是否已点赞
  checkLikeStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      return;
    }

    const likedItems = wx.getStorageSync('likedItems') || {};
    const key = `${userInfo.id}_${this.data.type}_${this.data.id}`;
    const isLiked = likedItems[key] || false;
    
    this.setData({ isLiked });

    wx.request({
      url: 'http://localhost:3001/api/like/check',
      method: 'GET',
      data: {
        userId: userInfo.id,
        contentId: this.data.id,
        contentType: this.data.type
      },
      success: (res) => {
        if (res.data.isLiked !== undefined) {
          this.setData({ isLiked: res.data.isLiked });
          likedItems[key] = res.data.isLiked;
          wx.setStorageSync('likedItems', likedItems);
        }
      }
    });
  },

  // 处理评论输入
  onCommentInput(e) {
    this.setData({ commentText: e.detail.value });
  },

  // 提交评论
  submitComment() {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const commentText = this.data.commentText.trim();
    if (!commentText) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    // 创建新评论
    const newComment = {
      id: Date.now(),
      user: userInfo.nickname || '用户',
      content: commentText,
      time: this.formatTime(new Date())
    };

    // 更新评论列表
    const comments = [newComment, ...this.data.comments];
    
    // 更新评论计数
    const detail = { ...this.data.detail };
    detail.comments = (detail.comments || 0) + 1;

    // 更新状态
    this.setData({
      comments,
      detail,
      commentText: ''
    });

    // 保存评论到本地存储
    const commentsData = wx.getStorageSync('comments') || {};
    const key = `${this.data.type}_${this.data.id}`;
    commentsData[key] = comments;
    wx.setStorageSync('comments', commentsData);

    wx.showToast({ title: '评论成功', icon: 'success' });

    // 向后端发送评论请求
    const commentData = {
      userId: userInfo.id,
      itemId: this.data.id,
      itemType: this.data.type,
      content: commentText
    };

    wx.request({
      url: 'http://localhost:3001/api/comments',
      method: 'POST',
      data: commentData,
      success: (res) => {
        console.log('评论请求结果:', res.data);
      },
      fail: (err) => {
        console.error('评论请求失败:', err);
      }
    });
  },

  // 加载评论列表
  loadComments() {
    // 从本地存储获取评论
    const commentsData = wx.getStorageSync('comments') || {};
    const key = `${this.data.type}_${this.data.id}`;
    const comments = commentsData[key] || [];
    
    this.setData({ comments });

    // 向后端请求评论列表
    wx.request({
      url: 'http://localhost:3001/api/comments',
      method: 'GET',
      data: {
        itemId: this.data.id,
        itemType: this.data.type
      },
      success: (res) => {
        if (res.data && res.data.length > 0) {
          const formattedComments = res.data.map(comment => ({
            id: comment.id,
            user: comment.nickname,
            content: comment.content,
            time: this.formatTime(new Date(comment.created_at))
          }));
          this.setData({ comments: formattedComments });
          // 更新本地存储
          commentsData[key] = formattedComments;
          wx.setStorageSync('comments', commentsData);
        }
      },
      fail: (err) => {
        console.error('加载评论失败:', err);
      }
    });
  },

  // 格式化时间
  formatTime(date, format = 'relative') {
    if (format === 'date') {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }

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
  },

  // 显示语音设置面板
  showVoiceSettings() {
    this.setData({ showVoiceSettings: true });
  },

  // 隐藏语音设置面板
  hideVoiceSettings() {
    this.setData({ showVoiceSettings: false });
  },

  // 选择方言
  selectDialect(e) {
    const dialect = e.currentTarget.dataset.dialect;
    this.setData({ selectedDialect: dialect });
    this.saveVoiceSettings();
    wx.showToast({ title: `已切换到${dialect}`, icon: 'success' });
  },

  // 选择语音风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style;
    this.setData({ selectedStyle: style });
    this.saveVoiceSettings();
  },

  // 选择情感语调
  selectEmotion(e) {
    const emotion = e.currentTarget.dataset.emotion;
    this.setData({ selectedEmotion: emotion });
    this.saveVoiceSettings();
  },

  // 选择声音类型
  selectVoice(e) {
    const voice = e.currentTarget.dataset.voice;
    this.setData({ selectedVoice: voice });
    this.saveVoiceSettings();
  },

  // 保存语音设置到本地存储
  saveVoiceSettings() {
    const voiceSettings = {
      dialect: this.data.selectedDialect,
      style: this.data.selectedStyle,
      emotion: this.data.selectedEmotion,
      voice: this.data.selectedVoice
    };
    wx.setStorageSync('voiceSettings', voiceSettings);
  },

  // 从本地存储加载语音设置
  loadVoiceSettings() {
    const voiceSettings = wx.getStorageSync('voiceSettings');
    if (voiceSettings) {
      this.setData({
        selectedDialect: voiceSettings.dialect || '普通话',
        selectedStyle: voiceSettings.style || '亲切',
        selectedEmotion: voiceSettings.emotion || '平静',
        selectedVoice: voiceSettings.voice || '女声'
      });
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 切换播放/暂停状态
  togglePlay() {
    const isPlaying = !this.data.isPlaying;
    this.setData({ isPlaying });
    
    if (isPlaying) {
      // 模拟开始播放
      wx.showToast({ title: `开始${this.data.selectedDialect}讲解`, icon: 'none' });
      // 开始更新进度
      this.startProgressUpdate();
    } else {
      // 模拟暂停播放
      wx.showToast({ title: '已暂停', icon: 'none' });
      // 停止更新进度
      this.stopProgressUpdate();
    }
  },

  // 开始更新播放进度
  startProgressUpdate() {
    this.progressTimer = setInterval(() => {
      const progress = this.data.progress + 1;
      if (progress <= 100) {
        // 计算当前时间
        const currentSeconds = Math.floor((progress / 100) * 300); // 假设总时长5分钟
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        const currentTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.setData({ 
          progress, 
          currentTime 
        });
      } else {
        // 播放结束
        this.setData({ 
          isPlaying: false, 
          progress: 0, 
          currentTime: '00:00' 
        });
        this.stopProgressUpdate();
        wx.showToast({ title: '播放结束', icon: 'none' });
      }
    }, 3000); // 每3秒更新一次进度
  },

  // 停止更新播放进度
  stopProgressUpdate() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  },

  // 页面卸载时清理定时器
  onUnload() {
    this.stopProgressUpdate();
  }
});