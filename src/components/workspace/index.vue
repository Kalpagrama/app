<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-9
  q-dialog(
    v-model="pageDialogOpened" :maximized="true" position="bottom"
    @hide="itemEdited")
    div(
      @click.self="pageDialogOpened = false"
      :style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width.justify-center
      //- ws-sphere(
      //-   v-if="$route.params.page === 'sphere'")
      //- ws-setting(
      //-   v-if="true")
      //- node-saver(
      //-   v-if="$store.state.workspace.item"
      //-   :value="item").fit
      //-   template(v-slot:editor=`{node, saving}`)
      //-     component(:is="`${$route.params.page}-editor`" :node="node" :saving="saving" @cancel="pageDialogOpened = false")
      //- content-noter(v-if="$store.state.workspace.itemType === 'content'" :value="$store.state.workspace.item")
      ws-item-saver(v-if="$store.state.workspace.item" :value="$store.state.workspace.item")
        template(v-slot=`{item}`)
          composition-editor(
            v-if="item"
            :ctx="'workspace'"
            :content="item.rawData.content"
            :composition="item.rawData"
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px'
            }`)
  //- q-dialog(
  //-   v-model="")
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
          q-btn(round flat color="grey-5" icon="settings" @click="$router.push({params: {page: 'setting'}})")
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
import contentNoter from 'components/node/content_noter'
import wsItemSaver from './ws_item_saver'

export default {
  name: 'workspaceIndex',
  components: {wsItems, wsSphere, wsSetting, contentNoter, wsItemSaver},
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
    // item () {
    //   return this.$store.state.workspace.item
    // }
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
    },
    '$store.state.workspace.item': {
      handler (to, from) {
        this.$log('item CHANGED', to)
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
    async itemEdited () {
      this.$log('itemEdited')
      // let res = await this.$store.dispatch('workspace/wsItemUpdate', this.$store.state.workspace.item)
      // this.$log('res', res)
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
