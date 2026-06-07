// 更新数据库数据
const db = require('./db');

async function updateData() {
  try {
    console.log('开始更新数据库数据...');

    // 更新攻略数据
    await updateStrategies();
    
    // 更新景点数据
    await updateScenics();
    
    // 更新历史文化数据
    await updateHistory();

    console.log('数据库数据更新完成');
  } catch (error) {
    console.error('更新数据库数据失败:', error);
  } finally {
    // 关闭数据库连接
    if (db.pool) {
      await db.pool.end();
    }
  }
}

// 更新攻略数据
async function updateStrategies() {
  try {
    const strategies = await db.query('SELECT id, title FROM strategies');
    
    for (const strategy of strategies) {
      let content = '';
      let images = [];
      let tags = [];
      
      switch (strategy.title) {
        case '北京三日游攻略':
          content = '第一天：故宫博物院、天安门广场\n第二天：长城、颐和园\n第三天：南锣鼓巷、什刹海\n\n故宫一定要提前预约，长城建议去慕田峪，人相对少一些。颐和园建议下午去，夕阳下的昆明湖很美。\n\n住宿推荐：王府井附近，交通便利，购物方便。\n\n美食推荐：烤鸭、炸酱面、豆汁焦圈。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20hutong%2C%20traditional%20alley%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['北京', '三日游', '经典路线'];
          break;
        case '上海美食攻略':
          content = '第一天：外滩、豫园、南京路\n第二天：迪士尼乐园\n第三天：田子坊、新天地\n\n美食推荐：\n1. 外滩附近的本帮菜餐厅，推荐菜品：红烧肉、糖醋排骨、醉蟹\n2. 豫园的南翔小笼包，皮薄馅多，汤汁鲜美\n3. 南京路的老字号小吃：生煎包、锅贴、小馄饨\n4. 田子坊的创意美食和咖啡店\n\n住宿推荐：外滩附近或人民广场附近，交通便利，购物方便。\n\n交通建议：购买上海交通卡，乘坐地铁和公交都很方便。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20bund%2C%20night%20view%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20food%20xiaolongbao%2C%20steamed%20dumplings%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shanghai%20yu%20garden%2C%20traditional%20garden%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['上海', '美食', '三日游'];
          break;
        case '杭州西湖一日游':
          content = '上午：西湖游船、三潭印月\n中午：楼外楼午餐，品尝西湖醋鱼\n下午：苏堤漫步、雷峰塔\n傍晚：灵隐寺\n\n西湖十景：苏堤春晓、曲院风荷、平湖秋月、断桥残雪、柳浪闻莺、花港观鱼、雷峰夕照、双峰插云、南屏晚钟、三潭印月\n\n美食推荐：\n1. 西湖醋鱼：楼外楼、知味观\n2. 龙井虾仁：以龙井茶入菜，清香可口\n3. 叫花鸡：传统名菜\n4. 西湖藕粉：杭州特产\n\n交通建议：\n1. 建议乘坐西湖游船，可到达多个景点\n2. 苏堤适合步行或骑自行车\n3. 雷峰塔可以俯瞰整个西湖美景';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20three%20pools%20mirroring%20the%20moon%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=leifeng%20pagoda%20hangzhou%2C%20sunset%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=su%20causeway%20hangzhou%2C%20willow%20trees%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['杭州', '西湖', '一日游'];
          break;
        default:
          content = strategy.title + '的详细内容';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=travel%20guide%2C%20scenic%20view%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['旅游', '攻略'];
      }
      
      // 更新数据库
      await db.query(
        'UPDATE strategies SET content = ?, images = ?, tags = ? WHERE id = ?',
        [content, JSON.stringify(images), tags.join(','), strategy.id]
      );
      console.log(`更新攻略 ${strategy.title} 成功`);
    }
  } catch (error) {
    console.error('更新攻略数据失败:', error);
  }
}

