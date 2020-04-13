<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-9
  q-dialog(
    v-model="pageDialogOpened" :maximized="true"
    @hide="itemEdited")
    div(:style=`{position: 'relative'}`).row.fit.bg-grey-10
      ws-sphere(
        v-if="$route.params.page === 'sphere'")
      ws-setting(
        v-else-if="$route.params.page === 'setting'")
      node-saver(
        v-else
        :value="item").fit
        template(v-slot:editor=`{node, saving}`)
          component(:is="`${$route.params.page}-editor`" :node="node" :saving="saving" @cancel="pageDialogOpened = false")
  q-header()
    .row.full-width.justify-center.bg-grey-9
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            q-btn(round flat color="white" icon="school")
            span.text-bold.text-white Workspace
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="settings")
  q-footer()
    .row.full-width.justify-center
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0'}`
        ).row.full-width.items-center.content-center.bg-grey-8
        .col
          kalpa-buttons(
            :value="pages"
          :id="$route.params.page" idKey="id"
          @id="$router.push({params: {page: $event}}).catch(e=>e)")
        q-btn(round flat color="white" icon="menu" @click="$store.commit('ui/stateSet', ['menuAppShow', true])").q-mr-sm
  q-page-container
    q-page(:style=`{height: $q.screen.height-60-60+'px'}`)
      ws-items(
        ctx="workspace"
        :pages="pages" :page="$route.params.page"
        @page="$router.push({params: {page: $event}}).catch(e=>e)"
        @item="itemClick"
        @add="itemAdd"
        ).bg-grey-9.fit
</template>

<script>
import wsItems from './ws_items'
import wsSphere from './ws_sphere'
import wsSetting from './ws_setting'

export default {
  name: 'workspaceIndex',
  components: {wsItems, wsSphere, wsSetting},
  props: [],
  data () {
    return {
      pageDialogOpened: false,
      page: 'contentNotes',
      pages: [
        // {id: 'note', name: 'Notes'},
        {id: 'contentNotes', name: 'Contents'},
        {id: 'node', name: 'Nodes'}
      ]
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
    this.$q.addressbarColor.set('#222')
    document.body.style.background = '#222'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
