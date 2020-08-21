<template lang="pug">
div(:style=`{position: 'relative', height: $q.screen.height+'px',}`).column.full-width
  div(
    v-if="$store.state.ui.showMobileNavigation"
    :style=`{
      position: 'absolute', zIndex: 1000, width: 'calc(100% - 100px)', left: '50px', bottom: '0px',
      height: '50px',
      }`).row
    q-tabs(
      :value="$route.name" @input="tabsChanged"
      no-caps dense active-color="white").full-width.text-white
      q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
  //- body
  .col.full-width
    .row.fit.items-start.content-start.justify-center
      //- v-if="showView"
      router-view(
        @close="$router.back()"
        mode="standalone"
        :value="item"
        :style=`{}`).full-height
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import menuRight from './menu_right'

export default {
  name: 'workspaceIndex',
  components: {menuRight},
  props: {
    sid: {type: String, default () { return 'workspace' }},
  },
  data () {
    return {
      item: null,
      typePicking: false,
    }
  },
  provide () {
    return {
      sidWorkspace: this.sid,
    }
  },
  computed: {
    page () {
      return this.pages.find(p => p.id === this.$route.name)
    },
    pages () {
      return [
        {id: 'content-list', path: 'content', name: this.$t('pageWs_content', 'Контент')},
        {id: 'node-list', path: 'node', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'chain-list', path: 'chain', name: this.$t('pageWs_chains', 'Цепочки')},
        {id: 'sphere-list', path: 'sphere', name: this.$t('pageWs_spheres', 'Сферы')},
        {id: 'ws-settings', path: 'settings', name: this.$t('pageWs_settings', 'Настройки')}
      ]
    },
    pagesHot () {
      return this.pages.filter(p => ['content-list', 'composition-list', 'node-list'].includes(p.id))
    },
    showView () {
      if (this.$route.params.id) return this.item
      else return true
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO', to)
        if (to) {
          this.item = null
          let rxCollectionEnumMap = {
            'content-explorer': RxCollectionEnum.WS_CONTENT,
            'composition-editor': RxCollectionEnum.WS_CONTENT,
            'node-editor': RxCollectionEnum.WS_NODE,
            'chain-editor': RxCollectionEnum.WS_CHAIN
          }
          let rxCollectionEnum = rxCollectionEnumMap[this.$route.name]
          if (!rxCollectionEnum) return
          let {items: [item]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum,
              id: to
            }
          })
          this.$log('item', item)
          this.item = item
        }
      }
    }
  },
  methods: {
    tabsChanged (val) {
      this.$log('tabsChanged', val)
      this.$router.push({name: val})
    }
  },
  created () {
    this.$log('created')
    window.stores[this.sid] = this
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
