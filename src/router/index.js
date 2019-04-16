import Vue from 'vue';
import VueRouter from 'vue-router';
import { globalVar } from 'src/store';
import routes from './routes';

Vue.use(VueRouter);

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

function isAuthorized() {
    try {
        const { auth } = globalVar.store.state.providers;

        return (auth.token && !auth.expired);
    } catch ($e) {

    }
    return false;
}

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as is and change from quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE,
  });

  Router.beforeEach((to, from, next) => {
      if (!isAuthorized()) {
          if (to.path.indexOf('/auth') === -1) next('/auth/login');
          else next()
      } else next();
  });

  return Router;
}
