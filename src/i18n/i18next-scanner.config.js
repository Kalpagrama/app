const fs = require('fs')
const chalk = require('chalk')

module.exports = {
  input: [
    'src/**/*.{js,jsx,vue}',
    // Use ! to filter out files or directories
    '!src/**/*.spec.{js,jsx}',
    '!src/i18n/**',
    '!**/node_modules/**'
  ],
  output: './',
  options: {
    debug: true,
    sort: true,
    // removeUnusedKeys: true,
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', '.jsx', '.vue']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx'],
      fallbackKey: function (ns, value) {
        return value
      },
      acorn: {
        ecmaVersion: 11, // defaults to 10
        sourceType: 'module' // defaults to 'module'
        // Check out https://github.com/acornjs/acorn/tree/master/acorn#interface for additional options
      }
    },
    lngs: ['en', 'ru'],
    ns: [
      'translation'
    ],
    defaultLng: 'ru',
    defaultNs: 'translation',
    // defaultValue: '__STRING_NOT_TRANSLATED__',
    resource: {
      loadPath: 'src/i18n/{{ns}}_{{lng}}.json',
      savePath: 'src/i18n/{{ns}}_{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false, // namespace separator
    keySeparator: false, // key separator
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform (file, enc, done) {
    'use strict'
    const parser = this.parser
    const content = fs.readFileSync(file.path, enc)
    let count = 0

    parser.parseFuncFromString(content, function(key, options) {
      options.defaultValue = key; // use key as the value
      parser.set(key, options);
    })

    // parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
    //   parser.set(key, Object.assign({}, options, {
    //     nsSeparator: false,
    //     keySeparator: false
    //   }))
    //   ++count
    // })

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`)
    }

    done()
  }
}
