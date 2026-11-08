const { RuleTester } = require('eslint')
const rule = require('./no-hardcoded-ui-text.cjs')

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    parserOptions: { ecmaFeatures: { jsx: true } },
    sourceType: 'module'
  }
})

tester.run('no-hardcoded-ui-text', rule, {
  valid: [
    { code: "const view = <p>{t('home.title')}</p>" },
    { code: "const view = <button aria-label={t('actions.save')} />" },
    { code: "const view = <Link to='/users' />" }
  ],
  invalid: [
    {
      code: 'const view = <p>Hello world</p>',
      errors: [{ messageId: 'hardcodedText' }]
    },
    {
      code: "const view = <button aria-label='Save' />",
      errors: [{ messageId: 'hardcodedAttribute' }]
    }
  ]
})
