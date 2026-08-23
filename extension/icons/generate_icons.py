from PIL import Image, ImageDraw, ImageFont
import sys

def make_icon(size, path):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    # Draw a simple "A" letter
    font_size = int(size * 0.6)
    try:
        from PIL import ImageFont
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        font = ImageFont.load_default()
    
    text = "A"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - bbox[1]
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
    img.save(path, "PNG")

make_icon(16, "icon16.png")
make_icon(48, "icon48.png")
make_icon(128, "icon128.png")
print("Icons generated")
