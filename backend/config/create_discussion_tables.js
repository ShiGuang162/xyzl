// 创建讨论和评论的数据库表
const db = require('./db');

async function createTables() {
  try {
    console.log('开始创建讨论和评论的数据库表...');

    // 创建讨论表
    const createDiscussionTable = `
      CREATE TABLE IF NOT EXISTS discussions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        tag VARCHAR(50) NOT NULL,
        image VARCHAR(255),
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_avatar VARCHAR(10) NOT NULL,
        likes INT DEFAULT 0,
        comments INT DEFAULT 0,
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;

    // 创建评论表
    const createCommentTable = `
      CREATE TABLE IF NOT EXISTS discussion_comments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        discussion_id INT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        user_avatar VARCHAR(10) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (discussion_id) REFERENCES discussions(id) ON DELETE CASCADE
      );
    `;

    // 执行创建表语句
    await db.query(createDiscussionTable);
    console.log('讨论表创建成功');

    await db.query(createCommentTable);
    console.log('评论表创建成功');

    // 插入示例数据
    await insertSampleData();

    console.log('数据库表创建和数据初始化完成');
  } catch (error) {
    console.error('创建数据库表失败:', error);
  } finally {
    // 关闭数据库连接
    if (db.pool) {
      await db.pool.end();
    }
  }
}

// 插入示例数据
async function insertSampleData() {
  try {
    console.log('开始插入示例数据...');

    // 插入讨论数据
    const discussions = [
      {
        title: '北京三日游攻略',
        content: '刚从北京回来，分享一下我的旅游经验。故宫一定要提前预约，长城建议去慕田峪，人相对少一些。颐和园建议下午去，夕阳下的昆明湖很美。\n\n住宿推荐：王府井附近，交通便利，购物方便。\n\n美食推荐：烤鸭、炸酱面、豆汁焦圈。',
        tag: '旅游攻略',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20travel%20guide%2C%20forbidden%20city%2C%20great%20wall%2C%20professional%20photography&image_size=landscape_16_9',
        user_id: 1,
        user_name: '背包客',
        user_avatar: '背',
        likes: 45,
        comments: 3,
        views: 234
      },
      {
        title: '成都必吃美食推荐',
        content: '下周要去成都，请问有什么必吃的当地美食推荐吗？最好是本地人常去的店，不是那种 tourist trap。',
        tag: '美食推荐',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sichuan%20local%20food%2C%20hotpot%2C%20mapo%20tofu%2C%20professional%20photography&image_size=landscape_16_9',
        user_id: 2,
        user_name: '吃货一枚',
        user_avatar: '吃',
        likes: 18,
        comments: 2,
        views: 156
      },
      {
        title: '西湖哪个季节去最好？',
        content: '计划去杭州西湖，请问哪个季节去景色最美？有没有什么推荐的游览路线？',
        tag: '景点讨论',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20traditional%20chinese%20garden%2C%20pagoda%2C%20professional%20photography&image_size=landscape_16_9',
        user_id: 3,
        user_name: '旅行爱好者',
        user_avatar: '旅',
        likes: 32,
        comments: 1,
        views: 198
      },
      {
        title: '上海交通攻略',
        content: '第一次去上海，请问地铁怎么乘坐？有没有什么交通卡推荐？住宿住在哪里比较方便？',
        tag: '交通住宿',
        user_id: 4,
        user_name: '新手旅行者',
        user_avatar: '新',
        likes: 25,
        comments: 1,
        views: 176
      },
      {
        title: '我的西藏自驾游',
        content: '分享一下我的西藏自驾游经历，沿途风景太美了！但是高原反应一定要注意，建议提前准备氧气袋。\n\n路线推荐：拉萨-林芝-日喀则，这条路线风景最优美，路况也相对较好。\n\n注意事项：\n1. 提前一周开始服用红景天\n2. 准备足够的保暖衣物\n3. 携带氧气袋\n4. 遵守当地宗教习俗',
        tag: '旅行故事',
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tibet%20road%20trip%2C%20mountain%20landscape%2C%20blue%20sky%2C%20professional%20photography&image_size=landscape_16_9',
        user_id: 5,
        user_name: '自驾达人',
        user_avatar: '自',
        likes: 67,
        comments: 1,
        views: 345
      }
    ];

    // 插入讨论
    for (const discussion of discussions) {
      const insertSql = `
        INSERT INTO discussions (title, content, tag, image, user_id, user_name, user_avatar, likes, comments, views)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.query(insertSql, [
        discussion.title,
        discussion.content,
        discussion.tag,
        discussion.image,
        discussion.user_id,
        discussion.user_name,
        discussion.user_avatar,
        discussion.likes,
        discussion.comments,
        discussion.views
      ]);
    }

    console.log('讨论数据插入成功');

    // 插入评论数据
    const comments = [
      {
        discussion_id: 1,
        user_id: 6,
        user_name: '旅行新手',
        user_avatar: '新',
        content: '谢谢分享！请问故宫预约需要提前多久？'
      },
      {
        discussion_id: 1,
        user_id: 7,
        user_name: '北京本地人',
        user_avatar: '北',
        content: '长城建议早上去，人少一些，而且不热。慕田峪确实比八达岭人少。'
      },
      {
        discussion_id: 1,
        user_id: 8,
        user_name: '美食爱好者',
        user_avatar: '美',
        content: '烤鸭推荐大董或者四季民福，比全聚德好吃。'
      },
      {
        discussion_id: 2,
        user_id: 9,
        user_name: '成都本地人',
        user_avatar: '成',
        content: '必吃：火锅、串串、川菜（麻婆豆腐、水煮鱼）'
      },
      {
        discussion_id: 2,
        user_id: 10,
        user_name: '美食达人',
        user_avatar: '美',
        content: '推荐去建设路小吃街，很多本地人去的店。'
      },
      {
        discussion_id: 3,
        user_id: 11,
        user_name: '杭州本地人',
        user_avatar: '杭',
        content: '春季和秋季最美，春季苏堤春晓，秋季满陇桂雨。'
      },
      {
        discussion_id: 4,
        user_id: 12,
        user_name: '上海本地人',
        user_avatar: '上',
        content: '交通卡可以在地铁站购买，住宿推荐人民广场附近。'
      },
      {
        discussion_id: 5,
        user_id: 13,
        user_name: '去过西藏',
        user_avatar: '西',
        content: '西藏真的很美，但是高原反应确实要注意。'
      }
    ];

    // 插入评论
    for (const comment of comments) {
      const insertSql = `
        INSERT INTO discussion_comments (discussion_id, user_id, user_name, user_avatar, content)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.query(insertSql, [
        comment.discussion_id,
        comment.user_id,
        comment.user_name,
        comment.user_avatar,
        comment.content
      ]);
    }

    console.log('评论数据插入成功');
  } catch (error) {
    console.error('插入示例数据失败:', error);
  }
}

// 执行创建表操作
createTables();
