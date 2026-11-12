#!/usr/bin/env node
// run.mjs: tests for packs/business-owner/workspace-template.
//
// Self-authored tests over self-authored code: they show that the template does what the spec intends on the
// machine that runs them (hooks fed realistic stdin payloads, the search tool, the secret check, the auto-save).
// They do not show that Claude Code fires the hooks this way in a real session; LISEZMOI-TECHNIQUE.md lists the
// external checks that settle that.
//
// Usage: node packs/business-owner/tests/workspace/run.mjs [--keep]   (--keep leaves the temp folder for inspection)
// Node built-ins and git only. Every key-like or contact-like value is built at runtime, so none is committed.
// Exit: 0 when every check passes, 1 otherwise.

import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = resolve(HERE, '..', '..', 'workspace-template');
const FIXTURES = join(HERE, 'fixtures');
const KEEP = process.argv.includes('--keep');

let passed = 0;
let failed = 0;
let skipped = 0;
function check(name, cond, detail) {
  const n = passed + failed + skipped + 1;
  if (cond) {
    passed++;
    console.log(`ok ${n} - ${name}`);
  } else {
    failed++;
    console.log(`not ok ${n} - ${name}`);
    if (detail !== undefined) console.log(`  # ${String(detail).trim().split('\n').join('\n  # ')}`);
  }
}
function skip(name, why) {
  skipped++;
  console.log(`ok ${passed + failed + skipped} - ${name} # SKIP ${why}`);
}
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const section = (title) => console.log(`# ${title}`);

// ---------------------------------------------------------------------------------------------------------------
// Workspace copy
// ---------------------------------------------------------------------------------------------------------------
const TMP = mkdtempSync(join(tmpdir(), 'bo-ws-'));
const WS = join(TMP, 'espace');
cpSync(TEMPLATE, WS, { recursive: true, filter: (src) => !src.includes(`${sep}.claude${sep}cache`) });

const run = (cmd, args, opts = {}) => spawnSync(cmd, args, {
  cwd: WS, encoding: 'utf8', windowsHide: true, timeout: 120000, ...opts,
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...(opts.env || {}) },
});
const git = (...args) => run('git', args);
const node = (script, args = [], opts = {}) => run(process.execPath, [join(WS, script), ...args], opts);
const ws = (rel) => join(WS, ...rel.split('/'));
const write = (rel, text) => { mkdirSync(dirname(ws(rel)), { recursive: true }); writeFileSync(ws(rel), text); };
const read = (rel) => readFileSync(ws(rel), 'utf8');
const headCount = () => Number(git('rev-list', '--count', 'HEAD').stdout.trim() || 0);
const lastSubject = () => git('log', '-1', '--format=%s').stdout.trim();

git('init', '-q');
git('symbolic-ref', 'HEAD', 'refs/heads/main');
git('config', 'user.name', 'Test');
git('config', 'user.email', 'test@example.invalid');
git('config', 'commit.gpgsign', 'false');
git('config', 'core.autocrlf', 'true'); // as Git for Windows sets it; .gitattributes must keep the hook LF

const payload = (event, extra = {}) => JSON.stringify({
  session_id: 'session-test-1',
  transcript_path: join(TMP, 'transcript.jsonl'),
  cwd: WS,
  permission_mode: 'default',
  hook_event_name: event,
  ...extra,
});
const hook = (file, input) => run(process.execPath, [ws(`.claude/hooks/${file}`)], {
  input, env: { CLAUDE_PROJECT_DIR: WS },
});
const sessions = () => JSON.parse(read('.claude/cache/session.json')).sessions;

// ---------------------------------------------------------------------------------------------------------------
section('Template structure');
// ---------------------------------------------------------------------------------------------------------------
const settings = JSON.parse(readFileSync(join(TEMPLATE, '.claude', 'settings.json'), 'utf8'));
check('settings.json caps subagents at 3', settings.env?.CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS === '3');
const matchers = (settings.hooks.SessionStart || []).map((g) => g.matcher);
check('SessionStart has startup|resume|clear and compact matchers',
  matchers.includes('startup|resume|clear') && matchers.includes('compact'), matchers.join(', '));
check('PreCompact, Stop and SessionEnd hooks are configured',
  ['PreCompact', 'Stop', 'SessionEnd'].every((e) => settings.hooks[e]?.[0]?.hooks?.[0]?.command));
