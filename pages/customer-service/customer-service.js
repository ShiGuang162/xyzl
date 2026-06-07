// AI客服小助手页面逻辑
const app = getApp();

Page({
  data: {
    // 消息列表
    messages: [],
    // 输入的消息
    inputMessage: '',
    // 是否正在输入
    isTyping: false,
    // 滚动位置
    scrollTop: 0,
    // 快捷问题
    quickQuestions: [
      '如何发布旅游攻略？',
      '怎么修改个人资料？',
      '如何删除我的讨论？',
      '景点推荐有哪些？',
      '美食推荐在哪里看？',
      '如何联系客服？'
    ]
  },

  // 生命周期函数
  onLoad() {
    console.log('AI客服页面加载');
    // 加载历史聊天记录
    this.loadChatHistory();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 加载聊天记录
  loadChatHistory() {
    const history = wx.getStorageSync('chatHistory') || [];
    this.setData({ messages: history });
  },

  // 保存聊天记录
  saveChatHistory() {
    wx.setStorageSync('chatHistory', this.data.messages);
  },

  // 清空聊天记录
  clearChat() {
    wx.showModal({
      title: '清空聊天记录',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [] });
          wx.removeStorageSync('chatHistory');
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // 输入框内容变更
  onInputChange(e) {
    this.setData({ inputMessage: e.detail.value });
  },

  // 发送快捷问题
  sendQuickQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ inputMessage: question });
    this.sendMessage();
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputMessage.trim();
    if (!message || this.data.isTyping) return;

    // 添加用户消息
    const userMessage = {
      type: 'user',
      content: message,
      time: this.formatTime(new Date())
    };

    const messages = [...this.data.messages, userMessage];
    this.setData({
      messages: messages,
      inputMessage: '',
      isTyping: true
    });

    // 保存聊天记录
    this.saveChatHistory();

    // 滚动到底部
    this.scrollToBottom();

    // 调用AI接口获取回复
    this.getAIResponse(message);
  },

  // 调用AI接口获取回复
  async getAIResponse(userMessage) {
    try {
      // 构建系统提示词，让AI了解乡音智旅小程序
      const systemPrompt = `你是乡音智旅小程序的AI客服助手。乡音智旅是一个旅游攻略和交流平台，主要功能包括：
1. 首页搜索 - 可以搜索旅游攻略、景点、历史文化等内容
2. 讨论频道 - 用户可以发布和查看旅游攻略、美食推荐、景点讨论、交通住宿、旅行故事等内容
3. 个人中心 - 包含我的收藏、旅行攻略、我的交流、设置等功能
4. 设置功能 - 包含个人资料编辑、修改密码、隐私设置、通知设置等

你的任务是帮助用户解答关于乡音智旅小程序的使用问题。回答要友好、简洁、实用。如果用户问的是其他问题，请礼貌地引导用户询问与乡音智旅相关的问题。`;

      // 构建对话历史
      const messages = [
        { role: 'system', content: systemPrompt },
        ...this.data.messages.slice(-10).map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      // 调用AI API - 使用免费的API服务
      const response = await this.callFreeAIAPI(messages);

      // 添加AI回复
      const aiMessage = {
        type: 'ai',
        content: response,
        time: this.formatTime(new Date())
      };

      const updatedMessages = [...this.data.messages, aiMessage];
      this.setData({
        messages: updatedMessages,
        isTyping: false
      });

      // 保存聊天记录
      this.saveChatHistory();

      // 滚动到底部
      this.scrollToBottom();

    } catch (error) {
      console.error('AI回复失败:', error);
      // 使用备用回复
      const fallbackResponse = this.getFallbackResponse(userMessage);
      const aiMessage = {
        type: 'ai',
        content: fallbackResponse,
        time: this.formatTime(new Date())
      };

      const updatedMessages = [...this.data.messages, aiMessage];
      this.setData({
        messages: updatedMessages,
        isTyping: false
      });

      this.saveChatHistory();
      this.scrollToBottom();
    }
  },

  // 调用免费AI API
  async callFreeAIAPI(messages) {
    // 方案1: 使用智谱AI的免费接口（需要API Key）
    // 方案2: 使用本地模拟的智能回复
    // 这里先使用模拟回复，如果需要真实AI可以接入智谱AI、文心一言等

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // 获取最后一条用户消息
    const lastMessage = messages[messages.length - 1].content;

    // 智能匹配回复
    return this.getSmartReply(lastMessage);
  },

  // 智能回复匹配
  getSmartReply(message) {
    const lowerMessage = message.toLowerCase();

    // 关键词匹配
    if (lowerMessage.includes('发布') && lowerMessage.includes('攻略')) {
      return '发布旅游攻略很简单！您可以：\n1. 进入"讨论"页面\n2. 点击右下角的"+"按钮\n3. 选择"旅游攻略"分类\n4. 填写标题和内容\n5. 可以添加图片让攻略更生动\n6. 点击"发布"即可\n\n发布后其他用户就可以看到您的攻略啦！';
    }

    if (lowerMessage.includes('修改') && lowerMessage.includes('资料')) {
      return '修改个人资料请按以下步骤：\n1. 进入"我的"页面\n2. 点击"设置"\n3. 选择"个人资料"\n4. 可以修改昵称、地区、性别\n5. 点击头像可以更换头像\n6. 修改完成后点击右上角"保存"\n\n您的资料就会更新啦！';
    }

    if (lowerMessage.includes('删除') && lowerMessage.includes('讨论')) {
      return '删除自己的讨论：\n1. 进入"我的"页面\n2. 点击"我的交流"\n3. 找到要删除的讨论\n4. 点击右下角的垃圾桶图标\n5. 确认删除即可\n\n注意：删除后无法恢复，请谨慎操作！';
    }

    if (lowerMessage.includes('景点') && lowerMessage.includes('推荐')) {
      return '乡音智旅有很多精彩的景点推荐！您可以：\n1. 在首页搜索框输入目的地\n2. 进入"讨论"页面查看"景点讨论"分类\n3. 查看其他用户分享的景点攻略\n4. 收藏感兴趣的景点方便以后查看\n\n热门景点包括：北京故宫、杭州西湖、成都宽窄巷子、重庆洪崖洞等！';
    }

    if (lowerMessage.includes('美食') && lowerMessage.includes('推荐')) {
      return '美食推荐在"讨论"页面的"美食推荐"分类中！这里有：\n1. 各地特色小吃介绍\n2. 网红餐厅推荐\n3. 美食探店分享\n4. 用户真实评价\n\n您可以搜索特定城市的美食，或者浏览热门推荐！';
    }

    if (lowerMessage.includes('客服') || lowerMessage.includes('联系')) {
      return '您可以通过以下方式获得帮助：\n1. 使用这个AI客服助手提问\n2. 在"设置"中查看"关于我们"\n3. 在讨论区发布问题，其他用户会帮助您\n\n我会尽力为您解答乡音智旅的相关问题！';
    }

    if (lowerMessage.includes('密码')) {
      return '修改密码步骤：\n1. 进入"我的"页面\n2. 点击"设置"\n3. 选择"修改密码"\n4. 输入当前密码\n5. 设置新密码（至少6位）\n6. 确认新密码\n7. 点击"确认修改"\n\n建议设置包含字母和数字的强密码！';
    }

    if (lowerMessage.includes('收藏')) {
      return '收藏功能使用方法：\n1. 浏览攻略或景点时，点击心形图标\n2. 收藏的內容会保存在"我的收藏"中\n3. 进入"我的"-"我的收藏"可以查看所有收藏\n4. 点击收藏项可以查看详情\n5. 再次点击心形图标可以取消收藏\n\n方便您随时查看感兴趣的内容！';
    }

    if (lowerMessage.includes('点赞') || lowerMessage.includes('评论')) {
      return '互动功能说明：\n1. 点赞：点击讨论下方的👍图标\n2. 评论：在讨论详情页可以发表评论\n3. 查看：可以看到其他用户的点赞和评论\n4. 通知：开启通知设置可以收到互动提醒\n\n积极参与互动，分享您的旅行体验！';
    }

    if (lowerMessage.includes('隐私') || lowerMessage.includes('通知')) {
      return '隐私和通知设置：\n1. 进入"我的"-"设置"\n2. 隐私设置：可以控制是否允许陌生人私信、是否允许评论等\n3. 通知设置：可以选择接收系统通知、评论通知、点赞通知等\n4. 根据个人喜好自由设置\n\n保护您的隐私，同时不错过重要信息！';
    }

    if (lowerMessage.includes('搜索')) {
      return '搜索功能使用方法：\n1. 在首页顶部搜索框输入关键词\n2. 可以搜索旅游攻略、景点、历史文化等\n3. 搜索结果会显示相关内容\n4. 点击结果可以查看详情\n\n试试搜索您感兴趣的目的地吧！';
    }

    if (lowerMessage.includes('你好') || lowerMessage.includes('您好') || lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
      return '您好！我是乡音智旅的AI客服助手🤖\n\n我可以帮您解答：\n• 如何使用小程序功能\n• 发布攻略和讨论的方法\n• 个人设置相关问题\n• 景点和美食推荐\n• 其他使用疑问\n\n请问有什么可以帮助您的吗？';
    }

    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
      return '不客气！很高兴能帮到您😊\n\n如果还有其他问题，随时问我哦！祝您在乡音智旅有愉快的体验，发现更多精彩的旅行内容！';
    }

    if (lowerMessage.includes('再见') || lowerMessage.includes('拜拜')) {
      return '再见！祝您旅途愉快，发现更多精彩！👋\n\n有问题随时来找我哦！';
    }

    // 默认回复
    return '感谢您的提问！关于"' + message + '"，您可以：\n\n1. 在"讨论"页面查看相关话题\n2. 使用搜索功能查找相关内容\n3. 查看"我的"页面的各项功能\n\n如果您需要更具体的帮助，可以详细描述您想做的事情，我会为您提供更准确的指导！\n\n您也可以尝试询问：\n• 如何发布攻略\n• 怎么修改资料\n• 景点推荐有哪些\n• 美食推荐在哪里';
  },

  // 备用回复（当API调用失败时使用）
  getFallbackResponse(message) {
    return this.getSmartReply(message);
  },

  // 滚动到底部
  scrollToBottom() {
    const query = wx.createSelectorQuery();
    query.select('.chat-container').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        this.setData({
          scrollTop: res[0].height + 1000
        });
      }
    });
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
});