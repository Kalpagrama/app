<template lang="pug">
kalpa-layout(
  :title="$t('Workspace', 'Мастерская')"
  @pageId="$router.push({name: $event})"
  :pages="pages" :pagesHot="pagesHot" :pageId="$route.name"
  :style=`{height: $q.screen.height+'px'}`)
  template(v-slot:drawerRight)
    menu-right(:style=`{maxWidth: '250px',}`).b-50
  template(v-slot:page)
    router-view(
      v-if="showView"
      @close="$router.back()"
      ctx="workspace"
      :value="item"
      :options="{ctx: 'explorer'}"
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
    }
  },
  provide () {
    return {
      sidWorkspace: this.sid,
    }
  },
  computed: {
    pages () {
      return [
        {id: 'content-list', name: this.$t('Content', 'Контент')},
        {id: 'composition-list', name: this.$t('Compositions', 'Образы')},
        {id: 'node-list', name: this.$t('Nodes', 'Ядра')},
        // {id: 'chain-list', name: this.$t('Chains', 'Цепочки')},
        // {id: 'sphere', name: this.$t('Spheres', 'Сферы')},
        {id: 'ws-settings', name: this.$t('Settings', 'Настройки')}
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
