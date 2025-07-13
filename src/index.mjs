class Stylish {
  #rules = []
  #cache = new Map()
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

  #buildStyle (style) {
    const id = this.#createId(style)
    for (const rule of this.#buildRules(style, id)) {
      this.#insertRule(rule)
    }
    return id
  }

  #createId (style, rnd = 0, iteration = 0) {
    const MAX31 = 0x7fffffff
    /* c8 ignore start */
    if (iteration > 10) throw new Error('Infinite Loop!')
    /* c8 ignore stop */
    const h = Array.from(style).reduce(
      (h, ch) => ((h << 5) - h + ch.charCodeAt(0)) & MAX31,
      rnd & MAX31
    )
    const id = `stylish-${h.toString(36)}`
    /* c8 ignore start */
    if (this.#classes.has(id)) {
      const rnd = (Math.random() * MAX31) & MAX31
      return this.#createId(style, rnd, iteration + 1)
    }
    /* c8 ignore stop */
    this.#classes.add(id)
    return id
  }

  #insertRule (rule) {
    this.#rules.push(rule)
    const sheet = this.#stylesheet
    sheet.insertRule(rule, sheet.cssRules.length)
  }

  #buildRules (style, id) {
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
      selector = selector.replaceAll(':self', id)
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
    let cls = this.#cache.get(style)
    if (cls) return cls

    cls = this.#buildStyle(style)
    this.#cache.set(style, cls)
    return cls
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
