// make-icons.mjs
import sharp from "sharp";
import fs from "fs";
import { Buffer } from "buffer";

const INK = "#E9A23F"; // Colors.dark.accent
const BG = "#0E141A"; // Colors.dark.background

const BARE_RN = false; // set true to also generate res/mipmap-* folders

// TallyMarks math, with size = 100 as the design unit
const S = 100;
const bw = Math.max(2, Math.round(S * 0.13)); // 13
const gap = Math.max(2, Math.round(S * 0.15)); // 15
const gw = bw * 4 + gap * 3; // 97

const strokes = [0, 1, 2, 3]
  .map((i) => {
    const x = i * (bw + gap);
    const rot = i % 2 === 0 ? -1.5 : 1;
    return `<rect x="${x}" y="0" width="${bw}" height="${S}" rx="${bw / 2}"
    transform="rotate(${rot} ${x + bw / 2} ${S / 2})"/>`;
  })
  .join("");

const dw = gw + 4;
const diagonal = `<rect x="-2" y="${S / 2 - bw / 2}" width="${dw}" height="${bw}" rx="${bw / 2}"
  transform="rotate(-34 ${-2 + dw / 2} ${S / 2})"/>`;

// Center the group on a 1024 canvas at ~57% of its width (inside the 66% safe zone)
const scale = 6;
const tx = 512 - (gw / 2) * scale;
const ty = 512 - (S / 2) * scale;

const art = (
  bg,
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  ${bg ? `<rect width="1024" height="1024" fill="${bg}"/>` : ""}
  <g fill="${INK}" transform="translate(${tx} ${ty}) scale(${scale})">${strokes}${diagonal}</g>
</svg>`;

const render = (svg, px, out) =>
  sharp(Buffer.from(svg), { density: 300 }).resize(px, px).png().toFile(out);

fs.mkdirSync("assets", { recursive: true });

// Expo / general assets
await render(art(BG), 1024, "assets/icon.png");
await render(art(null), 1024, "assets/adaptive-foreground.png");
await render(art(BG), 512, "assets/playstore.png");

// Bare React Native density folders
if (BARE_RN) {
  const sizes = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [d, px] of Object.entries(sizes)) {
    fs.mkdirSync(`res/mipmap-${d}`, { recursive: true });
    await render(art(BG), px, `res/mipmap-${d}/ic_launcher.png`);
  }
}

console.log("Done.");