// 更新景点数据
async function updateScenics() {
  try {
    const scenics = await db.query('SELECT id, name FROM scenics');
    
    for (const scenic of scenics) {
      let content = '';
      let images = [];
      let tags = [];
      
      switch (scenic.name) {
        case '故宫博物院':
          content = '故宫博物院是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心。是中国古代宫廷建筑之精华，无与伦比的艺术珍宝馆，世界上现存规模最大、保存最为完整的木质结构古建筑之一。\n\n故宫于明成祖永乐四年（1406年）开始建设，以南京故宫为蓝本营建，到永乐十八年（1420年）建成。是世界上现存规模最大、保存最为完整的木质结构古建筑之一。\n\n参观建议：\n1. 提前在网上预约门票\n2. 建议上午参观，人相对少一些\n3. 参观时间约3-4小时\n4. 可以租讲解器，更好地了解故宫的历史';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20beijing%2C%20ancient%20palace%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20interior%2C%20throne%20room%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20garden%2C%20traditional%20chinese%20garden%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['文化遗产', '历史古迹', '必游景点'];
          break;
        case '长城':
          content = '长城是中国古代的伟大防御工程，是世界上最伟大的建筑之一，也是世界文化遗产。北京地区的长城主要有八达岭、慕田峪、司马台等段落。\n\n慕田峪长城位于北京市怀柔区，是明代长城的精华段落之一，以其壮丽的自然风光和保存完好的城墙而闻名。这里的长城墙体高大坚固，敌楼密集，视野开阔，是观赏和攀登长城的绝佳地点。\n\n参观建议：\n1. 建议选择天气晴朗的日子前往\n2. 可以乘坐缆车上下，节省体力\n3. 建议上午参观，人相对少一些\n4. 准备舒适的鞋子和足够的水';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20of%20china%20mutianyu%2C%20mountainous%20landscape%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20watchtower%2C%20ancient%20architecture%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20sunset%2C%20golden%20hour%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['文化遗产', '历史古迹', '必游景点'];
          break;
        case '西湖':
          content = '西湖，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，是中国大陆首批国家重点风景名胜区和中国十大风景名胜之一。它的岸线全长15公里，水域面积约6.39平方公里，被孤山、白堤、苏堤、杨公堤分隔，形成了"一湖三岛五园"的格局。\n\n西湖十景是西湖景区内最著名的十处景点，包括苏堤春晓、曲院风荷、平湖秋月、断桥残雪、柳浪闻莺、花港观鱼、雷峰夕照、双峰插云、南屏晚钟、三潭印月。\n\n2011年6月24日，"杭州西湖文化景观"正式被列入《世界遗产名录》，成为中国第41处世界遗产。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20hangzhou%2C%20traditional%20chinese%20garden%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20pagoda%2C%20sunset%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=west%20lake%20boat%2C%20traditional%20chinese%20style%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['文化遗产', '自然景观', '必游景点'];
          break;
        default:
          content = scenic.name + '的详细介绍';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=scenic%20spot%2C%20beautiful%20view%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['景点', '旅游'];
      }
      
      // 更新数据库
      await db.query(
        'UPDATE scenics SET content = ?, images = ?, tags = ? WHERE id = ?',
        [content, JSON.stringify(images), tags.join(','), scenic.id]
      );
      console.log(`更新景点 ${scenic.name} 成功`);
    }
  } catch (error) {
    console.error('更新景点数据失败:', error);
  }
}

