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
// with the wrap-around seam cross-faded. The painting ends on a soldier
// course, so the wall's brick continues from its bottom edge.
{
  const x0 = 40,
    L = 1880,
    F = 120,
    H = 456;
  const s = COURSE / 48.8; // brick course pitch in the painting
  extra["cap-coping"] = `${(304 * s).toFixed(1)}px`; // top of the plain coping
  const cropped = await sharp(`${SRC}/cap.png`)
    .extract({ left: x0, top: 0, width: L + F, height: H })
    .toBuffer();
  await emit(
    "cap",
    (await tileable(cropped, F)).resize({ width: Math.round(L * s * DPR) }),
    L * s,
    H * s,
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

// The water's ripple: how far to the right, in CSS px, the reflection at
// `yCss` px down the canal band samples from (so an edge appears that far to
// the left). The water begins under the quay coping. Everything reflected -
// the tiles, the quoin and pilaster strips, and the reflection layers' edges
// (as a clip-path) - is bent with this one function so they wave together.
const WATER_TOP = 20; // CSS px, the quay coping in the canal tile
const RIPPLE_SCALE = 1.5; // canal tile output pixels per CSS px
const rippleDx = (yCss) => {
  const y = (yCss - WATER_TOP) * RIPPLE_SCALE;
  const depth = y / ((CANAL_H - WATER_TOP) * RIPPLE_SCALE);
  return (
    ((2 + 5 * depth) * Math.sin(y / 3.1) +
      (1 + 3 * depth) * Math.sin(y / 7.7 + 1.3)) /
    RIPPLE_SCALE
  );
};
// Bend a reflection strip (PNG at DPR px) whose top sits `topCss` px down
// the canal band.
async function rippled(png, topCss) {
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const dx = Math.round(rippleDx(topCss + y / DPR) * DPR);
    for (let x = 0; x < w; x++) {
      const sx = x + dx;
      if (sx >= 0 && sx < w)
        data.copy(out, (y * w + x) * 4, (y * w + sx) * 4, (y * w + sx + 1) * 4);
    }
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } });
}
// The reflection layers are RIPPLE_INSET wider than what they reflect on
// each side, so the clip can wave outward as well as in.
const RIPPLE_INSET = 8;
{
  const pts = [];
  for (let y = WATER_TOP; y <= CANAL_H; y += 2) pts.push(y);
  const right = pts.map(
    (y) => `calc(100% - ${(RIPPLE_INSET + rippleDx(y)).toFixed(1)}px) ${y}px`,
  );
  const left = pts
    .reverse()
    .map((y) => `${(RIPPLE_INSET - rippleDx(y)).toFixed(1)}px ${y}px`);
  extra["ripple-inset"] = `${RIPPLE_INSET}px`;
  extra["water-ripple"] =
    `polygon(${RIPPLE_INSET}px 0, calc(100% - ${RIPPLE_INSET}px) 0, ${right.join(", ")}, ${left.join(", ")})`;
}

