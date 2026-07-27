import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { parseYamlMime, parseYaml, YamlError } from './yaml.mjs';

// ---------------------------------------------------------------------------
// PARSE
// ---------------------------------------------------------------------------

export function splitFrontMatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  return { meta: parseYaml(m[1]), body: text.slice(m[0].length) };
}

export function parseAll(sources, { ROOT, err }) {
  const docs = [];
  for (const s of sources) {
    const abs = join(ROOT, s.rel);
    const text = readFileSync(abs, 'utf8');

    if (s.loader === 'diataxis') {
      const { meta, body } = splitFrontMatter(text);
      docs.push({ kind: 'doc', ...s, meta, body });
      continue;
    }

    if (!s.rel.endsWith('.yml')) continue; // learn-pr prose lives in includes/

    try {
      const { mime, data } = parseYamlMime(text, s.rel);
      docs.push({ kind: mime, ...s, data });
    } catch (e) {
      if (e instanceof YamlError) err('schema', s.rel, e.message);
      else throw e;
    }
  }
  return docs;
}
