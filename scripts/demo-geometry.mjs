#!/usr/bin/env node
/**
 * Generates the map geometry that the QCopilots demo draws: one country's first-level
 * administrative areas from the Natural Earth data that ships with QGIS (world_map.gpkg,
 * public domain), fitted to a small SVG viewBox and classed by area.
 *
 * Usage (Windows, from the repository root, with a QGIS 3.36+ install or package):
 *
 *   node scripts/demo-geometry.mjs ^
 *     --qgis-process "C:\...\bin\qgis_process-qgis-qt6.bat" ^
 *     --data "C:\...\apps\qgis-qt6\resources\data\world_map.gpkg" ^
 *     --admin Germany --mode equal --out src/components/demos/geometry/germany-states.ts
 *
 * The committed Germany module uses --mode equal, the classes of the recorded QCopilots run on
 * the product page: 5 equal intervals from 384.46 to 70,048.66 km², each 13,932.84 km² wide.
 *
 * Options
 *   --qgis-process  qgis_process launcher (.bat/.cmd or executable). Required.
 *   --data          world_map.gpkg. Read only. Required.
 *   --layer         Layer inside the GeoPackage. Default: states_provinces.
 *   --admin         Value of the `admin` field to keep. Default: Germany.
 *   --crs           Equal-area CRS for areas and drawing. Default: EPSG:3035.
 *   --tolerance     Coverage simplification tolerance in CRS units (metres). Default: 4000.
 *   --classes       Number of area classes. Default: 5.
 *   --mode          equal (equal interval, QGIS "Equal Interval": the range from the smallest
 *                   to the largest area cut into classes of the same width), quantile
 *                   (equal count, QGIS "Equal Count (Quantile)") or jenks (natural breaks).
 *                   Upper limits are inclusive in every mode, as in QGIS. Default: equal.
 *   --width         viewBox width. The height follows the shape. Default: 300.
 *   --pad           Padding inside the viewBox. Default: 6.
 *   --min-ring      Rings smaller than this many square viewBox units are dropped. Default: 4.
 *   --min-label     Areas below this many km² get no label (city states). Default: 1500.
 *   --work          Folder for intermediate files. Default: a temporary folder, removed after.
 *   --out           Module to write. Default: src/components/demos/geometry/germany-states.ts.
 *
 * QGIS processing chain (all native algorithms, run headless with JSON on stdin):
 *   native:extractbyattribute  admin = <admin>
 *   native:reprojectlayer      to <crs>
 *   native:fieldcalculator     area_km2 = area($geometry) / 1000000 (planar, equal-area CRS)
 *   native:coveragesimplify    shared borders stay shared, so no slivers between areas
 *   native:dissolve            country outline
 *   native:poleofinaccessibility  label anchors, from the unsimplified areas
 *
 * The output is formatted with Prettier when it is installed. Do not hand-edit the result.
 */
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const root = fileURLToPath(new URL('../', import.meta.url));
const { values: options } = parseArgs({
  options: {
    'qgis-process': { type: 'string' },
    data: { type: 'string' },
    layer: { type: 'string', default: 'states_provinces' },
    admin: { type: 'string', default: 'Germany' },
    crs: { type: 'string', default: 'EPSG:3035' },
    tolerance: { type: 'string', default: '4000' },
    classes: { type: 'string', default: '5' },
    mode: { type: 'string', default: 'equal' },
    width: { type: 'string', default: '300' },
    pad: { type: 'string', default: '6' },
    'min-ring': { type: 'string', default: '4' },
    'min-label': { type: 'string', default: '1500' },
    work: { type: 'string' },
    out: { type: 'string', default: 'src/components/demos/geometry/germany-states.ts' },
  },
});
const qgisProcess = options['qgis-process'];
if (!qgisProcess || !options.data) {
  console.error('Usage: node scripts/demo-geometry.mjs --qgis-process <launcher> --data <gpkg>');
  process.exit(2);
}
/** How each --mode is described in the generated module. */
const modes = {
  equal: 'equal interval as in QGIS',
  quantile: 'equal count (quantile) as in QGIS',
  jenks: 'natural breaks (Jenks)',
};
if (!Object.hasOwn(modes, options.mode)) throw new Error('--mode is equal, quantile or jenks');
const tolerance = Number(options.tolerance);
const classCount = Number(options.classes);
const width = Number(options.width);
const pad = Number(options.pad);
const minRing = Number(options['min-ring']);
const minLabel = Number(options['min-label']);

/** Runs one processing algorithm with its parameters as JSON on stdin and returns its results. */
function run(algorithm, inputs) {
  const args = ['--no-python', '--skip-loading-plugins', 'run', algorithm, '-'];
  // Batch launchers need cmd.exe. Node quotes nothing for the shell, so quote the path here.
  const batch = /\.(bat|cmd)$/i.test(qgisProcess);
  const child = batch
    ? spawn(`"${qgisProcess}" ${args.join(' ')}`, { shell: true, windowsHide: true })
    : spawn(qgisProcess, args, { windowsHide: true });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => (stdout += chunk));
  child.stderr.on('data', (chunk) => (stderr += chunk));
  child.stdin.end(JSON.stringify({ inputs }));
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => {
      const json = stdout.slice(stdout.indexOf('{'), stdout.lastIndexOf('}') + 1);
      try {
        const result = JSON.parse(json);
        if (code === 0 && result.results) return resolve(result.results);
      } catch {
        // Reported below with the tool's own output.
      }
      reject(new Error(`${algorithm} failed (exit ${code})\n${stderr || stdout}`));
    });
  });
}

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

