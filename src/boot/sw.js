// import VueI18n from 'vue-i18n'
// import messages from 'src/i18n'

import { initSw } from 'src/system/service_worker'
import { logE } from 'src/boot/log'

function t (str) {
  return str
}

export default async ({ app, store, Vue }) => {
  try {
    await initSw(store)
  } catch (err) {
    logE(err)
  }
}

export { t }
