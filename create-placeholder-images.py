#!/usr/bin/env python3
"""
创建占位符图片的脚本
为MBTI项目生成临时的占位符图片
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_image(text, width=300, height=300, bg_color=(240, 240, 240), text_color=(100, 100, 100)):
    """创建占位符图片"""
    # 创建图片
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # 尝试使用系统字体
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        except:
            font = ImageFont.load_default()
    
    # 计算文本位置
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # 绘制文本
    draw.text((x, y), text, fill=text_color, font=font)
    
    return img

def create_founders_images():
    """创建创始人占位符图片"""
    founders = [
        ("Carl Jung", "carl-jung-real.jpg"),
        ("Isabel Myers", "isabel-myers-real.jpg"),
        ("Katharine Briggs", "katharine-briggs-real.jpg")
    ]
    
    for name, filename in founders:
        img = create_placeholder_image(name, 400, 400, (220, 220, 255))
        path = f"public/images/founders/{filename}"
        img.save(path)
        print(f"✅ 创建占位符: {path}")

def create_character_images():
    """创建MBTI角色占位符图片"""
    characters = [
        # 分析师组 (NT)
        ("INTJ\nStewie", "intj-stewie.png", (128, 0, 128)),  # 紫色
        ("INTP\nCharlie", "intp-charlie-brown.png", (128, 0, 128)),
        ("ENTJ\nCartman", "entj-cartman.png", (128, 0, 128)),
        ("ENTP\nRick", "entp-rick.png", (128, 0, 128)),
        
        # 外交官组 (NF)
        ("INFJ\nKyle", "infj-kyle.png", (34, 139, 34)),  # 绿色
        ("INFP\nButters", "infp-butters.png", (34, 139, 34)),
        ("ENFJ\nMufasa", "enfj-mufasa.png", (34, 139, 34)),
        ("ENFP\nAnna", "enfp-anna.png", (34, 139, 34)),
        
        # 守护者组 (SJ)
        ("ISTJ\nHank", "istj-hank.png", (30, 144, 255)),  # 蓝色
        ("ISFJ\nMarge", "isfj-marge.png", (30, 144, 255)),
        ("ESTJ\nLucy", "estj-lucy.png", (30, 144, 255)),
        ("ESFJ\nMolly", "esfj-molly.png", (30, 144, 255)),
        
        # 探索者组 (SP)
        ("ISTP\nKenny", "istp-kenny.png", (255, 165, 0)),  # 橙色
        ("ISFP\nSchroeder", "isfp-schroeder.png", (255, 165, 0)),
        ("ESTP\nBart", "estp-bart.png", (255, 165, 0)),
        ("ESFP\nHomer", "esfp-homer.png", (255, 165, 0)),
    ]
    
    for text, filename, bg_color in characters:
        img = create_placeholder_image(text, 256, 256, bg_color, (255, 255, 255))
        path = f"public/images/characters/{filename}"
        img.save(path)
        print(f"✅ 创建占位符: {path}")

def create_institution_logos():
    """创建学术机构logo占位符"""
    institutions = [
        ("Harvard", "harvard-shield.png", (139, 0, 0)),  # 深红色
        ("Stanford", "stanford-logo.png", (140, 21, 21)),
        ("MIT", "mit-logo.png", (139, 69, 19)),
        ("500强企业", "enterprise-logo.png", (70, 130, 180)),
    ]
    
    for text, filename, bg_color in institutions:
        img = create_placeholder_image(text, 200, 200, bg_color, (255, 255, 255))
        path = f"public/images/institutions/{filename}"
        img.save(path)
        print(f"✅ 创建占位符: {path}")

def main():
    print("🎨 开始创建占位符图片...\n")
    
    # 确保目录存在
    os.makedirs("public/images/founders", exist_ok=True)
    os.makedirs("public/images/characters", exist_ok=True)
    os.makedirs("public/images/institutions", exist_ok=True)
    
    # 创建占位符图片
    print("📸 创建创始人占位符...")
    create_founders_images()
    
    print("\n🎭 创建角色占位符...")
    create_character_images()
    
    print("\n🏛️ 创建机构logo占位符...")
    create_institution_logos()
    
    print("\n✨ 占位符图片创建完成！")
    print("💡 这些是临时占位符，稍后可以用真实图片替换。")

if __name__ == "__main__":
    main()