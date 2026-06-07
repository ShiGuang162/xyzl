// 内容生成引擎 - 根据用户画像调整导览内容

// 内容模板
const contentTemplates = {
  // 儿童版本模板
  child: {
    introduction: '小朋友们好！今天我们要去一个特别好玩的地方——{{title}}。这里有很多有趣的故事和好玩的东西哦！',
    description: '这里有{{feature1}}、{{feature2}}，还有{{feature3}}，是不是听起来就很有意思呀？',
    conclusion: '希望你在{{title}}玩得开心！记得和爸爸妈妈分享你的快乐哦！'
  },
  
  // 青少年版本模板
  teenager: {
    introduction: '嘿，小伙伴们！今天我们来到了{{title}}，这里可是有很多很酷的历史和故事的地方。',
    description: '你知道吗？{{title}}有着{{history_years}}年的历史，这里发生过{{historical_event}}这样的大事。现在这里有{{feature1}}、{{feature2}}，非常值得探索。',
    conclusion: '探索完{{title}}后，你肯定会对这里的文化有更深的了解，记得拍些美美的照片分享给朋友们！'
  },
  
  // 青年版本模板
  young: {
    introduction: '各位年轻的朋友们，欢迎来到{{title}}！这是一个充满魅力和故事的地方。',
    description: '{{title}}以其{{feature1}}、{{feature2}}和{{feature3}}而闻名。这里的历史可以追溯到{{history_years}}年前，曾经是{{historical_significance}}。在这里，你可以感受到{{cultural_atmosphere}}。',
    conclusion: '希望你在{{title}}度过一段难忘的时光，留下美好的回忆！'
  },
  
  // 中年版本模板
  middle: {
    introduction: '欢迎来到{{title}}，这里是一个承载着深厚历史文化的地方。',
    description: '{{title}}有着{{history_years}}年的历史，是{{historical_significance}}的重要见证。这里的{{feature1}}、{{feature2}}和{{feature3}}都展现了当地独特的文化魅力。',
    conclusion: '在{{title}}的游览中，相信你会对这里的历史文化有更深刻的理解和感悟。'
  },
  
  // 老年版本模板
  old: {
    introduction: '欢迎来到{{title}}，这是一个有着悠久历史的地方。',
    description: '{{title}}建在{{location}}，已经有{{history_years}}年的历史了。这里曾经是{{historical_significance}}，现在我们可以看到{{feature1}}和{{feature2}}。',
    conclusion: '希望您在{{title}}的游览中能够感受到历史的厚重和文化的魅力，度过一段愉快的时光。'
  }
};

// 兴趣爱好相关内容增强
const interestEnhancements = {
  history: {
    content: '作为历史爱好者，你一定会对这里的{{historical_details}}特别感兴趣。{{title}}在{{historical_period}}时期扮演了重要角色，{{historical_story}}。',
    keywords: ['历史背景', '历史事件', '历史人物', '历史意义']
  },
  nature: {
    content: '喜欢自然的你，一定会被这里的{{natural_features}}所吸引。{{title}}的{{scenic_spots}}景色优美，{{ecological_value}}。',
    keywords: ['自然景观', '生态环境', '植物', '动物']
  },
  food: {
    content: '作为美食爱好者，来到{{title}}可不能错过当地的特色美食。这里的{{local_food}}非常有名，{{food_story}}。',
    keywords: ['特色美食', '当地小吃', '美食推荐', '烹饪方法']
  },
  photography: {
    content: '对于摄影爱好者来说，{{title}}有很多绝佳的拍摄地点。{{photo_spots}}都是非常出片的地方，{{photography_tips}}。',
    keywords: ['拍摄地点', '最佳时间', '构图技巧', '摄影装备']
  },
  adventure: {
    content: '喜欢探险的你，在{{title}}可以体验{{adventure_activities}}。这里的{{exploration_areas}}充满了未知的惊喜，{{safety_tips}}。',
    keywords: ['探险路线', '户外活动', '安全提示', '装备建议']
  },
  art: {
    content: '热爱艺术的你，在{{title}}可以欣赏到{{art_works}}。这里的{{artistic_features}}展现了独特的艺术风格，{{art_history}}。',
    keywords: ['艺术作品', '艺术风格', '艺术展览', '艺术历史']
  },
  culture: {
    content: '对文化感兴趣的你，在{{title}}可以感受到{{cultural_elements}}。这里的{{cultural_activities}}体现了当地的文化特色，{{cultural_significance}}。',
    keywords: ['文化元素', '传统习俗', '文化活动', '文化意义']
  },
  relax: {
    content: '想要放松的你，在{{title}}可以找到{{relaxing_spots}}。这里的{{leisure_activities}}非常适合休闲度假，{{relaxation_tips}}。',
    keywords: ['休闲场所', '放松活动', '度假体验', '休闲建议']
  }
};

// 导览深度调整
const depthAdjustments = {
  shallow: {
    length: 150, // 简短内容
    detail: '简要介绍',
    focus: ['主要景点', '基本信息', '亮点']
  },
  moderate: {
    length: 300, // 中等长度
    detail: '详细介绍',
    focus: ['主要景点', '历史背景', '文化特色', '实用信息']
  },
  deep: {
    length: 500, // 详细内容
    detail: '深度解析',
    focus: ['历史背景', '文化内涵', '建筑特色', '历史事件', '人物故事', '艺术价值', '实用信息']
  }
};

