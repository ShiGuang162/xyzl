-- 创建文创产品表
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '产品名称',
  description TEXT COMMENT '产品描述',
  price DECIMAL(10, 2) NOT NULL COMMENT '产品价格',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  category VARCHAR(100) NOT NULL COMMENT '产品分类',
  image VARCHAR(255) COMMENT '产品主图',
  images TEXT COMMENT '产品图片（JSON格式）',
  is_hot TINYINT(1) DEFAULT 0 COMMENT '是否热门',
  is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品',
  sales INT DEFAULT 0 COMMENT '销量',
  rating DECIMAL(3, 1) DEFAULT 0 COMMENT '评分',
  review_count INT DEFAULT 0 COMMENT '评价数量',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '文创产品表';

-- 创建产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  parent_id INT DEFAULT 0 COMMENT '父分类ID',
  icon VARCHAR(255) COMMENT '分类图标',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '产品分类表';

-- 创建购物车表
CREATE TABLE IF NOT EXISTS shopping_cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '产品ID',
  quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
  selected TINYINT(1) DEFAULT 1 COMMENT '是否选中',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) COMMENT '购物车表';

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  total_amount DECIMAL(10, 2) NOT NULL COMMENT '总金额',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  address VARCHAR(255) NOT NULL COMMENT '收货地址',
  phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  recipient VARCHAR(50) NOT NULL COMMENT '收货人',
  payment_method VARCHAR(20) COMMENT '支付方式',
  payment_time TIMESTAMP NULL COMMENT '支付时间',
  shipping_time TIMESTAMP NULL COMMENT '发货时间',
  delivered_time TIMESTAMP NULL COMMENT '收货时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '订单表';

-- 创建订单商品表
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT COMMENT '产品ID',
  product_name VARCHAR(255) NOT NULL COMMENT '产品名称',
  product_image VARCHAR(255) COMMENT '产品图片',
  price DECIMAL(10, 2) NOT NULL COMMENT '单价',
  quantity INT NOT NULL COMMENT '数量',
  subtotal DECIMAL(10, 2) NOT NULL COMMENT '小计',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) COMMENT '订单商品表';

-- 创建产品评价表
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL COMMENT '产品ID',
  user_id INT NOT NULL COMMENT '用户ID',
  user_name VARCHAR(50) NOT NULL COMMENT '用户名',
  rating INT NOT NULL COMMENT '评分（1-5）',
  content TEXT COMMENT '评价内容',
  images TEXT COMMENT '评价图片（JSON格式）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) COMMENT '产品评价表';

-- 插入默认分类
INSERT INTO product_categories (name, parent_id, icon, sort_order) VALUES
('非遗产品', 0, '🏮', 1),
('特色纪念品', 0, '🎁', 2),
('定制礼品', 0, '🎨', 3),
('传统手工艺', 1, '✂️', 1),
('民俗用品', 1, '🏠', 2),
('文化创意', 2, '💡', 1),
('地方特产', 2, '🌾', 2),
('个人定制', 3, '👤', 1),
('企业定制', 3, '🏢', 2);

-- 插入示例产品数据
INSERT INTO products (name, description, price, stock, category, image, images, is_hot, is_new, sales, rating, review_count) VALUES
('手工刺绣围巾', '采用传统刺绣工艺，图案精美，保暖舒适', 199.99, 50, '传统手工艺', 'http://localhost:3001/uploads/product_1.jpg', '["http://localhost:3001/uploads/product_1_1.jpg", "http://localhost:3001/uploads/product_1_2.jpg"]', 1, 1, 120, 4.8, 35),
('青花瓷茶具套装', '典雅的青花瓷工艺，一套四杯一壶', 299.99, 30, '传统手工艺', 'http://localhost:3001/uploads/product_2.jpg', '["http://localhost:3001/uploads/product_2_1.jpg", "http://localhost:3001/uploads/product_2_2.jpg"]', 1, 0, 85, 4.7, 28),
('民俗剪纸艺术', '纯手工剪纸，图案精美，可装饰家居', 59.99, 100, '民俗用品', 'http://localhost:3001/uploads/product_3.jpg', '["http://localhost:3001/uploads/product_3_1.jpg", "http://localhost:3001/uploads/product_3_2.jpg"]', 0, 1, 200, 4.9, 62),
('地方特色茶叶', '精选当地优质茶叶，香气浓郁', 89.99, 80, '地方特产', 'http://localhost:3001/uploads/product_4.jpg', '["http://localhost:3001/uploads/product_4_1.jpg", "http://localhost:3001/uploads/product_4_2.jpg"]', 1, 0, 150, 4.6, 45),
('文化创意笔记本', '融合传统元素的创意笔记本', 39.99, 150, '文化创意', 'http://localhost:3001/uploads/product_5.jpg', '["http://localhost:3001/uploads/product_5_1.jpg", "http://localhost:3001/uploads/product_5_2.jpg"]', 0, 1, 250, 4.5, 78),
('定制姓氏书签', '个性化定制姓氏书签，精美实用', 29.99, 200, '个人定制', 'http://localhost:3001/uploads/product_6.jpg', '["http://localhost:3001/uploads/product_6_1.jpg", "http://localhost:3001/uploads/product_6_2.jpg"]', 0, 0, 180, 4.7, 52);
