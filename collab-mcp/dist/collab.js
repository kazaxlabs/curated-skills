import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { execFileSync } from 'node:child_process';
/**
 * Builds the config for one call. docs/COLLAB is created only when writing, and only inside a
 * git repository root — otherwise a mis-resolved folder (a home directory, a temp dir) would
 * silently grow a stray docs/COLLAB.
 */
export function configFor(projectDir, options) {
    if (!existsSync(projectDir)) {
        throw new Error(`Project folder does not exist: ${projectDir}`);
    }
    const collabDir = join(projectDir, 'docs', 'COLLAB');
    if (!existsSync(collabDir)) {
        if (!options.createIfMissing) {
            throw new Error(`No docs/COLLAB folder in ${projectDir}.`);
        }
        if (!existsSync(join(projectDir, '.git'))) {
            throw new Error(`${projectDir} has no docs/COLLAB and is not a git repository root — refusing to create one. ` +
                'Pass project_dir pointing at the repository root.');
        }
        mkdirSync(collabDir, { recursive: true });
    }
    return { projectDir, collabDir };
}
/** Best-effort git branch/commit for the header. Never throws — a non-git or dirty checkout still works. */
export function getGitInfo(projectDir) {
    const run = (args) => {
        try {
            return execFileSync('git', args, { cwd: projectDir, encoding: 'utf-8' }).trim();
        }
        catch {
            return null;
        }
    };
    return {
        branch: run(['rev-parse', '--abbrev-ref', 'HEAD']),
        commit: run(['rev-parse', '--short', 'HEAD']),
    };
}
/** Turns a caller-supplied scope into the file's slug. "general" is the one reserved name -> HANDOFF.md. */
function slugify(scope) {
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
export function scopeToFilename(scope) {
    if (scope.trim().toLowerCase() === 'general')
        return 'HANDOFF.md';
    return `HANDOFF-${slugify(scope)}.md`;
}
export function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
/**
 * Creates a new handoff file for `scope` if none exists. Never overwrites an existing one —
 * existing files often have hand-written headers in slightly different shapes, and silently
 * rewriting them is how a real note gets lost. Use appendNote to add to an existing file.
 */
export function startHandoff(config, input) {
    const filename = scopeToFilename(input.scope);
    const path = join(config.collabDir, filename);
    if (existsSync(path)) {
        return { path, created: false };
    }
    const git = getGitInfo(config.projectDir);
    const date = todayISO();
    const title = input.scope.trim().toLowerCase() === 'general'
        ? `${basename(config.projectDir)} repository`
        : input.scope.trim();
    const header = [
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
/** Appends a new numbered section to an existing handoff file. Throws if the file doesn't exist yet. */
export function appendNote(config, input) {
    const filename = scopeToFilename(input.scope);
    const path = join(config.collabDir, filename);
    if (!existsSync(path)) {
        throw new Error(`No handoff file for scope "${input.scope}" (looked for ${filename}). Call start_handoff first.`);
    }
    const content = readFileSync(path, 'utf-8');
    const existingNumbers = [...content.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const date = todayISO();
    const section = `\n## ${nextNumber}. ${date} — ${input.tool}\n\n${input.note}\n`;
    appendFileSync(path, section, 'utf-8');
    return { path, sectionNumber: nextNumber };
}
export function readLatestHandoff(config, scope) {
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
export function listHandoffs(config) {
    const files = readdirSync(config.collabDir).filter((f) => /^HANDOFF.*\.md$/i.test(f));
    const listings = files.map((filename) => {
        const path = join(config.collabDir, filename);
        const stat = statSync(path);
        const firstLine = readFileSync(path, 'utf-8').split('\n', 1)[0] ?? '';
        return {
            filename,
            title: firstLine.replace(/^#\s*/, '').trim() || filename,
            modifiedISO: stat.mtime.toISOString(),
            bytes: stat.size,
        };
    });
    return listings.sort((a, b) => (a.modifiedISO < b.modifiedISO ? 1 : -1));
}
