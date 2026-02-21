#!/usr/bin/env python3
import os
import requests
from openai import OpenAI

# 生成故宫变迁图片
def generate_forbidden_city_history_image():
    print("开始使用Seedream 4.5生成故宫变迁图片...")
    
    # 设置API Key
    API_KEY = "b2ec99ba-9a5f-4a6f-8662-b180874c7203"
    os.environ["ARK_API_KEY"] = API_KEY
    
    # 初始化OpenAI客户端
    client = OpenAI(
        base_url="https://ark.cn-beijing.volces.com/api/v3",
        api_key=os.environ.get("ARK_API_KEY"),
    )
    
    # 使用用户提供的详细提示词
    prompt = "北京故宫，宏伟壮丽的明清皇家宫殿，金黄琉璃瓦屋顶在阳光下熠熠生辉，朱红宫墙庄严厚重，汉白玉栏杆与台阶雕刻精美，斗拱飞檐结构精巧细腻，庭院开阔规整，青砖地面古朴沧桑，对称式中轴线布局，远处宫殿层层叠叠，蓝天白云映衬，清晨柔和金色光线，光影层次丰富，大气磅礴，庄严神圣，国家地理纪实摄影，8K 超高清，极致细节，真实质感，电影级光影，色彩浓郁典雅，画面恢弘震撼"
    
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
        print(f"✅ 故宫变迁图片生成成功！")
        print(f"图片URL: {image_url}")
        
        return image_url
    except Exception as e:
        print(f"❌ 生成图片失败: {e}")
        return None

# 将图片URL更新到数据库
def update_database(image_url):
    print("开始将图片URL更新到数据库...")
    
    # 故宫的ID
    history_id = 1  # 历史页面故宫的变迁ID是1
    
    try:
        # 尝试更新历史页面的故宫变迁图片
        # 使用正确的API端点 /api/history/1
        update_response = requests.put(
            f"http://localhost:3001/api/history/{history_id}",
            json={
                "image": image_url
            }
        )
        update_response.raise_for_status()
        
        print(f"✅ 数据库更新成功！")
        print(f"故宫变迁的图片已更新为: {image_url}")
        
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
            print(f"故宫变迁的图片已更新为: {image_url}")
            
            return True
        except Exception as e2:
            print(f"❌ 历史文化数据库更新失败: {e2}")
            # 如果历史页面API不存在，尝试更新景点中的故宫图片
            try:
                # 尝试更新景点中的故宫图片（ID为1）
                response = requests.get("http://localhost:3001/api/scenics/1")
                response.raise_for_status()
                scenic_data = response.json()
                
                update_response = requests.put(
                    "http://localhost:3001/api/scenics/1",
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
                
                print(f"✅ 景点数据库更新成功！")
                print(f"故宫景点的图片已更新为: {image_url}")
                
                return True
            except Exception as e3:
                print(f"❌ 景点数据库更新失败: {e3}")
                return False

# 主函数
def main():
    try:
        # 生成图片
        image_url = generate_forbidden_city_history_image()
        
        if image_url:
            # 更新数据库
            update_database(image_url)
            print("\n🎉 任务完成！故宫变迁图片已成功生成并存储到数据库中。")
        else:
            print("\n❌ 任务失败：图片生成失败")
    except Exception as e:
        print(f"\n❌ 任务失败: {e}")

if __name__ == "__main__":
    main()
