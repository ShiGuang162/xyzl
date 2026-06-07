-- 创建非遗项目表
CREATE TABLE IF NOT EXISTS intangible_cultures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '非遗项目名称',
  description TEXT COMMENT '项目描述',
  category VARCHAR(100) NOT NULL COMMENT '项目分类',
  level VARCHAR(50) COMMENT '级别（国家级、省级、市级等）',
  image VARCHAR(255) COMMENT '项目主图',
  images TEXT COMMENT '项目图片（JSON格式）',
  video VARCHAR(255) COMMENT '项目视频',
  history TEXT COMMENT '历史渊源',
  craftsmanship TEXT COMMENT '工艺特点',
  inheritor_ids TEXT COMMENT '传承人ID（JSON格式）',
  related_products TEXT COMMENT '相关文创产品ID（JSON格式）',
  location VARCHAR(255) COMMENT '传承地',
  latitude DECIMAL(10, 6) COMMENT '纬度',
  longitude DECIMAL(10, 6) COMMENT '经度',
  status VARCHAR(50) DEFAULT 'active' COMMENT '状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '非遗项目表';

-- 创建非遗传承人表
CREATE TABLE IF NOT EXISTS inheritors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '传承人姓名',
  gender VARCHAR(10) COMMENT '性别',
  birth_year INT COMMENT '出生年份',
  image VARCHAR(255) COMMENT '传承人照片',
  bio TEXT COMMENT '个人简介',
  achievements TEXT COMMENT '主要成就',
  contact_info VARCHAR(255) COMMENT '联系方式',
  intangible_culture_ids TEXT COMMENT '关联非遗项目ID（JSON格式）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT '非遗传承人表';

-- 创建非遗体验预约表
CREATE TABLE IF NOT EXISTS experience_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT '用户ID',
  intangible_culture_id INT NOT NULL COMMENT '非遗项目ID',
  inheritor_id INT COMMENT '传承人ID',
  booking_date DATE NOT NULL COMMENT '预约日期',
  booking_time TIME NOT NULL COMMENT '预约时间',
  participants INT DEFAULT 1 COMMENT '参与人数',
  contact_name VARCHAR(100) NOT NULL COMMENT '联系人姓名',
  contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '状态（pending, confirmed, completed, cancelled）',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (intangible_culture_id) REFERENCES intangible_cultures(id) ON DELETE CASCADE,
  FOREIGN KEY (inheritor_id) REFERENCES inheritors(id) ON DELETE SET NULL
) COMMENT '非遗体验预约表';

-- 创建非遗分类表
CREATE TABLE IF NOT EXISTS intangible_culture_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '分类名称',
  parent_id INT DEFAULT 0 COMMENT '父分类ID',
  icon VARCHAR(255) COMMENT '分类图标',
  description TEXT COMMENT '分类描述',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT '非遗分类表';
