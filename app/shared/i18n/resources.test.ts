import { describe, expect, it } from 'vitest'

import { resources } from './resources'

type TranslationTree = { readonly [key: string]: string | TranslationTree }

function translationEntries(tree: TranslationTree, prefix = ''): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [[path, value]] : translationEntries(value, path)
  })
}

describe('translation resources', () => {
  const viEntries = translationEntries(resources.vi.translation)
  const enEntries = translationEntries(resources.en.translation)

  it('provides identical translation key paths in Vietnamese and English', () => {
    expect(enEntries.map(([key]) => key).sort()).toEqual(viEntries.map(([key]) => key).sort())
  })

  it('preserves interpolation variables across languages', () => {
    const english = new Map(enEntries)
    function variables(text: string) {
      return [...new Set([...text.matchAll(/{{\s*([^},]+)(?:,[^}]*)?}}/g)].map((match) => match[1].trim()))].sort()
    }
    for (const [key, text] of viEntries) {
      expect(variables(english.get(key) ?? ''), key).toEqual(variables(text))
    }
  })
})
