<template lang="pug">
kalpa-layout(:style=`{height: $q.screen.height+'px'}`)
  template(v-slot:footer)
    div(:style=`{}`).row.full-width.q-pa-sm
      q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
      .col
      q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = true")
  template(v-slot:drawerRight)
    menu-right(
      :stateWorkspace="stateWorkspace"
      :style=`{
        maxWidth: '300px',
      }`).b-50
  template(v-slot:page)
    router-view(
      v-if="showView"
      @close="$router.back()"
      ctx="workspace"
      :value="item"
      :options="{ctx: 'explorer'}"
      :style=`{maxWidth: '800px',}`).full-height
  //- transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
  //-   div(
  //-     v-if="!$route.params.id && $q.screen.width < 1260 && !$store.state.ui.appShowMenu && !showMenuRight"
  //-     :style=`{
  //-       position: 'absolute', zIndex: 9999,
  //-       bottom: '0px',
  //-       borderRadius: '10px 10px 0 0',
  //-       transform: 'translate3d(0,0,0)',
  //-       overflow: 'hidden',
  //-     }`
  //-     ).row.full-width.q-pa-sm.b-50
  //-     q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
  //-     .col
  //-     q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = true")
  //- .col.full-width
</template>

<script>
import menuRight from './menu_right'
import { RxCollectionEnum } from 'src/system/rxdb'
// import { ContentApi } from 'src/api/content'

export default {
  name: 'workspaceIndex',
  components: {menuRight},
  data () {
    return {
      item: null,
      showMenuRight: false,
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
