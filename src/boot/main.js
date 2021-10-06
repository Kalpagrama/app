import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

import { Screen, date, colors } from 'quasar'
import { gsap } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMasonry from 'vue-masonry-css'
import axios from 'axios'
// import VueShowdown from 'vue-showdown'
import isEqual from 'lodash/isEqual'

// import Vue from 'vue'
// import VueVirtualScroller from 'vue-virtual-scroller'
// import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
// import 'tiptap/src/style.css'
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

export default async ({ Vue, store, router: VueRouter }) => {
   try {
      const f = { nameExtra: 'boot::main' }
      logD(f, 'start')
      const t1 = performance.now()
      Vue.prototype.$bus = new Vue({}) // event bus
      // Vue.use(VueVirtualScroller)
      // Vue.use(VueShowdown, {
      //   flavor: 'github',
      //   options: {
      //     emoji: false,
      //   },
      // })
      // contentful
      const contentfulConfig = {
         space: 'f0vpl39owsy8',
         accessToken: 'dt4poXVl2-veCdWkW_v02gsZWxBwe-JHZSw2T394kQQ'
      }
      const contentfulClient = contentful.createClient(contentfulConfig)
      Vue.prototype.$contentful = contentfulClient
      Vue.use(VueMasonry)
      Vue.use(VueObserveVisibility)
      Vue.prototype.$getPaletteColor = colors.getPaletteColor
      Vue.prototype.$routerKalpa = new Proxy(VueRouter, {
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
      Vue.prototype.$htmlToText = (html) => {
         let tempDivElement = document.createElement('div');
         tempDivElement.innerHTML = html
         return tempDivElement.textContent || tempDivElement.innerText || ''
      }
      Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
      Vue.prototype.$axios = axios
      Vue.prototype.$gsap = gsap
      Vue.prototype.$date = (ts, format) => {
         return date.formatDate(ts, format || 'DD.MM.YYYY', {
            dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
         })
      }
      Vue.prototype.$time = time
      Vue.prototype.$random = function (min, max) {
         return Math.floor(Math.random() * (max - min + 1)) + min
      }
      // alert("4 " + getNoun(4, 'слон', 'слона', 'слонов')) ->>>>  4 слона
      Vue.prototype.$getNoun = function (number, one, two, five) {
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
      Vue.prototype.$go = function (to) {
         if (isEqual(goLast, to)) {
            console.log('$go DUPLICATE')
            this.$router.push(to).catch(e => e)
         } else {
            this.$log('$go FRESH', to, goLast)
            goLast = to
            this.$router.push(to).catch(e => e)
         }
      }
      // Vue.prototype.$goDrop = function () {
      //   console.log('$goDrop')
      //   goLast = null
      // }
      Vue.prototype.$ym = function (target, payload) {
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
}

export { time }
