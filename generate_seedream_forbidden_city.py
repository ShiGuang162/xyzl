#!/usr/bin/env python3
import os
import sys
import requests
import json
import time
from openai import OpenAI

# 安装必要的依赖
def install_dependencies():
    print("开始安装必要的依赖...")
    try:
        import openai
        print(f"OpenAI库已安装，版本: {openai.__version__}")
        if openai.__version__ < "1.0":
            print("需要更新OpenAI库到1.0或更高版本")
            os.system("pip install --upgrade 'openai>=1.0'")
    except ImportError:
        print("OpenAI库未安装，开始安装...")
        os.system("pip install --upgrade 'openai>=1.0'")
    print("依赖安装完成")

# 生成故宫博物院图片
def generate_forbidden_city_image():
    print("开始使用Seedream 4.5生成故宫博物院图片...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 精心设计的提示词
    prompt = "故宫博物院，北京，中国，宏伟的古代宫殿建筑群，红墙黄瓦，晨光照射在皇宫上，专业风景摄影，超高清，电影级灯光，详细的建筑细节，历史准确性，鲜艳的色彩，广角拍摄，完美的构图，晴朗的天空，没有人，干净的环境"
    
    try:
        # 生成图片
        print("正在生成图片...")
        imagesResponse = client.images.generate(
            model="doubao-seedream-4-5-251128",
            prompt=prompt,
            size="2K",
            response_format="url",
            extra_body={
                "watermark": False,
            },
        )
        
        image_url = imagesResponse.data[0].url
        print(f"✅ 故宫博物院图片生成成功！")
        print(f"图片URL: {image_url}")
        
        return image_url
    except Exception as e:
        print(f"❌ 生成图片失败: {e}")
        return None

# 将图片URL更新到数据库
def update_database(image_url):
    print("开始将图片URL更新到数据库...")
    
    # 先获取当前景点数据
    scenic_id = 1  # 故宫博物院的ID
    
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
        print(f"故宫博物院的图片已更新为: {image_url}")
        
        return True
    except Exception as e:
        print(f"❌ 更新数据库失败: {e}")
        return False

# 主函数
def main():
    try:
        # 安装依赖
        install_dependencies()
        
        # 生成图片
        image_url = generate_forbidden_city_image()
        
        if image_url:
            # 更新数据库
            update_database(image_url)
            print("\n🎉 任务完成！故宫博物院图片已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成失败")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")

if __name__ == "__main__":
    main()
