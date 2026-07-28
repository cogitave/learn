/*
 * learn.cogitave.com - progressive enhancement.
 *
 * Every page is complete and readable without this file: it is loaded `defer`
 * and only upgrades behaviour that already has a static fallback. Nothing here
 * fetches from a third party and nothing runs before first paint except the
 * inline theme resolver in the document head.
 *
 * Zero dependencies, per ADR-0003.
 */

;(function () {
  'use strict'

  var root = document.documentElement

  // ---------------------------------------------------------------- theme
  // The head script has already applied any stored choice. This only handles
  // the toggle, and resolves "no stored choice" against the OS preference so
  // the first click always flips what the reader is actually looking at.
  var themeBtn = document.querySelector('.theme-toggle')
  if (themeBtn) {
    var resolvedTheme = function () {
      return (
        root.dataset.theme ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      )
    }
    // Name what the control will do, from the theme actually in effect, so a
    // screen-reader user hears "Switch to dark theme" not a static "Switch theme".
    var syncThemeLabel = function () {
      themeBtn.setAttribute(
        'aria-label',
        resolvedTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
      )
    }
    syncThemeLabel()
    themeBtn.addEventListener('click', function () {
      var next = resolvedTheme() === 'dark' ? 'light' : 'dark'
      root.dataset.theme = next
      try {
        localStorage.setItem('cogitave-theme', next)
      } catch (e) {
        /* private mode: the choice simply does not persist */
      }
      syncThemeLabel()
    })
  }

  // ------------------------------------------------------- section navigation
  var burger = document.querySelector('.topbar-burger')
  var sidenav = document.getElementById('sidenav')
  if (burger && sidenav) {
    burger.addEventListener('click', function () {
      var open = sidenav.classList.toggle('is-open')
      burger.setAttribute('aria-expanded', String(open))
      document.body.style.overflow = open ? 'hidden' : ''
    })
    sidenav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        sidenav.classList.remove('is-open')
        burger.setAttribute('aria-expanded', 'false')
        document.body.style.overflow = ''
      }
    })
  }

  // ------------------------------------------------------------------- tabs
  document.querySelectorAll('.tabs').forEach(function (group) {
    group.querySelectorAll('.tab-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var id = head.dataset.tab
        group.querySelectorAll('.tab-head,.tab-panel').forEach(function (el) {
          var on = el.dataset.tab === id
          el.classList.toggle('is-active', on)
          if (el.classList.contains('tab-head')) el.setAttribute('aria-selected', String(on))
        })
      })
    })
  })

  // ------------------------------------------------------------- copy button
  document.querySelectorAll('.code-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code').querySelector('pre')
      if (!pre || !navigator.clipboard) return
      navigator.clipboard.writeText(pre.innerText).then(function () {
        btn.classList.add('is-done')
        btn.setAttribute('aria-label', 'Copied')
        setTimeout(function () {
          btn.classList.remove('is-done')
          btn.setAttribute('aria-label', 'Copy code')
        }, 1600)
      })
    })
  })

  // --------------------------------------------------------------- on-page rail
  var railLinks = Array.prototype.slice.call(document.querySelectorAll('[data-toc]'))
  if (railLinks.length && 'IntersectionObserver' in window) {
    var byId = {}
    railLinks.forEach(function (a) {
      byId[a.dataset.toc] = a
    })
    var visible = []
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var id = entry.target.id
          var at = visible.indexOf(id)
          if (entry.isIntersecting && at === -1) visible.push(id)
          if (!entry.isIntersecting && at !== -1) visible.splice(at, 1)
        })
        // Headings enter in document order; the topmost visible one wins.
        var order = railLinks.map(function (a) {
          return a.dataset.toc
        })
        var active = order.filter(function (id) {
          return visible.indexOf(id) !== -1
        })[0]
        railLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.toc === active)
        })
      },
      // The band starts just under the sticky chrome, which is one tier taller
      // on a page that carries a contextual bar - measure it rather than
      // guessing, or the rail marks nothing on exactly those pages.
      {
        rootMargin:
          '-' +
          (Math.round(
            parseFloat(getComputedStyle(root).getPropertyValue('--chrome-h')) || 56,
          ) + 16) +
          'px 0px -65% 0px',
        threshold: 0,
      },
    )
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  }

  // ------------------------------------------------------------------- quiz
  document.querySelectorAll('.quiz').forEach(function (quiz) {
    var questions = quiz.querySelectorAll('.question')
    var score = quiz.querySelector('.quiz-score')
    var answered = 0
    var right = 0
    var note = quiz.querySelector('.quiz-noscript')
    if (note) note.remove()

    questions.forEach(function (question) {
      var choices = question.querySelectorAll('.choice')
      choices.forEach(function (choice) {
        choice.addEventListener('click', function () {
          if (question.dataset.answered === 'true') return
          question.dataset.answered = 'true'
          answered += 1
          if (choice.dataset.correct === 'true') right += 1

          choices.forEach(function (c) {
            // aria-disabled, not disabled: disabling the just-clicked button drops
            // focus to <body>; the dataset.answered guard already blocks re-answer.
            c.setAttribute('aria-disabled', 'true')
            c.classList.add('is-answered')
            // Reveal the reader's pick and, when it was wrong, the right one.
            if (c === choice) c.classList.add(c.dataset.correct === 'true' ? 'is-correct' : 'is-wrong')
            else if (c.dataset.correct === 'true' && choice.dataset.correct !== 'true') {
              c.classList.add('is-correct')
            }
          })

          // A class reveal is silent to assistive tech, so announce the outcome.
          var live = document.createElement('p')
          live.className = 'sr-only'
          live.setAttribute('aria-live', 'polite')
          if (choice.dataset.correct === 'true') {
            live.textContent = 'Correct.'
          } else {
            var correctEl = question.querySelector('.choice.is-correct .choice-text')
            live.textContent = 'Incorrect.' + (correctEl ? ' The correct answer is: ' + correctEl.textContent : '')
          }
          question.appendChild(live)

          if (score && answered === questions.length) {
            score.hidden = false
            score.textContent = right + ' of ' + questions.length + ' correct.'
          }
        })
      })
    })
  })

  // -------------------------------------------------------- section filter
  // Narrows the side navigation in place. Groups with nothing left collapse out
  // of the way, so a filtered tree does not leave a column of empty headings.
  var filterInput = document.querySelector('[data-sidenav-filter]')
  if (filterInput) {
    var scope = filterInput.closest('.sidenav-in')
    var empty = scope.querySelector('.sidenav-empty')
    filterInput.addEventListener('input', function () {
      var needle = filterInput.value.trim().toLowerCase()
      var shown = 0
      scope.querySelectorAll('.sidenav-item').forEach(function (a) {
        var hit = !needle || (a.dataset.title || '').indexOf(needle) !== -1
        a.parentElement.hidden = !hit
        if (hit) shown += 1
      })
      scope.querySelectorAll('.sidenav-group').forEach(function (g) {
        var any = g.querySelectorAll('.sidenav-item').length
          ? [].slice.call(g.querySelectorAll('.sidenav-item')).some(function (a) {
              return !a.parentElement.hidden
            })
          : false
        g.hidden = !any
        if (needle && any) g.open = true
      })
      if (empty) empty.hidden = shown > 0
    })
  }

  // --------------------------------------------------------------- diagrams
  // Mermaid is 2.5 MB, so it is self-hosted and fetched ONLY by a page that
  // actually contains a diagram - most pages never touch it. Nothing is
  // requested from a third party. Without it the definition stays on the page
  // as preformatted text, which is the honest fallback for a build that cannot
  // rasterise at compile time.
  var diagrams = document.querySelectorAll('pre.mermaid')
  if (diagrams.length) {
    // Keep each diagram's source in a script-side array, not a data-* attribute:
    // mermaid replaces the node on render and we need the definition back to
    // re-render on a theme change. Holding it in a closure array rather than the
    // DOM also keeps it off any attribute other script on the page could read.
    var diagramSources = []
    diagrams.forEach(function (el, i) {
      diagramSources[i] = el.textContent
    })

    var loadMermaid = function () {
      var s = document.createElement('script')
      s.src = '/assets/vendor/mermaid.min.js'
      s.onload = renderDiagrams
      document.head.appendChild(s)
    }

    var renderDiagrams = function () {
      if (!window.mermaid) return
      var css = getComputedStyle(root)
      var v = function (name) {
        return css.getPropertyValue(name).trim()
      }
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: v('--font'),
        // Larger than body copy on purpose: a node label is set inside a box at
        // a distance, not read as a line of prose. At 14 the diagram was
        // technically present and practically unreadable.
        fontSize: 14,
        // NOT useMaxWidth: scaling a wide flowchart down to a 720px measure is
        // what makes diagrams unreadable. It draws at its natural size and the
        // figure scrolls, which is the same bargain a wide code block makes.
        flowchart: {
          curve: 'basis',
          useMaxWidth: false,
          nodeSpacing: 32,
          rankSpacing: 44,
          padding: 20,
          diagramPadding: 20,
          // A two-line subgraph caption collides with the first node unless the
          // title band is given room of its own.
          subGraphTitleMargin: { top: 10, bottom: 16 },
        },
        sequence: { useMaxWidth: false },
        gantt: { useMaxWidth: false },
        themeVariables: {
          // Flowchart labels take their size from HERE, not from the top-level
          // `fontSize` - which is why setting that alone changed nothing. The
          // layout is computed from it, so boxes grow with the text.
          fontSize: '14px',
          fontFamily: v('--font'),
          background: v('--bg-code'),
          primaryColor: v('--bg-raised'),
          primaryTextColor: v('--t1'),
          primaryBorderColor: v('--line-strong'),
          secondaryColor: v('--bg-sunken'),
          tertiaryColor: v('--bg-sunken'),
          lineColor: v('--t3'),
          textColor: v('--t1'),
          clusterBkg: v('--bg-sunken'),
          clusterBorder: v('--line'),
          nodeTextColor: v('--t1'),
        },
      })
      // Re-running needs the definition back: mermaid replaces the node.
      diagrams.forEach(function (el, i) {
        el.removeAttribute('data-processed')
        el.innerHTML = ''
        el.textContent = diagramSources[i]
        el.id = 'diagram-' + i
      })
      window.mermaid.run({ querySelector: 'pre.mermaid' })
    }

    loadMermaid()

    // The diagram must follow the theme, not stay in the one it was drawn for.
    if (themeBtn) themeBtn.addEventListener('click', function () {
      setTimeout(renderDiagrams, 30)
    })
  }

  // ----------------------------------------------------------------- search
  // The same index serves every search control on the page: the compact one in
  // the masthead and the promoted one on the home page.
  var searches = [].slice.call(document.querySelectorAll('[data-search]'))
  var index = null
  var loading = false

  searches.forEach(function (root, sidx) {
    var input = root.querySelector('input')
    var panel = root.querySelector('.search-results')
    if (!input || !panel) return
    var hits = []
    var cursor = -1
    // Combobox/listbox wiring so arrow-key highlighting is announced to AT.
    if (!panel.id) panel.id = 'search-results-' + sidx
    panel.setAttribute('role', 'listbox')
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-controls', panel.id)
    input.setAttribute('aria-autocomplete', 'list')

    function load() {
      if (index || loading) return
      loading = true
      fetch('/search-index.json')
        .then(function (r) {
          return r.json()
        })
        .then(function (data) {
          index = data
          loading = false
          if (input.value) run()
        })
        .catch(function () {
          loading = false
        })
    }

    function score(entry, needle) {
      var title = entry.t.toLowerCase()
      if (title === needle) return 100
      if (title.indexOf(needle) === 0) return 80
      if (title.indexOf(needle) !== -1) return 60
      if ((entry.s || '').toLowerCase().indexOf(needle) !== -1) return 30
      if ((entry.h || '').toLowerCase().indexOf(needle) !== -1) return 20
      return 0
    }

    function run() {
      var needle = input.value.trim().toLowerCase()
      if (!needle || !index) {
        close()
        return
      }
      hits = index
        .map(function (e) {
          return { e: e, s: score(e, needle) }
        })
        .filter(function (r) {
          return r.s > 0
        })
        .sort(function (a, b) {
          return b.s - a.s
        })
        .slice(0, 8)
        .map(function (r) {
          return r.e
        })

      cursor = -1
      panel.innerHTML = hits.length
        ? hits
            .map(function (e, i) {
              return (
                '<a class="search-hit" role="option" id="' +
                panel.id +
                '-o' +
                i +
                '" href="' +
                escapeText(e.u) +
                '"><span class="search-hit-kind">' +
                escapeText(e.k) +
                '</span><span class="search-hit-title">' +
                escapeText(e.t) +
                '</span></a>'
              )
            })
            .join('')
        : '<p class="search-empty">No match for &ldquo;' + escapeText(input.value) + '&rdquo;.</p>'
      panel.hidden = false
      input.setAttribute('aria-expanded', 'true')
      input.removeAttribute('aria-activedescendant')
    }

    function escapeText(s) {
      var d = document.createElement('span')
      d.textContent = s
      return d.innerHTML
    }

    function close() {
      panel.hidden = true
      input.setAttribute('aria-expanded', 'false')
      input.removeAttribute('aria-activedescendant')
      cursor = -1
    }

    function move(delta) {
      var nodes = panel.querySelectorAll('.search-hit')
      if (!nodes.length) return
      cursor = (cursor + delta + nodes.length) % nodes.length
      nodes.forEach(function (n, i) {
        n.classList.toggle('is-active', i === cursor)
      })
      nodes[cursor].scrollIntoView({ block: 'nearest' })
      input.setAttribute('aria-activedescendant', nodes[cursor].id)
    }

    input.addEventListener('focus', load)
    input.addEventListener('input', run)

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        move(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        move(-1)
      } else if (e.key === 'Enter') {
        var nodes = panel.querySelectorAll('.search-hit')
        var target = cursor >= 0 ? nodes[cursor] : nodes[0]
        if (target) {
          e.preventDefault()
          window.location.href = target.getAttribute('href')
        }
      } else if (e.key === 'Escape') {
        close()
        input.blur()
      }
    })

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search')) close()
    })
  })

  // "/" focuses search, the convention on every docs surface worth copying.
  // The promoted control wins when the page has one.
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || ''
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      var target = document.querySelector('.search-hero input') || document.getElementById('q')
      if (target) {
        e.preventDefault()
        target.focus()
      }
    }
  })
})()
