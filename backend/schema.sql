-- 乡音智旅数据库表结构

-- 攻略表
CREATE TABLE IF NOT EXISTS strategies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '攻略标题',
    description TEXT COMMENT '攻略描述',
    image VARCHAR(500) COMMENT '攻略封面图片URL',
    author VARCHAR(100) COMMENT '作者',
    views INT DEFAULT 0 COMMENT '浏览量',
    likes INT DEFAULT 0 COMMENT '点赞数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 景点表
CREATE TABLE IF NOT EXISTS scenics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '景点名称',
    description TEXT COMMENT '景点描述',
    image VARCHAR(500) COMMENT '景点图片URL',
    address VARCHAR(500) COMMENT '景点地址',
    rating DECIMAL(3,1) COMMENT '评分',
    reviews INT DEFAULT 0 COMMENT '评价数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 历史文化表
CREATE TABLE IF NOT EXISTS history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL COMMENT '历史标题',
    description TEXT COMMENT '历史描述',
    image VARCHAR(500) COMMENT '历史图片URL',
    period VARCHAR(100) COMMENT '历史时期',
    importance VARCHAR(255) COMMENT '重要性',
    content TEXT COMMENT '详细内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    openid VARCHAR(100) UNIQUE NOT NULL COMMENT '微信用户唯一标识',
    nickname VARCHAR(100) COMMENT '昵称',
    avatar_url VARCHAR(500) COMMENT '头像URL',
    city VARCHAR(50) COMMENT '城市',
    gender TINYINT DEFAULT 0 COMMENT '性别 0未知 1男 2女',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 收藏表
CREATE TABLE IF NOT EXISTS collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    item_id INT NOT NULL COMMENT '收藏项ID',
    item_type ENUM('strategy', 'scenic', 'history') NOT NULL COMMENT '收藏项类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    item_id INT NOT NULL COMMENT '评论项ID',
    item_type ENUM('strategy', 'scenic', 'history') NOT NULL COMMENT '评论项类型',
    content TEXT NOT NULL COMMENT '评论内容',
    parent_id INT DEFAULT NULL COMMENT '父评论ID，用于回复',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 插入初始攻略数据
INSERT INTO strategies (title, description, image, author, views, likes) VALUES
('北京三日游攻略', '详细的北京三日游行程安排，带你玩转帝都', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20forbidden%20city%2C%20great%20wall%2C%20professional%20photography&image_size=landscape_16_9', '旅游达人', 1234, 567),
('上海美食攻略', '探寻上海当地特色美食，满足你的味蕾', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20local%20food%2C%20xiaolongbao%2C%20soup%20dumplings%2C%20professional%20photography&image_size=landscape_16_9', '美食专家', 987, 432),
('杭州西湖一日游', '西湖十景全攻略，领略江南水乡之美', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hangzhou%20west%20lake%2C%20traditional%20chinese%20garden%2C%20scenic%20view%2C%20professional%20photography&image_size=landscape_16_9', '旅行博主', 765, 321);

-- 插入初始景点数据
INSERT INTO scenics (name, description, image, address, rating, reviews) VALUES
('故宫博物院', '中国明清两代的皇家宫殿，世界文化遗产', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20ancient%20chinese%20palace%2C%20red%20walls%2C%20professional%20photography&image_size=square', '北京市东城区景山前街4号', 4.8, 12345),
('长城', '中国古代伟大的防御工程，世界文化遗产', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%2C%20mountain%20landscape%2C%20ancient%20architecture%2C%20professional%20photography&image_size=square', '北京市怀柔区', 4.9, 23456),
('西湖', '杭州西湖，中国著名的风景名胜区', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20traditional%20chinese%20garden%2C%20pagoda%2C%20professional%20photography&image_size=square', '浙江省杭州市西湖区', 4.7, 18901);

-- 插入初始历史文化数据
INSERT INTO history (title, description, image, period, importance, content) VALUES
('故宫的历史变迁', '从明清宫殿到现代博物馆的演变历程', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20history%2C%20ancient%20chinese%20palace%2C%20historical%20photography&image_size=landscape_16_9', '明清时期', '世界文化遗产', '故宫又称紫禁城，是中国明清两代的皇家宫殿，始建于明永乐四年（1406年），是世界上现存规模最大、保存最为完整的木质结构古建筑之一。'),
('长城的修建历史', '从春秋战国到明清时期的长城建设', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20history%2C%20ancient%20chinese%20fortification%2C%20historical%20photography&image_size=landscape_16_9', '春秋战国至明清', '世界文化遗产', '长城是中国古代的伟大防御工程，始建于春秋战国时期，秦统一六国后连接和修缮了战国长城，此后汉、明等朝代不断修筑，成为世界上最伟大的建筑之一。');