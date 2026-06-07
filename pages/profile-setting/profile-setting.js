// 用户画像设置页面
Page({
  data: {
    loading: false,
    // 年龄段选择
    ageGroups: ['儿童', '青少年', '青年', '中年', '老年'],
    selectedAgeGroup: '青年',
    // 文化程度选择
    educationLevels: ['小学', '初中', '高中', '大学', '研究生及以上'],
    selectedEducation: '大学',
    // 兴趣爱好
    interests: [
      { id: 'history', name: '历史', icon: '📜', selected: false },
      { id: 'nature', name: '自然', icon: '🌿', selected: false },
      { id: 'food', name: '美食', icon: '🍜', selected: false },
      { id: 'photography', name: '摄影', icon: '📷', selected: false },
      { id: 'adventure', name: '探险', icon: '🧭', selected: false },
      { id: 'art', name: '艺术', icon: '🎨', selected: false },
      { id: 'culture', name: '文化', icon: '🏛️', selected: false },
      { id: 'relax', name: '休闲', icon: '☕', selected: false }
    ],
    // 导览深度
    tourDepths: ['浅度', '中度', '深度'],
    selectedTourDepth: '中度'
  },

  onLoad() {
    this.loadUserProfile();
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 加载用户画像
  loadUserProfile() {
    const userProfile = wx.getStorageSync('userProfile');
    if (userProfile) {
      // 更新选中的选项
      this.setData({
        selectedAgeGroup: userProfile.ageGroup || '青年',
        selectedEducation: userProfile.education || '大学',
        selectedTourDepth: userProfile.tourDepth || '中度'
      });

      // 更新兴趣爱好选中状态
      if (userProfile.interests && userProfile.interests.length > 0) {
        const updatedInterests = this.data.interests.map(interest => ({
          ...interest,
          selected: userProfile.interests.includes(interest.id)
        }));
        this.setData({ interests: updatedInterests });
      }
    }
  },

  // 选择年龄段
  selectAgeGroup(e) {
    const ageGroup = e.currentTarget.dataset.age;
    this.setData({ selectedAgeGroup: ageGroup });
  },

  // 选择文化程度
  selectEducation(e) {
    const education = e.currentTarget.dataset.education;
    this.setData({ selectedEducation: education });
  },

  // 切换兴趣爱好
  toggleInterest(e) {
    const index = e.currentTarget.dataset.index;
    const interests = [...this.data.interests];
    interests[index].selected = !interests[index].selected;
    this.setData({ interests });
  },

  // 选择导览深度
  selectTourDepth(e) {
    const depth = e.currentTarget.dataset.depth;
    this.setData({ selectedTourDepth: depth });
  },

  // 保存用户画像
  saveUserProfile() {
    const selectedInterests = this.data.interests
      .filter(interest => interest.selected)
      .map(interest => interest.id);

    const userProfile = {
      ageGroup: this.data.selectedAgeGroup,
      education: this.data.selectedEducation,
      interests: selectedInterests,
      tourDepth: this.data.selectedTourDepth,
      updatedAt: new Date().toISOString()
    };

    wx.setStorageSync('userProfile', userProfile);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });

    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  },

  // 重置为默认设置
  resetToDefault() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置为默认设置吗？',
      success: (res) => {
        if (res.confirm) {
          const defaultInterests = this.data.interests.map(interest => ({
            ...interest,
            selected: false
          }));

          this.setData({
            selectedAgeGroup: '青年',
            selectedEducation: '大学',
            interests: defaultInterests,
            selectedTourDepth: '中度'
          });

          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  }
});
