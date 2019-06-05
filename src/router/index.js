import Vue from 'vue'
import VueRouter from 'vue-router'
// import { globalVar } from 'src/store';
import routes from './routes'

Vue.use(VueRouter)

// function isAuthorized() {
//     try {
//         const { auth } = globalVar.store.state.providers;

//         return (auth.token && !auth.expired);
//     } catch ($e) {

//     }
//     return false;
// }

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,
    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  })

  return Router
}
