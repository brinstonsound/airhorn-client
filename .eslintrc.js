module.exports = {
  root: true,

  env: {
    node: true,
    jest: true
  },

  extends: ['plugin:vue/essential', 'eslint:recommended'],

  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/no-unused-vars': 'warning'
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ]
}
