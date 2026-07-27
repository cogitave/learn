import { renderMarkdown, renderInline, escapeHtml } from '../markdown.mjs';
import { icon } from '../icons.mjs';
import {
  shell, card, cardGrid, awardNote, factRow, extractToc, minutes, pager,
} from '../layout.mjs';
import { loadInclude } from '../includes.mjs';
import { writePage } from './site.mjs';

/**
 * The knowledge check is answerable, not just readable: choosing marks the pick,
 * reveals the explanation for every option, and scores the set. Without
 * JavaScript the choices render as inert buttons with their explanations
 * visible, which is the honest static fallback - so a note says so.
 */
function renderQuiz(quiz) {
  const qs = (quiz.questions ?? [])
    .map((q, n) => {
      const choices = (q.choices ?? [])
        .map(
          (c) =>
            `<li><button class="choice" type="button" data-correct="${c.isCorrect === true}">` +
            `<span class="choice-dot">${icon('check')}</span>` +
            `<span class="choice-text">${renderInline(String(c.content))}</span>` +
            `<span class="choice-explain">${renderInline(String(c.explanation ?? ''))}</span>` +
            `</button></li>`,
        )
        .join('');
      return (
        `<li class="question">` +
        `<p class="question-text"><span class="question-no">${String(n + 1).padStart(2, '0')}</span>` +
        `${renderInline(String(q.content))}</p>` +
        `<ul class="choices">${choices}</ul></li>`
      );
    })
    .join('');
  return (
    `<section class="quiz">` +
    `<h2 class="quiz-head">${icon('quiz', { size: 20 })}${escapeHtml(quiz.title ?? 'Knowledge check')}</h2>` +
    `<p class="quiz-lede">Choose an answer to see why it is right or wrong.</p>` +
    `<p class="quiz-noscript">JavaScript is off, so every explanation is shown at once.</p>` +
    `<ol class="questions">${qs}</ol>` +
    `<p class="quiz-score" hidden></p>` +
    `</section>`
  );
}

/**
 * The node page renderers: learning paths, modules, units, and diataxis docs.
 * Each pushes its search-index and api entries in emission order, so this runs
 * after the landings have seeded the facet entries.
 */
