#!/usr/bin/env python3
import os
import requests
from openai import OpenAI

# 生成长城图片
def generate_great_wall_image():
    print("开始使用Seedream 4.5生成长城图片...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 使用用户提供的详细提示词
    prompt = "万里长城，雄伟大气，蜿蜒盘旋在连绵起伏的青山山脊之上，古老城墙砖石纹理清晰，斑驳沧桑，烽火台矗立，山间云雾缭绕，清晨柔和金色阳光斜照，光影层次丰富，远山层叠朦胧，天空湛蓝飘着白云，超广角全景，国家地理风光摄影，8K 超高清，极致细节，真实质感，电影级光影，色彩自然通透，画面震撼壮丽"
    
    try:
        # 生成图片
        print("正在生成图片...")
        imagesResponse = client.images.generate(
            model="doubao-seedream-4-5-251128",
            prompt=prompt,
            size="4K",  # 使用4K分辨率以获得更清晰的细节
            response_format="url",
            extra_body={
                "watermark": False,
            },
        )
        
        image_url = imagesResponse.data[0].url
        print(f"✅ 长城图片生成成功！")
        print(f"图片URL: {image_url}")
        
        return image_url
    except Exception as e:
        print(f"❌ 生成图片失败: {e}")
        return None

# 将图片URL更新到数据库
def update_database(image_url):
    print("开始将图片URL更新到数据库...")
    
    # 长城的ID
    scenic_id = 2  # 根据之前的API响应，长城的ID是2
    
    try:
        # 获取当前景点数据
        response = requests.get(f"http://localhost:3001/api/scenics/{scenic_id}")
        response.raise_for_status()
        scenic_data = response.json()
        
        # 更新图片
        update_response = requests.put(
            f"http://localhost:3001/api/scenics/{scenic_id}",
            json={
                "name": scenic_data["name"],
                "description": scenic_data["description"],
                "image": image_url,
                "address": scenic_data["address"],
                "rating": scenic_data["rating"],
                "reviews": scenic_data["reviews"]
            }
        )
        update_response.raise_for_status()
        
        print(f"✅ 数据库更新成功！")
        print(f"长城的图片已更新为: {image_url}")
        
        return True
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        return False

# 主函数
def main():
    try:
        # 生成图片
        image_url = generate_great_wall_image()
        
        if image_url:
            # 更新数据库
            update_database(image_url)
            print("\n🎉 任务完成！长城图片已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成失败")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")

if __name__ == "__main__":
    main()
