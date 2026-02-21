#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成长城三张轮播图
def generate_greatwall_images():
    print("开始使用Seedream 4.5生成长城轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应长城的三个主题
    prompts = [
        {
            "day": 1,
            "title": "长城全景",
            "prompt": "中国万里长城慕田峪段，雄伟大气，蜿蜒盘旋在连绵起伏的青山山脊之上，古老城墙砖石纹理清晰，斑驳沧桑，烽火台矗立，山间云雾缭绕，清晨柔和金色阳光斜照，光影层次丰富，远山层叠朦胧，天空湛蓝飘着白云，超广角全景，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩自然通透，画面震撼壮丽"
        },
        {
            "day": 2,
            "title": "敌楼",
            "prompt": "中国长城敌楼特写，古朴厚重的砖石结构，垛口整齐排列，瞭望窗口视野开阔，城墙沿着山脊延伸，背景是层峦叠嶂的青山，蓝天白云映衬，阳光照射在城墙上形成明暗对比，国家地理纪实摄影风格，8K超高清，极致细节，真实质感，电影级光影，色彩厚重古朴，画面庄严壮观"
        },
        {
            "day": 3,
            "title": "长城日落",
            "prompt": "中国万里长城日落时分，夕阳西沉金色余晖洒满长城，城墙呈现暖金色调，烽火台剪影矗立山巅，远山层叠在暮色中，天空橙红渐变绚丽多彩，云海翻涌在山谷间，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩温暖绚烂，画面震撼壮美"
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
    
    scenic_id = 2  # 长城ID
    
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
        print(f"长城的轮播图已更新:")
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
        image_urls = generate_greatwall_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！长城三张轮播图已成功生成并存储到数据库中。")
            print("   推荐页面图片保持不变，详情页轮播图已更新。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