const commands = Object.values(settings.hooks).flat().flatMap((g) => g.hooks.map((h) => h.command));
const scriptPaths = commands.flatMap((c) => c.match(/\.claude\/hooks\/[\w.-]+|outils\/[\w.-]+/g) || []);
check('every hook command names a script that exists',
  commands.length === scriptPaths.length && scriptPaths.every((p) => existsSync(join(TEMPLATE, ...p.split('/')))),
  scriptPaths.join(', '));
check('no agent-teams flag and no compaction threshold in settings',
  !JSON.stringify(settings).includes('AGENT_TEAMS') && !JSON.stringify(settings).includes('AUTOCOMPACT'));

const roles = ['coordination', 'recherche', 'redaction', 'analyse', 'revision'];
for (const role of roles) {
  const file = join(TEMPLATE, '.claude', 'agents', `${role}.md`);
  const text = existsSync(file) ? readFileSync(file, 'utf8') : '';
  const fm = (text.match(/^---\n([\s\S]*?)\n---/) || [])[1] || '';
  const name = (fm.match(/^name:\s*(.+)$/m) || [])[1]?.trim();
  const desc = (fm.match(/^description:\s*(.+)$/m) || [])[1]?.trim() || '';
  const tools = (fm.match(/^tools:\s*(.+)$/m) || [])[1]?.split(',').map((t) => t.trim()) || [];
  check(`role ${role}: name, French description, tools`,
    name === role && desc.length > 40 && desc.length <= 1024 && /[éèàç]/.test(desc) && tools.length > 0,
    `name=${name} desc=${desc.length} tools=${tools.join('|')}`);
  if (role === 'revision') {
    check('revision is read-only (no Write, Edit, Bash, NotebookEdit)',
      !tools.some((t) => ['Write', 'Edit', 'Bash', 'NotebookEdit'].includes(t)), tools.join(', '));
  }
}
const claudeMd = readFileSync(join(TEMPLATE, 'CLAUDE.md'), 'utf8');
check('CLAUDE.md imports @instructions-agent.md on its first line', claudeMd.split('\n')[0].trim() === '@instructions-agent.md');
check('CLAUDE.md states the workspace rules',
  ['profil-entreprise.md', 'memoire/passation.md', 'memoire/etat-en-cours.md', 'At most 3', 'registre-des-decisions.md',
    'dossier number', 'Québec French'].every((s) => claudeMd.includes(s)));
check('memoire/MEMOIRE.md is at most 200 lines', read('memoire/MEMOIRE.md').split('\n').length <= 200);
// instructions-agent.md is a byte-identical copy of instructions/instructions-agent.md (validate-pack --strict).
const INSTRUCTIONS = resolve(TEMPLATE, '..', 'instructions', 'instructions-agent.md');
check('template ships instructions-agent.md identical to instructions/instructions-agent.md',
  existsSync(join(TEMPLATE, 'instructions-agent.md')) && existsSync(INSTRUCTIONS)
  && readFileSync(join(TEMPLATE, 'instructions-agent.md')).equals(readFileSync(INSTRUCTIONS)));
check('template ships no profil-entreprise.md or .claude/skills',
  !existsSync(join(TEMPLATE, 'profil-entreprise.md')) && !existsSync(join(TEMPLATE, '.claude', 'skills')));
const gitignore = read('.gitignore');
check('.gitignore ignores .claude/cache/ and does not ignore .claude/skills/',
  gitignore.includes('.claude/cache/') && !/^\.claude\/skills/m.test(gitignore));
check('project template has the standard layout',
  ['README.md', 'registre-des-decisions.md', 'taches.md', 'sources/.gitkeep', 'livrables/.gitkeep', 'notes/.gitkeep']
    .every((p) => existsSync(ws(`projets/_modele/${p}`))));

