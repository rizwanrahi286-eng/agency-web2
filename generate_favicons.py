import base64
from PIL import Image, ImageFilter

src_path = r"C:\Users\User\.gemini\antigravity-ide\brain\31081015-e2b2-44ef-8e41-e801438b2820\.user_uploaded\media_1789140028417.png"
img = Image.open(src_path).convert("RGBA")
width, height = img.size

# 1. Erase watermark area at bottom right (x > 650, y > 350)
for y in range(350, height):
    for x in range(650, width):
        img.putpixel((x, y), (0, 0, 0, 0))

# 2. Transparent background conversion with clean antialiasing
out = Image.new("RGBA", (width, height), (0, 0, 0, 0))
for y in range(height):
    for x in range(width):
        r, g, b, a = img.getpixel((x, y))
        max_c = max(r, g, b)
        if max_c <= 12:
            out.putpixel((x, y), (0, 0, 0, 0))
        elif max_c < 45:
            alpha = int(255 * (max_c - 12) / (45 - 12))
            out.putpixel((x, y), (r, g, b, alpha))
        else:
            out.putpixel((x, y), (r, g, b, 255))

# 3. Crop tightly to logo
bbox = out.getbbox()
logo = out.crop(bbox)
logo.save(r"c:\Users\User\Desktop\agencyweb\logo-transparent.png", "PNG")

# 4. Generate Square Text Favicons
def make_favicon_canvas(target_size, pad_ratio=0.04):
    canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
    pad = int(target_size * pad_ratio)
    avail = target_size - 2 * pad
    scale = min(avail / logo.width, avail / logo.height)
    nw = max(1, int(logo.width * scale))
    nh = max(1, int(logo.height * scale))
    resized = logo.resize((nw, nh), Image.Resampling.LANCZOS)
    
    pos_x = (target_size - nw) // 2
    pos_y = (target_size - nh) // 2
    
    # Subtle drop shadow for visibility on light and dark browser tabs
    shadow_mask = resized.split()[3].point(lambda a: int(a * 0.7))
    shadow = Image.new("RGBA", resized.size, (10, 15, 29, 220))
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1), (0, 2)]:
        canvas.paste(shadow, (pos_x + dx, pos_y + dy), shadow_mask)
        
    canvas.paste(resized, (pos_x, pos_y), resized)
    return canvas

fav512 = make_favicon_canvas(512, 0.05)
fav192 = make_favicon_canvas(192, 0.05)
fav180 = make_favicon_canvas(180, 0.05)
fav48 = make_favicon_canvas(48, 0.03)
fav32 = make_favicon_canvas(32, 0.02)
fav16 = make_favicon_canvas(16, 0.01)

fav512.save(r"c:\Users\User\Desktop\agencyweb\favicon-512x512.png")
fav192.save(r"c:\Users\User\Desktop\agencyweb\favicon-192x192.png")
fav180.save(r"c:\Users\User\Desktop\agencyweb\apple-touch-icon.png")
fav48.save(r"c:\Users\User\Desktop\agencyweb\favicon-48x48.png")
fav32.save(r"c:\Users\User\Desktop\agencyweb\favicon-32x32.png")
fav16.save(r"c:\Users\User\Desktop\agencyweb\favicon-16x16.png")
fav32.save(r"c:\Users\User\Desktop\agencyweb\favicon.png")

# Save multi-size favicon.ico
fav48.save(
    r"c:\Users\User\Desktop\agencyweb\favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)]
)

# 5. Generate SVG Favicon
with open(r"c:\Users\User\Desktop\agencyweb\logo-transparent.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode("ascii")

svg_data = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.8"/>
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#00D2B4" flood-opacity="0.35"/>
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64}" x="16" y="211" width="480" height="90" filter="url(#shadow)"/>
</svg>"""

with open(r"c:\Users\User\Desktop\agencyweb\favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_data)

print("All favicons generated successfully!")
