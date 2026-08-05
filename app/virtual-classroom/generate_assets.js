const fs = require('fs');
const path = require('path');
const assetsDir = path.join(__dirname, 'assets');
const mapsDir = path.join(__dirname, 'maps');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);
if (!fs.existsSync(mapsDir)) fs.mkdirSync(mapsDir);

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = ((c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1) >>> 0;
        }
        table[i] = c;
    }
    return table;
})();

function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
        crc = (CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function makePNG(width, height, pixels) {
    const chunks = [];
    function chunk(type, data) {
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length, 0);
        const typeBuf = Buffer.from(type);
        const crc = Buffer.alloc(4);
        const crcData = Buffer.concat([typeBuf, data]);
        crc.writeUInt32BE(crc32(crcData), 0);
        chunks.push(Buffer.concat([length, typeBuf, data, crc]));
    }
    const header = Buffer.from('\x89PNG\r\n\x1a\n', 'binary');
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.writeUInt8(8, 8); // bit depth
    ihdr.writeUInt8(6, 9); // RGBA
    ihdr.writeUInt8(0, 10);
    ihdr.writeUInt8(0, 11);
    ihdr.writeUInt8(0, 12);
    chunk('IHDR', ihdr);
    const raw = Buffer.concat(pixels.map(row => Buffer.concat([Buffer.from([0]), row])));
    const compressed = require('zlib').deflateSync(raw);
    chunk('IDAT', compressed);
    chunk('IEND', Buffer.alloc(0));
    return Buffer.concat([header, ...chunks]);
}

function colorTile(color) {
    return Buffer.from(Array(32 * 4).fill(0).map((_, idx) => color[idx % 4]));
}

const colors = [
    [187, 222, 251, 255],
    [100, 116, 139, 255],
    [251, 191, 36, 255],
    [34, 197, 94, 255],
    [168, 85, 247, 255],
    [14, 165, 233, 255],
    [251, 146, 60, 255],
    [148, 163, 184, 255]
];
const width = 128;
const height = 64;
const pixels = [];
for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(width * 4);
    const tileRow = Math.floor(y / 32);
    for (let x = 0; x < width; x++) {
        const tileCol = Math.floor(x / 32);
        const color = colors[tileRow * 4 + tileCol];
        const pos = x * 4;
        row[pos] = color[0];
        row[pos + 1] = color[1];
        row[pos + 2] = color[2];
        row[pos + 3] = color[3];
    }
    pixels.push(row);
}
fs.writeFileSync(path.join(assetsDir, 'tileset.png'), makePNG(width, height, pixels));

const spriteWidth = 96;
const spriteHeight = 32;
const spritePixels = [];
for (let y = 0; y < spriteHeight; y++) {
    const row = Buffer.alloc(spriteWidth * 4);
    for (let x = 0; x < spriteWidth; x++) {
        const frame = Math.floor(x / 32);
        if (x % 32 >= 6 && x % 32 <= 25 && y >= 4 && y <= 24) {
            row[x * 4] = 236;
            row[x * 4 + 1] = 72;
            row[x * 4 + 2] = 153;
            row[x * 4 + 3] = 255;
        } else {
            row[x * 4] = 0;
            row[x * 4 + 1] = 0;
            row[x * 4 + 2] = 0;
            row[x * 4 + 3] = 0;
        }
    }
    spritePixels.push(row);
}
fs.writeFileSync(path.join(assetsDir, 'player.png'), makePNG(spriteWidth, spriteHeight, spritePixels));

const classroomJson = {
    height: 8,
    width: 12,
    tileheight: 32,
    tilewidth: 32,
    layers: [
        {
            data: [
                2,2,2,2,2,2,2,2,2,2,2,2,
                2,1,1,4,4,1,1,4,4,1,1,2,
                2,1,1,4,4,1,1,4,4,1,1,2,
                2,1,1,1,1,5,5,5,1,1,1,2,
                2,1,1,6,6,6,6,6,1,1,1,2,
                2,1,1,7,1,1,1,1,7,1,1,2,
                2,1,1,1,1,1,1,1,1,1,1,2,
                2,2,2,2,2,2,2,2,2,2,2,2
            ],
            height: 8,
            id: 1,
            name: 'Ground',
            opacity: 1,
            type: 'tilelayer',
            visible: true,
            width: 12,
            x: 0,
            y: 0
        },
        {
            draworder: 'topdown',
            id: 2,
            name: 'Objects',
            objects: [
                {id: 1, name: 'playerStart', type: 'start', x: 64, y: 64, width: 32, height: 32, properties: []},
                {id: 2, name: 'teacher', type: 'npc', x: 160, y: 96, width: 32, height: 32, properties: [{name: 'dialog', type: 'string', value: 'Hello! Welcome to the virtual classroom. Use arrows or WASD to walk.'}]},
                {id: 3, name: 'board', type: 'sign', x: 160, y: 128, width: 32, height: 32, properties: [{name: 'dialog', type: 'string', value: "Today’s lesson is about map design and sprite movement."}]},
                {id: 4, name: 'door', type: 'door', x: 320, y: 160, width: 32, height: 32, properties: [{name: 'scene', type: 'string', value: 'hallway'}]}
            ],
            opacity: 1,
            type: 'objectgroup',
            visible: true,
            x: 0,
            y: 0
        }
    ],
    nextlayerid: 3,
    nextobjectid: 5,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tilesets: [
        {
            columns: 4,
            firstgid: 1,
            grid: {height: 1, width: 1},
            image: '../assets/tileset.png',
            imageheight: 64,
            imagewidth: 128,
            margin: 0,
            name: 'classroom_tiles',
            spacing: 0,
            tilecount: 8,
            tileheight: 32,
            tilewidth: 32
        }
    ],
    version: 1.8,
    tiledversion: '1.9.2',
    type: 'map'
};
fs.writeFileSync(path.join(mapsDir, 'classroom.json'), JSON.stringify(classroomJson, null, 4), 'utf-8');
console.log('Created assets and classroom JSON files.');
