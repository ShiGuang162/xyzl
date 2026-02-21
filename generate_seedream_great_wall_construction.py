#!/usr/bin/env python3
import os
import requests
from openai import OpenAI

# 生成长城修建图片
def generate_great_wall_construction_image():
    print("开始使用Seedream 4.5生成长城修建图片...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 使用用户提供的详细提示词
    prompt = "古代中国秦朝修建长城的宏大施工现场，群山险峻的山脊之上，无数古代劳工分工协作，有的抬运巨大青石块，有的夯土筑墙，有的打磨砖石，工匠们穿着古朴粗布衣衫，神情坚毅，现场尘土飞扬、炊烟袅袅，木质脚手架牢固搭建，绳索、木杠、石锤、夯具等工具齐全，古老城墙层层向上修筑，烽火台初具雏形，远处山峦连绵起伏，天空云层厚重，清晨柔和自然光，历史纪实摄影风格，人物动态自然生动，场景宏大壮阔，细节清晰逼真，8K 超高清，电影级光影质感，色彩厚重古朴，氛围庄严悲壮，极具历史沉浸感，比例16:9"
    
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
        print(f"✅ 长城修建图片生成成功！")
        print(f"图片URL: {image_url}")
        
        return image_url
    except Exception as e:
        print(f"❌ 生成图片失败: {e}")
        return None

# 将图片URL更新到数据库
def update_database(image_url):
    print("开始将图片URL更新到数据库...")
    
    # 长城修建的历史ID
    history_id = 2  # 假设历史页面长城修建的ID是2
    
    try:
        # 尝试更新历史页面的长城修建图片
        # 使用正确的API端点 /api/history/{id}
        update_response = requests.put(
            f"http://localhost:3001/api/history/{history_id}",
            json={
                "image": image_url
            }
        )
        update_response.raise_for_status()
        
        print(f"✅ 数据库更新成功！")
        print(f"长城修建的图片已更新为: {image_url}")
        
        return True
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        # 如果历史页面API更新失败，尝试获取完整数据后更新
        try:
            # 尝试获取历史文化的完整数据
            response = requests.get(f"http://localhost:3001/api/history/{history_id}")
            response.raise_for_status()
            history_data = response.json()
            
            # 使用完整数据进行更新
            update_response = requests.put(
                f"http://localhost:3001/api/history/{history_id}",
                json={
                    "title": history_data["title"],
                    "description": history_data["description"],
                    "image": image_url,
                    "period": history_data["period"],
                    "importance": history_data["importance"],
                    "content": history_data["content"]
                }
            )
            update_response.raise_for_status()
            
            print(f"✅ 历史文化数据库更新成功！")
            print(f"长城修建的图片已更新为: {image_url}")
            
            return True
        except Exception as e2:
            print(f"❌ 历史文化数据库更新失败: {e2}")
            return False

# 主函数
def main():
    try:
        # 生成图片
        image_url = generate_great_wall_construction_image()
        
        if image_url:
            # 更新数据库
            update_database(image_url)
            print("\n🎉 任务完成！长城修建图片已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成失败")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")

if __name__ == "__main__":
    main()
