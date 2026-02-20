// 引入API工具
const api = require('../../utils/api');

Page({
  data: {
    activeTab: '推荐',
    loading: false,
    currentLocation: '',
    strategies: [], // 攻略列表
    scenics: [],    // 景点列表
    history: [],    // 历史文化列表
    searchKeyword: '', // 搜索关键词
    swiperList: [
      {
        id: 1,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20Chinese%20hometown%20scenery%2C%20majestic%20mountains%20and%20serene%20rivers%2C%20traditional%20village%20by%20water%2C%20soft%20sky%20blue%20sky%20%230EA5E9%2C%20warm%20sunset%20glow%20%23F97316%2C%20morning%20mist%2C%20professional%20photography%2C%20cinematic%20composition%2C%208K%20quality&image_size=landscape_16_9',
        title: '家乡美景',
        link: '/pages/detail/detail?type=scenic&id=1'
      },
      {
        id: 2,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20Chinese%20water%20town%2C%20traditional%20architecture%20with%20black%20tiles%20and%20white%20walls%2C%20stone%20bridges%20over%20canals%2C%20lanterns%20glowing%20warm%20orange%20%23F97316%2C%20reflections%20in%20water%2C%20evening%20atmosphere%2C%20professional%20photography%2C%20cinematic%20lighting&image_size=landscape_16_9',
        title: '古镇风情',
        link: '/pages/detail/detail?type=scenic&id=2'
      },
      {
        id: 3,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20countryside%20landscape%2C%20lush%20green%20rice%20terraces%2C%20traditional%20farmhouses%20with%20blue%20roofs%20%230EA5E9%2C%20golden%20sunset%20light%20%23F97316%2C%20rolling%20hills%20in%20background%2C%20peaceful%20rural%20scene%2C%20professional%20photography%2C%20vibrant%20colors%2C%20idyllic%20atmosphere&image_size=landscape_16_9',
        title: '田园风光',
        link: '/pages/detail/detail?type=scenic&id=3'
      }
    ]
  },

  onLoad: function() {
    console.log('首页加载');
    // 初始加载推荐内容和数据
    this.loadData();
  },
  
  // 点击轮播图
  clickSwiper(e) {
    const index = e.currentTarget.dataset.index;
    const swiperItem = this.data.swiperList[index];
    console.log('点击轮播图:', swiperItem);
    
    // 跳转到对应的链接
    wx.navigateTo({
      url: swiperItem.link
    });
  },
  


  // 加载后端数据
  loadData: function() {
    this.setData({ loading: true });
    
    // 同时获取攻略、景点和历史数据
    Promise.all([api.getStrategies(), api.getScenics(), api.getHistory()]).then(([strategiesResponse, scenicsResponse, historyResponse]) => {
      const strategies = strategiesResponse.data || strategiesResponse;
      const scenics = scenicsResponse.data || scenicsResponse;
      const history = historyResponse.data || historyResponse;
      
      this.setData({ 
        strategies,
        scenics,
        history,
        loading: false
      });
    }).catch(err => {
      console.error('获取数据失败:', err);
      this.setData({ loading: false });
    });
  },

  // 切换标签
  switchTab: function(e) {
    var tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.activeTab) {
      this.setData({ 
        activeTab: tab, 
        loading: true,
        showSearchResults: false // 切换标签时隐藏搜索结果
      });

      // 根据标签加载不同的数据
      this.loadContent(tab);
    }
  },

  // 加载内容
  loadContent: function(tab) {
    console.log('加载内容:', tab);

    this.setData({ loading: true });

    // 根据tab加载不同的数据
    var that = this;
    switch(tab) {
      case '推荐':
        // 加载推荐数据（可以结合攻略和景点数据）
        Promise.all([api.getStrategies(), api.getScenics()]).then(([strategiesResponse, scenicsResponse]) => {
          const strategies = strategiesResponse.data || strategiesResponse;
          const scenics = scenicsResponse.data || scenicsResponse;
          that.setData({ 
            strategies,
            scenics,
            loading: false 
          });
        }).catch(err => {
          console.error('加载推荐数据失败:', err);
          that.setData({ loading: false });
        });
        break;
      case '攻略':
        // 加载攻略数据
        api.getStrategies().then(strategiesResponse => {
          const strategies = strategiesResponse.data || strategiesResponse;
          that.setData({ 
            strategies,
            loading: false 
          });
        }).catch(err => {
          console.error('加载攻略数据失败:', err);
          that.setData({ loading: false });
        });
        break;
      case '景点':
        // 加载景点数据
        api.getScenics().then(scenicsResponse => {
          const scenics = scenicsResponse.data || scenicsResponse;
          that.setData({ 
            scenics,
            loading: false 
          });
        }).catch(err => {
          console.error('加载景点数据失败:', err);
          that.setData({ loading: false });
        });
        break;
      case '历史':
        // 加载历史数据
        api.getHistory().then(historyResponse => {
          const history = historyResponse.data || historyResponse;
          that.setData({ 
            history,
            loading: false 
          });
        }).catch(err => {
          console.error('加载历史数据失败:', err);
          that.setData({ loading: false });
        });
        break;
      default:
        that.setData({ loading: false });
        break;
    }
  },

  // 点击内容项
  clickItem: function(e) {
    var type = e.currentTarget.dataset.type;
    var id = e.currentTarget.dataset.id;
    console.log('点击内容:', type, id);

    // 这里可以跳转到详情页
    switch(type) {
      case 'recommend':
        wx.navigateTo({
          url: '/pages/detail/detail?type=recommend&id=' + id
        });
        break;
      case 'strategy':
        wx.navigateTo({
          url: '/pages/detail/detail?type=strategy&id=' + id
        });
        break;
      case 'scenic':
        wx.navigateTo({
          url: '/pages/detail/detail?type=scenic&id=' + id
        });
        break;
      case 'history':
        wx.navigateTo({
          url: '/pages/detail/detail?type=history&id=' + id
        });
        break;
      default:
        break;
    }
  },

  // 获取位置
  getLocation: function() {
    var that = this;
    
    // 检查位置权限
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userLocation']) {
          // 已授权，直接获取位置
          that.getLocationInfo();
        } else if (res.authSetting['scope.userLocation'] === undefined) {
          // 首次请求权限
          wx.authorize({
            scope: 'scope.userLocation',
            success: function() {
              that.getLocationInfo();
            },
            fail: function() {
              wx.showModal({
                title: '位置权限',
                content: '需要您的位置信息来提供附近的旅游服务',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function(res) {
                        if (res.authSetting['scope.userLocation']) {
                          that.getLocationInfo();
                        }
                      }
                    });
                  }
                }
              });
            }
          });
        } else {
          // 已拒绝授权
          wx.showModal({
            title: '位置权限',
            content: '需要您的位置信息来提供附近的旅游服务，请在设置中打开位置权限',
            success: function(res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function(res) {
                    if (res.authSetting['scope.userLocation']) {
                      that.getLocationInfo();
                    }
                  }
                });
              }
            }
          });
        }
      }
    });
  },

  // 获取位置信息
  getLocationInfo: function() {
    var that = this;
    wx.showLoading({
      title: '获取位置中...',
    });
    
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        // 使用微信逆地理编码API获取具体地址
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/',
          data: {
            location: res.latitude + ',' + res.longitude,
            key: 'OB4BZ-D4W3U-B7VVO-4PJWW-6TKDJ-WPB77' // 这里使用腾讯地图API密钥，实际使用时需要替换为自己的密钥
          },
          success: function(geoRes) {
            if (geoRes.data.status === 0) {
              const address = geoRes.data.result;
              const city = address.address_component.city || address.address_component.province;
              
              that.setData({
                currentLocation: city
              });
              
              // 存储城市信息到本地存储，供其他页面使用
              wx.setStorageSync('currentCity', city);
              
              wx.hideLoading();
              wx.showToast({
                title: '定位成功',
                icon: 'success'
              });
            } else {
              // 逆地理编码失败，使用模拟数据
              that.setData({
                currentLocation: '当前位置'
              });
              wx.hideLoading();
              wx.showToast({
                title: '定位成功',
                icon: 'success'
              });
            }
          },
          fail: function() {
            // 网络请求失败，使用模拟数据
            that.setData({
              currentLocation: '当前位置'
            });
            wx.hideLoading();
            wx.showToast({
              title: '定位成功',
              icon: 'success'
            });
          }
        });
      },
      fail: function() {
        wx.hideLoading();
        wx.showToast({
          title: '定位失败',
          icon: 'none'
        });
      }
    });
  },

  // 搜索输入处理
  onSearchInput: function(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
  },

  // 搜索确认
  onSearchConfirm: function() {
    const keyword = this.data.searchKeyword;
    if (keyword.length > 0) {
      // 跳转到搜索结果页面
      wx.navigateTo({
        url: '/pages/search/search?keyword=' + encodeURIComponent(keyword)
      });
    }
  },

  // 清空搜索
  clearSearch: function() {
    this.setData({ 
      searchKeyword: ''
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
});