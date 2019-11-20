// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

function t (str) {
  return str
}

export default async ({ app, Vue }) => {
  // Vue.use(VueI18n);
  // Set i18n instance on app
  // app.i18n = new VueI18n({
  //   locale: 'ru-ru',
  //   fallbackLocale: 'ru-ru',
  //   messages,
  // })
  Vue.prototype.$t = t
}

export { t }
