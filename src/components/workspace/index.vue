<template lang="pug">
div(:style=`{position: 'relative', height: $q.screen.height+'px',}`).column.full-width
  //- type picker
  q-btn(
    @click="typePicking = true"
    no-caps color="green" icon-right="keyboard_arrow_down"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '14px',
      left: '50%',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
    }`).q-px-sm
    span(v-if="page").text-bold.text-white {{ page.name }}
    q-menu(cover anchor="bottom middle" max-width="200px")
      div(v-if="typePicking").row.b-30
        .row.full-width.items-center.content-center.justify-center.q-pa-md
          span(:style=`{fontSize: '20px'}`).text-white.text-bold {{ $t('pageApp_workspace_title', 'Мастерская') }}
        router-link(
          v-for="p in pages" :key="p.id" :to="'/workspace/'+p.path"
          :style=`{
            cursor: 'pointer',
            borderRadius: '10px', overflow: 'hidden',
          }`
          :class=`{
            'b-60': p.id === $route.name,
          }`
          ).row.full-width.items-center.content-center.justify-center.q-pa-md
          span(:style=`{fontSize: '16px'}`).text-white {{ p.name }}
  //- body
  .col.full-width
    //- v-if="showView"
    router-view(
      @close="$router.back()"
      ctx="workspace"
      :value="item"
      :style=`{maxWidth: '800px',}`).full-height
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
