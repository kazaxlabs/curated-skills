import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';

export interface CollabConfig {
  projectDir: string;
  collabDir: string;
}

/**
 * Builds the config for one call. docs/COLLAB is created only when writing, and only inside a
 * git repository root — otherwise a mis-resolved folder (a home directory, a temp dir) would
 * silently grow a stray docs/COLLAB.
 */
export function configFor(projectDir: string, options: { createIfMissing: boolean }): CollabConfig {
  if (!existsSync(projectDir)) {
    throw new Error(`Project folder does not exist: ${projectDir}`);
  }
  const collabDir = join(projectDir, 'docs', 'COLLAB');
  if (!existsSync(collabDir)) {
    if (!options.createIfMissing) {
      throw new Error(`No docs/COLLAB folder in ${projectDir}.`);
    }
    if (!existsSync(join(projectDir, '.git'))) {
      throw new Error(
        `${projectDir} has no docs/COLLAB and is not a git repository root — refusing to create one. ` +
          'Pass project_dir pointing at the repository root.'
      );
    }
    mkdirSync(collabDir, { recursive: true });
  }
  return { projectDir, collabDir };
}

export interface GitInfo {
  branch: string | null;
  commit: string | null;
}

/** Best-effort git branch/commit for the header. Never throws — a non-git or dirty checkout still works. */
export function getGitInfo(projectDir: string): GitInfo {
  const run = (args: string[]): string | null => {
    try {
      return execFileSync('git', args, { cwd: projectDir, encoding: 'utf-8' }).trim();
    } catch {
      return null;
    }
  };
  return {
    branch: run(['rev-parse', '--abbrev-ref', 'HEAD']),
    commit: run(['rev-parse', '--short', 'HEAD']),
  };
}

/** Turns a caller-supplied scope into the file's slug. "general" is the one reserved name -> HANDOFF.md. */
function slugify(scope: string): string {
  const cleaned = scope
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!cleaned) {
    throw new Error(`scope "${scope}" has no usable characters after sanitizing (letters/digits only).`);
  }
  return cleaned;
}

export function scopeToFilename(scope: string): string {
  if (scope.trim().toLowerCase() === 'general') return 'HANDOFF.md';
  return `HANDOFF-${slugify(scope)}.md`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- Status block (ADR-0001): YAML front matter at the top of each handoff file ----
// Written in a strict subset so it round-trips without a YAML library: one `key: value` per line,
// strings as JSON double-quoted strings (valid YAML), lists as JSON flow arrays (valid YAML).

export const STATUSES = ['claimed', 'active', 'blocked', 'done'] as const;
export type HandoffStatusValue = (typeof STATUSES)[number];

export interface HandoffStatus {
  scope: string;
  status: HandoffStatusValue;
  tool: string;
  updated: string;
  next: string;
  blockers: string[];
  links: string[];
}

const FRONT = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/** Reads the status block at the top of a handoff file, or null if there is none. */
export function readStatus(text: string): HandoffStatus | null {
  const m = text.match(FRONT);
  if (!m) return null;
  const raw: Record<string, unknown> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-z_]+):\s*(.*?)\s*(?:#.*)?$/);
    if (!kv) continue;
    const v = kv[2];
    try {
      raw[kv[1]] = v.startsWith('"') || v.startsWith('[') ? JSON.parse(v) : v;
    } catch {
      raw[kv[1]] = v;
    }
  }
  const list = (x: unknown) => (Array.isArray(x) ? x.map(String) : []);
  return {
    scope: String(raw.scope ?? ''),
    status: (STATUSES as readonly string[]).includes(String(raw.status)) ? (raw.status as HandoffStatusValue) : 'active',
    tool: String(raw.tool ?? ''),
    updated: String(raw.updated ?? ''),
    next: String(raw.next ?? ''),
    blockers: list(raw.blockers),
    links: list(raw.links),
  };
}

function renderStatus(s: HandoffStatus): string {
  return [
    '---',
    `scope: ${JSON.stringify(s.scope)}`,
    `status: ${s.status}`,
    `tool: ${JSON.stringify(s.tool)}`,
    `updated: ${s.updated}`,
    `next: ${JSON.stringify(s.next)}`,
    `blockers: ${JSON.stringify(s.blockers)}`,
    `links: ${JSON.stringify(s.links)}`,
    '---',
    '',
  ].join('\n');
}

function checkStatus(status: string | undefined): HandoffStatusValue | undefined {
  if (status === undefined) return undefined;
  if (!(STATUSES as readonly string[]).includes(status)) {
    throw new Error(`Unknown status "${status}". Use one of: ${STATUSES.join(', ')}.`);
  }
  return status as HandoffStatusValue;
}

export interface StartHandoffInput {
  scope: string;
  tool: string;
  summary: string;
  next?: string;
  links?: string[];
}

