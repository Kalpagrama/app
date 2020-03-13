<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px'}`)
  q-dialog(v-model="pageDialogOpened" :maximized="true" @hide="itemEdited")
    div(:style=`{position: 'relative'}`).row.fit.bg-grey-10
      q-btn(
        round flat color="white" icon="keyboard_arrow_left" @click="pageDialogOpened = false"
        :style=`{position: 'fixed', zIndex: 10000, left: '16px', top: 'calc(20% - 20px)', background: 'rgba(0,0,0,0.3)'}`)
      ws-sphere(
        v-if="$route.params.page === 'sphere'")
      ws-setting(
        v-else-if="$route.params.page === 'setting'")
      node-saver(
        v-else
        :value="item").fit
        template(v-slot:editor=`{node, saving}`)
          component(:is="`${$route.params.page}-editor`" :node="node" :saving="saving")
  q-page-container.fit
    ws-menu(
      ctx="workspace"
      :oid="node ? node.oid : false" :page="$route.params.page"
      @page="$router.push({params: {page: $event}}).catch(e=>e)" @item="itemClick" @add="itemAdd"
      ).bg-grey-9.full-width
</template>

<script>
import wsMenu from './ws_menu'
import wsSphere from './ws_sphere'
import wsSetting from './ws_setting'

export default {
  name: 'workspaceIndex',
  components: {wsMenu, wsSphere, wsSetting},
  props: [],
  data () {
    return {
      pageDialogOpened: false
    }
  },
  computed: {
    item () {
      return this.$store.state.workspace.item
    }
  },
  watch: {
    '$route.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
          if (to !== from) {
            // this.item = null
            this.$store.commit('workspace/stateSet', ['item', null])
            this.$store.commit('workspace/stateSet', ['itemType', undefined])
            this.$router.replace('/workspace/' + to).catch(e => e)
          }
        } else {
          this.$router.push({params: {page: 'node'}})
        }
      }
    }
  },
  methods: {
    async itemClick ({type, item}) {
      this.$log('itemClick', type, item)
      this.$store.commit('workspace/stateSet', ['itemType', type])
      this.$store.commit('workspace/stateSet', ['item', item])
      this.pageDialogOpened = true
    },
    itemAdd ({type, item}) {
      this.$log('itemAdd', type, item)
      this.$store.commit('workspace/stateSet', ['itemType', type])
      this.$store.commit('workspace/stateSet', ['item', item])
      this.pageDialogOpened = true
    },
    itemEdited () {
      this.$log('itemEdited')
      this.$store.commit('workspace/stateSet', ['itemType', undefined])
      this.$store.commit('workspace/stateSet', ['item', null])
    }
  },
  mounted () {
    this.$log('mounted')
    document.body.style.backgroundColor = '#424242'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
