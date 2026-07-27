import { join, relative, sep } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';

// ---------------------------------------------------------------------------
// glob -> regex (supports **, *, ? - the subset docs.config.json uses)
// ---------------------------------------------------------------------------

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        // `**/` matches zero or more path segments; bare `**` matches anything.
        if (glob[i + 2] === '/') {
          re += '(?:[^/]*/)*';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

export const matchesAny = (rel, globs) => globs.some((g) => globToRegExp(g).test(rel));

// ---------------------------------------------------------------------------
// ACQUIRE
// ---------------------------------------------------------------------------

function walk(dir, base = dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, base, acc);
    else acc.push(relative(base, full).split(sep).join('/'));
  }
  return acc;
}

export function acquire(config, { ROOT, err }) {
  const sources = [];
  for (const root of config.build.content) {
    if (root.files && !root.src) {
      // Explicit file list relative to the content root (the achievements loader).
      for (const f of root.files) {
        if (existsSync(join(ROOT, f))) sources.push({ loader: root.loader, rel: f, dest: root.dest });
        else err('broken-link', f, `content root declares a file that does not exist`);
      }
      continue;
    }
    const srcDir = join(ROOT, root.src);
    for (const rel of walk(srcDir)) {
      if (root.files && !matchesAny(rel, root.files)) continue;
      if (root.exclude && matchesAny(rel, root.exclude)) continue;
      sources.push({ loader: root.loader, rel: `${root.src}/${rel}`, srcRel: rel, dest: root.dest });
    }
  }
  return sources;
}
