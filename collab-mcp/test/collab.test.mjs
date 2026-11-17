// Tests for the handoff status block (ADR-0001). Written before the implementation and seen failing
// against the old collab.ts first. They are self-authored: they show intent, not independent proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startHandoff, appendNote, listHandoffs, readStatus } from '../dist/collab.js';

function fresh() {
  const projectDir = mkdtempSync(join(tmpdir(), 'collab-test-'));
  const collabDir = join(projectDir, 'docs', 'COLLAB');
  mkdirSync(collabDir, { recursive: true });
  return { projectDir, collabDir };
}

test('start_handoff writes a status block with status claimed, and keeps the title line', () => {
  const c = fresh();
  const r = startHandoff(c, { scope: 'demo-scope', tool: 'claude-code', summary: 'Do the thing.' });
  const text = readFileSync(r.path, 'utf-8');
  assert.ok(text.startsWith('---\n'), 'file starts with a front-matter block');
  const s = readStatus(text);
  assert.equal(s.scope, 'demo-scope');
  assert.equal(s.status, 'claimed');
  assert.equal(s.tool, 'claude-code');
  assert.match(s.updated, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(s.next, '');
  assert.deepEqual(s.blockers, []);
  assert.deepEqual(s.links, []);
  assert.match(text, /\n# Handoff — demo-scope\n/);
  assert.match(text, /\n## 1\. \d{4}-\d{2}-\d{2} — claude-code\n\nDo the thing\.\n/);
});

test('append_note updates the block and leaves earlier notes byte-for-byte', () => {
  const c = fresh();
  const { path } = startHandoff(c, { scope: 'demo', tool: 'claude-code', summary: 'First.' });
  const before = readFileSync(path, 'utf-8');
  const bodyBefore = before.slice(before.indexOf('# Handoff'));
  const r = appendNote(c, { scope: 'demo', tool: 'antigravity', note: 'Second.', status: 'blocked',
    next: 'Owner: pick a trigger: always_on or model_decision', blockers: ['needs owner input'], links: ['docs/adr/ADR-0001.md'] });
  assert.equal(r.sectionNumber, 2);
  const after = readFileSync(path, 'utf-8');
  const s = readStatus(after);
  assert.equal(s.status, 'blocked');
  assert.equal(s.tool, 'antigravity');
  assert.equal(s.next, 'Owner: pick a trigger: always_on or model_decision');
  assert.deepEqual(s.blockers, ['needs owner input']);
  assert.deepEqual(s.links, ['docs/adr/ADR-0001.md']);
  assert.ok(after.includes(bodyBefore), 'the earlier body is unchanged');
  assert.match(after, /\n## 2\. \d{4}-\d{2}-\d{2} — antigravity\n\nSecond\.\n$/);
});

test('append_note leaves fields it was not given as they were', () => {
  const c = fresh();
  startHandoff(c, { scope: 'demo', tool: 'claude-code', summary: 'First.' });
  appendNote(c, { scope: 'demo', tool: 'claude-code', note: 'x', next: 'step one', blockers: ['b1'] });
  const { path } = appendNote(c, { scope: 'demo', tool: 'claude-code', note: 'y' });
  const s = readStatus(readFileSync(path, 'utf-8'));
  assert.equal(s.status, 'claimed');
  assert.equal(s.next, 'step one');
  assert.deepEqual(s.blockers, ['b1']);
});

test('append_note on a file without a block adds one (status active) and keeps the old text', () => {
  const c = fresh();
  const legacy = '# Handoff — old\n\n- **Started:** 2026-11-01 by claude-code\n\n---\n\n## 1. 2026-11-01 — claude-code\n\nOld note.\n';
  writeFileSync(join(c.collabDir, 'HANDOFF-OLD.md'), legacy, 'utf-8');
  const { path } = appendNote(c, { scope: 'old', tool: 'claude-code', note: 'New note.' });
  const text = readFileSync(path, 'utf-8');
  const s = readStatus(text);
  assert.equal(s.status, 'active');
  assert.equal(s.scope, 'old');
  assert.ok(text.includes(legacy), 'the legacy text is kept byte-for-byte');
});

test('append_note refuses an unknown status', () => {
  const c = fresh();
  startHandoff(c, { scope: 'demo', tool: 'claude-code', summary: 'First.' });
  assert.throws(() => appendNote(c, { scope: 'demo', tool: 'claude-code', note: 'x', status: 'finished' }), /status/);
});

test('list_handoffs takes the title from the heading, not the front matter, and reports status', () => {
  const c = fresh();
  startHandoff(c, { scope: 'demo', tool: 'claude-code', summary: 'First.' });
  const [h] = listHandoffs(c);
  assert.equal(h.title, 'Handoff — demo');
  assert.equal(h.status, 'claimed');
});

test('readStatus returns null for text with no block', () => {
  assert.equal(readStatus('# Handoff — x\n\nbody\n'), null);
});
