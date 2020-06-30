<template lang="pug">
kalpa-layout(
  title="Мастерская"
  @pageId="$router.push({name: $event})"
  :pages="pages" :pagesHot="pagesHot" :pageId="$route.name"
  :style=`{height: $q.screen.height+'px'}`)
  template(v-slot:drawerRight)
    menu-right.b-50
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
import menuRight from './menu_right'
import { RxCollectionEnum } from 'src/system/rxdb'
// import { ContentApi } from 'src/api/content'

export default {
  name: 'workspaceIndex',
  components: {menuRight},
  props: {
    sid: {type: String, default () { return 'workspace' }},
  },
  data () {
    return {
      item: null,
      pages: [
        {id: 'content-list', name: 'Контент'},
        {id: 'composition-list', name: 'Образы'},
        {id: 'node-list', name: 'Ядра'},
        {id: 'chain-list', name: 'Цепочки'},
        {id: 'sphere', name: 'Сферы'},
        {id: 'ws-settings', name: 'Настройки'}
      ],
      pagesHot: [
        {id: 'content-list', name: 'Контент'},
        {id: 'composition-list', name: 'Образы'},
        {id: 'node-list', name: 'Ядра'},
      ]
    }
  },
  provide () {
    return {
      sidWorkspace: this.sid,
    }
  },
  computed: {
    showView () {
      if (this.$route.params.id) return this.item
      else return true
    },
    stateWorkspace () {
      return {
        showMenuRight: this.showMenuRight,
        pages: this.pages,
        pagesHot: this.pagesHot,
        set: (key, val) => {
          this[key] = val
        }
      }
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
