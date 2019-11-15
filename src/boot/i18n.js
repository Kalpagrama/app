// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

export default async ({ app, Vue }) => {
  // Vue.use(VueI18n);
  // Set i18n instance on app
  // app.i18n = new VueI18n({
  //   locale: 'ru-ru',
  //   fallbackLocale: 'ru-ru',
  //   messages,
  // })
  Vue.prototype.$t = function (str) {
    // this.$options.name = 'main_layert'
    // this.$options.name
    return str
  }
}
