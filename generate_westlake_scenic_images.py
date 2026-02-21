#!/usr/bin/env python3
import os
import json
import mysql.connector
from openai import OpenAI

# 生成西湖三张轮播图
def generate_westlake_images():
    print("开始使用Seedream 4.5生成西湖轮播图...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 三张图片的提示词 - 对应西湖的三个主题
    prompts = [
        {
            "day": 1,
            "title": "断桥残雪",
            "prompt": "杭州西湖断桥残雪，石拱桥横跨湖面，桥身覆盖薄薄白雪，湖水静谧如镜，岸边柳树枝条挂满冰霜，远处雷峰塔隐约可见，冬日清晨柔和光线，薄雾轻笼，水墨画般的意境，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩淡雅清冷，画面诗意盎然"
        },
        {
            "day": 2,
            "title": "平湖秋月",
            "prompt": "杭州西湖平湖秋月，秋夜月圆，月光洒在平静湖面，波光粼粼，湖心亭灯火阑珊，桂花飘香，岸边枫叶红似火，与碧水相映，夜空深蓝繁星点点，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩温暖浪漫，画面宁静优美"
        },
        {
            "day": 3,
            "title": "曲院风荷",
            "prompt": "杭州西湖曲院风荷，夏日荷塘，荷花盛开粉红洁白相间，荷叶田田翠绿欲滴，微风拂过荷花摇曳，蜻蜓点水，曲桥蜿蜒于荷塘之上，远处青山如黛，蓝天白云映衬，国家地理风光摄影，8K超高清，极致细节，真实质感，电影级光影，色彩清新明媚，画面生机盎然"
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
    
    scenic_id = 3  # 西湖ID
    
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
        print(f"西湖的轮播图已更新:")
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
        image_urls = generate_westlake_images()
        
        if image_urls and len(image_urls) == 3:
            # 更新数据库
            update_database(image_urls)
            print("\n🎉 任务完成！西湖三张轮播图已成功生成并存储到数据库中。")
            print("   推荐页面图片保持不变，详情页轮播图已更新。")
        else:
            print("\n❌ 任务失败：图片生成不完整")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