// ---------------------------------------------------------------------------------------------------------------
section('SessionStart (startup) and the first commit');
// ---------------------------------------------------------------------------------------------------------------
const startCmd = settings.hooks.SessionStart.find((g) => g.matcher === 'startup|resume|clear').hooks[0].command;
let start = run('sh', ['-c', startCmd], { input: payload('SessionStart', { source: 'startup', model: 'claude-test' }), env: { CLAUDE_PROJECT_DIR: WS } });
if (start.error && start.error.code === 'ENOENT') {
  skip('settings.json command string runs under sh', 'sh not on PATH; running the script directly');
  start = hook('session-start.mjs', payload('SessionStart', { source: 'startup', model: 'claude-test' }));
} else {
  check('settings.json command string runs under sh (exit 0)', start.status === 0, start.stderr);
}
check('startup without a profile asks for profil-entreprise', /profil-entreprise/.test(start.stdout) && /missing/.test(start.stdout), start.stdout);
check('startup output stays within ~2,000 characters', start.stdout.length <= 2001, start.stdout.length);
check('startup records the session start in .claude/cache/session.json', typeof sessions()['session-test-1']?.debutMs === 'number');
check('startup points git at .githooks', git('config', '--get', 'core.hooksPath').stdout.trim() === '.githooks');
check('startup is idempotent (second run exit 0, hooksPath unchanged)',
  hook('session-start.mjs', payload('SessionStart', { source: 'clear' })).status === 0
  && git('config', '--get', 'core.hooksPath').stdout.trim() === '.githooks');

const top = readdirSync(WS).filter((e) => e !== '.git');
git('add', '--', ...top);
const first = git('commit', '-q', '-m', 'init: espace de travail');
check('the template passes its own pre-commit check (first commit succeeds)', first.status === 0, first.stdout + first.stderr);
check('.claude/cache stays out of git', !git('ls-files', '.claude/cache').stdout.trim());
git('rm', '-q', '--cached', '--', '.githooks/pre-commit');
unlinkSync(ws('.githooks/pre-commit'));
git('checkout', '-q', 'HEAD', '--', '.githooks/pre-commit');
check('with core.autocrlf=true the checked-out git hook keeps LF line endings', !read('.githooks/pre-commit').includes('\r'));
check('.claude/agents and .claude/hooks are committed',
  git('ls-files', '.claude/agents').stdout.includes('revision.md') && git('ls-files', '.claude/hooks').stdout.includes('stop.mjs'));

// ---------------------------------------------------------------------------------------------------------------
section('SessionStart with a profile, a handoff and open tasks');
// ---------------------------------------------------------------------------------------------------------------
write('profil-entreprise.md', '# Profil d\'entreprise\n\n## Résumé\n\nEntreprise fictive de test : isolation de greniers, service résidentiel.\n\n## Services\n\n- Isolation\n');
write('memoire/passation.md', '# Note de passation\n\nMise à jour le : test\n\n## Où on en est\n\n- MARQUEUR-PASSATION : soumission en préparation.\n\n## Prochaine étape\n\n- Valider le prix.\n');
write('projets/demo/taches.md', '# Tâches\n\n- [ ] T1 : Préparer la soumission ; redaction\n- [~] T2 : Vérifier les sources ; recherche\n- [x] T3 : Ouvrir le dossier\n');
let out = hook('session-start.mjs', payload('SessionStart', { source: 'startup', session_id: 'session-test-2' }));
check('startup prints the profile summary (its Résumé section only)',
  out.stdout.includes('Entreprise fictive de test') && !out.stdout.includes('## Services'), out.stdout);
check('startup prints the handoff', out.stdout.includes('MARQUEUR-PASSATION'), out.stdout);
check('startup lists open tasks ([ ] and [~]) but not done ones',
  out.stdout.includes('T1 : Préparer') && out.stdout.includes('T2 : Vérifier') && !out.stdout.includes('T3'), out.stdout);
check('startup skips projets/_modele', !out.stdout.includes('_modele'), out.stdout);

write('memoire/passation.md', `# Note de passation\n\n## Où on en est\n\n${'- Une longue ligne de passation pour remplir le budget.\n'.repeat(120)}`);
out = hook('session-start.mjs', payload('SessionStart', { source: 'startup', session_id: 'session-test-3' }));
check('a long handoff is cut with a pointer and the output stays within ~2,000 characters',
  out.stdout.length <= 2001 && out.stdout.includes('[cut: read memoire/passation.md]'), `${out.stdout.length} chars`);

const before = sessions()['session-test-2'].debutMs;
sleep(20);
hook('session-start.mjs', payload('SessionStart', { source: 'resume', session_id: 'session-test-2' }));
check('resume keeps the original session start', sessions()['session-test-2'].debutMs === before);

// ---------------------------------------------------------------------------------------------------------------
section('PreCompact and SessionStart (compact)');
// ---------------------------------------------------------------------------------------------------------------
write('memoire/passation.md', '# Note de passation\n\n## Où on en est\n\n- MARQUEUR-PASSATION-2\n');
const etatBefore = read('memoire/etat-en-cours.md');
out = hook('pre-compact.mjs', payload('PreCompact', { trigger: 'auto', custom_instructions: null }));
const stamped = read('memoire/etat-en-cours.md');
check('PreCompact exits 0 and prints nothing', out.status === 0 && out.stdout === '', out.stdout + out.stderr);
check('PreCompact stamps etat-en-cours.md with the time',
  /^Dernier résumé automatique : \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2} \(automatique\)$/m.test(stamped), stamped.slice(0, 200));