export function renderPages(vm, outDir, { ROOT, err }) {
  const {
    paths, modules, units, achievements, modulesOf, unitsOf, duration, pathOf,
    title, summary, ctxFor, indexEntry, apiEntry, byUid, nav, trainingSidenav,
    docsSidenav, docTypes,
  } = vm;

  // --- learning paths -------------------------------------------------------
  for (const p of paths) {
    const mods = modulesOf(p);
    const trophy = achievements.get(p.data.trophy?.uid);
    const prereq = p.data.prerequisites
      ? `<h2 id="prerequisites">Prerequisites</h2>${renderMarkdown(String(p.data.prerequisites), ctxFor(p))}`
      : '';

    const body =
      `<article class="path">` +
      `<h1>${escapeHtml(title(p))}</h1>` +
      `<p class="lede">${escapeHtml(summary(p))}</p>` +
      factRow([
        { key: 'Modules', value: String(mods.length), icon: 'module' },
        { key: 'Duration', value: minutes(mods.reduce((n, m) => n + duration(m), 0)), icon: 'clock' },
        { key: 'Level', value: (p.data.levels ?? [])[0] ?? '', icon: 'path' },
      ]) +
      (mods.length ? `<div class="cta-row"><a class="cta" href="${mods[0].href}">Start path ${icon('arrowRight')}</a></div>` : '') +
      prereq +
      `<h2 id="modules-in-this-path">Modules in this path</h2>` +
      cardGrid(
        mods.map((m) =>
          card({
            href: m.href,
            title: title(m),
            summary: summary(m),
            icon: 'module',
            meta: [`${unitsOf(m).length} units`, minutes(duration(m))],
          }),
        ),
      ) +
      (trophy ? awardNote('trophy', trophy.title, trophy.summary) : '') +
      `</article>`;

    indexEntry('Learning path', p);
    apiEntry(p, {
      kind: 'learningPath',
      source: String(p.data.prerequisites ?? ''),
      extra: {
        modules: mods.map((m) => m.data.uid),
        durationInMinutes: mods.reduce((n, m) => n + duration(m), 0),
        trophy: p.data.trophy?.uid ?? null,
      },
    });
    writePage(
      outDir,
      p.href,
      shell({
        title: title(p),
        description: p.data.metadata?.description,
        body,
        nav,
        section: 'training',
        breadcrumb: [
          { label: 'Learn', href: '/' },
          { label: 'Training', href: '/training/' },
          { label: title(p) },
        ],
        toc: extractToc(body),
        sidenav: trainingSidenav(p.href),
      }),
    );
  }

  // --- modules ---------------------------------------------------------------
  for (const m of modules) {
    const us = unitsOf(m);
    const badge = achievements.get(m.data.badge?.uid);
    const parentPath = pathOf(m);
    const abstract = m.data.abstract ? renderMarkdown(String(m.data.abstract), ctxFor(m)) : '';

    const body =
      `<article class="module">` +
      `<h1>${escapeHtml(title(m))}</h1>` +
      `<p class="lede">${escapeHtml(summary(m))}</p>` +
      factRow([
        { key: 'Units', value: String(us.length), icon: 'unit' },
        { key: 'Duration', value: minutes(duration(m)), icon: 'clock' },
        { key: 'Level', value: (m.data.levels ?? [])[0] ?? '', icon: 'module' },
      ]) +
      (us.length ? `<div class="cta-row"><a class="cta" href="${us[0].href}">Start module ${icon('arrowRight')}</a></div>` : '') +
      abstract +
      `<h2 id="units">Units</h2>` +
      `<ol class="unit-list">${us
        .map(
          (u, n) =>
            `<li><a href="${u.href}">` +
            `<span class="unit-no">${String(n + 1).padStart(2, '0')}</span>` +
            `<span class="unit-main"><span class="unit-title">${escapeHtml(title(u))}</span></span>` +
            (u.data.durationInMinutes
              ? `<span class="unit-dur">${icon('clock')}${minutes(u.data.durationInMinutes)}</span>`
              : '<span></span>') +
            `</a></li>`,
        )
        .join('')}</ol>` +
      (badge ? awardNote('badge', badge.title, badge.summary) : '') +
      `</article>`;

    indexEntry('Module', m, extractToc(abstract).map((t) => t.text));
    apiEntry(m, {
      kind: 'module',
      source: String(m.data.abstract ?? ''),
      extra: {
        units: us.map((u) => u.data.uid),
        durationInMinutes: duration(m),
        badge: m.data.badge?.uid ?? null,
        partOf: parentPath?.data.uid ?? null,
      },
    });
    writePage(
      outDir,
      m.href,
      shell({
        title: title(m),
        description: m.data.metadata?.description,
        body,
        nav,
        section: 'training',
        breadcrumb: [
          { label: 'Learn', href: '/' },
          { label: 'Training', href: '/training/' },
          ...(parentPath ? [{ label: title(parentPath), href: parentPath.href }] : []),
          { label: title(m) },
        ],
        toc: extractToc(body),
        sidenav: {
          label: 'Units in this module',
          href: parentPath ? parentPath.href : '/training/',
          title: parentPath ? title(parentPath) : 'All training',
          items: us.map((u) => ({
            href: u.href,
            title: title(u),
            meta: minutes(u.data.durationInMinutes),
            current: false,
          })),
        },
      }),
    );
  }

  // --- units ------------------------------------------------------------------
  for (const u of units) {
    const ctx = ctxFor(u);
    let inner = '';
    // Keep the authored markdown: it is what the JSON API and llms-full.txt
    // serve, so an agent reads the source rather than de-tagged HTML.
    let source = '';
    if (u.data.content) {
      const inc = /\[!include\[[^\]]*\]\(([^)]+)\)\]/.exec(String(u.data.content));
      if (inc) {
        const text = loadInclude(u, inc[1], { ROOT, err });
        source = text ?? '';
        inner = text == null ? '' : renderMarkdown(text, ctx);
      } else {
        source = String(u.data.content);
        inner = renderMarkdown(source, ctx);
      }
    }
    if (u.data.quiz) inner += renderQuiz(u.data.quiz);

    const siblings = u.parent ? (u.parent.data.units ?? []) : [];
    const idx = siblings.indexOf(u.data.uid);
    const prev = idx > 0 ? byUid.get(siblings[idx - 1]) : null;
    const next = idx >= 0 && idx < siblings.length - 1 ? byUid.get(siblings[idx + 1]) : null;

    const body =
      `<article class="unit"><h1>${escapeHtml(title(u))}</h1>${inner}</article>` +
      pager(
        prev ? { href: prev.href, title: title(prev) } : null,
        next ? { href: next.href, title: title(next) } : null,
      );

    const toc = extractToc(inner);
    indexEntry('Unit', u, toc.map((t) => t.text));
    apiEntry(u, {
      kind: 'moduleUnit',
      source,
      headings: toc.map((t) => t.text),
      extra: {
        partOf: u.parent?.data.uid ?? null,
        durationInMinutes: u.data.durationInMinutes ?? null,
        // A quiz is structured data, so expose it as data - an agent should not
        // have to scrape the answers out of rendered buttons.
        quiz: u.data.quiz
          ? {
              title: u.data.quiz.title ?? 'Knowledge check',
              questions: (u.data.quiz.questions ?? []).map((q) => ({
                content: q.content,
                choices: (q.choices ?? []).map((c) => ({
                  content: c.content,
                  isCorrect: c.isCorrect === true,
                  explanation: c.explanation ?? '',
                })),
              })),
            }
          : null,
      },
    });
    writePage(
      outDir,
      u.href,
      shell({
        title: title(u),
        description: u.data.metadata?.description,
        body,
        nav,
        section: 'training',
        breadcrumb: [
          { label: 'Learn', href: '/' },
          { label: 'Training', href: '/training/' },
          ...(u.parent ? [{ label: title(u.parent), href: u.parent.href }] : []),
          { label: title(u) },
        ],
        toc,
        sidenav: u.parent
          ? {
              label: 'Units in this module',
              href: u.parent.href,
              title: title(u.parent),
              progress: true,
              items: unitsOf(u.parent).map((s) => ({
                href: s.href,
                title: title(s),
                meta: minutes(s.data.durationInMinutes),
                current: s.data.uid === u.data.uid,
              })),
            }
          : null,
      }),
    );
  }

  // --- diataxis docs ------------------------------------------------------------
  // Emit in reading order so the search index, the JSON catalogue, and llms.txt
  // all present documentation the way the landing page does.
  for (const d of docTypes.flatMap((t) => t.items)) {
    const rendered = renderMarkdown(d.body, ctxFor(d));
    const body = `<article class="doc">${rendered}</article>`;
    const toc = extractToc(rendered);
    indexEntry('Platform doc', d, toc.map((t) => t.text));
    apiEntry(d, {
      kind: 'doc',
      source: d.body,
      headings: toc.map((t) => t.text),
      extra: { lastReviewed: d.meta.lastReviewed ?? null, order: d.meta.order ?? null },
    });
    writePage(
      outDir,
      d.href,
      shell({
        title: title(d),
        description: d.meta.description,
        body,
        nav,
        section: 'docs',
        breadcrumb: [
          { label: 'Learn', href: '/' },
          { label: 'Documentation', href: '/documentation/' },
          { label: title(d) },
        ],
        toc,
        sidenav: docsSidenav(d.href),
      }),
    );
  }
}
