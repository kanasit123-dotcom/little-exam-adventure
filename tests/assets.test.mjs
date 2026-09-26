import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ASSETS } from '../src/core/assets.js';
import { SETS } from '../src/content/sets/index.js';

const root = new URL('../public/assets/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('asset-manifest.json', root), 'utf8'));

test('every asset file is hashed with a recorded source, and hashes match', async () => {
  const folders = (await readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  const onDisk = [];
  for (const folder of folders) for (const name of await readdir(new URL(`${folder}/`, root))) onDisk.push(`${folder}/${name}`);
  assert.deepEqual(onDisk.sort(), Object.keys(manifest.files).sort(), 'run npm run assets');
  for (const [rel, expected] of Object.entries(manifest.files)) {
    const actual = createHash('sha256').update(await readFile(new URL(rel, root))).digest('hex');
    assert.equal(actual, expected, rel);
    assert.ok(manifest.provenance[rel], `provenance for ${rel}`);
  }
});

test('every registry entry points at a real file', async () => {
  for (const [id, entry] of Object.entries(ASSETS)) await access(new URL(entry.file, root)).catch(() => assert.fail(id));
});

test('every picture used by content is in the registry', () => {
  const used = new Set(['pic-house']);
  const visit = (visual) => {
    if (!visual) return;
    if (visual.asset) used.add(visual.asset);
    if (visual.icon) used.add(visual.icon);
    for (const row of visual.rows || []) if (row.asset) used.add(row.asset);
    if (visual.type === 'row') for (const id of visual.items) used.add(id);
  };
  for (const set of SETS) {
    for (const s of Object.values(set.stimuli || {})) visit(s.visual);
    for (const item of set.items) {
      visit(item.visual);
      for (const option of item.options) if (option.image) used.add(option.image);
    }
  }
  for (const id of used) assert.ok(ASSETS[id], id);
});

test('picture alt text is neutral (no correct/incorrect words)', () => {
  for (const entry of Object.values(ASSETS)) assert.equal(/ถูก|ผิด|correct/i.test(entry.alt), false);
});
