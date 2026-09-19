// Turns the painted source art in art/facade/ into the small, tileable
// web assets the facade uses. Run with `npm run facade:assets` after replacing
// any of the sources. Brick-bearing outputs are sized so that one brick
// course is COURSE CSS pixels at 2x device pixel ratio. The display sizes
// are written to src/styles/facade-sizes.css, which Facade.astro and
// globals.css read, so the assets stay the single source of truth.
import sharp from "sharp";

const SRC = "art/facade";
const OUT = "public/facade";
const COURSE = 9; // CSS px per brick course
const CANAL_H = 140; // CSS px, height of the canal band
const DPR = 2;

/** Make a horizontal strip tileable by cross-fading its right end into its
 *  left end over F source pixels. Returns raw RGBA of width W - F. */
async function tileable(input, F) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const L = W - F;
  const out = Buffer.alloc(L * info.height * 4);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < L; x++) {
      const src = (y * W + x) * 4;
      const dst = (y * L + x) * 4;
      if (x < F) {
        const t = x / F; // 0 → wrapped pixel, 1 → own pixel
        const wrap = (y * W + L + x) * 4;
        for (let c = 0; c < 4; c++)
          out[dst + c] = Math.round(
            data[wrap + c] * (1 - t) + data[src + c] * t,
          );
      } else {
        out.set(data.subarray(src, src + 4), dst);
      }
    }
  }
  return sharp(out, { raw: { width: L, height: info.height, channels: 4 } });
}

const sizes = {};
const extra = {};
async function emit(name, pipeline, displayW, displayH, quality = 84) {
  await pipeline.webp({ quality }).toFile(`${OUT}/${name}.webp`);
  sizes[name] = [displayW, displayH];
}

// Brick tile: 16 whole courses between the mortar lines at y=2 and y=1190, so
// the crop repeats vertically; it already repeats horizontally.
{
  const pitch = (1190 - 2) / 16;
  const s = COURSE / pitch;
  await emit(
    "brick",
    sharp(`${SRC}/brick.png`)
      .extract({ left: 0, top: 2, width: 1254, height: 1188 })
      .resize({ width: Math.round(1254 * s * DPR), height: 16 * COURSE * DPR }),
    1254 * s,
    16 * COURSE,
  );
}

// Roofline cap: a 1880px span starting and ending in a plain low section,
// with the wrap-around seam cross-faded.
{
  const x0 = 40,
    L = 1880,
    F = 120;
  const s = COURSE / ((700 - 456) / 5);
  extra["cap-mortar"] = `${(700 * s).toFixed(1)}px`; // lowest mortar line
  const cropped = await sharp(`${SRC}/cap.png`)
    .extract({ left: x0, top: 0, width: L + F, height: 724 })
    .toBuffer();
  await emit(
    "cap",
    (await tileable(cropped, F)).resize({ width: Math.round(L * s * DPR) }),
    L * s,
    724 * s,
  );
}

// Base strip: plinth and hedge. Cropped at the top mortar line.
{
  const top = 330,
    F = 120;
  const s = COURSE / ((516 - 333) / 4);
  const cropped = await sharp(`${SRC}/base.png`)
    .extract({ left: 0, top, width: 2172, height: 724 - top })
    .toBuffer();
  await emit(
    "base",
    (await tileable(cropped, F)).resize({
      width: Math.round((2172 - F) * s * DPR),
    }),
    (2172 - F) * s,
    (724 - top) * s,
  );
}

