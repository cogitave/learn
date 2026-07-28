/**
 * Line-icon set for learn.cogitave.com.
 *
 * One geometric family, drawn on a 16-unit grid, `currentColor` only, no fills.
 * Stroke weight is 1.5 at every size so a 14px navigation icon and a 20px card
 * icon read as the same pen - the convention the Cogitave marketing surface
 * already uses (hairline strokes, round caps and joins).
 *
 * Sizes are not free-form: navigation and inline affordances are 14px, card and
 * section marks are 20px. See docs/design-language.md ("Iconography").
 */

const PATHS = {
  // navigation / affordances (14px)
  chevronRight: '<path d="M6 3.5L10.5 8L6 12.5"/>',
  chevronDown: '<path d="M3.5 6L8 10.5L12.5 6"/>',
  arrowRight: '<path d="M3 8h10m0 0l-4-4m4 4l-4 4"/>',
  arrowLeft: '<path d="M13 8H3m0 0l4-4m-4 4l4 4"/>',
  search: '<circle cx="7.2" cy="7.2" r="4.4"/><path d="M10.5 10.5L14 14"/>',
  close: '<path d="M4 4l8 8m0-8l-8 8"/>',
  menu: '<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/>',
  sun: '<circle cx="8" cy="8" r="3.1"/><path d="M8 1.5v1.6M8 12.9v1.6M14.5 8h-1.6M3.1 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5L3.4 3.4"/>',
  moon: '<path d="M13.2 9.6A5.6 5.6 0 016.4 2.8a5.6 5.6 0 106.8 6.8z"/>',
  copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.8"/><path d="M10.5 5.5v-1a1.8 1.8 0 00-1.8-1.8H4.3A1.8 1.8 0 002.5 4.5v4.4a1.8 1.8 0 001.8 1.8h1.2"/>',
  check: '<path d="M3 8.4l3.2 3.2L13 4.8"/>',
  external: '<path d="M9.5 2.5H13.5V6.5M13.5 2.5L7.5 8.5"/><path d="M12 9.8v2.9a1.8 1.8 0 01-1.8 1.8H3.3a1.8 1.8 0 01-1.8-1.8V5.8A1.8 1.8 0 013.3 4h2.9"/>',
  hash: '<path d="M6.2 2.5L4.6 13.5M11.4 2.5L9.8 13.5M2.8 5.8h10.4M2.2 10.2h10.4"/>',
  terminal: '<rect x="2" y="3" width="12" height="10" rx="1.8"/><path d="M4.7 6.6L6.9 8.3 4.7 10"/><path d="M8.4 10.2h2.9"/>',
  braces: '<path d="M6.6 3.4c-1.2 0-1.6.5-1.6 1.7v1c0 .9-.4 1.5-1.2 1.7.8.2 1.2.8 1.2 1.7v1c0 1.2.4 1.7 1.6 1.7"/><path d="M9.4 3.4c1.2 0 1.6.5 1.6 1.7v1c0 .9.4 1.5 1.2 1.7-.8.2-1.2.8-1.2 1.7v1c0 1.2-.4 1.7-1.6 1.7"/>',
  pencil: '<path d="M10.5 2.6l2.9 2.9-7.4 7.4H3.1v-2.9z"/><path d="M8.9 4.2l2.9 2.9"/>',
  comment: '<path d="M2.5 4.3A1.8 1.8 0 014.3 2.5h7.4a1.8 1.8 0 011.8 1.8v4a1.8 1.8 0 01-1.8 1.8H7l-3 2.4V10.1H4.3a1.8 1.8 0 01-1.8-1.8z"/>',
  calendar: '<rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>',

  // section and card marks (20px)
  path: '<circle cx="4" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 4h3.2A2.8 2.8 0 0112 6.8v2.4M4 6v3.2A2.8 2.8 0 006.8 12H10"/>',
  module: '<rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2.6"/><path d="M2.2 6.2h11.6M6.2 6.2v7.6"/>',
  unit: '<path d="M2.5 3.6h4.2c.9 0 1.8.5 1.8 1.4v8c0-.9-.9-1.4-1.8-1.4H2.5z"/><path d="M13.5 3.6H9.3c-.9 0-1.8.5-1.8 1.4v8c0-.9.9-1.4 1.8-1.4h4.2z"/>',
  doc: '<path d="M4 1.8h5l3.2 3.2v9.2H4z"/><path d="M9 1.8V5h3.2M6 8.6h4M6 11h3"/>',
  badge: '<path d="M8 1.8l1.9 1.2 2.2.2.7 2.1 1.4 1.7-1.4 1.7-.7 2.1-2.2.2L8 12.2l-1.9-1.2-2.2-.2-.7-2.1L1.8 7l1.4-1.7.7-2.1 2.2-.2z"/><path d="M6.1 7l1.3 1.3L10 5.7"/>',
  trophy: '<path d="M4.6 2.2h6.8v3.4a3.4 3.4 0 01-6.8 0z"/><path d="M4.6 3.2H2.4v1a2.2 2.2 0 002.2 2.2M11.4 3.2h2.2v1a2.2 2.2 0 01-2.2 2.2"/><path d="M8 9v2.4M5.4 13.8h5.2l-.5-2.4H5.9z"/>',
  clock: '<circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.4 1.6"/>',

  // callout kinds - the alert carries no colour, so the mark does the work
  note: '<circle cx="8" cy="8" r="6"/><path d="M8 7.2v4M8 4.9v.01"/>',
  tip: '<path d="M8 1.8l1.5 3.6 3.9.3-3 2.6.9 3.8L8 10.1l-3.3 2 .9-3.8-3-2.6 3.9-.3z"/>',
  important: '<path d="M3.2 2.4h9.6v7.8H6.4L3.2 13z"/><path d="M8 4.6v2.6M8 8.9v.01"/>',
  warning: '<path d="M8 2.2l5.6 9.9H2.4z"/><path d="M8 6.2v2.6M8 10.5v.01"/>',
  caution: '<path d="M5.4 2.2h5.2l3.2 3.2v5.2l-3.2 3.2H5.4L2.2 10.6V5.4z"/><path d="M8 5v3.2M8 10.6v.01"/>',
  quiz: '<circle cx="8" cy="8" r="6"/><path d="M6.2 6.2A1.9 1.9 0 019.8 7c0 1.3-1.8 1.6-1.8 2.7"/><path d="M8 11.8v.01"/>',
}

/**
 * @param {keyof PATHS} name
 * @param {{size?: 14|20, class?: string}} [opts]
 */
export function icon(name, opts = {}) {
  const body = PATHS[name]
  if (!body) throw new Error(`icon: unknown name '${name}'`)
  const size = opts.size ?? 14
  const cls = opts.class ? ` class="${opts.class}"` : ''
  return (
    `<svg${cls} width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" ` +
    `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`
  )
}

export const iconNames = Object.keys(PATHS)
