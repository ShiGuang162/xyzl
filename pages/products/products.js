// 产品列表页面
Page({
  data: {
    loading: true,
    products: [],
    categories: [],
    activeCategory: '',
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
    sortBy: 'created_at',
    keyword: ''
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts();
  },

  // 加载产品分类
  loadCategories() {
    wx.request({
      url: 'http://localhost:3001/api/product-categories',
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({ categories: res.data.data });
        }
      },
      fail: (err) => {
        console.error('获取分类失败:', err);
      }
    });
  },

  // 加载产品列表
  loadProducts(refresh = false) {
    if (refresh) {
      this.setData({ page: 1, hasMore: true });
    }

    if (!this.data.hasMore && !refresh) return;

    this.setData({ loading: true });

    wx.request({
      url: 'http://localhost:3001/api/products',
      method: 'GET',
      data: {
        page: this.data.page,
        limit: this.data.limit,
        category: this.data.activeCategory,
        sort: this.data.sortBy,
        keyword: this.data.keyword
      },
      success: (res) => {
        if (res.data && res.data.data) {
          const newProducts = res.data.data;
          const products = refresh ? newProducts : [...this.data.products, ...newProducts];
          
          this.setData({
            products: products,
            total: res.data.pagination.total,
            hasMore: products.length < res.data.pagination.total,
            page: this.data.page + 1
          });
        }
      },
      fail: (err) => {
        console.error('获取产品列表失败:', err);
      },
      complete: () => {
        this.setData({ loading: false });
      }
    });
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ 
      activeCategory: category,
      page: 1,
      hasMore: true,
      products: []
    });
    this.loadProducts(true);
  },

  // 切换排序
  switchSort(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ 
      sortBy: sortBy,
      page: 1,
      hasMore: true,
      products: []
    });
    this.loadProducts(true);
  },

  // 搜索产品
  searchProducts(e) {
    const keyword = e.detail.value;
    this.setData({ 
      keyword: keyword,
      page: 1,
      hasMore: true,
      products: []
    });
    this.loadProducts(true);
  },

  // 跳转到产品详情
  navigateToProductDetail(e) {
    const productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadProducts(true);
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts();
    }
  }
});
