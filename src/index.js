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

function parseRules (s) {
  const r = /([^{}]*([{}]))/gm
  let n = 0
  const rules = []
  let selector
  let rule
  while (true) {
    const match = r.exec(s)
    if (!match) break
    if (match[2] === '{') {
      if (n++ === 0) {
        selector = match[1].slice(0, -1)
        rule = '{'
      } else {
        rule = rule + match[1]
      }
    } else {
      rule = rule + match[1]
      if (--n === 0) {
        rules.push({ selector, rule })
      }
    }
  }
  return rules
}

function trimRule (rule) {
  return rule.replace(/\s*([,>+~;:}{]{1})\s*/gm, '$1').replace(/;}/g, '}')
}

function buildRules (style, usi) {
  return parseRules(style).map(({ selector, rule }) => {
    selector = selector.trim()
    if (!/^(:root|@)/.test(selector)) {
      if (!/:self/.test(selector)) {
        if (/^[+~>]/.test(selector)) {
          selector = '.:self' + selector
        } else {
          selector = '.:self ' + selector
        }
      }
    }
    selector = selector.replace(/:self/g, usi)
    rule = trimRule(rule)
    return selector + rule
  })
}
