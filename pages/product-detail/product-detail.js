// 产品详情页面
Page({
  data: {
    loading: true,
    product: null,
    reviews: [],
    quantity: 1,
    selectedImage: 0
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadProductDetail(id);
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 加载产品详情
  loadProductDetail(id) {
    this.setData({ loading: true });

    wx.request({
      url: `http://localhost:3001/api/products/${id}`,
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.product) {
          // 解析图片数组
          if (res.data.product.images) {
            try {
              res.data.product.images = JSON.parse(res.data.product.images);
            } catch (e) {
              res.data.product.images = [];
            }
          } else {
            res.data.product.images = [];
          }
          
          this.setData({
            product: res.data.product,
            reviews: res.data.reviews || []
          });
        }
      },
      fail: (err) => {
        console.error('获取产品详情失败:', err);
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 增加数量
  increaseQuantity() {
    if (this.data.quantity < this.data.product.stock) {
      this.setData({ quantity: this.data.quantity + 1 });
    } else {
      wx.showToast({ title: '已达到库存上限', icon: 'none' });
    }
  },

  // 减少数量
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({ quantity: this.data.quantity - 1 });
    }
  },

  // 切换图片
  switchImage(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedImage: index });
  },

  // 添加到购物车
  addToCart() {
    const userId = wx.getStorageSync('userId') || 1; // 模拟用户ID
    
    wx.request({
      url: 'http://localhost:3001/api/cart',
      method: 'POST',
      data: {
        userId: userId,
        productId: this.data.product.id,
        quantity: this.data.quantity
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: res.data.message, icon: 'success' });
        }
      },
      fail: (err) => {
        console.error('添加到购物车失败:', err);
        wx.showToast({ title: '添加失败', icon: 'none' });
      }
    });
  },

  // 立即购买
  buyNow() {
    const userId = wx.getStorageSync('userId') || 1; // 模拟用户ID
    
    // 模拟地址信息
    const address = '北京市朝阳区';
    const phone = '13800138000';
    const recipient = '张三';
    
    wx.request({
      url: 'http://localhost:3001/api/orders',
      method: 'POST',
      data: {
        userId: userId,
        items: [{
          productId: this.data.product.id,
          quantity: this.data.quantity
        }],
        address: address,
        phone: phone,
        recipient: recipient,
        paymentMethod: '微信支付'
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({ title: '订单创建成功', icon: 'success' });
          setTimeout(() => {
            wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + res.data.orderId });
          }, 1500);
        }
      },
      fail: (err) => {
        console.error('创建订单失败:', err);
        wx.showToast({ title: '购买失败', icon: 'none' });
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.product?.name || '文创产品',
      path: `/pages/product-detail/product-detail?id=${this.data.product?.id}`
    };
  }
});
