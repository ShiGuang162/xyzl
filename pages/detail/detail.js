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
    // 语音播放相关状态
    isPlaying: false,
    progress: 0,
    currentTime: '00:00',
    totalTime: '05:00',
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
    
    // 模拟加载详情数据
    setTimeout(() => {
      let detail = null;
      
      switch(type) {
        case 'strategy':
          detail = {
            id: id,
            title: '北京三日游攻略',
            author: '旅游达人',
            avatar: '旅',
            time: '2026-01-01',
            views: 12345,
            likes: 6789,
            comments: 1234,
            content: '第一天：故宫博物院、天安门广场\n第二天：长城、颐和园\n第三天：南锣鼓巷、什刹海\n\n故宫一定要提前预约，长城建议去慕田峪，人相对少一些。颐和园建议下午去，夕阳下的昆明湖很美。\n\n住宿推荐：王府井附近，交通便利，购物方便。\n\n美食推荐：烤鸭、炸酱面、豆汁焦圈。',
            images: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20professional%20photography&image_size=landscape_16_9',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%2C%20professional%20photography&image_size=landscape_16_9',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20hutong%2C%20traditional%20alley%2C%20professional%20photography&image_size=landscape_16_9'
            ],
            tags: ['北京', '三日游', '经典路线']
          };
          break;
        case 'scenic':
          detail = {
            id: id,
            title: '故宫博物院',
            address: '北京市东城区景山前街4号',
            rating: 4.8,
            reviews: 23456,
            content: '故宫博物院是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心。是中国古代宫廷建筑之精华，无与伦比的艺术珍宝馆，世界上现存规模最大、保存最为完整的木质结构古建筑之一。\n\n故宫于明成祖永乐四年（1406年）开始建设，以南京故宫为蓝本营建，到永乐十八年（1420年）建成。是世界上现存规模最大、保存最为完整的木质结构古建筑之一。\n\n参观建议：\n1. 提前在网上预约门票\n2. 建议上午参观，人相对少一些\n3. 参观时间约3-4小时\n4. 可以租讲解器，更好地了解故宫的历史',
            images: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20ancient%20palace%2C%20professional%20photography&image_size=landscape_16_9',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20interior%2C%20throne%20room%2C%20professional%20photography&image_size=landscape_16_9',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20garden%2C%20traditional%20chinese%20garden%2C%20professional%20photography&image_size=landscape_16_9'
            ],
            tags: ['文化遗产', '历史古迹', '必游景点']
          };
          break;
        case 'history':
          detail = {
            id: id,
            title: '历史遗迹',
            content: '历史遗迹是指人类在历史上活动所留下的具有纪念意义和研究价值的物质遗存。它们是历史的见证，是文化的载体，是人类文明的重要组成部分。\n\n中国作为四大文明古国之一，拥有丰富的历史遗迹。从远古的石器时代遗址，到夏商周的青铜文明，再到秦汉唐宋元明清的封建王朝，每个时期都留下了大量的历史遗迹。\n\n这些历史遗迹不仅是中华民族的宝贵财富，也是全人类的共同遗产。它们见证了中国历史的发展，反映了不同时期的社会制度、经济状况、文化艺术和科技水平。\n\n保护历史遗迹是我们每个人的责任，让这些宝贵的文化遗产得以传承和发扬，是对历史的尊重，也是对未来的负责。',
            images: [
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20relics%2C%20historical%20site%2C%20professional%20photography&image_size=landscape_16_9',
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cultural%20heritage%2C%20ancient%20architecture%2C%20professional%20photography&image_size=landscape_16_9'
            ],
            tags: ['历史', '文化', '遗迹']
          };
          break;
        default:
          detail = {
            id: id,
            title: '未知内容',
            content: '抱歉，未找到相关内容',
            images: []
          };
      }
      
      this.setData({
        detail: detail,
        loading: false
      });

      // 检查用户是否已点赞
      this.checkLikeStatus();
    }, 1000);
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
    wx.showToast({ title: '评论功能开发中', icon: 'none' });
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

  // 显示方言选择对话框
  showDialectDialog() {
    const that = this;
    wx.showActionSheet({
      itemList: this.data.dialects,
      success(res) {
        const selectedDialect = that.data.dialects[res.tapIndex];
        that.setData({ selectedDialect });
        wx.showToast({ title: `已切换到${selectedDialect}`, icon: 'success' });
        // 这里可以根据选择的方言加载对应的音频文件
      },
      fail(res) {
        console.log(res.errMsg);
      }
    });
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