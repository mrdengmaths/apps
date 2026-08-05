from pathlib import Path
import zlib
import struct

assets = Path('assets')
assets.mkdir(exist_ok=True)


def make_png(width, height, pixels):
    def chunk(tag, data):
        return struct.pack('!I', len(data)) + tag + data + struct.pack('!I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('!IIBBBBB', width, height, 8, 6, 0, 0, 0)
    raw = b''
    for row in pixels:
        raw += b'\x00' + row
    img = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')
    return img


def color_tile(color):
    r, g, b, a = color
    return bytes([r, g, b, a]) * 32

colors = [
    (187, 222, 251, 255),
    (100, 116, 139, 255),
    (251, 191, 36, 255),
    (34, 197, 94, 255),
    (168, 85, 247, 255),
    (14, 165, 233, 255),
    (251, 146, 60, 255),
    (148, 163, 184, 255),
]

# Create tileset 128x64 (4x2 tiles)
width = 128
height = 64
pixels = []
for y in range(height):
    row = b''
    tile_row = y // 32
    for x in range(width):
        tile_col = x // 32
        row += bytes(colors[tile_row * 4 + tile_col])
    pixels.append(row)
with open(assets / 'tileset.png', 'wb') as f:
    f.write(make_png(width, height, pixels))

# Create player sprite 96x32 (3 frames)
width = 96
height = 32
player_colors = [(236, 72, 153, 255), (79, 70, 229, 255), (248, 113, 113, 255)]
pixels = []
for y in range(height):
    row = b''
    for x in range(width):
        frame = x // 32
        if 6 <= x % 32 <= 25 and 4 <= y <= 24:
            row += bytes(player_colors[frame])
        else:
            row += b'\x00\x00\x00\x00'
    pixels.append(row)
with open(assets / 'player.png', 'wb') as f:
    f.write(make_png(width, height, pixels))

print('Generated placeholder assets in assets/')