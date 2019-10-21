'use strict'

import test from 'ava'
import stylish from '../src'

test.serial('simple rule', t => {
  const prevRules = stylish.context.rules.slice()

  const c = stylish('h1 { color: red }')
  const rules = stylish.context.rules.slice()

  t.snapshot(c)
  t.is(rules.length, prevRules.length + 1)
  t.snapshot(rules.pop())
})

test.serial('simple rule repeated', t => {
  const prevRules = stylish.context.rules.slice()

  const c = stylish('h1 { color: red }')
  const rules = stylish.context.rules.slice()

  t.snapshot(c)
  t.is(rules.length, prevRules.length)
})

test.serial('complex rules', t => {
  const prevRules = stylish.context.rules.slice()

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
  const rules = stylish.context.rules.slice()
  t.snapshot(c)
  t.is(rules.length, prevRules.length + 5)
  t.snapshot(rules.slice(-5))
})