hook('pre-compact.mjs', payload('PreCompact', { trigger: 'manual', custom_instructions: 'garder le prix' }));
check('a second PreCompact replaces the stamp (one stamp line)',
  (read('memoire/etat-en-cours.md').match(/^Dernier résumé automatique/gm) || []).length === 1);
check('PreCompact keeps the rest of the file',
  read('memoire/etat-en-cours.md').replace(/^Dernier résumé automatique.*$/m, '') === etatBefore.replace(/^Dernier résumé automatique.*$/m, ''));

write('memoire/etat-en-cours.md', `${read('memoire/etat-en-cours.md')}\n- MARQUEUR-ETAT : rédaction de la soumission.\n`);
const recordBefore = JSON.stringify(sessions());
out = hook('session-start.mjs', payload('SessionStart', { source: 'compact' }));
check('compact prints etat-en-cours.md and passation.md',
  out.status === 0 && out.stdout.includes('MARQUEUR-ETAT') && out.stdout.includes('MARQUEUR-PASSATION-2'), out.stdout);
check('compact output stays within ~2,000 characters and drops empty template bullets',
  out.stdout.length <= 2001 && !/^-\s*$/m.test(out.stdout), out.stdout);
check('compact does not touch the session records', JSON.stringify(sessions()) === recordBefore);

// ---------------------------------------------------------------------------------------------------------------
section('Stop: etat-en-cours reminder and auto-save');
// ---------------------------------------------------------------------------------------------------------------
git('add', '--', 'profil-entreprise.md', 'memoire', 'projets');
git('commit', '-q', '-m', 'test: état de départ');
out = hook('session-start.mjs', payload('SessionStart', { source: 'startup', session_id: 'session-stop' }));
sleep(50);
write('projets/demo/notes/brouillon.md', '# Brouillon\n\nTexte de travail.\n');
hook('pre-compact.mjs', payload('PreCompact', { trigger: 'auto', custom_instructions: null }));
const commitsBeforeStop = headCount();
out = hook('stop.mjs', payload('Stop', { session_id: 'session-stop', stop_hook_active: false, last_assistant_message: 'Fait.' }));
let decision = {};
try { decision = JSON.parse(out.stdout.trim() || '{}'); } catch { decision = { raw: out.stdout }; }
check('Stop blocks once when work changed and etat-en-cours.md did not (a PreCompact stamp does not count)',
  out.status === 0 && decision.decision === 'block'
  && decision.reason === 'Mets à jour memoire/etat-en-cours.md (ce qui est fait, la prochaine étape) avant de terminer.',
  out.stdout + out.stderr);
check('Stop auto-saves changed memory paths (sauvegarde commit)',
  headCount() === commitsBeforeStop + 1 && /^sauvegarde: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(lastSubject()), lastSubject());

out = hook('stop.mjs', payload('Stop', { session_id: 'session-stop', stop_hook_active: true }));
check('Stop never blocks when stop_hook_active is true', out.status === 0 && !out.stdout.includes('"block"'), out.stdout);
out = hook('stop.mjs', payload('Stop', { session_id: 'session-inconnue', stop_hook_active: false }));
check('Stop does not block without a start record for the session', out.status === 0 && !out.stdout.includes('"block"'), out.stdout);
write('memoire/etat-en-cours.md', `${read('memoire/etat-en-cours.md')}\n## Prochaine étape\n\n- Faire réviser le brouillon.\n`);
out = hook('stop.mjs', payload('Stop', { session_id: 'session-stop', stop_hook_active: false }));
check('Stop does not block once etat-en-cours.md is updated', out.status === 0 && !out.stdout.includes('"block"'), out.stdout);
check('Stop does not save again within 10 minutes', headCount() === commitsBeforeStop + 1, lastSubject());

let state = {};
try { state = JSON.parse(read('.claude/cache/sauvegarde.json')); } catch { /* the next check fails instead */ }
state.derniereMs = Date.now() - 11 * 60 * 1000;
writeFileSync(ws('.claude/cache/sauvegarde.json'), JSON.stringify(state));
out = hook('stop.mjs', payload('Stop', { session_id: 'session-stop', stop_hook_active: false }));
check('Stop saves again once the last save is older than 10 minutes',
  headCount() === commitsBeforeStop + 2 && lastSubject().startsWith('sauvegarde:'), `${lastSubject()} ${out.stdout}`);