// Canal: the quay edge from the painting, and beneath it water that reflects
// what actually stands at the water's edge (quay wall, hedge, plinth, brick),
// mirrored, rippled, smeared and tinted with the painting's water colour.
{
  const SCALE = 1.5; // output pixels per CSS px
  const h = CANAL_H;
  const quayH = Math.round(20 * SCALE);
  const H = Math.round(h * SCALE);
  const waterH = H - quayH;

  const raw = async (pipeline) => {
    const { data, info } = await pipeline
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height };
  };
  // quay coping and wall (source rows 163..204), tileable, quayH tall
  const quaySrc = await sharp(`${SRC}/canal.png`)
    .extract({ left: 0, top: 163, width: 2172, height: 41 })
    .toBuffer();
  const quay = await raw(
    (await tileable(quaySrc, 100)).resize({ height: quayH }),
  );
  const W = quay.w;
  // pieces of the scene above the water, at widths that tile W exactly
  const wallSrc = await sharp(`${SRC}/canal.png`)
    .extract({ left: 0, top: 175, width: 2172, height: 28 })
    .toBuffer();
  const wall = await raw(
    (await tileable(wallSrc, 100))
      .resize({ width: W, height: Math.round(13 * SCALE) })
      .flip(),
  );
  const base = await raw(
    sharp(`${OUT}/base.webp`)
      .resize({ width: Math.round(W / 3) })
      .flip(),
  );
  const brick = await raw(
    sharp(`${OUT}/brick.webp`)
      .resize({ width: Math.round(W / 7) })
      .flip(),
  );

  // Two scenes: what stands above the water where the building is (quay
  // wall, hedge, brick), and where only sky is (beside the bay on narrow
  // viewports, where the wings are hidden).
  const scene = Buffer.alloc(W * waterH * 4);
  const skyScene = Buffer.alloc(W * waterH * 4);
  const put = (piece, y0, rows, target = scene) => {
    for (let y = 0; y < rows && y0 + y < waterH; y++)
      for (let x = 0; x < W; x++) {
        const si = ((y % piece.h) * piece.w + (x % piece.w)) * 4;
        const di = ((y0 + y) * W + x) * 4;
        target[di] = piece.data[si];
        target[di + 1] = piece.data[si + 1];
        target[di + 2] = piece.data[si + 2];
        target[di + 3] = 255;
      }
  };
  put(wall, 0, wall.h);
  put(base, wall.h, base.h);
  put(brick, wall.h + base.h, waterH);
  // Under the recessed wings only the quay wall and brick show in the water.
  const wingScene = Buffer.alloc(W * waterH * 4);
  put(wall, 0, wall.h, wingScene);
  put(brick, wall.h, waterH, wingScene);
  scene.copy(skyScene, 0, 0, W * wall.h * 4);
  const sky = [226, 204, 178];
  for (let i = W * wall.h * 4; i < skyScene.length; i += 4) {
    skyScene[i] = sky[0];
    skyScene[i + 1] = sky[1];
    skyScene[i + 2] = sky[2];
    skyScene[i + 3] = 255;
  }

  // ripple (horizontal displacement growing with depth), vertical smear, tint
  const water = [111, 112, 94]; // sampled from the painting
  const ripple = (scene) => {
    const out = Buffer.alloc(W * waterH * 4);
    const px = (x, y) => (((y + waterH) % waterH) * W + ((x + W) % W)) * 4;
    for (let y = 0; y < waterH; y++) {
      const depth = y / waterH;
      const dx = Math.round(
        (2 + 5 * depth) * Math.sin(y / 3.1) +
          (1 + 3 * depth) * Math.sin(y / 7.7 + 1.3),
      );
      const smear = 1 + Math.round(3 * depth);
      const t = 0.32 + 0.4 * depth; // how much water colour
      const dark = 0.9 - 0.25 * depth;
      for (let x = 0; x < W; x++) {
        const acc = [0, 0, 0];
        for (let k = -smear; k <= smear; k++) {
          const i = px(x + dx, y + k);
          acc[0] += scene[i];
          acc[1] += scene[i + 1];
          acc[2] += scene[i + 2];
        }
        const n = 2 * smear + 1;
        const o = (y * W + x) * 4;
        for (let c = 0; c < 3; c++)
          out[o + c] = Math.round(
            ((acc[c] / n) * (1 - t) + water[c] * t) * dark,
          );
        out[o + 3] = 255;
      }
    }
    return out;
  };
  const quayPng = await sharp(quay.data, {
    raw: { width: W, height: quayH, channels: 4 },
  })
    .png()
    .toBuffer();
  for (const [name, sc] of [
    ["canal", scene],
    ["canal-sky", skyScene],
    ["canal-wings", wingScene],
  ]) {
    const waterPng = await sharp(ripple(sc), {
      raw: { width: W, height: waterH, channels: 4 },
    })
      .png()
      .toBuffer();
    await emit(
      name,
      sharp({
        create: { width: W, height: H, channels: 4, background: "#000" },
      }).composite([
        { input: waterPng, top: quayH, left: 0 },
        { input: quayPng, top: 0, left: 0 },
      ]),
      W / SCALE,
      h,
      80,
    );
  }
}

