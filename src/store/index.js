import Vue from 'vue';
import Vuex from 'vuex';
import providers from './providers';

// import example from './module-example'

Vue.use(Vuex);

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */
export const globalVar = {
    store: null,
}

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    modules: {
      providers,
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV,
  });

  globalVar.store = Store;

  return Store;
}
