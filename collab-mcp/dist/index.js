import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { configFor, scopeToFilename, startHandoff, appendNote, readLatestHandoff, listHandoffs, } from './collab.js';
const server = new McpServer({ name: 'collab-mcp', version: '0.2.0' });
async function clientFileRoots() {
    if (!server.server.getClientCapabilities()?.roots)
        return null;
    try {
        const { roots } = await server.server.listRoots();
        return roots.filter((r) => r.uri.startsWith('file://')).map((r) => fileURLToPath(r.uri));
    }
    catch {
        return null;
    }
}
/**
 * Order: explicit argument, then the client's workspace roots, then the env fallback.
 * With several roots the server never guesses: it uses the single root where `fits` holds,
 * otherwise it refuses. Taking the first root wrote to the wrong project in multi-root workspaces.
 */
async function resolveProject(projectDirArg, fits) {
    if (projectDirArg)
        return { projectDir: projectDirArg, source: 'project_dir argument' };
    const roots = await clientFileRoots();
    if (roots && roots.length === 1)
        return { projectDir: roots[0], source: 'client workspace root' };
    if (roots && roots.length > 1) {
        const matches = roots.filter(fits);
        if (matches.length === 1)
            return { projectDir: matches[0], source: 'matching workspace root' };
        // Deliberately no env fallback here: a pinned env var would silently pick a project again.
        throw new Error(`This workspace has ${roots.length} folders and ${matches.length === 0 ? 'none' : matches.length} ` +
            `of them fit, so the target project is ambiguous: ${roots.join(' | ')}. ` +
            'Pass project_dir with the repository root you mean.');
    }
    const envDir = process.env.COLLAB_PROJECT_DIR;
    if (envDir)
        return { projectDir: envDir, source: 'COLLAB_PROJECT_DIR' };
    throw new Error('Cannot tell which project to use: no project_dir argument, the client reported no workspace ' +
        'root, and COLLAB_PROJECT_DIR is not set. Pass project_dir with the repository root path.');
}
const hasCollabDir = (dir) => existsSync(join(dir, 'docs', 'COLLAB'));
const hasHandoff = (scope) => (dir) => existsSync(join(dir, 'docs', 'COLLAB', scopeToFilename(scope)));
async function withProject(projectDirArg, createIfMissing, fits, run) {
    const { projectDir, source } = await resolveProject(projectDirArg, fits);
    const config = configFor(projectDir, { createIfMissing });
    return { result: run(config), footer: `\n\n(project: ${projectDir}, from ${source})` };
}
const projectDirField = z
    .string()
    .optional()
    .describe('Absolute path to the repository root. Always pass it when your workspace has more than one ' +
    "folder. If omitted: a single-folder workspace is used as-is; with several folders the server " +
    'uses the one folder that fits and refuses when that is ambiguous; with none, COLLAB_PROJECT_DIR.');
server.registerTool('start_handoff', {
    description: 'Create a new handoff file in docs/COLLAB for a scope (e.g. "general" -> HANDOFF.md, ' +
        '"admin-ontology" -> HANDOFF-ADMIN-ONTOLOGY.md, or a one-off dated task slug). ' +
        'Never overwrites an existing file for that scope — use append_note on an existing one.',
    inputSchema: z.object({
        scope: z.string().describe('Topic slug, or "general" for the repo-wide handoff.'),
        tool: z.string().describe('Who is writing this, e.g. "claude-code" or "antigravity".'),
        summary: z.string().describe('What this handoff covers, in a sentence or two.'),
        project_dir: projectDirField,
    }),
}, async ({ scope, tool, summary, project_dir }) => {
    const { result, footer } = await withProject(project_dir, true, hasCollabDir, (config) => startHandoff(config, { scope, tool, summary }));
    const text = result.created
        ? `Created ${result.path}`
        : `${result.path} already exists — use append_note instead.`;
    return { content: [{ type: 'text', text: text + footer }] };
});
server.registerTool('append_note', {
    description: 'Append a new dated, numbered section to an existing docs/COLLAB handoff file.',
    inputSchema: z.object({
        scope: z.string().describe('Same scope used in start_handoff.'),
        tool: z.string().describe('Who is writing this note.'),
        note: z.string().describe('What happened, what changed, what is next.'),
        project_dir: projectDirField,
    }),
}, async ({ scope, tool, note, project_dir }) => {
    const { result, footer } = await withProject(project_dir, false, hasHandoff(scope), (config) => appendNote(config, { scope, tool, note }));
    return {
        content: [
            { type: 'text', text: `Appended section ${result.sectionNumber} to ${result.path}${footer}` },
        ],
    };
});
server.registerTool('read_latest_handoff', {
    description: 'Read the full contents of the handoff file for a scope (defaults to "general").',
    inputSchema: z.object({
        scope: z.string().optional().describe('Defaults to "general" (HANDOFF.md) if omitted.'),
        project_dir: projectDirField,
    }),
}, async ({ scope, project_dir }) => {
    const { result, footer } = await withProject(project_dir, false, hasHandoff(scope ?? 'general'), (config) => readLatestHandoff(config, scope ?? 'general'));
    const header = `${result.path} (last modified ${result.modifiedISO})\n\n`;
    return { content: [{ type: 'text', text: header + result.content + footer }] };
});
server.registerTool('list_handoffs', {
    description: 'List every handoff file in docs/COLLAB with its title and last-modified date.',
    inputSchema: z.object({ project_dir: projectDirField }),
}, async ({ project_dir }) => {
    const { result: listings, footer } = await withProject(project_dir, false, hasCollabDir, listHandoffs);
    const lines = listings.map((l) => `${l.filename} — "${l.title}" — modified ${l.modifiedISO} — ${l.bytes} bytes`);
    const body = lines.length > 0 ? lines.join('\n') : 'No handoff files yet.';
    return { content: [{ type: 'text', text: body + footer }] };
});
async function main() {
    await server.connect(new StdioServerTransport());
    console.error('collab-mcp connected; project folder is resolved per call');
}
main().catch((error) => {
    console.error('collab-mcp failed to start:', error);
    process.exit(1);
});