out = hook('session-start.mjs', payload('SessionStart', { source: 'startup', session_id: 'session-calme' }));
out = hook('stop.mjs', payload('Stop', { session_id: 'session-calme', stop_hook_active: false }));
check('Stop does not block a session that changed nothing', out.status === 0 && !out.stdout.includes('"block"'), out.stdout);

// ---------------------------------------------------------------------------------------------------------------
section('SessionEnd and malformed input');
// ---------------------------------------------------------------------------------------------------------------
appendFileSync(ws('memoire/journal.md'), '2026-01-01 : ligne de test pour la sauvegarde de fin de session\n');
const endCmd = settings.hooks.SessionEnd[0].hooks[0].command;
let end = run('sh', ['-c', endCmd], { input: payload('SessionEnd', { reason: 'prompt_input_exit' }), env: { CLAUDE_PROJECT_DIR: WS } });
if (end.error && end.error.code === 'ENOENT') end = node('outils/sauvegarde.mjs', ['--hook'], { input: payload('SessionEnd', { reason: 'other' }) });
check('SessionEnd command saves pending memory and exits 0',
  end.status === 0 && lastSubject().startsWith('sauvegarde:') && !git('status', '--porcelain', '--', 'memoire').stdout.trim(),
  end.stdout + end.stderr);
for (const file of ['session-start.mjs', 'pre-compact.mjs', 'stop.mjs']) {
  const r = hook(file, 'ceci n\'est pas du JSON {');
  check(`${file} exits 0 on malformed stdin`, r.status === 0, r.stderr);
}
const empty = hook('stop.mjs', '');
check('stop.mjs exits 0 on empty stdin', empty.status === 0, empty.stderr);

// ---------------------------------------------------------------------------------------------------------------
section('recherche.mjs');
// ---------------------------------------------------------------------------------------------------------------
const FX = join(TMP, 'fixtures');
cpSync(FIXTURES, FX, { recursive: true });
mkdirSync(join(FX, 'projets', 'demo', 'node_modules', 'paquet'), { recursive: true });
writeFileSync(join(FX, 'projets', 'demo', 'node_modules', 'paquet', 'README.md'), '# Subvention isolation grenier subvention grenier\n');
writeFileSync(join(FX, 'connaissances', 'binaire.txt'), Buffer.concat([Buffer.from('subvention grenier '), Buffer.from([0, 1, 2, 0])]));
const search = (query, extra = []) => {
  const r = node('outils/recherche.mjs', [query, '--racine', FX, '--json', ...extra]);
  let data = { resultats: [] };
  try { data = JSON.parse(r.stdout); } catch { /* reported below */ }
  return { r, data, first: data.resultats[0]?.chemin };
};
let s = search('subvention isolation grenier');
check('search ranks the subsidy document first', s.first === 'connaissances/programme-subventions.md', s.r.stdout + s.r.stderr);
check('search gives a best matching line', Number.isInteger(s.data.resultats[0]?.ligne) && /subvention/i.test(s.data.resultats[0]?.extrait || ''), JSON.stringify(s.data.resultats[0]));
check('search skips node_modules and binary files',
  !s.data.resultats.some((x) => x.chemin.includes('node_modules') || x.chemin.endsWith('binaire.txt')), s.data.resultats.map((x) => x.chemin).join(', '));
