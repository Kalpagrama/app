module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
  root: true,

  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  env: {
    browser: true,
    webextensions: true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    // 'eslint:recommended',


    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    'standard'

  ],

  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // required to lint *.vue files
    'vue',

  ],

  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly',
    Quasar: 'readonly',
    lodash: 'readonly',
    _: 'readonly',
    gql: 'readonly'
  },

  // add your custom rules here
  rules: {
    'max-len': ['off', { code: 140 }],
    indent: ['off', 4],
    semi: 0,
    'comma-dangle': 0,
    'space-before-function-paren': 0,
    'no-alert': 0,
    'object-shorthand': 0,
    'no-unused-vars': 0,
    'object-curly-newline': ['off', {}],
    'no-plusplus': 'off',
    'linebreak-style': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    'space-before-blocks': 'off',
    'vue/no-mutating-props': 'off',

    'import/first': 'off',

    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'prefer-promise-reject-errors': 'off',

    // allow console.log during development only
    // 'no-console': process.env.PROD ? 'error' : 'off',
    'no-console': 'off',
    // allow debugger during development only
    'no-debugger': process.env.PROD ? 'error' : 'off',

    // custom
    'no-return-await': 0,
    'vue/require-valid-default-prop': 0,
    'object-curly-spacing': 0,
    'no-throw-literal': 0,
    'no-unneeded-ternary': 0,
    'prefer-const': 0,
    'no-lone-blocks': 0,
    'brace-style': 0,
    'no-async-promise-executor': 0,
    'dot-notation': 0,
  }
}
