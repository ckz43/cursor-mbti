#!/usr/bin/env python3
"""
下载真实图片的脚本
为MBTI项目下载真实的卡通角色图片和创始人照片
"""

import urllib.request
import urllib.error
import os
from PIL import Image
import io

def download_image(url, filename, max_retries=3):
    """下载图片并保存"""
    for attempt in range(max_retries):
        try:
            print(f"📥 下载 {filename} (尝试 {attempt + 1}/{max_retries})")
            
            # 设置User-Agent避免被拒绝
            req = urllib.request.Request(url)
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            
            with urllib.request.urlopen(req) as response:
                image_data = response.read()
                
            # 验证图片数据
            try:
                img = Image.open(io.BytesIO(image_data))
                img.verify()  # 验证图片完整性
                
                # 重新打开图片进行保存
                img = Image.open(io.BytesIO(image_data))
                img.save(filename)
                print(f"✅ 成功下载: {filename}")
                return True
                
            except Exception as e:
                print(f"❌ 图片验证失败: {e}")
                continue
                
        except Exception as e:
            print(f"❌ 下载失败 (尝试 {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                print(f"⚠️  跳过 {filename}")
                return False
            continue
    
    return False

def create_simpsons_characters():
    """下载辛普森一家角色"""
    characters = [
        # 辛普森一家的官方角色
        ("Homer Simpson", "https://static.wikia.nocookie.net/simpsons/images/b/bd/Homer_Simpson.png", "public/images/characters/esfp-homer.png"),
        ("Bart Simpson", "https://static.wikia.nocookie.net/simpsons/images/a/aa/Bart_Simpson.png", "public/images/characters/estp-bart.png"),
        ("Marge Simpson", "https://static.wikia.nocookie.net/simpsons/images/0/0b/Marge_Simpson.png", "public/images/characters/isfj-marge.png"),
    ]
    
    for name, url, filename in characters:
        print(f"🔍 处理 {name}...")
        download_image(url, filename)

def create_south_park_characters():
    """下载南方公园角色"""
    characters = [
        # 南方公园官方角色
        ("Eric Cartman", "https://static.wikia.nocookie.net/southpark/images/7/73/Eric_cartman.png", "public/images/characters/entj-cartman.png"),
        ("Kyle Broflovski", "https://static.wikia.nocookie.net/southpark/images/8/8f/Kyle_broflovski.png", "public/images/characters/infj-kyle.png"),
        ("Kenny McCormick", "https://static.wikia.nocookie.net/southpark/images/3/3e/Kenny_mccormick.png", "public/images/characters/istp-kenny.png"),
        ("Butters Stotch", "https://static.wikia.nocookie.net/southpark/images/3/32/Butters_stotch.png", "public/images/characters/infp-butters.png"),
    ]
    
    for name, url, filename in characters:
        print(f"🔍 处理 {name}...")
        download_image(url, filename)

def create_peanuts_characters():
    """下载史努比角色"""
    characters = [
        # 史努比官方角色
        ("Charlie Brown", "https://static.wikia.nocookie.net/peanuts/images/a/a7/Charlie_Brown.png", "public/images/characters/intp-charlie-brown.png"),
        ("Lucy van Pelt", "https://static.wikia.nocookie.net/peanuts/images/8/88/Lucy_van_pelt.png", "public/images/characters/estj-lucy.png"),
        ("Schroeder", "https://static.wikia.nocookie.net/peanuts/images/1/1a/Schroeder.png", "public/images/characters/isfp-schroeder.png"),
    ]
    
    for name, url, filename in characters:
        print(f"🔍 处理 {name}...")
        download_image(url, filename)

def create_founder_photos():
    """下载创始人真实照片"""
    founders = [
        # 使用历史档案中的真实照片
        ("Isabel Briggs Myers", "https://www.capt.org/Images/People/isabel-briggs-myers-portrait.jpg", "public/images/founders/isabel-myers-real.jpg"),
        ("Katharine Cook Briggs", "https://upload.wikimedia.org/wikipedia/commons/9/9e/Katherine_Cook_Briggs.jpeg", "public/images/founders/katharine-briggs-real.jpg"),
    ]
    
    for name, url, filename in founders:
        print(f"🔍 处理 {name}...")
        download_image(url, filename)

def create_backup_images():
    """创建备用图片（如果网络下载失败）"""
    print("🎨 创建备用图片...")
    
    # 如果无法下载真实图片，创建高质量的示意图
    from PIL import Image, ImageDraw, ImageFont
    
    def create_character_image(character_type, name, bg_color, filename):
        img = Image.new('RGBA', (300, 300), bg_color)
        draw = ImageDraw.Draw(img)
        
        # 绘制圆形背景
        margin = 30
        draw.ellipse([margin, margin, 300-margin, 300-margin], fill=(255, 255, 255, 200))
        
        try:
            font_large = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 36)
            font_small = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 24)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # 绘制角色类型
        bbox = draw.textbbox((0, 0), character_type, font=font_large)
        text_width = bbox[2] - bbox[0]
        x = (300 - text_width) // 2
        draw.text((x, 100), character_type, fill=(50, 50, 50), font=font_large)
        
        # 绘制角色名称
        bbox = draw.textbbox((0, 0), name, font=font_small)
        text_width = bbox[2] - bbox[0]
        x = (300 - text_width) // 2
        draw.text((x, 160), name, fill=(80, 80, 80), font=font_small)
        
        img.save(filename)
        print(f"✅ 创建备用图片: {filename}")

    # 创建主要角色的备用图片
    backup_characters = [
        ("ESFP", "Homer Simpson", (255, 220, 100), "public/images/characters/esfp-homer.png"),
        ("ESTP", "Bart Simpson", (100, 200, 255), "public/images/characters/estp-bart.png"),
        ("ISFJ", "Marge Simpson", (100, 255, 150), "public/images/characters/isfj-marge.png"),
        ("ENTJ", "Eric Cartman", (255, 100, 100), "public/images/characters/entj-cartman.png"),
        ("INFJ", "Kyle Broflovski", (150, 100, 255), "public/images/characters/infj-kyle.png"),
    ]
    
    for character_type, name, bg_color, filename in backup_characters:
        if not os.path.exists(filename):  # 只有文件不存在时才创建
            create_character_image(character_type, name, bg_color, filename)

def main():
    print("🖼️  开始下载真实图片...\n")
    
    # 确保目录存在
    os.makedirs("public/images/founders", exist_ok=True)
    os.makedirs("public/images/characters", exist_ok=True)
    
    try:
        # 1. 下载创始人照片
        print("📸 下载创始人照片...")
        create_founder_photos()
        
        # 2. 下载辛普森角色
        print("\n🟨 下载辛普森一家角色...")
        create_simpsons_characters()
        
        # 3. 下载南方公园角色
        print("\n🔴 下载南方公园角色...")
        create_south_park_characters()
        
        # 4. 下载史努比角色
        print("\n🟤 下载史努比角色...")
        create_peanuts_characters()
        
    except Exception as e:
        print(f"❌ 下载过程中出现错误: {e}")
    
    # 5. 为未能下载的图片创建备用图
    print("\n🎨 检查并创建备用图片...")
    create_backup_images()
    
    print("\n✨ 图片处理完成！")
    print("💡 现在可以运行替换脚本更新组件: node replace-images.js")

if __name__ == "__main__":
    main()