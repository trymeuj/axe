from PIL import Image, ImageDraw, ImageFont


BLUE = (38, 141, 244)
VIOLET = (118, 99, 237)


def mix(start, end, amount):
    return tuple(round(a + (b - a) * amount) for a, b in zip(start, end))

def make_icon(size, path):
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = round(canvas_size * 0.29)
    for y in range(canvas_size):
        color = mix(BLUE, VIOLET, y / max(canvas_size - 1, 1)) + (255,)
        draw.line((0, y, canvas_size, y), fill=color)

    mask = Image.new("L", (canvas_size, canvas_size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, canvas_size - 1, canvas_size - 1), radius=radius, fill=255
    )
    img.putalpha(mask)

    inset = max(scale, round(canvas_size * 0.035))
    draw.rounded_rectangle(
        (inset, inset, canvas_size - inset - 1, canvas_size - inset - 1),
        radius=max(1, radius - inset),
        outline=(255, 255, 255, 45),
        width=max(scale, round(canvas_size * 0.012)),
    )

    font_size = round(canvas_size * 0.52)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size, index=1)
    except OSError:
        font = ImageFont.load_default()

    text = "A"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (canvas_size - text_width) // 2
    y = (canvas_size - text_height) // 2 - bbox[1]
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)

    img.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")

make_icon(16, "icon16.png")
make_icon(48, "icon48.png")
make_icon(128, "icon128.png")
print("Icons generated")
