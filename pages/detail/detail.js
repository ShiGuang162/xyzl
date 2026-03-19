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
    totalTime: '00:10',
    selectedDialect: '普通话',
    // 支持的方言列表
    dialects: ['普通话', '北京话', '上海话', '广东话', '四川话', '东北话']
  },

  onLoad(options) {
    console.log('详情页加载', options);
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
        console.log('原始 images 字段:', res.data.images);
        console.log('原始 image 字段:', res.data.image);
        console.log('数据类型:', type);
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
            // 处理图片数据：优先使用images字段，如果不存在则使用image字段创建数组
            images: this.processImages(detail),
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
            // 处理图片数据：优先使用images字段，如果不存在则使用image字段创建数组
            images: this.processImages(detail),
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
            // 处理图片数据：优先使用images字段，如果不存在则使用image字段创建数组
            images: this.processImages(detail),
            tags: detail.tags ? detail.tags.split(',').map(tag => tag.trim()) : []
          };
        }
        
        console.log('处理后的detail对象:', detail);
        console.log('处理后的images字段:', detail.images);
        console.log('images字段类型:', typeof detail.images);
        console.log('images数组长度:', detail.images ? detail.images.length : 0);
        
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

  // 显示方言选择对话框
  showDialectDialog() {
    const that = this;
    wx.showActionSheet({
      itemList: this.data.dialects,
      success(res) {
        const selectedDialect = that.data.dialects[res.tapIndex];
        that.setData({ selectedDialect });
        wx.showToast({ title: `已切换到${selectedDialect}`, icon: 'success' });
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
  },

  // 切换播放/暂停状态
  togglePlay() {
    const { isPlaying, selectedDialect, detail } = this.data;
    
    if (isPlaying) {
      // 暂停播放
      this.stopSpeech();
      wx.showToast({ title: '已暂停', icon: 'none' });
    } else {
      if (detail) {
        // 准备合成的文本
        const text = `${detail.title}。${detail.content.replace(/\n/g, '。')}`;
        // 使用微信内置的语音合成功能
        this.playSpeech(text, selectedDialect);
      }
    }
  },
  
  // 使用微信内置的语音合成功能
  playSpeech(text, dialect) {
    wx.showToast({ title: `开始${dialect}讲解`, icon: 'none' });
    
    // 开始播放
    this.setData({ isPlaying: true });
    
    // 计算预计播放时间（假设每秒播放5个汉字）
    const textLength = text.length;
    const estimatedTime = Math.max(10, Math.ceil(textLength / 5));
    this.setData({ totalTime: `00:${estimatedTime.toString().padStart(2, '0')}` });
    
    // 模拟语音播放进度
    this.startProgressUpdate(estimatedTime);
    
    // 检查微信语音合成功能是否可用
    if (wx.speechSynthesis && wx.speechSynthesis.speak) {
      // 使用微信的语音合成功能
      wx.speechSynthesis.speak({
        text: text,
        lang: 'zh_CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        success: () => {
          console.log('语音播放成功');
        },
        fail: (res) => {
          console.error('语音播放失败:', res);
          this.setData({ isPlaying: false });
          this.stopProgressUpdate();
          wx.showToast({ title: '语音播放失败', icon: 'none' });
        }
      });
    } else {
      // 语音合成功能不可用，显示提示
      console.warn('语音合成功能不可用');
      wx.showToast({ title: '语音合成功能不可用，请在真机上测试', icon: 'none' });
    }
    
    // 根据文本长度设置播放结束时间
    setTimeout(() => {
      // 停止语音播放
      if (wx.speechSynthesis && wx.speechSynthesis.stop) {
        wx.speechSynthesis.stop();
      }
      this.setData({ 
        isPlaying: false, 
        progress: 0, 
        currentTime: '00:00' 
      });
      this.stopProgressUpdate();
      wx.showToast({ title: '播放结束', icon: 'none' });
    }, estimatedTime * 1000);
  },
  
  // 停止语音播放
  stopSpeech() {
    // 停止微信语音合成
    if (wx.speechSynthesis && wx.speechSynthesis.stop) {
      wx.speechSynthesis.stop();
    }
    this.setData({ isPlaying: false });
    this.stopProgressUpdate();
  },
  
  // 开始更新播放进度
  startProgressUpdate(totalSeconds) {
    this.progressTimer = setInterval(() => {
      const progress = this.data.progress + (100 / totalSeconds / 10);
      if (progress <= 100) {
        // 计算当前时间
        const currentSeconds = Math.floor((progress / 100) * totalSeconds);
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
      }
    }, 100); // 每100毫秒更新一次进度
  },

  // 停止更新播放进度
  stopProgressUpdate() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  },
  
  // 处理图片数据：优先使用本地的image字段，如果不存在则使用images字段
  processImages(detail) {
    try {
      console.log('processImages开始处理:', { 
        hasImage: !!detail.image, 
        hasImages: !!detail.images,
        image: detail.image,
        images: detail.images 
      });
      
      // 优先使用本地的image字段（通常是可访问的本地图片）
      if (detail.image) {
        console.log('使用本地image字段:', detail.image);
        return [detail.image];
      }
      
      // 如果本地image字段不存在，尝试使用images字段
      if (detail.images) {
        console.log('尝试使用images字段:', detail.images);
        // 如果images是字符串，尝试解析为JSON数组
        if (typeof detail.images === 'string') {
          try {
            const parsedImages = JSON.parse(detail.images);
            if (Array.isArray(parsedImages) && parsedImages.length > 0) {
              console.log('成功解析images字段为JSON数组:', parsedImages.length, '个图片');
              return parsedImages;
            }
          } catch (parseError) {
            console.warn('无法解析images字段为JSON:', parseError);
            // 如果解析失败，检查是否是逗号分隔的字符串
            if (detail.images.includes(',')) {
              const images = detail.images.split(',').map(img => img.trim()).filter(img => img);
              console.log('将逗号分隔的字符串转换为数组:', images.length, '个图片');
              return images;
            }
            // 如果只有一个URL字符串，返回数组
            console.log('images字段是单个URL字符串');
            return [detail.images];
          }
        } else if (Array.isArray(detail.images)) {
          // 如果已经是数组，直接返回
          console.log('images字段已经是数组:', detail.images.length, '个图片');
          return detail.images;
        }
      }
      
      // 如果都没有，返回空数组
      console.log('没有找到可用的图片字段');
      return [];
    } catch (error) {
      console.error('处理图片数据时出错:', error);
      return [];
    }
  },
  
  // 页面卸载时清理定时器
  onUnload() {
    this.stopProgressUpdate();
  }
});