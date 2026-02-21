#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成故宫历史变迁三张轮播图
def generate_forbidden_city_history_images():
    print("开始使用Seedream 4.5生成故宫历史变迁轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应故宫历史变迁的三个时期
    prompts = [
        {
            "day": 1,
            "title": "明清皇宫",
            "prompt": "北京故宫明清时期皇家宫殿，太和殿前举行盛大典礼，皇帝龙椅宝座，文武百官朝拜，宫廷仪仗队整齐排列，红墙黄瓦金碧辉煌，祥云缭绕，历史纪实绘画风格，8K超高清，极致细节，真实质感，色彩庄重华贵，画面恢弘壮观"
        },
        {
            "day": 2,
            "title": "故宫博物院成立",
            "prompt": "1925年故宫博物院成立场景，民国时期建筑外观，牌匾上书故宫博物院，门前人群熙熙攘攘，早期博物馆展览场景，历史黑白照片风格转为彩色，8K超高清，极致细节，真实质感，色彩复古怀旧，画面充满历史感"
        },
        {
            "day": 3,
            "title": "现代故宫",
            "prompt": "现代故宫博物院，阳光明媚下金碧辉煌的宫殿建筑群，游客有序参观，文物保护展示，数字化展览，中外游客拍照留念，蓝天白云映衬，国家地理纪实摄影风格，8K超高清，极致细节，真实质感，色彩明亮鲜艳，画面充满活力"
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
    
    history_id = 1  # 故宫历史变迁ID
    
    try:
        # 只更新 images 字段（用于详情页轮播），保留原有的 image 字段（历史页面图片不变）
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
            UPDATE history 
            SET images = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_sql, (images_json, history_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✅ 数据库更新成功！")
        print(f"故宫历史变迁的轮播图已更新:")
        print(f"  详情页轮播图 (images): {images_json}")
        print(f"  注意：历史页面图片 (image) 保持不变")
        
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
        image_urls = generate_forbidden_city_history_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！故宫历史变迁三张轮播图已成功生成并存储到数据库中。")
            print("   历史页面图片保持不变，详情页轮播图已更新。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
