import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

mkdirSync('public/icons', { recursive: true })

// Brand-consistent, font-free mark: navy plate, white sign/card with a green
// "pass" check, amber dashed road. Content sits within the maskable safe zone.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#16202e"/>
  <g fill="#f5a31a">
    <rect x="150" y="396" width="46" height="15" rx="7.5"/>
    <rect x="233" y="396" width="46" height="15" rx="7.5"/>
    <rect x="316" y="396" width="46" height="15" rx="7.5"/>
  </g>
  <rect x="131" y="118" width="250" height="208" rx="30" fill="#ffffff"/>
  <path d="M193 224 l36 36 l90 -98" fill="none" stroke="#11a14a" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`

const buf = Buffer.from(svg)
const out = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-512-maskable.png', 512],
  ['public/icons/apple-touch-icon-180.png', 180],
]
for (const [file, size] of out) {
  await sharp(buf).resize(size, size).png().toFile(file)
  console.log('wrote', file)
}
