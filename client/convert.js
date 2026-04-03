import fs from 'fs';
import path from 'path';

const INPUT = './public/assets/tile_list_v1.7';
const OUTPUT = './public/assets/dungeon_atlas.json';
const IMAGE_NAME = 'dungeon_atlas.png';

const text = fs.readFileSync(INPUT, 'utf8');

const lines = text
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean);

const frames = [];

let maxX = 0;
let maxY = 0;

for (const line of lines) {
  const parts = line.split(/\s+/);

  if (parts.length !== 5) {
    console.warn('Skipping malformed line:', line);
    continue;
  }

  let [name, x, y, w, h] = parts;

  x = Number(x);
  y = Number(y);
  w = Number(w);
  h = Number(h);

  maxX = Math.max(maxX, x + w);
  maxY = Math.max(maxY, y + h);

  if (!name.endsWith('.png')) {
    name = `${name}.png`;
  }

  frames.push({
    filename: name,
    rotated: false,
    trimmed: false,

    sourceSize: {
      w,
      h,
    },

    spriteSourceSize: {
      x: 0,
      y: 0,
      w,
      h,
    },

    frame: {
      x,
      y,
      w,
      h,
    },
  });
}

const json = {
  textures: [
    {
      image: IMAGE_NAME,
      format: 'RGBA8888',

      size: {
        w: maxX,
        h: maxY,
      },

      scale: 1,
      frames,
    },
  ],
};

fs.writeFileSync(OUTPUT, JSON.stringify(json, null, 2));

console.log('Atlas JSON generated successfully!');
console.log('Frames:', frames.length);
console.log('Atlas size:', maxX, 'x', maxY);