s = search('echeancier etapes');
check('accent-insensitive: an unaccented query finds the accented document first', s.first === 'connaissances/visite-conseiller.md', JSON.stringify(s.data.resultats.map((x) => x.chemin)));
s = search('délai de conservation');
check('accent-insensitive: an accented query finds the unaccented document first', s.first === 'connaissances/politique-confidentialite.md', JSON.stringify(s.data.resultats.map((x) => x.chemin)));
s = search('ouverture de chantier');
check('search covers .txt files under projets/', s.first === 'projets/demo/notes/procedure-chantier.txt', JSON.stringify(s.data.resultats.map((x) => x.chemin)));
s = search('fournisseurs souffleuse', ['--top', '1']);
check('--top 1 returns one result, the supplier list', s.data.resultats.length === 1 && s.first === 'connaissances/fournisseurs.txt', JSON.stringify(s.data.resultats));
s = search('zzyzx introuvable');
check('no match exits 1', s.r.status === 1 && s.data.resultats.length === 0, s.r.stdout);
const bad = node('outils/recherche.mjs', []);
check('no query exits 2', bad.status === 2);
const human = node('outils/recherche.mjs', ['subvention grenier', '--racine', FX]);
check('plain output prints path, score and line', /^1\. connaissances\/programme-subventions\.md {2}\(score [\d.]+\)\n {3}l\.\d+ : /m.test(human.stdout), human.stdout);
for (const [rel, text] of [['connaissances/guide.md', '# Guide des soumissions\n\nComment préparer une soumission.\n'], ['projets/demo/notes/appel.txt', 'Notes d\'appel : rappeler pour la soumission.\n']]) write(rel, text);
const idx = node('outils/recherche.mjs', ['--index']);
check('--index writes .claude/cache/recherche.json', idx.status === 0 && existsSync(ws('.claude/cache/recherche.json')), idx.stdout + idx.stderr);
const cached = node('outils/recherche.mjs', ['préparer une soumission', '--json']);
let cachedFirst = '';
try { cachedFirst = JSON.parse(cached.stdout).resultats[0]?.chemin; } catch { /* reported below */ }
check('search in the workspace (with the cache) finds connaissances/ first', cachedFirst === 'connaissances/guide.md', cached.stdout);
check('the search cache stays out of git', !git('status', '--porcelain', '--', '.claude/cache').stdout.trim());

// ---------------------------------------------------------------------------------------------------------------
section('verifier-secrets.mjs');
// ---------------------------------------------------------------------------------------------------------------
const alnum = (n, set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  const bytes = randomBytes(n);
  return Array.from(bytes, (b) => set[b % set.length]).join('');
};
const brevo = `${'xkeysib'}-${randomBytes(32).toString('hex')}-${alnum(16)}`;
const verify = (args, input) => node('outils/verifier-secrets.mjs', args, input ? { input } : {});
const leaks = (text, value) => text.includes(value) || text.includes(value.slice(8, 20));

write('projets/demo/notes/config.md', `# Réglages\n\nClé du fournisseur de courriel :\n${brevo}\n`);
git('add', '--', 'projets/demo/notes/config.md');
let v = verify(['--staged']);
check('a staged provider key is blocked (exit 1, file:line and rule)',
  v.status === 1 && v.stdout.includes('projets/demo/notes/config.md:4') && v.stdout.includes('clé Brevo'), v.stdout + v.stderr);
check('the blocked key is never printed', !leaks(v.stdout + v.stderr, brevo));
const commitsBeforeHook = headCount();
const hooked = git('commit', '-q', '-m', 'test: ne doit pas passer');
check('the pre-commit hook blocks the commit', hooked.status !== 0 && headCount() === commitsBeforeHook, hooked.stdout + hooked.stderr);
git('reset', '-q', '--', 'projets/demo/notes/config.md');
unlinkSync(ws('projets/demo/notes/config.md'));

const samples = {
  'clé AWS': `${'AKIA'}${alnum(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')}`,
  'jeton GitHub': `${'ghp'}_${alnum(36)}`,
  'clé Google': `${'AIza'}${alnum(35)}`,
  'bloc de clé privée': `-----BEGIN ${'RSA PRIVATE'} KEY-----`,
  'clé au préfixe « sk- »': `${'sk'}-proj-${alnum(20)}9${alnum(19)}`,
  'longue chaîne aléatoire': Array.from({ length: 14 }, () => alnum(1, 'ABCDEFGHJKLMNPQRSTUVWXYZ') + alnum(1, 'abcdefghijkmnopqrstuvwxyz') + alnum(1, '23456789')).join(''),
  'valeur écrite après « mot de passe »': `mot de passe : Zq${alnum(10)}7x`,
};
for (const [label, value] of Object.entries(samples)) {
  write('projets/demo/notes/echantillon.md', `Note\n${value}\n`);
  const r = verify([ws('projets/demo/notes/echantillon.md')]);
  check(`detects ${label}`, r.status === 1 && r.stdout.includes(label.split(' »')[0].split(' «')[0]) && !leaks(r.stdout, value.replace(/^mot de passe : /, '')), r.stdout);
}
unlinkSync(ws('projets/demo/notes/echantillon.md'));