export interface StartHandoffResult {
  path: string;
  created: boolean;
}

/**
 * Creates a new handoff file for `scope` if none exists. Never overwrites an existing one —
 * existing files often have hand-written headers in slightly different shapes, and silently
 * rewriting them is how a real note gets lost. Use appendNote to add to an existing file.
 */
export function startHandoff(config: CollabConfig, input: StartHandoffInput): StartHandoffResult {
  const filename = scopeToFilename(input.scope);
  const path = join(config.collabDir, filename);

  if (existsSync(path)) {
    return { path, created: false };
  }

  const git = getGitInfo(config.projectDir);
  const date = todayISO();
  const title =
    input.scope.trim().toLowerCase() === 'general'
      ? `${basename(config.projectDir)} repository`
      : input.scope.trim();

  const status = renderStatus({
    scope: input.scope.trim(), status: 'claimed', tool: input.tool, updated: date,
    next: input.next ?? '', blockers: [], links: input.links ?? [],
  });
  const header = status + [
    `# Handoff — ${title}`,
    '',
    `- **Repo:** \`${config.projectDir}\``,
    `- **Branch:** \`${git.branch ?? 'unknown'}\`, at \`${git.commit ?? 'unknown'}\``,
    `- **Started:** ${date} by ${input.tool}`,
    '',
    '**Read first:** `CLAUDE.md` (precedence and traps), then this file.',
    '',
    '---',
    '',
    `## 1. ${date} — ${input.tool}`,
    '',
    input.summary,
    '',
  ].join('\n');

  writeFileSync(path, header, 'utf-8');
  return { path, created: true };
}

export interface AppendNoteInput {
  scope: string;
  tool: string;
  note: string;
  status?: string;
  next?: string;
  blockers?: string[];
  links?: string[];
}

export interface AppendNoteResult {
  path: string;
  sectionNumber: number;
}

/** Appends a new numbered section to an existing handoff file. Throws if the file doesn't exist yet. */
export function appendNote(config: CollabConfig, input: AppendNoteInput): AppendNoteResult {
  const filename = scopeToFilename(input.scope);
  const path = join(config.collabDir, filename);

  if (!existsSync(path)) {
    throw new Error(
      `No handoff file for scope "${input.scope}" (looked for ${filename}). Call start_handoff first.`
    );
  }

  const status = checkStatus(input.status); // validate before touching the file
  const content = readFileSync(path, 'utf-8');
  const existingNumbers = [...content.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  const date = todayISO();

  // The status block is replaced; the body below it is kept byte-for-byte and the note is appended.
  // A file written before ADR-0001 gets a block (status: active) on its first new note.
  const current = readStatus(content);
  const body = current ? content.replace(FRONT, '') : content;
  const updated = renderStatus({
    scope: current?.scope || input.scope.trim(),
    status: status ?? current?.status ?? 'active',
    tool: input.tool,
    updated: date,
    next: input.next ?? current?.next ?? '',
    blockers: input.blockers ?? current?.blockers ?? [],
    links: input.links ?? current?.links ?? [],
  });
  const section = `\n## ${nextNumber}. ${date} — ${input.tool}\n\n${input.note}\n`;
  writeFileSync(path, updated + body + section, 'utf-8');

  return { path, sectionNumber: nextNumber };
}

export interface ReadLatestHandoffResult {
  path: string;
  modifiedISO: string;
  content: string;
}

export function readLatestHandoff(config: CollabConfig, scope: string): ReadLatestHandoffResult {
  const filename = scopeToFilename(scope);
  const path = join(config.collabDir, filename);

  if (!existsSync(path)) {
    throw new Error(`No handoff file for scope "${scope}" (looked for ${filename}).`);
  }

  const stat = statSync(path);
  return {
    path,
    modifiedISO: stat.mtime.toISOString(),
    content: readFileSync(path, 'utf-8'),
  };
}

export interface HandoffListing {
  filename: string;
  title: string;
  modifiedISO: string;
  bytes: number;
  status: HandoffStatusValue | null;
  next: string | null;
}

export function listHandoffs(config: CollabConfig): HandoffListing[] {
  const files = readdirSync(config.collabDir).filter((f) => /^HANDOFF.*\.md$/i.test(f));

  const listings = files.map((filename) => {
    const path = join(config.collabDir, filename);
    const stat = statSync(path);
    const text = readFileSync(path, 'utf-8');
    const status = readStatus(text);
    const heading = text.replace(FRONT, '').split('\n').find((l) => /^#\s/.test(l)) ?? '';
    return {
      filename,
      title: heading.replace(/^#\s*/, '').trim() || filename,
      modifiedISO: stat.mtime.toISOString(),
      bytes: stat.size,
      status: status?.status ?? null,
      next: status ? status.next : null,
    };
  });

  return listings.sort((a, b) => (a.modifiedISO < b.modifiedISO ? 1 : -1));
}
