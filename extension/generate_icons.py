import os
from PIL import Image, ImageDraw

icons_dir = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(icons_dir, exist_ok=True)

sizes = [16, 48, 128]

for size in sizes:
    img = Image.new("RGBA", (size, size), (13, 17, 23, 255))
    draw = ImageDraw.Draw(img)
    
    # Outer glowing circle/shield border
    margin = int(size * 0.1)
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        outline=(0, 229, 255, 255),
        width=max(1, int(size * 0.08))
    )
    
    # Shield shape fill
    cx, cy = size // 2, size // 2
    r = size // 4
    draw.polygon(
        [
            (cx, cy - r),
            (cx + r, cy - r // 2),
            (cx + r, cy + r // 2),
            (cx, cy + r + 2),
            (cx - r, cy + r // 2),
            (cx - r, cy - r // 2)
        ],
        fill=(0, 229, 255, 200)
    )
    
    # Save PNG
    out_path = os.path.join(icons_dir, f"icon{size}.png")
    img.save(out_path, "PNG")
    print(f"Generated {out_path}")
