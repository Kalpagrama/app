<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      router-view
      q-page-sticky(
        v-if="!$route.params.id"
        expand position="bottom")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px', height: '50px', paddingLeft: '50px', paddingRight: '50px',}`).row.full-width
            q-tabs(
              :value="$route.name" @input="tabsChanged"
              no-caps dense active-color="white").fit.text-grey-8
              q-tab(v-for="p in pages" :key="p.id" :name="p.id" :label="p.name")
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
        {id: 'content-list', path: 'contents', name: this.$t('pageWs_content', 'Контент')},
        {id: 'node-list', path: 'nodes', name: this.$t('pageWs_nodes', 'Ядра')},
        {id: 'chain-list', path: 'chains', name: this.$t('pageWs_chains', 'Цепочки')},
        {id: 'sphere-list', path: 'spheres', name: this.$t('pageWs_spheres', 'Сферы')},
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
    // '$route.params.id': {
    //   immediate: true,
    //   async handler (to, from) {
    //     this.$log('$route.params.id TO', to)
    //     if (to) {
    //       this.item = null
    //       let rxCollectionEnumMap = {
    //         'content-explorer': RxCollectionEnum.WS_CONTENT,
    //         'composition-editor': RxCollectionEnum.WS_CONTENT,
    //         'node-editor': RxCollectionEnum.WS_NODE,
    //         'chain-editor': RxCollectionEnum.WS_CHAIN
    //       }
    //       let rxCollectionEnum = rxCollectionEnumMap[this.$route.name]
    //       if (!rxCollectionEnum) return
    //       let {items: [item]} = await this.$rxdb.find({
    //         selector: {
    //           rxCollectionEnum,
    //           id: to
    //         }
    //       })
    //       this.$log('item', item)
    //       this.item = item
    //     }
    //   }
    // }
  },
  methods: {
    tabsChanged (val) {
      this.$log('tabsChanged', val)
      this.$router.push({name: val})
    }
  },
  created () {
    this.$log('created')
    // window.stores[this.sid] = this
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