const customerEmail = `client.test${'@'}example.com`;
appendFileSync(ws('memoire/journal.md'), `2026-01-02 : rappel au client ${customerEmail}\n`);
git('add', '--', 'memoire/journal.md');
v = verify(['--staged']);
check('a customer email staged in memoire/ is blocked', v.status === 1 && /memoire\/journal\.md:\d+ : adresse courriel/.test(v.stdout), v.stdout);
check('the blocked email is never printed', !v.stdout.includes(customerEmail) && !v.stdout.includes('client.test'));
git('reset', '-q', '--', 'memoire/journal.md');
git('checkout', '-q', '--', 'memoire/journal.md');

const contacts = {
  'numéro de téléphone': `${'514'}-555-${'0199'}`,
  'code postal': `${'H2X'} ${'1Y4'}`,
  'adresse civique': `${'1234'} rue des ${'Exemples'}`,
};
for (const [label, value] of Object.entries(contacts)) {
  write('memoire/fiche-test.md', `Note : ${value}\n`);
  const r = verify([ws('memoire/fiche-test.md')]);
  check(`detects a ${label} in memoire/`, r.status === 1 && r.stdout.includes(label) && !r.stdout.includes(value), r.stdout);
}
write('projets/demo/notes/contact.md', `Contact fourni pour la soumission : ${customerEmail}\n`);
v = verify([ws('projets/demo/notes/contact.md')]);
check('contact rules apply to memoire/ only (an email in projets/ passes)', v.status === 0, v.stdout);
unlinkSync(ws('projets/demo/notes/contact.md'));

const businessEmail = `info${'@'}entreprise-exemple.ca`;
write('memoire/fiche-test.md', `Courriel de l'entreprise : ${businessEmail}\n`);
v = verify([ws('memoire/fiche-test.md')]);
check('the business email is blocked before it is allowlisted', v.status === 1, v.stdout);
appendFileSync(ws('memoire/.autorises'), `${businessEmail}\n`);
v = verify([ws('memoire/fiche-test.md')]);
check('memoire/.autorises allows the business\'s own contact line', v.status === 0, v.stdout);

write('memoire/fiche-test.md', [
  '# Fiche propre',
  `Lien : https://docs.google.com/document/d/1${alnum(43)}/edit`,
  `Commit : ${randomBytes(20).toString('hex')}`,
  'Identifiant : 123e4567-e89b-12d3-a456-426614174000',
  `Vidéo : ${alnum(60)}.mp4`,
  'Campagne : Campagne_Isolation-Grenier_Automne_2026Q4',
  'Dossier D-2026-0042, rendez-vous le 2026-11-12 à 14:00.',
].join('\n'));
v = verify([ws('memoire/fiche-test.md')]);
check('no false positive on a document URL, a commit id, a UUID, a file name, an identifier, a dossier number', v.status === 0, v.stdout);
git('add', '--', 'memoire/fiche-test.md', 'memoire/.autorises');
v = verify(['--staged']);
check('a clean staged file passes (exit 0)', v.status === 0, v.stdout + v.stderr);
git('reset', '-q', '--', 'memoire/fiche-test.md', 'memoire/.autorises');

// ---------------------------------------------------------------------------------------------------------------
section('sauvegarde.mjs');
// ---------------------------------------------------------------------------------------------------------------
write('projets/demo/notes/procedure.md', '# Procédure\n\nÀ retirer pendant le test.\n');
node('outils/sauvegarde.mjs'); // settle what the sections above left behind
write('brouillon-hors-memoire.md', 'Fichier hors des chemins sauvegardés.\n');
write('autre-indexe.md', 'Fichier déjà indexé, hors des chemins sauvegardés.\n');
git('add', '--', 'autre-indexe.md');
appendFileSync(ws('memoire/journal.md'), '2026-01-03 : test de sauvegarde sans dépôt distant\n');
unlinkSync(ws('projets/demo/notes/brouillon.md')); // deletion not staged
git('rm', '-q', '--', 'projets/demo/notes/procedure.md'); // deletion already staged
let n0 = headCount();
let sv = node('outils/sauvegarde.mjs');
const files = git('show', '--name-status', '--format=', 'HEAD').stdout;
check('without a remote: commit made, exit 0', sv.status === 0 && headCount() === n0 + 1 && /^sauvegarde: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(lastSubject()), sv.stdout + sv.stderr);
check('without a remote: the push is skipped quietly', !/envoi|dépôt en ligne/i.test(sv.stdout), sv.stdout);
check('the commit holds the memory change and both deletions (unstaged and staged)',
  files.includes('memoire/journal.md') && /D\s+projets\/demo\/notes\/brouillon\.md/.test(files)
  && /D\s+projets\/demo\/notes\/procedure\.md/.test(files), files);
