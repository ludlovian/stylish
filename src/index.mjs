import StringHash from '@ludlovian/stringhash'

class Stylish {
  #rules = []
  #cache = new StringHash()
  #classes = new Set()
  #stylesheet

  constructor () {
    this.#createStylesheet()
    this.getClass = this.getClass.bind(this)
    if (this.#hasGlobal) {
      this.getClass._rules = this.#rules
      this.#stylesheet = {
        insertRule () {},
        cssRules: []
      }
    }
  }

  get #hasWindow () {
    return typeof window === 'object'
  }

  get #hasGlobal () {
    return typeof global === 'object'
  }

  #createStylesheet () {
    /* c8 ignore start */
    if (this.#hasWindow) {
      const { document } = window
      const { head } = document
      const el = document.createElement('style')
      this.#stylesheet = head.appendChild(el).sheet
    }
    /* c8 ignore stop */
  }

  #getTokenClass (tok) {
    return `stylish-${tok.toString(36)}`
  }

  #buildStyle (style) {
    const tok = this.#cache.store(style)
    const cls = this.#getTokenClass(tok)
    for (const rule of this.#buildRules(style, cls)) {
      this.#insertRule(rule)
    }
    return cls
  }

  #insertRule (rule) {
    this.#rules.push(rule)
    const sheet = this.#stylesheet
    sheet.insertRule(rule, sheet.cssRules.length)
  }

  #buildRules (style, cls) {
    const ret = []
    for (const item of this.#parseRules(style)) {
      let [selector, rule] = item
      selector = selector.trim()
      // insert implied :self into selector
      if (!/^(?:@|:root)/.test(selector)) {
        if (!/:self/.test(selector)) {
          if ('+~>'.includes(selector.charAt(0))) {
            selector = `.:self${selector}`
          } else {
            selector = `.:self ${selector}`
          }
        }
      }
      // replace all :self
      selector = selector.replaceAll(':self', cls)
      rule = this.#trimRule(rule)
      ret.push(`${selector}${rule}`)
    }
    return ret
  }

  #trimRule (rule) {
    return (
      rule
        // remove whitespace aronud punc
        .replace(/\s*([,>+~;:}{])\s*/gm, '$1')
        // and trailing semis
        .replaceAll(';}', '}')
    )
  }

  getClass (style) {
    if (Array.isArray(style)) style = style[0]
    if (!this.#cache.has(style)) {
      return this.#buildStyle(style)
    }
    return this.#getTokenClass(this.#cache.store(style))
  }

  #parseRules (style) {
    const ret = []
    const rgx = /([^{}]*([{}]))/gm
    let depth = 0
    let selector
    let rule
    while (true) {
      const match = rgx.exec(style)
      if (!match) return ret
      if (match[2] === '{') {
        if (depth++ === 0) {
          selector = match[1].slice(0, -1)
          rule = '{'
        } else {
          rule += match[1]
        }
      } else {
        rule += match[1]
        if (--depth === 0) {
          ret.push([selector, rule])
        }
      }
    }
  }
}

const stylish = new Stylish()
export default stylish.getClass
