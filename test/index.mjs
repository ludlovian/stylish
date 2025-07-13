import { suite, test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

import stylish from '../src/index.mjs'

beforeEach(() => {
  stylish._rules.splice(0)
})

suite('stylish', () => {
  test('basic usage', () => {
    const c = stylish('h1 {color: red;}')

    const act = stylish._rules
    const exp = [`.${c} h1{color:red}`]
    assert.deepEqual(act, exp)
  })

  test('same input gives same class', () => {
    const c1 = stylish('h1 {color: red;}')
    const c2 = stylish('h1 {color: red;}')
    assert.equal(c1, c2)
  })

  test('complex rules', () => {
    const c = stylish`
      .top { margin: 10; }
      >.bottom { margin: 13; }
      p.:self {
        padding-left: 15;
        padding-right: 12;
      }
      :root {
        --var1: #123456;
      }
      @keyframes :self {
        from { color: red; }
        to { color: blue; }
      }
    `

    const exp = [
      `.${c} .top{margin:10}`,
      `.${c}>.bottom{margin:13}`,
      `p.${c}{padding-left:15;padding-right:12}`,
      ':root{--var1:#123456}',
      `@keyframes ${c}{from{color:red}to{color:blue}}`
    ]
    const act = stylish._rules

    assert.deepEqual(act, exp)
  })
})