const work = options.work
  ? path.resolve(options.work)
  : await mkdtemp(path.join(os.tmpdir(), 'demo-geometry-'));
await mkdir(work, { recursive: true });
const file = (name) => path.join(work, name);
let states;
let outline;
let poles;
try {
  console.log(`Running QGIS processing in ${work}`);
  await run('native:extractbyattribute', {
    INPUT: `${path.resolve(options.data)}|layername=${options.layer}`,
    FIELD: 'admin',
    OPERATOR: 0,
    VALUE: options.admin,
    OUTPUT: file('01-extract.gpkg'),
  });
  await run('native:reprojectlayer', {
    INPUT: file('01-extract.gpkg'),
    TARGET_CRS: options.crs,
    OUTPUT: file('02-reprojected.gpkg'),
  });
  await run('native:fieldcalculator', {
    INPUT: file('02-reprojected.gpkg'),
    FIELD_NAME: 'area_km2',
    FIELD_TYPE: 0,
    FIELD_LENGTH: 20,
    // QGIS rounds computed values to the field precision. Keep enough decimals for the class limits.
    FIELD_PRECISION: 6,
    FORMULA: 'area($geometry) / 1000000',
    OUTPUT: file('03-area.gpkg'),
  });
  await run('native:coveragesimplify', {
    INPUT: file('03-area.gpkg'),
    TOLERANCE: tolerance,
    PRESERVE_BOUNDARY: false,
    OUTPUT: file('04-simplified.geojson'),
  });
  await run('native:dissolve', {
    INPUT: file('04-simplified.geojson'),
    OUTPUT: file('05-outline.geojson'),
  });
  await run('native:poleofinaccessibility', {
    INPUT: file('03-area.gpkg'),
    TOLERANCE: 500,
    OUTPUT: file('06-labels.geojson'),
  });
  states = (await readJson(file('04-simplified.geojson'))).features;
  outline = (await readJson(file('05-outline.geojson'))).features;
  poles = (await readJson(file('06-labels.geojson'))).features;
} finally {
  if (!options.work) await rm(work, { recursive: true, force: true });
}

// Polygons of any feature as a list of polygons, each a list of rings.
const polygonsOf = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
const ringArea = (ring) =>
  Math.abs(
    ring.reduce((sum, [x, y], i) => {
      const [nx, ny] = ring[(i + 1) % ring.length];
      return sum + x * ny - nx * y;
    }, 0) / 2,
  );

// Fit the outline into the viewBox, north up.
const allPoints = outline.flatMap((feature) => polygonsOf(feature.geometry).flat(2));
const xs = allPoints.map(([x]) => x);
const ys = allPoints.map(([, y]) => y);
const [minX, maxX, minY, maxY] = [
  Math.min(...xs),
  Math.max(...xs),
  Math.min(...ys),
  Math.max(...ys),
];
const scale = (width - 2 * pad) / (maxX - minX);
const height = Math.ceil((maxY - minY) * scale + 2 * pad);
const round = (value) => Math.round(value * 10) / 10;
const project = ([x, y]) => [round(pad + (x - minX) * scale), round(pad + (maxY - y) * scale)];

// Compact SVG numbers, as minifiers write them: no trailing ".0" or leading zero, and no space
// before a minus sign or before ".5" when the previous number already has a decimal point.
const num = (value) => String(round(value)).replace(/^(-?)0\./, '$1.');
const join = (numbers) =>
  numbers.map(num).reduce((text, part) => {
    const tight = !text || part.startsWith('-') || (part.startsWith('.') && /\.\d*$/.test(text));
    return text + (tight ? '' : ' ') + part;
  }, '');

/** Absolute move to each ring's start, then relative line steps, dropping steps that round to zero. */
function pathOf(geometry) {
  let d = '';
  for (const polygon of polygonsOf(geometry))
    for (const ring of polygon) {
      const points = ring.map(project);
      if (ringArea(points) < minRing) continue;
      const steps = [];
      let [px, py] = points[0];
      for (const [x, y] of points.slice(1, -1)) {
        if (x === px && y === py) continue;
        steps.push(x - px, y - py);
        [px, py] = [x, y];
      }
      if (steps.length >= 4) d += `M${join(points[0])}l${join(steps)}z`;
    }
  return d;
}

