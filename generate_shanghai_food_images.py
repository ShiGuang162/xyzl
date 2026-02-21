#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成上海美食攻略三张轮播图
def generate_shanghai_images():
    print("开始使用Seedream 4.5生成上海美食攻略轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应上海美食攻略的三个主题
    prompts = [
        {
            "day": 1,
            "title": "本帮菜",
            "prompt": "上海本帮菜美食盛宴，红烧肉色泽红亮油润，肥瘦相间，糖醋排骨金黄诱人，醉蟹酒香浓郁，精致瓷盘盛装，中式餐桌布置，暖黄色灯光，餐厅环境优雅，美食摄影风格，8K超高清，极致细节，真实质感，色彩浓郁诱人，画面精致美味"
        },
        {
            "day": 2,
            "title": "南翔小笼",
            "prompt": "上海南翔小笼包，晶莹剔透的薄皮，隐约可见内部鲜美汤汁和肉馅，蒸笼中热气腾腾，配姜丝香醋碟，传统竹制蒸笼，中式点心特写，美食摄影风格，8K超高清，极致细节，真实质感，色彩清新诱人，画面精致美味"
        },
        {
            "day": 3,
            "title": "上海小吃",
            "prompt": "上海传统小吃集合，生煎包底部金黄酥脆，锅贴整齐排列，小馄饨汤清味鲜，摆放在传统木质托盘上，老上海街头小吃摊氛围，暖黄色灯光，美食摄影风格，8K超高清，极致细节，真实质感，色彩温暖诱人，画面充满市井烟火气"
        }
    ]
    
    image_urls = []
    
    for item in prompts:
        try:
            print(f"\n正在生成第{item['day']}张图片 - {item['title']}...")
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
            print(f"✅ 第{item['day']}张图片生成成功！")
            print(f"图片URL: {image_url}")
            image_urls.append(image_url)
            
        except Exception as e:
            print(f"❌ 生成第{item['day']}张图片失败: {e}")
            return None
    
    return image_urls

# 将图片URL更新到数据库
def update_database(image_urls):
    print("\n开始将图片URL更新到数据库...")
    
    strategy_id = 2  # 上海美食攻略ID
    
    try:
        # 更新图片 - 同时更新 image（用于推荐页面）和 images（用于详情页轮播）
        first_image = image_urls[0] if image_urls else None
        images_json = json.dumps(image_urls)
        
        # 使用原始SQL直接更新数据库，确保两个字段都更新
        conn = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="Mysql@123456",
            database="xyzl_db"
        )
        
        cursor = conn.cursor()
        
        # 更新 strategies 表
        update_sql = """
            UPDATE strategies 
            SET image = %s, images = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_sql, (first_image, images_json, strategy_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✅ 数据库更新成功！")
        print(f"上海美食攻略的图片已更新为:")
        print(f"  推荐页面图片 (image): {first_image}")
        print(f"  详情页轮播图 (images): {images_json}")
        
        return True
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        import traceback
        traceback.print_exc()
        return False

# 主函数
def main():
    try:
        # 生成图片
        image_urls = generate_shanghai_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！上海美食攻略三张轮播图已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
