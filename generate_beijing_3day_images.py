#!/usr/bin/env python3
import os
import requests
import json
from openai import OpenAI

# 生成北京三日游三张轮播图
def generate_beijing_images():
    print("开始使用Seedream 4.5生成北京三日游轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应北京三日游的三个主题
    prompts = [
        {
            "day": 1,
            "title": "故宫",
            "prompt": "北京故宫博物院，宏伟壮丽的明清皇家宫殿建筑群，金黄琉璃瓦屋顶在阳光下熠熠生辉，朱红宫墙庄严厚重，汉白玉栏杆与台阶雕刻精美，斗拱飞檐结构精巧细腻，庭院开阔规整，蓝天白云映衬，清晨柔和金色光线，游客有序参观，国家地理纪实摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩浓郁典雅，画面恢弘震撼"
        },
        {
            "day": 2,
            "title": "长城",
            "prompt": "中国万里长城，雄伟大气，蜿蜒盘旋在连绵起伏的青山山脊之上，古老城墙砖石纹理清晰，斑驳沧桑，烽火台矗立，山间云雾缭绕，清晨柔和金色阳光斜照，光影层次丰富，远山层叠朦胧，天空湛蓝飘着白云，超广角全景，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩自然通透，画面震撼壮丽"
        },
        {
            "day": 3,
            "title": "胡同",
            "prompt": "北京传统胡同风情，青砖灰瓦四合院，红漆大门，石狮子门墩，古老街巷，垂柳依依，人力三轮车穿梭，老北京生活气息浓厚，傍晚暖黄色灯光，游客悠闲漫步，民俗纪实摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩温暖怀旧，画面充满人文情怀"
        }
    ]
    
    image_urls = []
    
    for item in prompts:
        try:
            print(f"\n正在生成第{item['day']}天图片 - {item['title']}...")
            imagesResponse = client.images.generate(
                model="doubao-seedream-4-5-251128",
                prompt=item['prompt'],
                size="4K",
                response_format="url",
                extra_body={
                    "watermark": False,
                },
            )
            
            image_url = imagesResponse.data[0].url
            print(f"✅ 第{item['day']}天图片生成成功！")
            print(f"图片URL: {image_url}")
            image_urls.append(image_url)
            
        except Exception as e:
            print(f"❌ 生成第{item['day']}天图片失败: {e}")
            return None
    
    return image_urls

# 将图片URL更新到数据库
def update_database(image_urls):
    print("\n开始将图片URL更新到数据库...")
    
    strategy_id = 1  # 北京三日游攻略ID
    
    try:
        # 获取当前攻略数据
        response = requests.get(f"http://localhost:3001/api/strategies/{strategy_id}")
        response.raise_for_status()
        strategy_data = response.json()
        
        # 更新图片
        update_response = requests.put(
            f"http://localhost:3001/api/strategies/{strategy_id}",
            json={
                "title": strategy_data["title"],
                "description": strategy_data["description"],
                "content": strategy_data["content"],
                "images": json.dumps(image_urls),
                "tags": strategy_data["tags"],
                "author": strategy_data["author"]
            }
        )
        update_response.raise_for_status()
        
        print(f"✅ 数据库更新成功！")
        print(f"北京三日游攻略的图片已更新为:")
        for i, url in enumerate(image_urls, 1):
            print(f"  第{i}张: {url}")
        
        return True
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        return False

# 主函数
def main():
    try:
        # 生成图片
        image_urls = generate_beijing_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！北京三日游三张轮播图已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")

if __name__ == "__main__":
    main()