// Area classes. Each function returns the k - 1 inner limits of sorted values.
const areas = states.map((feature) => feature.properties.area_km2).sort((a, b) => a - b);
/** Equal interval, as QGIS: k classes of width (max - min) / k from the smallest value. */
function equalBreaks(values, k) {
  const [min, max] = [values[0], values[values.length - 1]];
  return Array.from({ length: k - 1 }, (_, i) => min + ((i + 1) * (max - min)) / k);
}
/** Quantile, as QGIS: limits at positions i / k * (n - 1), interpolated between neighbours. */
function quantileBreaks(values, k) {
  return Array.from({ length: k - 1 }, (_, i) => {
    const a = ((i + 1) / k) * (values.length - 1);
    const low = Math.floor(a);
    return values[low] + (a - low) * ((values[low + 1] ?? values[low]) - values[low]);
  });
}
/** Fisher-Jenks natural breaks: minimises the squared deviation inside each class. */
function jenksBreaks(values, k) {
  const n = values.length;
  const cost = (from, to) => {
    const slice = values.slice(from, to + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    return slice.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  };
  const best = Array.from({ length: k + 1 }, () => Array(n).fill(Infinity));
  const cut = Array.from({ length: k + 1 }, () => Array(n).fill(0));
  for (let j = 0; j < n; j += 1) best[1][j] = cost(0, j);
  for (let c = 2; c <= k; c += 1)
    for (let j = c - 1; j < n; j += 1)
      for (let i = c - 1; i <= j; i += 1) {
        const total = best[c - 1][i - 1] + cost(i, j);
        if (total < best[c][j]) [best[c][j], cut[c][j]] = [total, i];
      }
  const breaks = [];
  for (let c = k, j = n - 1; c > 1; c -= 1) {
    breaks.unshift(values[cut[c][j] - 1]);
    j = cut[c][j] - 1;
  }
  return breaks;
}
const classify = { equal: equalBreaks, quantile: quantileBreaks, jenks: jenksBreaks };
const inner = classify[options.mode](areas, classCount);
// Two decimals, so the limits can be checked against a QGIS legend or a recorded run.
const breaks = [areas[0], ...inner, areas[areas.length - 1]].map(
  (value) => Math.round(value * 100) / 100,
);
const classOf = (area) => {
  const index = inner.findIndex((limit) => area <= limit);
  return (index === -1 ? inner.length : index) + 1;
};

const poleFor = (name) => poles.find((feature) => feature.properties.name === name);
const result = states
  .map((feature) => {
    const { name, area_km2: area } = feature.properties;
    const pole = poleFor(name);
    const [x, y] = project(pole.geometry.coordinates);
    return {
      name,
      areaKm2: round(area),
      cls: classOf(area),
      d: pathOf(feature.geometry),
      label: area >= minLabel ? { x, y } : null,
    };
  })
  .sort((a, b) => b.areaKm2 - a.areaKm2);
const outlinePath = outline.map((feature) => pathOf(feature.geometry)).join('');

const today = new Date().toISOString().slice(0, 10);
const source = `/*
 * Generated by scripts/demo-geometry.mjs on ${today}. Do not hand-edit: regenerate with that script.
 * Source: Natural Earth (public domain) as bundled with QGIS in world_map.gpkg.
 * Layer ${options.layer}, filter admin = '${options.admin}', ${states.length} areas.
 * Chain: extractbyattribute > reprojectlayer ${options.crs} > fieldcalculator area_km2 =
 * area($geometry) / 1000000 > coveragesimplify ${tolerance} m > dissolve (outline) and
 * poleofinaccessibility (labels, unsimplified). Areas are unsimplified, in km².
 * Classes: ${classCount} by area, ${modes[options.mode]}, upper limits inclusive.
 * viewBox units: north up, y down, 1 decimal. Rings under ${minRing} square units are dropped.
 */

export interface MapArea {
  name: string;
  /** Unsimplified area in km², 1 decimal. */
  areaKm2: number;
  /** Area class, 1 (smallest) to ${classCount}. */
  cls: number;
  d: string;
  /** Label anchor, or null when the area is too small to hold its name. */
  label: { x: number; y: number } | null;
}

export const viewBox = '0 0 ${width} ${height}';
export const size = { width: ${width}, height: ${height} };
/** Ground distance of one viewBox unit in metres, for scale bars. */
export const unitMetres = ${round(1 / scale)};
/** Class limits in km² from the smallest to the largest area, 2 decimals. */
export const breaks: readonly number[] = ${JSON.stringify(breaks)};
export const outline = '${outlinePath}';
/** Sorted by area, largest first. */
export const areas: readonly MapArea[] = ${JSON.stringify(result)};
`;

const out = path.resolve(root, options.out);
await mkdir(path.dirname(out), { recursive: true });
let formatted = source;
try {
  const prettier = await import(
    pathToFileURL(path.join(root, 'node_modules/prettier/index.mjs')).href
  );
  const config = (await prettier.resolveConfig(out)) ?? {};
  formatted = await prettier.format(source, { ...config, filepath: out });
} catch (error) {
  console.warn(`Prettier skipped: ${error.message}`);
}
await writeFile(out, formatted);

console.log(`Wrote ${path.relative(root, out)} (${(formatted.length / 1024).toFixed(1)} KB)`);
console.log(`viewBox 0 0 ${width} ${height}, ${options.mode} breaks: ${breaks.join(' | ')}`);
console.table(
  result.map(({ name, areaKm2, cls, label }) => ({ name, areaKm2, cls, label: !!label })),
);
