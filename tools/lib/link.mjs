import { slugify } from './markdown.mjs';

// ---------------------------------------------------------------------------
// LINK
// ---------------------------------------------------------------------------

const moduleSlug = (uid) => uid.replace(/^cogitave\.learn\./, '');
const pathSlug = (uid) => uid.replace(/^cogitave\.learn\.paths\./, '');

export function link(docs, { err }) {
  const byUid = new Map();
  const achievements = new Map();

  for (const d of docs) {
    if (d.kind === 'Achievements') {
      for (const a of d.data.achievements ?? []) achievements.set(a.uid, a);
      continue;
    }
    if (d.kind === 'doc') continue;
    const uid = d.data?.uid;
    if (!uid) {
      err('schema', d.rel, 'document has no uid');
      continue;
    }
    if (byUid.has(uid)) {
      err('schema', d.rel, `duplicate uid '${uid}' (also in ${byUid.get(uid).rel})`);
      continue;
    }
    byUid.set(uid, d);
  }

  // URL assignment
  for (const d of byUid.values()) {
    if (d.kind === 'LearningPath') d.href = `/paths/${pathSlug(d.data.uid)}/`;
    else if (d.kind === 'Module') d.href = `/modules/${moduleSlug(d.data.uid)}/`;
  }
  for (const d of byUid.values()) {
    if (d.kind !== 'ModuleUnit') continue;
    const parent = [...byUid.values()].find(
      (m) => m.kind === 'Module' && (m.data.units ?? []).includes(d.data.uid),
    );
    d.parent = parent ?? null;
    const unitSlug = d.data.uid.split('.').pop();
    d.href = parent ? `${parent.href}${unitSlug}/` : `/units/${unitSlug}/`;
  }
  for (const d of docs) {
    if (d.kind === 'doc') d.href = `/docs/${slugify(d.srcRel.replace(/\.md$/, ''))}/`;
  }

  return { byUid, achievements };
}