check('files outside the allowed paths stay out of the commit',
  !files.includes('brouillon-hors-memoire.md') && !files.includes('autre-indexe.md'), files);
check('a file staged outside the allowed paths stays staged', git('diff', '--cached', '--name-only').stdout.includes('autre-indexe.md'));
git('reset', '-q', '--', 'autre-indexe.md');

n0 = headCount();
sv = node('outils/sauvegarde.mjs');
check('nothing changed: no commit, exit 0', sv.status === 0 && headCount() === n0 && sv.stdout.includes('Rien à sauvegarder'), sv.stdout);

write('memoire/.sauvegarde-desactivee', '');
appendFileSync(ws('memoire/journal.md'), '2026-01-04 : test avec la sauvegarde désactivée\n');
n0 = headCount();
sv = node('outils/sauvegarde.mjs');
check('memoire/.sauvegarde-desactivee: no commit, exit 0', sv.status === 0 && headCount() === n0 && sv.stdout.includes('désactivée'), sv.stdout);
unlinkSync(ws('memoire/.sauvegarde-desactivee'));

const secretLine = `jeton du fournisseur : ${'ghp'}_${alnum(36)}`;
appendFileSync(ws('memoire/journal.md'), `2026-01-05 : ${secretLine}\n`);
n0 = headCount();
sv = node('outils/sauvegarde.mjs');
check('a secret in memoire/: no commit, exit 1', sv.status === 1 && headCount() === n0, sv.stdout);
check('the message names the file and the rule, in French', /Sauvegarde bloquée/.test(sv.stdout) && /memoire\/journal\.md:\d+ : jeton GitHub/.test(sv.stdout), sv.stdout);
check('the message never shows the value', !sv.stdout.includes(secretLine.split(' : ')[1]));
check('nothing is left staged after a blocked save', !git('diff', '--cached', '--name-only').stdout.trim());
sv = node('outils/sauvegarde.mjs', ['--hook']);
check('--hook mode exits 0 even when blocked', sv.status === 0 && headCount() === n0, sv.stdout);
git('checkout', '-q', '--', 'memoire/journal.md');

const REMOTE = join(TMP, 'distant.git');
spawnSync('git', ['init', '-q', '--bare', REMOTE], { encoding: 'utf8' });
git('remote', 'add', 'origin', REMOTE);
git('push', '-q', '-u', 'origin', 'main');
appendFileSync(ws('memoire/journal.md'), '2026-01-06 : test avec un dépôt distant\n');
sv = node('outils/sauvegarde.mjs');
const remoteHead = spawnSync('git', ['--git-dir', REMOTE, 'rev-parse', 'main'], { encoding: 'utf8' }).stdout.trim();
check('with an upstream: the save is pushed', sv.status === 0 && remoteHead === git('rev-parse', 'HEAD').stdout.trim() && /Envoyée/.test(sv.stdout), sv.stdout + sv.stderr);

git('remote', 'set-url', 'origin', join(TMP, 'absent.git'));
appendFileSync(ws('memoire/journal.md'), '2026-01-07 : test avec un envoi qui échoue\n');
n0 = headCount();
sv = node('outils/sauvegarde.mjs');
check('push failure: commit kept locally, one French line, exit 0',
  sv.status === 0 && headCount() === n0 + 1 && /n'a pas fonctionné/.test(sv.stdout) && sv.stdout.trim().split('\n').length === 1, sv.stdout + sv.stderr);
git('remote', 'set-url', 'origin', REMOTE);
sv = node('outils/sauvegarde.mjs');
check('a later run retries the pending sauvegarde push',
  sv.status === 0 && spawnSync('git', ['--git-dir', REMOTE, 'rev-parse', 'main'], { encoding: 'utf8' }).stdout.trim() === git('rev-parse', 'HEAD').stdout.trim(), sv.stdout);

// ---------------------------------------------------------------------------------------------------------------
console.log(`\n# ${passed} passed, ${failed} failed, ${skipped} skipped (node ${process.version}, ${process.platform}, ${git('--version').stdout.trim()})`);
if (KEEP) console.log(`# temp workspace kept at ${WS}`);
else rmSync(TMP, { recursive: true, force: true });
process.exitCode = failed ? 1 : 0;
