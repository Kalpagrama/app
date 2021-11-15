import { boot } from 'quasar/wrappers'
import { getLogFunctions, LogSystemModulesEnum, performance } from 'src/boot/log'
import eventBus from 'tiny-emitter/instance'
let { logD, logT, logI, logW, logE, logC } = getLogFunctions(LogSystemModulesEnum.BOOT)

import { Screen, date, colors } from 'quasar'
import { gsap } from 'gsap'
import VueMasonry from 'vue-masonry-css'
import axios from 'axios'
// import VueShowdown from 'vue-showdown'
import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'

const contentful = require('contentful')

// image editors
// https://github.com/Norserium/vue-advanced-cropper
// https://github.com/anvaka/panzoom

const time = (sec, addSeconds = true) => {
   let hrs = ~~(sec / 3600)
   let mins = ~~((sec % 3600) / 60)
   let secs = ~~sec % 60
   // let arr = sec.toString().split('.')
   // let ms = ''
   // if (arr.length > 1) ms = arr[1]

   let result = ''
   if (hrs > 0) result += '' + hrs + ':' + (mins < 10 ? '0' : '')
   // result += '' + mins + ':' + (secs < 10 ? '0' : '')
   // result += '' + secs

   if (addSeconds) {
      result += '' + mins + ':' + (secs < 10 ? '0' : '')
      result += '' + secs
   } else {
      result += '' + mins
   }

   // if (ms !== '') result += ':' + ms.substring(0, 3)
   return result
}

export default boot(async ({ app, router: VueRouter, store, ssrContext, urlPath, publicPath, redirect }) => {
   try {
      const f = { nameExtra: 'boot::main' }
      logD(f, 'start')
      const t1 = performance.now()
      eventBus.$on = eventBus.on
      eventBus.$off = eventBus.off
      eventBus.$emit = eventBus.emit
      app.config.globalProperties.$eventBus = eventBus // event bus
      // Vue.use(VueVirtualScroller)
      // Vue.use(VueShowdown, {
      //   flavor: 'github',
      //   options: {
      //     emoji: false,
      //   },
      // })
      // contentful
      app.config.globalProperties.$set_deprecated = (obj, prop, value) => {
         obj[prop] = value
      }
      const contentfulConfig = {
         space: 'f0vpl39owsy8',
         accessToken: 'dt4poXVl2-veCdWkW_v02gsZWxBwe-JHZSw2T394kQQ'
      }
      const contentfulClient = contentful.createClient(contentfulConfig)
      app.config.globalProperties.$contentful = contentfulClient
      app.use(VueMasonry)

      app.config.globalProperties.$getPaletteColor = colors.getPaletteColor
      app.config.globalProperties.$routerKalpa = new Proxy(VueRouter, {
         get (target, prop) {
            if (prop === 'back') {
               // если в истории пусто (зашли например по ссылке на контент), то переход назад приведет к выходу их приложения
               if (VueRouter.historyKalpa.length > 1) return VueRouter.back
               else return VueRouter.push.bind(target, '/') // В истории пусто. переходим на корневую страницу
            }
            let value = target[prop]
            return (typeof value === 'function') ? value.bind(target) : value // иначе - this - будет указывать на Proxy
         }
      })
      app.config.globalProperties.$htmlToText = (html) => {
         let tempDivElement = document.createElement('div');
         tempDivElement.innerHTML = html
         return tempDivElement.textContent || tempDivElement.innerText || ''
      }
      app.config.globalProperties.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      app.config.globalProperties.$axios = axios
      app.config.globalProperties.$gsap = gsap

      app.config.globalProperties.$debounce = debounce
      app.config.globalProperties.$throttle = throttle
      app.config.globalProperties.$date = (ts, format) => {
         return date.formatDate(ts, format || 'DD.MM.YYYY', {
            dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
         })
      }
      app.config.globalProperties.$time = time
      app.config.globalProperties.$random = function (min, max) {
         return Math.floor(Math.random() * (max - min + 1)) + min
      }
      // alert("4 " + getNoun(4, 'слон', 'слона', 'слонов')) ->>>>  4 слона
      app.config.globalProperties.$getNoun = function (number, one, two, five) {
         let n = Math.abs(number);
         n %= 100;
         if (n >= 5 && n <= 20) {
            return five;
         }
         n %= 10;
         if (n === 1) {
            return one;
         }
         if (n >= 2 && n <= 4) {
            return two;
         }
         return five;
      }
      logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)

      // App go, last position, and feeds refresh...
      let goLast = null
      app.config.globalProperties.$go = function (to) {
         if (isEqual(goLast, to)) {
            console.log('$go DUPLICATE', to)
            VueRouter.push(to).catch(e => this.$log('error on route go1', e))
         } else {
            this.$log('$go FIRST TIME', to, goLast)
            goLast = to
            VueRouter.push(to).catch(e => this.$log('error on route go2', e))
         }
      }
      // app.config.globalProperties.$goDrop = function () {
      //   console.log('$goDrop')
      //   goLast = null
      // }
      app.config.globalProperties.$ym = function (target, payload) {
         if (!window.ym) return
         window.ym(
            window.yaCounterId,
            'reachGoal',
            target,
            {
               from: this.$options.name,
               // user: store.getters.currentUser,
               user: {
                  oid: store.getters.currentUser.oid,
                  name: store.getters.currentUser.name,
                  email: store.getters.currentUser.profile.email
               },
               ...payload
            }
         )
      }
   } catch (err) {
      logC(err)
      throw err
   }
})

export { time, eventBus }
