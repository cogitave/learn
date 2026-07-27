// ---------------------------------------------------------------------------
// VALIDATE
// ---------------------------------------------------------------------------

const REQUIRED = {
  LearningPath: ['uid', 'title', 'summary', 'modules', 'trophy'],
  Module: ['uid', 'title', 'summary', 'abstract', 'units', 'badge'],
  ModuleUnit: ['uid', 'title'],
};

export function validate(docs, { byUid, achievements }, { err }) {
  for (const d of docs) {
    if (d.kind === 'Achievements' || d.kind === 'doc') continue;
    const req = REQUIRED[d.kind];
    if (!req) {
      err('schema', d.rel, `unknown YamlMime type '${d.kind}'`);
      continue;
    }
    for (const f of req) {
      if (d.data[f] == null) err('schema', d.rel, `missing required field '${f}'`);
    }

    // metadata-required: description length is a certificate-level gate.
    const desc = d.data.metadata?.description;
    if (desc == null) err('metadata-required', d.rel, 'metadata.description is required');
    else if (desc.length < 75 || desc.length > 300) {
      err('metadata-required', d.rel, `metadata.description must be 75-300 chars (is ${desc.length})`);
    }

    // unit-membership
    if (d.kind === 'Module') {
      for (const u of d.data.units ?? []) {
        const t = byUid.get(u);
        if (!t) err('unit-membership', d.rel, `units[] UID does not resolve: ${u}`);
        else if (t.kind !== 'ModuleUnit') err('unit-membership', d.rel, `${u} is a ${t.kind}, expected ModuleUnit`);
      }
      const badge = d.data.badge?.uid;
      if (badge && !achievements.has(badge)) {
        err('achievement-resolves', d.rel, `badge.uid not in achievements.yml: ${badge}`);
      }
    }

    if (d.kind === 'LearningPath') {
      for (const m of d.data.modules ?? []) {
        const t = byUid.get(m);
        if (!t) err('unit-membership', d.rel, `modules[] UID does not resolve: ${m}`);
        else if (t.kind !== 'Module') err('unit-membership', d.rel, `${m} is a ${t.kind}, expected Module`);
      }
      const trophy = d.data.trophy?.uid;
      if (trophy && !achievements.has(trophy)) {
        err('achievement-resolves', d.rel, `trophy.uid not in achievements.yml: ${trophy}`);
      }
    }

    // quiz-shape (partial: structural only)
    if (d.data.quiz) {
      for (const q of d.data.quiz.questions ?? []) {
        const choices = q.choices ?? [];
        if (choices.length < 2) err('quiz-shape', d.rel, `question '${q.content}' has fewer than 2 choices`);
        const correct = choices.filter((c) => c.isCorrect === true).length;
        if (correct !== 1) err('quiz-shape', d.rel, `question '${q.content}' has ${correct} correct choices, expected exactly 1`);
        for (const c of choices) {
          if (!c.explanation) err('quiz-shape', d.rel, `choice '${c.content}' has no explanation`);
        }
      }
    }
  }
}
