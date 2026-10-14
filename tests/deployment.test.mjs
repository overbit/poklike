import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const importPattern = /^\s*import\s+(?:[^'"\n]*?\s+from\s+)?['"](\.\/[^'"]+\.js)['"];?\s*$/gm;

function runtimeClosure(entry, sources) {
  const found = new Set();
  const visit = file => {
    if (found.has(file)) return;
    found.add(file);
    const source = sources.get(file);
    assert.ok(source, `Missing runtime module ${file}`);
    for (const match of source.matchAll(importPattern)) {
      visit(new URL(match[1], `https://local/${file}`).pathname.slice(1));
    }
  };
  visit(entry);
  return found;
}

function deploymentLists(workflow) {
  const copy = workflow.match(/^\s*cp\s+(.+?)\s+_site\/$/m)?.[1];
  const verify = workflow.match(/^\s*for path in (.+); do$/m)?.[1];
  assert.ok(copy, 'Workflow must include a static app packaging command');
  assert.ok(verify, 'Workflow must include an HTTPS asset verification list');
  return {
    packaged: new Set(copy.split(/\s+/).filter(file => file.endsWith('.js'))),
    verified: new Set(verify.split(/\s+/).filter(file => file.endsWith('.js'))),
  };
}

const workflow = await read('.github/workflows/deploy-pages.yml');
const sources = new Map(await Promise.all(
  ['app.js', 'toys.js', 'profile.js', 'portrait-toys.js', 'wide-toys.js'].map(async file => [file, await read(file)]),
));
const closure = runtimeClosure('app.js', sources);
const lists = deploymentLists(workflow);

test('workflow packages, verifies, and service-worker-caches the complete runtime import closure', async () => {
  const serviceWorker = await read('sw.js');
  const assetList = serviceWorker.match(/const ASSETS=\[(.*?)\];/s)?.[1];
  assert.ok(assetList, 'Service worker must declare its static asset list');
  for (const file of closure) {
    assert.ok(lists.packaged.has(file), `Workflow packaging is missing ${file}`);
    assert.ok(lists.verified.has(file), `Workflow HTTPS verification is missing ${file}`);
    assert.ok(assetList.includes(`'./${file}'`) || assetList.includes(`"./${file}"`), `Service worker assets are missing ${file}`);
  }
});

test('regression fixture rejects a workflow with profile.js removed', () => {
  const broken = workflow.replaceAll('profile.js', '');
  const brokenLists = deploymentLists(broken);
  assert.ok(closure.has('profile.js'));
  assert.ok(!brokenLists.packaged.has('profile.js'));
  assert.ok(!brokenLists.verified.has('profile.js'));
  assert.throws(() => {
    for (const file of closure) {
      assert.ok(brokenLists.packaged.has(file), `Workflow packaging is missing ${file}`);
      assert.ok(brokenLists.verified.has(file), `Workflow HTTPS verification is missing ${file}`);
    }
  }, /profile\.js/);
});
