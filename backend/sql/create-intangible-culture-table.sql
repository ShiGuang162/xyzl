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

-- 插入非遗分类数据
INSERT INTO intangible_culture_categories (name, parent_id, icon, description, sort_order) VALUES
('传统技艺', 0, '✂️', '传统手工技艺', 1),
('传统美术', 0, '🎨', '传统绘画、雕塑等美术形式', 2),
('传统音乐', 0, '🎵', '传统音乐、戏曲等', 3),
('传统舞蹈', 0, '💃', '传统舞蹈表演', 4),
('传统戏剧', 0, '🎭', '传统戏剧表演', 5),
('传统体育', 0, '🤸', '传统体育、游艺与杂技', 6),
('传统医药', 0, '🌿', '传统医药知识与实践', 7),
('民俗', 0, '🏮', '传统民俗活动', 8),
('刺绣', 1, '🧵', '传统刺绣技艺', 1),
('陶瓷', 1, '🏺', '传统陶瓷制作技艺', 2),
('木雕', 1, '🪵', '传统木雕技艺', 3),
('剪纸', 2, '✂️', '传统剪纸艺术', 1),
('年画', 2, '🎨', '传统年画艺术', 2),
('书法', 2, '✍️', '传统书法艺术', 3),
('京剧', 5, '🎭', '京剧表演艺术', 1),
('昆曲', 5, '🎭', '昆曲表演艺术', 2),
('太极拳', 6, '🤸', '太极拳', 1),
('中医', 7, '🌿', '中医诊疗', 1),
('中药', 7, '🌿', '中药炮制', 2),
('春节', 8, '🏮', '春节习俗', 1),
('端午节', 8, '龙舟', '端午节习俗', 2);

-- 插入示例传承人数据
INSERT INTO inheritors (name, gender, birth_year, image, bio, achievements, contact_info) VALUES
('张三', '男', 1950, 'http://localhost:3001/uploads/inheritor_1.jpg', '张三是国家级非遗项目刺绣的传承人，从事刺绣工作50余年，技艺精湛。', '多次获得国家级工艺美术奖项，培养了众多徒弟。', '13800138001'),
('李四', '女', 1965, 'http://localhost:3001/uploads/inheritor_2.jpg', '李四是省级非遗项目陶瓷制作的传承人，擅长青花瓷制作。', '作品被多家博物馆收藏，曾赴国外进行文化交流。', '13900139002'),
('王五', '男', 1948, 'http://localhost:3001/uploads/inheritor_3.jpg', '王五是市级非遗项目剪纸艺术的传承人，剪纸作品精美绝伦。', '多次在国内外展览中获奖，出版了多部剪纸艺术著作。', '13700137003');

-- 插入示例非遗项目数据
INSERT INTO intangible_cultures (name, description, category, level, image, images, history, craftsmanship, inheritor_ids, location, latitude, longitude) VALUES
('苏绣', '苏绣是中国传统刺绣工艺之一，以针法精细、色彩淡雅著称。', '刺绣', '国家级', 'http://localhost:3001/uploads/intangible_1.jpg', '["http://localhost:3001/uploads/intangible_1_1.jpg", "http://localhost:3001/uploads/intangible_1_2.jpg"]', '苏绣起源于苏州地区，历史悠久，可追溯到春秋战国时期。', '苏绣以精细见长，针法多达40余种，色彩丰富和谐。', '[1]', '江苏省苏州市', 31.298892, 120.585316),
('青花瓷制作', '青花瓷是中国传统陶瓷工艺的珍品，以其淡雅的青花色泽著称。', '陶瓷', '省级', 'http://localhost:3001/uploads/intangible_2.jpg', '["http://localhost:3001/uploads/intangible_2_1.jpg", "http://localhost:3001/uploads/intangible_2_2.jpg"]', '青花瓷始于唐代，成熟于元代，兴盛于明清时期。', '青花瓷制作工艺复杂，包括制胎、施釉、绘画、烧制等多个环节。', '[2]', '江西省景德镇市', 29.295683, 117.228217),
('剪纸艺术', '剪纸是中国传统民间艺术，以剪刀或刻刀在纸上剪刻出各种图案。', '剪纸', '市级', 'http://localhost:3001/uploads/intangible_3.jpg', '["http://localhost:3001/uploads/intangible_3_1.jpg", "http://localhost:3001/uploads/intangible_3_2.jpg"]', '剪纸艺术历史悠久，起源于汉代，是中国最古老的民间艺术之一。', '剪纸工艺包括起稿、剪刻、染色等步骤，作品题材广泛。', '[3]', '山西省吕梁市', 37.549068, 111.754378');
