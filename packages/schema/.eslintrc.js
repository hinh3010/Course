module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json'
  },
  rules: {
    'space-before-function-paren': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/space-before-function-paren': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/explicit-function-return-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/return-await': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-misused-promises': 'off'
  }
}
