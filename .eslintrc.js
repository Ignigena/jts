module.exports = {
  env: {
    node: true
  },
  extends: ['standard'],
  overrides: [
    {
      files: ['*.spec.{js,jsx}', '**/__mocks__/**', 'jest.*.js'],
      extends: ['plugin:jest/recommended'],
      env: {
        'jest/globals': true
      },
      rules: {
        'jest/expect-expect': ['error', {
          // Support for the HTTP assertions library SuperTest
          assertFunctionNames: ['expect', 'request.*.expect']
        }]
      }
    }
  ],
  rules: {
    'no-new-func': 'off',
    'no-template-curly-in-string': 'off',
    'arrow-body-style': ['error', 'as-needed'],
    'arrow-parens': ['error', 'as-needed']
  },
  plugins: [
    'jest'
  ]
}
