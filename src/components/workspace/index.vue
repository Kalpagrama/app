<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px'}`)
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
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            q-btn(round flat color="white" icon="school")
            span.text-bold.text-white Workspace
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-centern
          q-btn(round flat color="grey-3" icon="settings")
  q-footer(reveal)
    .row.full-width.justify-center
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px 10px 0 0'}`
        ).row.full-width.items-center.content-center.bg-grey-8
        kalpa-buttons(:value="pagesFiltered" :id="page" idKey="id").row.fit.items-center
  q-page-container.fit
    q-page.fit.br
      ws-menu(
        ctx="workspace"
        :oid="node ? node.oid : false" :page="$route.params.page"
        @page="$router.push({params: {page: $event}}).catch(e=>e)" @item="itemClick" @add="itemAdd"
        ).bg-grey-9.fit
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
      pageDialogOpened: false,
      pagesRaw: [
        {id: 'note', name: 'Notes'},
        {id: 'content', name: 'Contents'},
        // {id: 'composition', name: 'Compositions'},
        {id: 'node', name: 'Nodes'}
      ]
    }
  },
  computed: {
    item () {
      return this.$store.state.workspace.item
    },
    pagesFiltered () {
      // return this.pagesRaw.filter(p => this.pages.includes(p.id))
      return this.pagesRaw
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
