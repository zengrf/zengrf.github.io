#!/usr/bin/env python3
"""Package approved image-generation PNGs as website materials.

Usage: python3 scripts/prepare_materials.py /path/to/approved-png-directory
Requires Pillow. Input filenames are the IDs in materials-photo-prompts.json.
Only crops repeat bounds, resizes, rotates grain, packs a repeat strip,
and encodes WebP. It does not synthesize or retouch the generated photographs.
"""
from pathlib import Path
import argparse
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
args = parser.parse_args()
destination = Path(__file__).resolve().parents[1] / "assets/img/materials"
destination.mkdir(parents=True, exist_ok=True)


def save(name, picture, width=None):
    if width and picture.width > width:
        picture = picture.resize(
            (width, round(picture.height * width / picture.width)),
            Image.Resampling.LANCZOS,
        )
    target = destination / (name + ".webp")
    picture.save(target, "WEBP", quality=93, method=6, exact=True)
    print(f"{target.name}: {picture.width} x {picture.height}, {target.stat().st_size:,} bytes")


for name in ["ceramic-roof", "ceramic-roof-lotus"]:
    picture = Image.open(args.source / (name + ".png")).convert("RGBA")
    # One straight photographic barrel, bounded by the two trough midpoints.
    # These are the repeat bounds of the approved 1254px image, not a geometric
    # warp. The same module repeats with no fanning or cumulative angle drift.
    if picture.size != (1254, 1254):
        raise ValueError(f"{name}: check repeat bounds for new source dimensions")
    picture = picture.crop((250, 200, 1000, 1124))
    save(name, picture, 512)

# A complete asanoha row, cropped through matching vertical wooden struts.
# Repeating one cell keeps every angle and pitch constant; no mirrored grain
# or perspective correction. Preserve the transparent openings and bevels.
picture = Image.open(args.source / "asanoha-kumiko.png").convert("RGBA")
if picture.size != (2172, 724):
    raise ValueError("asanoha-kumiko: check repeat bounds for new source dimensions")
save("asanoha-kumiko", picture.crop((386, 14, 1125, 470)), 600)

picture = Image.open(args.source / "washi-fiber.png").convert("RGB")
if picture.size != (1254, 1254):
    raise ValueError("washi-fiber: check repeat bounds for new source dimensions")
# The exposure-balanced photograph still has an outer-edge color drift.
# These measured repeat bounds keep opposing edge tones within the normal
# variation of the fine fibers, on both axes. No blur or mirrored grain.
# CSS maps the 1012px crop to 349px, preserving the previous fiber scale.
save("washi-fiber", picture.crop((224, 233, 1236, 1245)))

for name in ["silk-shippou", "silk-meander", "gold-leaf"]:
    # The silk repeat is 256 CSS pixels; 768 retains detail through DPR 3.
    save(name, Image.open(args.source / (name + ".png")).convert("RGB"), 768 if name.startswith("silk-") else 1254)

for name in ["urushi-black", "urushi-vermilion"]:
    picture = Image.open(args.source / (name + ".png")).convert("RGB")
    save(name, picture)
    save(name + "-v", picture.transpose(Image.Transpose.ROTATE_90))
    if name == "urushi-black":
        if picture.size != (2048, 768):
            raise ValueError("urushi-black-column: check repeat bounds for new source dimensions")
        # A quiet continuous portion of the same photograph, with matching
        # exposure at the repeat ends. CSS supplies the column's window light.
        save("urushi-black-column", picture.transpose(Image.Transpose.ROTATE_90).crop((0, 16, 768, 972)))

picture = Image.open(args.source / "gilt-flower.png").convert("RGBA")
bounds = picture.getchannel("A").point(lambda x: 255 if x > 10 else 0).getbbox()
picture = picture.crop((max(0, bounds[0] - 4), max(0, bounds[1] - 4),
                        min(picture.width, bounds[2] + 4), min(picture.height, bounds[3] + 4)))
save("gilt-flower", picture, 512)
# Four source pixels per CSS pixel. The fitting is 16px tall, centered in
# a 190 x 18px repeat cell. Its silhouette and alpha are unmodified.
height = 64
fitting = picture.resize((round(picture.width * height / picture.height), height), Image.Resampling.LANCZOS)
strip = Image.new("RGBA", (760, 72))
strip.alpha_composite(fitting, ((strip.width - fitting.width) // 2, (strip.height - height) // 2))
save("gilt-flower-repeat", strip)

# A photographed dougong support, cropped to its generated alpha bounds.
# Pack it at 4x screen resolution, one support per three 60px-high roof bays.
picture = Image.open(args.source / "dougong-vermilion.png").convert("RGBA")
bounds = picture.getchannel("A").point(lambda x: 255 if x > 10 else 0).getbbox()
picture = picture.crop((max(0, bounds[0] - 4), max(0, bounds[1] - 4),
                        min(picture.width, bounds[2] + 4), min(picture.height, bounds[3] + 4)))
save("dougong-vermilion", picture, 512)
height = 80
bracket = picture.resize((round(picture.width * height / picture.height), height), Image.Resampling.LANCZOS)
strip = Image.new("RGBA", (584, 80))
strip.alpha_composite(bracket, ((strip.width - bracket.width) // 2, 0))
save("dougong-vermilion-repeat", strip)
