import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BRAND = '#0057ff';
const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const source = await readFile(new URL('icon.svg', `file://${publicDir}`));
const squareSource = Buffer.from(source.toString().replace(/ rx="\d+"/, ' rx="0"'));

const outputs = [
  { file: 'pwa-192x192.png', input: source, size: 192 },
  { file: 'pwa-512x512.png', input: source, size: 512 },
  { file: 'maskable-icon-512x512.png', input: squareSource, size: 512, flatten: true },
  { file: 'apple-touch-icon-180x180.png', input: source, size: 180, flatten: true },
];

await Promise.all(
  outputs.map(({ file, input, size, flatten }) => {
    let image = sharp(input, { density: 384 }).resize(size, size);
    if (flatten) image = image.flatten({ background: BRAND });
    return image.png().toFile(`${publicDir}${file}`);
  }),
);
