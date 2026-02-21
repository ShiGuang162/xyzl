#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成故宫博物院三张轮播图
def generate_forbidden_city_images():
    print("开始使用Seedream 4.5生成故宫博物院轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应故宫博物院的三个主题
    prompts = [
        {
            "day": 1,
            "title": "太和殿",
            "prompt": "北京故宫太和殿，宏伟壮丽的皇家宫殿，金黄琉璃瓦屋顶在阳光下熠熠生辉，朱红宫墙庄严厚重，汉白玉栏杆与台阶雕刻精美，斗拱飞檐结构精巧细腻，殿前广场开阔规整，蓝天白云映衬，清晨柔和金色光线，国家地理纪实摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩浓郁典雅，画面恢弘震撼"
        },
        {
            "day": 2,
            "title": "乾清宫",
            "prompt": "北京故宫乾清宫内部，金碧辉煌的龙椅宝座，雕龙画凤的梁柱，精美的藻井天花板，红色宫柱支撑，御案上摆放着文房四宝，阳光透过窗棂洒入，光影斑驳，皇家气派尽显，国家地理纪实摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩庄重华贵，画面威严神圣"
        },
        {
            "day": 3,
            "title": "御花园",
            "prompt": "北京故宫御花园，古典园林美景，亭台楼阁错落有致，假山奇石嶙峋，古树参天，松柏苍翠，花卉盛开，红墙黄瓦与绿树相映成趣，曲径通幽，池塘中游鱼嬉戏，春日暖阳，国家地理风光摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩清新雅致，画面宁静优美"
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

# 将图片URL更新到数据库 - 只更新images字段，不更新image字段
def update_database(image_urls):
    print("\n开始将图片URL更新到数据库...")
    
    scenic_id = 1  # 故宫博物院ID
    
    try:
        # 只更新 images 字段（用于详情页轮播），保留原有的 image 字段（推荐页面图片不变）
        images_json = json.dumps(image_urls)
        
        # 使用原始SQL直接更新数据库
        conn = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="Mysql@123456",
            database="xyzl_db"
        )
        
        cursor = conn.cursor()
        
        # 只更新 images 字段，保留 image 字段不变
        update_sql = """
            UPDATE scenics 
            SET images = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_sql, (images_json, scenic_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✅ 数据库更新成功！")
        print(f"故宫博物院的轮播图已更新:")
        print(f"  详情页轮播图 (images): {images_json}")
        print(f"  注意：推荐页面图片 (image) 保持不变")
        
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
        image_urls = generate_forbidden_city_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！故宫博物院三张轮播图已成功生成并存储到数据库中。")
            print("   推荐页面图片保持不变，详情页轮播图已更新。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
