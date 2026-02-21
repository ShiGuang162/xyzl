#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成杭州西湖一日游三张轮播图
def generate_hangzhou_images():
    print("开始使用Seedream 4.5生成杭州西湖一日游轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应杭州西湖一日游的三个主题
    prompts = [
        {
            "day": 1,
            "title": "三潭印月",
            "prompt": "杭州西湖三潭印月，平静如镜的湖面泛着淡淡波光，三座石塔亭亭玉立在湖中，月圆之夜塔中点灯，倒映水中形成多个月影，岸边垂柳枝条轻柔垂落，远处苏堤白堤蜿蜒，清晨柔和暖光，空气通透清新，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩温润雅致，意境悠远宁静"
        },
        {
            "day": 2,
            "title": "雷峰夕照",
            "prompt": "杭州西湖雷峰塔，古朴典雅的塔身矗立在夕照山上，夕阳西下金色余晖洒满塔身，塔影倒映在西湖水面，波光粼粼，远山层叠朦胧，天空橙红渐变，晚霞绚丽，西湖全景尽收眼底，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩温暖绚烂，画面震撼壮丽"
        },
        {
            "day": 3,
            "title": "苏堤春晓",
            "prompt": "杭州西湖苏堤春晓，六桥烟柳，桃红柳绿，春风拂面，柳树新绿嫩叶随风轻拂，桃花盛开粉红如云，湖面轻舟荡漾，游人漫步堤上，远处保俶塔隐约可见，蓝天白云映衬，清晨柔和金色阳光，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩清新明媚，画面诗意盎然"
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
    
    strategy_id = 3  # 杭州西湖一日游攻略ID
    
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
            UPDATE strategies 
            SET images = %s, updated_at = NOW()
            WHERE id = %s
        """
        cursor.execute(update_sql, (images_json, strategy_id))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print(f"✅ 数据库更新成功！")
        print(f"杭州西湖一日游攻略的轮播图已更新:")
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
        image_urls = generate_hangzhou_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！杭州西湖一日游三张轮播图已成功生成并存储到数据库中。")
            print("   推荐页面图片保持不变，详情页轮播图已更新。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