// Parapet for the top of the bay: spans the bay width (840 CSS px), which
// happens to put its bricks at nearly the tile's scale. The bay's box starts
// at the main coping line (source row 340).
{
  const top = 103,
    w = 840;
  extra["baytop-coping"] = ((340 - top) / (724 - top)).toFixed(4);
  await emit(
    "baytop",
    sharp(`${SRC}/baytop.png`)
      .extract({ left: 0, top, width: 2172, height: 724 - top })
      .resize({ width: Math.round(w * 1.5) }), // 1.5x is plenty for soft brick
    w,
    ((724 - top) / 2172) * w,
    72,
  );
}

// Window unit: crop to the opaque bounds, 104 CSS px wide on screen.
{
  const w = 104;
  await emit(
    "window",
    sharp(`${SRC}/window.png`)
      .extract({ left: 45, top: 52, width: 684, height: 1903 })
      .resize({ width: w * DPR }),
    w,
    (1903 / 684) * w,
  );
}

// Nameplate: crop to the opaque bounds, 270 CSS px wide on screen.
{
  const w = 270;
  await emit(
    "plaque",
    sharp(`${SRC}/plaque.png`)
      .extract({ left: 36, top: 145, width: 1703, height: 594 })
      .resize({ width: w * DPR }),
    w,
    (594 / 1703) * w,
  );
}

// Quoin strip for the building's outer edges: four block pairs between two
// joints, so it tiles vertically; 32 CSS px wide. Flipped so the shadow
// falls towards the brick when placed at the outer end of a wing.
{
  const w = 32;
  const s = w / 203;
  await emit(
    "edge",
    sharp(`${SRC}/edge.png`)
      .extract({ left: 266, top: 302, width: 203, height: 1507 })
      .flop()
      .resize({ width: w * DPR }),
    w,
    1507 * s,
  );
}

// Distant skyline: 150 CSS px tall, tileable.
{
  const top = 278,
    F = 150,
    h = 150;
  const cropped = await sharp(`${SRC}/skyline.png`)
    .extract({ left: 0, top, width: 2172, height: 724 - top })
    .toBuffer();
  const s = h / (724 - top);
  await emit(
    "skyline",
    (await tileable(cropped, F)).resize({ height: h * DPR }),
    (2172 - F) * s,
    h,
  );
}

const vars = { course: COURSE, canal: `${CANAL_H}px` };
for (const [name, [w, h]] of Object.entries(sizes)) {
  const m = await sharp(`${OUT}/${name}.webp`).metadata();
  const kb = (
    (await sharp(`${OUT}/${name}.webp`).toBuffer()).length / 1024
  ).toFixed(0);
  console.log(
    `${name.padEnd(8)} ${m.width}x${m.height}px  ${kb} KB  display ${w.toFixed(1)}x${h.toFixed(1)}`,
  );
  vars[`${name}-w`] = `${w.toFixed(1)}px`;
  vars[`${name}-h`] = `${h.toFixed(1)}px`;
  vars[`${name}-aspect`] = (w / h).toFixed(4);
}
Object.assign(vars, extra);
const css =
  "/* Generated by scripts/facade-assets.mjs from the facade art. Do not edit. */\n:root {\n" +
  Object.entries(vars)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n") +
  "\n}\n";
await import("node:fs/promises").then((fs) =>
  fs.writeFile("src/styles/facade-sizes.css", css),
);
console.log("wrote src/styles/facade-sizes.css");
