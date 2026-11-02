import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'how', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their',
  'them', 'then', 'there', 'these', 'they', 'this', 'to', 'use', 'used', 'using',
  'when', 'where', 'which', 'who', 'will', 'with', 'you', 'your', 'skill', 'user',
  'asks', 'wants', 'should', 'can', 'any', 'all', 'also', 'even', 'dont', 'does',
  'not', 'about', 'like', 'such', 'more', 'other', 'new', 'need', 'needs', 'make',
]);

export interface IndexedSkill {
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  relPath: string;
  summary: string;
  norm: number;
  terms: Record<string, number>;
  tier?: 'core' | 'archive';
}

interface SkillIndexFile {
  version: string;
  totalSkills: number;
  skills: IndexedSkill[];
}

export interface SkillSearchMatch {
  /** Installed slash command; only Core skills are installed (plan D1). Archive skills: read skillPath. */
  command: string | null;
  tier: 'core' | 'archive';
  slug: string;
  name: string;
  category: string;
  score: number;
  summary: string;
  skillPath: string;
}

export interface SearchSkillsInput {
  query: string;
  category?: string;
  limit?: number;
}

let cachedIndex: { mtimeLoaded: number; skillsRoot: string; data: SkillIndexFile } | null = null;

function stemWord(word: string): string {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('tion') && word.length > 6) return word.slice(0, -4) + 't';
  if (word.endsWith('ment') && word.length > 6) return word.slice(0, -4);
  if (word.endsWith('ness') && word.length > 6) return word.slice(0, -4);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

function tokenizeQuery(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));

  const out: string[] = [];
  for (const w of raw) {
    out.push(stemWord(w));
    if (w.includes('-')) {
      for (const part of w.split('-')) {
        if (part.length >= 2 && !STOPWORDS.has(part)) {
          out.push(stemWord(part));
        }
      }
    }
  }
  return out;
}

function resolveSkillsRoot(): string {
  // collab-mcp/dist/skills.js -> ../../skills
  const here = dirname(fileURLToPath(import.meta.url));
  const candidate = resolve(here, '..', '..', 'skills');
  if (existsSync(candidate)) return candidate;
  return resolve(process.cwd(), 'skills');
}

function loadIndex(): { skillsRoot: string; data: SkillIndexFile } {
  const skillsRoot = resolveSkillsRoot();
  const indexPath = join(skillsRoot, '_index', 'skills-index.json');
  if (!existsSync(indexPath)) {
    throw new Error(
      `Skills index not found at ${indexPath}. Run "node scripts/build-skill-index.js" in Curated_Skills first.`
    );
  }
  if (!cachedIndex) {
    const raw = readFileSync(indexPath, 'utf-8');
    cachedIndex = {
      mtimeLoaded: Date.now(),
      skillsRoot: skillsRoot.replace(/\\/g, '/'),
      data: JSON.parse(raw) as SkillIndexFile,
    };
  }
  return cachedIndex;
}

/**
 * Hybrid vector cosine similarity + BM25 term overlap + slug prefix matching
 * over the pre-computed 1,500+ skill index.
 */
export function searchSkills(input: SearchSkillsInput): {
  totalIndexed: number;
  matches: SkillSearchMatch[];
} {
  const { skillsRoot, data } = loadIndex();
  const rawQuery = input.query.trim().replace(/^[@/]+/, '');
  const normSlugQuery = rawQuery.toLowerCase().replace(/\s+/g, '-');
  const queryTokens = tokenizeQuery(rawQuery);
  const categoryFilter = input.category?.trim().toLowerCase();
  const limit = Math.max(1, Math.min(input.limit ?? 5, 25));

  const qFreq: Record<string, number> = {};
  for (const tok of queryTokens) {
    qFreq[tok] = (qFreq[tok] ?? 0) + 1;
  }
  const qNorm = Math.sqrt(Object.values(qFreq).reduce((acc, v) => acc + v * v, 0)) || 1;

  const scored: SkillSearchMatch[] = [];

  for (const skill of data.skills) {
    if (categoryFilter) {
      const catHaystack = `${skill.category} ${skill.subcategory}`.toLowerCase();
      if (!catHaystack.includes(categoryFilter)) continue;
    }

    let dot = 0;
    let matchedTerms = 0;
    for (const [qTerm, qWeight] of Object.entries(qFreq)) {
      const docWeight = skill.terms[qTerm];
      if (docWeight !== undefined) {
        dot += qWeight * docWeight;
        matchedTerms++;
      } else {
        // Prefix partial match for longer technical stems
        if (qTerm.length >= 4) {
          for (const [dTerm, dWeight] of Object.entries(skill.terms)) {
            if (dTerm.startsWith(qTerm) || qTerm.startsWith(dTerm)) {
              dot += qWeight * dWeight * 0.45;
              matchedTerms += 0.5;
              break;
            }
          }
        }
      }
    }

    const cosine = dot / (qNorm * (skill.norm || 1));
    const coverage = queryTokens.length > 0 ? matchedTerms / Object.keys(qFreq).length : 0;

    let slugBoost = 0;
    if (skill.slug === normSlugQuery) {
      slugBoost = 50;
    } else if (skill.slug.startsWith(normSlugQuery) && normSlugQuery.length >= 3) {
      slugBoost = 15;
    } else if (skill.slug.includes(normSlugQuery) && normSlugQuery.length >= 3) {
      slugBoost = 8;
    }

    const totalScore = Number((cosine * 20 + coverage * 10 + slugBoost).toFixed(2));
    if (totalScore > 0.5) {
      scored.push({
        command: skill.tier === 'core' ? `/${skill.slug}` : null,
        tier: skill.tier === 'core' ? 'core' : 'archive',
        slug: skill.slug,
        name: skill.name,
        category: skill.subcategory ? `${skill.category} / ${skill.subcategory}` : skill.category,
        score: totalScore,
        summary: skill.summary,
        skillPath: `${skillsRoot}/${skill.relPath}`,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug));
  return {
    totalIndexed: data.totalSkills,
    matches: scored.slice(0, limit),
  };
}