// 更新历史文化数据
async function updateHistory() {
  try {
    const historyItems = await db.query('SELECT id, title FROM history');
    
    for (const item of historyItems) {
      let content = '';
      let images = [];
      let tags = [];
      
      switch (item.title) {
        case '故宫的历史变迁':
          content = '故宫又称紫禁城，是中国明清两代的皇家宫殿，位于北京中轴线的中心。它始建于明永乐四年（1406年），以南京故宫为蓝本营建，到永乐十八年（1420年）建成。\n\n故宫是世界上现存规模最大、保存最为完整的木质结构古建筑之一，占地面积约72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，房屋九千余间。\n\n故宫的建筑布局呈南北对称轴线，分为外朝和内廷两部分。外朝以太和殿、中和殿、保和殿三大殿为中心，是国家举行大典礼的地方；内廷以乾清宫、交泰殿、坤宁宫后三宫为中心，是皇帝和皇后居住的正宫。\n\n1912年，清朝灭亡后，故宫作为溥仪的私产被保留下来。1924年，冯玉祥发动北京政变，将溥仪赶出故宫。1925年，故宫博物院正式成立，向公众开放。\n\n1961年，故宫被国务院公布为第一批全国重点文物保护单位。1987年，故宫被联合国教科文组织列为世界文化遗产。\n\n如今，故宫博物院已成为中国最大的古代文化艺术博物馆，收藏有大量珍贵文物，每年吸引数百万游客前来参观。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20history%2C%20ancient%20chinese%20palace%2C%20historical%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20太和殿%2C%20throne%20room%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=forbidden%20city%20architecture%2C%20traditional%20chinese%20palace%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['历史', '故宫', '文化遗产', '建筑'];
          break;
        case '长城的修建历史':
          content = '长城是中国古代的伟大防御工程，是世界上最伟大的建筑之一。它的修建历史可以追溯到春秋战国时期（公元前770年-公元前221年），当时各国为了防御北方游牧民族的入侵，纷纷在自己的边境上修建长城。\n\n秦始皇统一六国后（公元前221年），为了防御匈奴的入侵，将原来秦、赵、燕三国的北方长城连接起来，形成了西起临洮（今甘肃岷县），东至辽东的万里长城。\n\n汉代（公元前202年-公元220年）继续修缮和扩建长城，将长城向西延伸到敦煌、罗布泊一带，以防御匈奴和西域诸国的入侵。\n\n明代（1368年-1644年）是长城修建的鼎盛时期。为了防御蒙古和女真的入侵，明代大规模修缮和扩建长城，形成了今天我们看到的长城的基本面貌。明长城西起嘉峪关，东至鸭绿江，全长约6700公里。\n\n清代（1644年-1912年）由于满族统一了中国，北方游牧民族不再构成威胁，因此没有大规模修建长城。\n\n1987年，长城被联合国教科文组织列为世界文化遗产。\n\n如今，长城已成为中国的象征之一，每年吸引数百万游客前来参观。其中，北京地区的八达岭、慕田峪、司马台等段落是最受欢迎的旅游景点。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20history%2C%20ancient%20chinese%20fortification%2C%20historical%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20mutianyu%2C%20mountainous%20landscape%2C%20professional%20photography&image_size=landscape_16_9',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=great%20wall%20watchtower%2C%20ancient%20architecture%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['历史', '长城', '文化遗产', '建筑'];
          break;
        default:
          content = item.title + '的详细内容\n\n这里是关于' + item.title + '的详细介绍，包含了丰富的历史背景、文化内涵和相关故事。\n\n通过了解这段历史，我们可以更好地理解中国传统文化的博大精深，感受历史的魅力。\n\n历史是一面镜子，通过研究历史，我们可以从中汲取智慧，指导我们的现实生活。';
          images = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=history%20culture%2C%20ancient%20china%2C%20professional%20photography&image_size=landscape_16_9'
          ];
          tags = ['历史', '文化'];
      }
      
      // 更新数据库
      await db.query(
        'UPDATE history SET content = ?, images = ?, tags = ? WHERE id = ?',
        [content, JSON.stringify(images), tags.join(','), item.id]
      );
      console.log(`更新历史文化 ${item.title} 成功`);
    }
  } catch (error) {
    console.error('更新历史文化数据失败:', error);
  }
}

// 执行更新
updateData();