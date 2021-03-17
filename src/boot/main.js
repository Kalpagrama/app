import { getLogFunc, LogLevelEnum, LogSystemModulesEnum, performance } from 'src/system/log'
const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.BOOT)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.BOOT)
const logC = getLogFunc(LogLevelEnum.CRITICAL, LogSystemModulesEnum.BOOT)

import { Screen, date } from 'quasar'
import { TweenMax } from 'gsap'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMasonry from 'vue-masonry-css'
import axios from 'axios'
import VueShowdown from 'vue-showdown'

// import Vue from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
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
  }
  else {
    result += '' + mins
  }

  // if (ms !== '') result += ':' + ms.substring(0, 3)
  return result
}

export default async ({ Vue, store: storeVue, router: VueRouter }) => {
  try {
    const f = {nameExtra: 'boot::main'}
    logD(f, 'start')
    const t1 = performance.now()
    Vue.use(VueVirtualScroller)
    Vue.use(VueShowdown, {
      flavor: 'github',
      options: {
        emoji: false,
      },
    })
    // contentful
    const contentfulConfig = {
      space: 'f0vpl39owsy8',
      accessToken: 'dt4poXVl2-veCdWkW_v02gsZWxBwe-JHZSw2T394kQQ'
    }
    const contentfulClient = contentful.createClient(contentfulConfig)
    Vue.prototype.$contentful = contentfulClient
    Vue.use(VueMasonry)
    Vue.use(VueObserveVisibility)
    Vue.prototype.$routerKalpa = new Proxy(VueRouter, {
      get (target, prop) {
        if (prop === 'back'){
          // если в истории пусто (зашли например по ссылке на контент), то переход назад приведет к выходу их приложения
          if (VueRouter.historyKalpa.length > 1) return VueRouter.back
          else return VueRouter.push.bind(target, '/') // В истории пусто. переходим на корневую страницу
        }
        let value = target[prop]
        return (typeof value === 'function') ? value.bind(target) : value // иначе - this - будет указывать на Proxy
      }
    })
    Vue.prototype.$wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))
    Vue.prototype.$axios = axios
    Vue.prototype.$tween = TweenMax
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
    var colors = {}
    Vue.prototype.$randomColor = function (id, opacity) {
      const r = () => Math.floor(256 * Math.random())
      if (opacity) {
        return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()}, ${opacity})`)
      } else {
        return colors[id] || (colors[id] = `rgb(${r()}, ${r()}, ${r()})`)
      }
    }
    Vue.prototype.$tt = function (val) {
      return val
    }
    logD(f, `complete: ${Math.floor(performance.now() - t1)} msec`)
  } catch (err) {
    logC(err)
    throw err
  }
}

export { time }