// 根据用户画像生成内容
function generateContent(originalContent, userProfile) {
  if (!userProfile) {
    return originalContent;
  }
  
  const { ageGroup, education, interests = [], tourDepth = 'moderate' } = userProfile;
  
  // 1. 根据年龄段选择模板
  let template = contentTemplates.young; // 默认青年模板
  
  switch (ageGroup) {
    case '儿童':
      template = contentTemplates.child;
      break;
    case '青少年':
      template = contentTemplates.teenager;
      break;
    case '青年':
      template = contentTemplates.young;
      break;
    case '中年':
      template = contentTemplates.middle;
      break;
    case '老年':
      template = contentTemplates.old;
      break;
  }
  
  // 2. 提取原始内容的关键信息
  const contentInfo = extractContentInfo(originalContent);
  
  // 3. 生成个性化内容
  let personalizedContent = {
    title: originalContent.title,
    introduction: fillTemplate(template.introduction, contentInfo),
    description: fillTemplate(template.description, contentInfo),
    conclusion: fillTemplate(template.conclusion, contentInfo)
  };
  
  // 4. 根据兴趣爱好增强内容
  if (interests && interests.length > 0) {
    interests.forEach(interest => {
      if (interestEnhancements[interest]) {
        personalizedContent.description += ' ' + fillTemplate(interestEnhancements[interest].content, contentInfo);
      }
    });
  }
  
  // 5. 根据导览深度调整内容长度和详细程度
  const depthConfig = depthAdjustments[tourDepth] || depthAdjustments.moderate;
  personalizedContent.description = adjustContentLength(personalizedContent.description, depthConfig.length);
  
  // 6. 根据文化程度调整语言复杂度
  personalizedContent = adjustLanguageComplexity(personalizedContent, education);
  
  return personalizedContent;
}

// 提取内容关键信息
function extractContentInfo(content) {
  return {
    title: content.title || '景点',
    feature1: content.feature1 || '美丽的风景',
    feature2: content.feature2 || '丰富的历史',
    feature3: content.feature3 || '独特的文化',
    history_years: content.history_years || '几百年',
    historical_event: content.historical_event || '许多重要历史事件',
    historical_significance: content.historical_significance || '历史上重要的地方',
    cultural_atmosphere: content.cultural_atmosphere || '浓厚的文化氛围',
    location: content.location || '美丽的地方',
    historical_details: content.historical_details || '丰富的历史细节',
    historical_period: content.historical_period || '古代',
    historical_story: content.historical_story || '有很多有趣的历史故事',
    natural_features: content.natural_features || '壮丽的自然风光',
    scenic_spots: content.scenic_spots || '各个景点',
    ecological_value: content.ecological_value || '重要的生态价值',
    local_food: content.local_food || '特色美食',
    food_story: content.food_story || '有着悠久的历史',
    photo_spots: content.photo_spots || '很多拍照的好地方',
    photography_tips: content.photography_tips || '是拍照的绝佳地点',
    adventure_activities: content.adventure_activities || '各种探险活动',
    exploration_areas: content.exploration_areas || '很多值得探索的地方',
    safety_tips: content.safety_tips || '记得注意安全',
    art_works: content.art_works || '精彩的艺术作品',
    artistic_features: content.artistic_features || '独特的艺术风格',
    art_history: content.art_history || '有着丰富的艺术历史',
    cultural_elements: content.cultural_elements || '丰富的文化元素',
    cultural_activities: content.cultural_activities || '各种文化活动',
    cultural_significance: content.cultural_significance || '重要的文化意义',
    relaxing_spots: content.relaxing_spots || '很多放松的地方',
    leisure_activities: content.leisure_activities || '各种休闲活动',
    relaxation_tips: content.relaxation_tips || '是放松身心的好地方'
  };
}

// 填充模板
function fillTemplate(template, data) {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return data[key] || '';
  });
}

// 调整内容长度
function adjustContentLength(content, targetLength) {
  if (content.length <= targetLength) {
    return content;
  }
  
  // 简单的长度调整逻辑
  return content.substring(0, targetLength) + '...';
}

// 调整语言复杂度
function adjustLanguageComplexity(content, education) {
  switch (education) {
    case '小学':
      // 简化语言
      return {
        ...content,
        description: simplifyLanguage(content.description)
      };
    case '初中':
    case '高中':
      // 保持中等复杂度
      return content;
    case '大学':
    case '研究生及以上':
      // 增加一些专业词汇
      return {
        ...content,
        description: enhanceLanguage(content.description)
      };
    default:
      return content;
  }
}

// 简化语言
function simplifyLanguage(text) {
  // 替换复杂词汇为简单词汇
  const simplifications = {
    '独特的': '特别的',
    '丰富的': '很多的',
    '历史悠久的': '有很久历史的',
    '文化底蕴': '文化故事',
    '建筑风格': '房子的样子',
    '历史意义': '历史故事',
    '文化内涵': '文化故事'
  };
  
  let simplified = text;
  for (const [complex, simple] of Object.entries(simplifications)) {
    simplified = simplified.replace(new RegExp(complex, 'g'), simple);
  }
  
  return simplified;
}

// 增强语言
function enhanceLanguage(text) {
  // 添加一些专业词汇
  const enhancements = {
    '历史': '历史沿革',
    '文化': '文化内涵',
    '建筑': '建筑风格',
    '风景': '自然风光',
    '故事': '历史典故'
  };
  
  let enhanced = text;
  for (const [simple, complex] of Object.entries(enhancements)) {
    // 只替换独立的词汇
    enhanced = enhanced.replace(new RegExp('\\b' + simple + '\\b', 'g'), complex);
  }
  
  return enhanced;
}

module.exports = {
  generateContent,
  contentTemplates,
  interestEnhancements,
  depthAdjustments
};
