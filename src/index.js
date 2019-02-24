'use strict'

const hash = string =>
  Array.from(string).reduce(
    (h, ch) => ((h << 5) - h + ch.charCodeAt(0)) & 0xffff,
    0
  )

const context = {
  rules: [],
  cache: {},
  hasWindow: typeof window === 'object',
  isTest:
    typeof process === 'object' &&
    process.env &&
    process.env.NODE_ENV !== 'production'
}

export default function stylish (style) {
  if (Array.isArray(style)) style = style[0]
  let c = context.cache[style]
  if (!c) c = context.cache[style] = buildStyle(style)
  return c
}

/* istanbul ignore else */
if (context.isTest) {
  stylish.context = context
  /* istanbul ignore if */
  if (context.hasWindow) {
    window.$tyli$h = context
  }
}
context.stylesheet = createStylesheet()

function createStylesheet () {
  /* istanbul ignore if */
  if (context.hasWindow) {
    const el = window.document.createElement('style')
    return window.document.head.appendChild(el).sheet
  }
}

function buildStyle (style) {
  const usi = `stylish-${hash(style).toString(16)}`
  buildRules(style, usi).forEach(insertRule)
  return usi
}

function insertRule (rule) {
  context.rules.push(rule)
  /* istanbul ignore if */
  if (context.stylesheet) {
    context.stylesheet.insertRule(rule, context.stylesheet.cssRules.length)
  }
}

function buildRules (style, usi) {
  style = style
    .replace(/\s*([,>+~;:}{]{1})\s*/gm, '$1')
    .trim()
    .replace(/;}/g, '}')
  const reSplit = /(.+?})/g
  const rules = []
  while (true) {
    const match = reSplit.exec(style)
    if (!match) break
    let rule = match[1]
    if (!/^(:root|@)/.test(rule)) {
      if (!/:self/.test(rule)) rule = ':self ' + rule
    }
    rule = rule.replace(/:self/g, '.' + usi)
    rules.push(rule)
  }
  return rules
}
