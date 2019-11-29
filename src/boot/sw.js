// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initSw } from 'src/system/service_worker'

function t (str) {
  return str
}

export default async ({ app, store, Vue }) => {
  await initSw(store)
}

export { t }
