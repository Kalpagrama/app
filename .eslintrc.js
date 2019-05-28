module.exports = {
    root: true,

    parserOptions: {
        parser: 'babel-eslint',
        sourceType: 'module'
    },

    env: {
        browser: true
    },

    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    extends: [
        'standard',
        'plugin:vue/essential'
    ],

    // required to lint *.vue files
    plugins: [
        'vue'
    ],

    globals: {
        'ga': true, // Google Analytics
        'cordova': true,
        '__statics': true,
        'process': true,
        'Vue': false,
        'Quasar': false,
        'lodash': false,
        '_': false,
        'gql': false
    },

    // add your custom rules here
    rules: {
        'max-len': ['off', { 'code': 140 }],
        'indent': ['off', 4],
        'semi': 0,
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

        'import/first': 'off',

        'import/extensions': 'off',
        'import/no-unresolved': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/prefer-default-export': 'off',
        'prefer-promise-reject-errors': 'off',

        // allow console.log during development only
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // allow debugger during development only
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

        // custom
        'no-return-await': 0,
        'vue/require-valid-default-prop': 0,
        'object-curly-spacing': 0
    }
}
