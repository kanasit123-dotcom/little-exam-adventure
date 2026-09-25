import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ASSETS } from '../src/core/assets.js';

const root = new URL('../public/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('assets/asset-manifest.json', root), 'utf8'));

test('approved assets exist and match recorded hashes', async () => {
  for (const [relative, expected] of Object.entries(manifest.files)) {
    const file = new URL(`assets/${relative}`, root);
    await access(file);
    const actual = createHash('sha256').update(await readFile(file)).digest('hex');
    assert.equal(actual, expected, relative);
  }
});

test('every content asset id is present in the registry', async () => {
  const { VERTICAL_SLICE_12 } = await import('../src/content/vertical-slice-12.js');
  const ids = new Set();
  for (const question of VERTICAL_SLICE_12) {
    if (question.visual?.assetId) ids.add(question.visual.assetId);
    for (const option of question.options) if (option.assetId) ids.add(option.assetId);
  }
  for (const id of ids) assert.ok(ASSETS[id], id);
});