// Canal: the quay edge from the painting, and beneath it water that reflects
// what actually stands at the water's edge (quay wall, hedge, plinth, brick),
// mirrored, rippled, smeared and tinted with the painting's water colour.
{
  const SCALE = RIPPLE_SCALE; // output pixels per CSS px
  const h = CANAL_H;
  const quayH = Math.round(WATER_TOP * SCALE);
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
  // The plinth's reflection is smaller than the plinth; the bay's pilaster
  // reflections are placed by this ratio.
  extra["plinth-reflection-scale"] = (base.h / SCALE / sizes.base[1]).toFixed(
    3,
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
      const dx = Math.round(rippleDx(WATER_TOP + y / SCALE) * SCALE);
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
// just inside the plain coping (its top is source row 310, so the stone
// always overlaps the brick); the finial begins at row 72.
{
  const top = 72,
    w = 840;
  extra["baytop-coping"] = ((322 - top) / (724 - top)).toFixed(4);
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

// Pilaster strip for the building's outer edges: two pairs of plain and
// fluted blocks between matching bands, so it tiles vertically; 32 CSS px
// wide. It is symmetric, so it serves both corners as is.
const EDGE_CROP = { left: 312, top: 273, width: 169, height: 801 };
{
  const w = 32;
  await emit(
    "edge",
    sharp(`${SRC}/edge.png`)
      .extract(EDGE_CROP)
      .resize({ width: w * DPR }),
    w,
    (EDGE_CROP.height * w) / EDGE_CROP.width,
  );
}

// The quoin strip as seen in the canal: mirrored, softened and tinted with
// the water colour, keeping its transparency.
{
  const w = 32;
  const strip = await sharp(`${SRC}/edge.png`)
    .extract(EDGE_CROP)
    .flip()
    .resize({ width: w * DPR })
    .blur(0.8)
    .modulate({ brightness: 0.8, saturation: 0.75 })
    .png()
    .toBuffer();
  const { width, height } = await sharp(strip).metadata();
  const tinted = await sharp(strip)
    .composite([
      {
        input: {
          create: {
            width,
            height,
            channels: 4,
            background: { r: 111, g: 112, b: 94, alpha: 0.45 },
          },
        },
        blend: "atop",
      },
    ])
    .png()
    .toBuffer();
  // Starts below the quay wall's reflection (--quay-h + --quay-wall).
  await emit(
    "edge-reflection",
    await rippled(tinted, WATER_TOP + 13),
    w,
    (EDGE_CROP.height * w) / EDGE_CROP.width,
  );
}

// Provisional pilasters for the bay's sides: eight courses of each of the
// parapet's outer pilasters (mortar-aligned, so they tile). Each side is
// cropped from its own pilaster so the lighting stays consistent: the
// right one's chamfer is in shadow. To be replaced by painted strips in
// the wall's brick colour.
{
  const width = 144,
    top = 506,
    height = 217;
  const scale = (840 * 1.5) / 2172; // same pixel scale as the parapet
  extra["bay-pilaster-frac"] = (width / 2172).toFixed(4);
  for (const [name, left] of [
    ["bay-pilaster-l", 0],
    ["bay-pilaster-r", 2172 - width],
  ]) {
    await emit(
      name,
      sharp(`${SRC}/baytop.png`)
        .extract({ left, top, width, height })
        .resize({ width: Math.round(width * scale) }),
      (width * 840) / 2172,
      (height * 840) / 2172,
      76,
    );
  }
}

// The bay's pilasters as seen in the canal: three courses of tiles stacked
// so one image spans the water at any bay width, then mirrored, softened
// and tinted like the quoins' reflection.
{
  const width = 144,
    top = 506,
    height = 217;
  const scale = (840 * 1.5) / 2172;
  for (const [name, left] of [
    ["bay-pilaster-l-reflection", 0],
    ["bay-pilaster-r-reflection", 2172 - width],
  ]) {
    const tile = await sharp(`${SRC}/baytop.png`)
      .extract({ left, top, width, height })
      .png()
      .toBuffer();
    const stacked = await sharp({
      create: { width, height: height * 3, channels: 4, background: "#0000" },
    })
      .composite(
        [0, 1, 2].map((i) => ({ input: tile, top: i * height, left: 0 })),
      )
      .png()
      .toBuffer();
    const strip = await sharp(stacked)
      .flip()
      .resize({ width: Math.round(width * scale) })
      .blur(0.8)
      .modulate({ brightness: 0.8, saturation: 0.75 })
      .png()
      .toBuffer();
    const meta = await sharp(strip).metadata();
    const tinted = await sharp(strip)
      .composite([
        {
          input: {
            create: {
              width: meta.width,
              height: meta.height,
              channels: 4,
              background: { r: 111, g: 112, b: 94, alpha: 0.45 },
            },
          },
          blend: "atop",
        },
      ])
      .png()
      .toBuffer();
    // Bent for its place in the water at full bay width (see --pilaster-y).
    const depth =
      WATER_TOP + 13 + 44 * Number(extra["plinth-reflection-scale"]);
    await emit(
      name,
      await rippled(tinted, depth),
      (width * 840) / 2172,
      (height * 3 * 840) / 2172,
      76,
    );
  }
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
