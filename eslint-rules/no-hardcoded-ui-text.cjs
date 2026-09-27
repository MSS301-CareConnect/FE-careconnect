const visibleAttributes = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'accessibilityHint',
  'accessibilityLabel',
  'label',
  'placeholder',
  'title'
])

function containsVisibleText(value) {
  return typeof value === 'string' && /[\p{L}\p{N}]/u.test(value)
}

module.exports = {
  meta: {
    docs: {
      description: 'Require user-visible JSX text to come from the i18n layer'
    },
    messages: {
      hardcodedAttribute: "User-visible attribute text must come from i18n (for example: aria-label={t('key')}).",
      hardcodedText: "User-visible JSX text must come from i18n (for example: {t('key')})."
    },
    schema: [],
    type: 'problem'
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          !visibleAttributes.has(node.name.name) ||
          node.value?.type !== 'Literal' ||
          !containsVisibleText(node.value.value)
        ) {
          return
        }

        context.report({ messageId: 'hardcodedAttribute', node })
      },
      JSXExpressionContainer(node) {
        const expression = node.expression
        if (expression.type === 'Literal' && containsVisibleText(expression.value)) {
          context.report({ messageId: 'hardcodedText', node })
        }
      },
      JSXText(node) {
        if (containsVisibleText(node.value)) {
          context.report({ messageId: 'hardcodedText', node })
        }
      }
    }
  }
}
