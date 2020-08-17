<template lang="pug">
//- kalpa-layout(
//-   :title="$t('Workspace', 'Мастерская')"
//-   @pageId="$router.push({name: $event})"
//-   :pages="pages" :pagesHot="pagesHot" :pageId="$route.name"
//-   :style=`{height: $q.screen.height+'px'}`)
//-   template(v-slot:drawerRight)
//-     menu-right(:style=`{maxWidth: '250px',}`).b-50
//-   template(v-slot:page)
//-     router-view(
//-       v-if="showView"
//-       @close="$router.back()"
//-       ctx="workspace"
//-       :value="item"
//-       :options="{ctx: 'explorer'}"
//-       :style=`{maxWidth: '800px',}`).full-height
div(:style=`{position: 'relative', height: $q.screen.height+'px',}`).column.full-width
  //- navigation
  q-btn(
    @click="$store.commit('ui/stateSet', ['appShowMenu', true])"
    round flat color="white" icon="menu"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', right: '24px',}`)
  q-btn(
    @click="$router.back()"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', left: '24px',}`)
  //- type picker
  q-btn(
    @click="typePicking = true"
    no-caps color="green" icon-right="keyboard_arrow_down"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '24px',
      left: '50%',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
    }`
    ).q-px-sm Контент
    q-menu(cover anchor="bottom middle" max-width="200px")
      div(v-if="typePicking").row.b-80
        .row.full-width.items-center.content-center.justify-center.q-pa-md
          span(:style=`{fontSize: '20px'}`).text-white.text-bold {{ $t('pageApp_workspace_title', 'Мастерская') }}
        router-link(
          v-for="p in pages" :key="p.id" :to="'/workspace/'+p.path"
          ).row.full-width.items-center.content-center.justify-center.q-pa-md
          span.text-white.text-bold {{ p.name }}
  //- body
  .col.full-width
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
      typePicking: false,
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
        {id: 'content-list', path: 'content', name: this.$t('Content', 'Контент')},
        {id: 'composition-list', path: 'composition', name: this.$t('Compositions', 'Образы')},
        {id: 'node-list', path: 'node', name: this.$t('Nodes', 'Ядра')},
        {id: 'chain-list', path: 'chain', name: this.$t('Chains', 'Цепочки')},
        // {id: 'sphere', name: this.$t('Spheres', 'Сферы')},
        {id: 'ws-settings', path: 'settings', name: this.$t('Settings', 'Настройки')}
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
