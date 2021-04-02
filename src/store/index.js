import Vue from 'vue'
import Vuex from 'vuex'

import core from './core'
import ui from './ui'
import debug from './debug'
import { RxCollectionEnum, rxdb } from 'src/system/rxdb'
import assert from 'assert'
import { getLogFunc, LogLevelEnum, LogSystemModulesEnum } from 'src/system/log'

const logD = getLogFunc(LogLevelEnum.DEBUG, LogSystemModulesEnum.VUEX)
const logE = getLogFunc(LogLevelEnum.ERROR, LogSystemModulesEnum.VUEX)

Vue.use(Vuex)
// alert('vuex init!')

const store = new Vuex.Store({
   modules: {
      core,
      ui,
      debug
   },
   strict: process.env.DEV,
   state: {
      mirrorObjects: {} // отображения реактивных объектов из rxdb (меняются синхронно с объектами из rxdb (см  reactive.js))
   },
   mutations: {
      setMirrorObject (state, [key, val]) {
         assert(key && val, '!key && val')
         Vue.set(state.mirrorObjects, key, val)
      }
   },
   getters: {
      currentUser: (state, getters, rootState, rootGetters) => {
         return state.mirrorObjects['currentUser']
      },
      isGuest: (state, getters, rootState, rootGetters) => {
         return state.mirrorObjects['currentUser'] ? state.mirrorObjects['currentUser'].profile.role === 'GUEST' : true
      },
      nodeCategories: (state, getters, rootState, rootGetters) => {
         let currentUser = state.mirrorObjects['currentUser']
         let currentSettings = state.mirrorObjects['currentSettings']
         if (!currentUser || currentSettings) return []
         return currentSettings.nodeCategories.filter(c => c.lang === currentUser.profile.lang)
      },
      // currentUser: (state, getters, rootState, rootGetters) => id => {
      //    // assert(rxdb, '!rxdb')
      //    // assert(rxdb.getCurrentUser, '!rxdb.getCurrentUser')
      //    // assert(rxdb.getCurrentUser(), '!rxdb.getCurrentUser()')
      //    if (rxdb && rxdb.getCurrentUser) return rxdb.getCurrentUser()
      // },
      // isGuest: (state, getters) => id => {
      //    if (!getters.currentUser) return true
      //    return getters.currentUser.profile.role === 'GUEST'
      // },
      // nodeCategories: (state, getters) => id => {
      //    assert(rxdb, '!rxdb')
      //    assert(rxdb.getSettings, '!rxdb.getSettings')
      //    assert(rxdb.getSettings() && rxdb.getSettings().nodeCategories, '!rxdb.getSettings()')
      //    return rxdb.getSettings().nodeCategories.filter(c => c.lang === getters.currentUser.profile.lang)
      //    // return [
      //    //    {
      //    //       name: '❉category-ALL-RUS',
      //    //       type: 'ALL',
      //    //       icon: 'ALL',
      //    //       lang: 'RUS',
      //    //       alias: 'Все подряд',
      //    //       sphere: {
      //    //          oid: '100958592395419654',
      //    //          name: '❉category-all-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-POLITICS-RUS',
      //    //       type: 'POLITICS',
      //    //       icon: 'POLITICS',
      //    //       lang: 'RUS',
      //    //       alias: 'Политика',
      //    //       sphere: {
      //    //          oid: '100958593859231751',
      //    //          name: '❉category-politics-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-SPIRIT-RUS',
      //    //       type: 'SPIRIT',
      //    //       icon: 'SPIRIT',
      //    //       lang: 'RUS',
      //    //       alias: 'Духовная сфера',
      //    //       sphere: {
      //    //          oid: '100958594719064072',
      //    //          name: '❉category-spirit-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-EDUCATION-RUS',
      //    //       type: 'EDUCATION',
      //    //       icon: 'EDUCATION',
      //    //       lang: 'RUS',
      //    //       alias: 'Образование',
      //    //       sphere: {
      //    //          oid: '100958595004276745',
      //    //          name: '❉category-education-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-FUN-RUS',
      //    //       type: 'FUN',
      //    //       icon: 'FUN',
      //    //       lang: 'RUS',
      //    //       alias: 'Развлечения',
      //    //       sphere: {
      //    //          oid: '100958595302072330',
      //    //          name: '❉category-fun-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-SCIENCE-RUS',
      //    //       type: 'SCIENCE',
      //    //       icon: 'SCIENCE',
      //    //       lang: 'RUS',
      //    //       alias: 'Наука',
      //    //       sphere: {
      //    //          oid: '100958595625033739',
      //    //          name: '❉category-science-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-HEALTH-RUS',
      //    //       type: 'HEALTH',
      //    //       icon: 'HEALTH',
      //    //       lang: 'RUS',
      //    //       alias: 'Здоровье',
      //    //       sphere: {
      //    //          oid: '100958595964772364',
      //    //          name: '❉category-health-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-SPORT-RUS',
      //    //       type: 'SPORT',
      //    //       icon: 'SPORT',
      //    //       lang: 'RUS',
      //    //       alias: 'Спорт',
      //    //       sphere: {
      //    //          oid: '100958596275150861',
      //    //          name: '❉category-sport-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-TRAVEL-RUS',
      //    //       type: 'TRAVEL',
      //    //       icon: 'TRAVEL',
      //    //       lang: 'RUS',
      //    //       alias: 'Путешествия',
      //    //       sphere: {
      //    //          oid: '100958596581335054',
      //    //          name: '❉category-travel-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-NATURE-RUS',
      //    //       type: 'NATURE',
      //    //       icon: 'NATURE',
      //    //       lang: 'RUS',
      //    //       alias: 'Природа',
      //    //       sphere: {
      //    //          oid: '100958596916879375',
      //    //          name: '❉category-nature-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-PEOPLE-RUS',
      //    //       type: 'PEOPLE',
      //    //       icon: 'PEOPLE',
      //    //       lang: 'RUS',
      //    //       alias: 'Люди',
      //    //       sphere: {
      //    //          oid: '100958597248229392',
      //    //          name: '❉category-people-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    },
      //    //    {
      //    //       name: '❉category-ART-RUS',
      //    //       type: 'ART',
      //    //       icon: 'ART',
      //    //       lang: 'RUS',
      //    //       alias: 'Искусство',
      //    //       sphere: {
      //    //          oid: '100958597571190801',
      //    //          name: '❉category-art-rus',
      //    //          type: 'WORD'
      //    //       }
      //    //    }
      //    // ]
      // }
   }
})
export default store
