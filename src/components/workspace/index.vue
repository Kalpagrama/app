<style lang="sass">
.ws-menu-item
  &:hover
    background: #888
</style>
<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+300+300"
    :style=`{
      position: 'fixed', zIndex: 1000, width: '300px', height: $q.screen.height+'px', top: '0px', right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-300+'px',
      paddingTop: '68px',
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.bg-grey-9
      //- .col.full-width.scroll
      .row.full-width.items-start.q-my-sm
        router-link(
          :to="p.id"
          v-for="(p,pi) in pages" :key="pi"
          :class=`{
            'bg-grey-7': $route.params.page === p.id
          }`
          :style=`{height: '40px'}`
          ).row.full-width.items-center.content-center.ws-menu-item.q-px-md
          span(
            :class=`{
            }`
            ).text-white {{ p.name }}
  q-dialog(
    v-model="pageDialogOpened" :maximized="true" position="bottom"
    @hide="itemEdited")
    div(
      @click.self="pageDialogOpened = false"
      :style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width.justify-center.q-pb-sm
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
      //- span(
      //-   v-if="$store.state.workspace.item"
      //-   :style=`{position: 'fixed', top: '8px', zIndex: 10000}`).bg-red {{$store.state.workspace.item.revision}}
  q-header()
    .row.full-width.justify-center.bg-grey-10
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="keyboard_arrow_left" @click="$router.back()")
        .col.full-height
          .row.fit.items-center.content-center.justify-center
            q-btn(round flat color="white" icon="school")
            span.text-bold.text-white Workspace
        div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
          q-btn(round flat color="grey-5" icon="settings" @click="$router.push({params: {page: 'setting'}})")
  q-footer(v-if="$q.screen.width < 1300")
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
    q-page(:style=`{height: $q.screen.height-60+'px'}`)
      div(:style=`{minHeight: '100%'}`).row.fit.justify-center.q-py-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            borderRadius: '10px', overflow: 'hidden'
          }`).row.fit.bg-grey-9
          ws-settings(v-if="$route.params.page === 'settings'")
          ws-items(
            v-else
            ctx="workspace"
            :pages="pages" :page="$route.params.page"
            @page="$router.push({params: {page: $event}}).catch(e=>e)"
            @item="itemClick"
            @add="itemAdd"
            :style=`{
              borderRadius: '10px', overflow: 'hidden'
            }`)
</template>

<script>
import wsItems from './ws_items'
import wsSphere from './ws_sphere'
import wsSettings from './ws_settings'
import contentNoter from 'components/node/content_noter'
import wsItemSaver from './ws_item_saver'

export default {
  name: 'workspaceIndex',
  components: {wsItems, wsSphere, wsSettings, contentNoter, wsItemSaver},
  props: [],
  data () {
    return {
      pageDialogOpened: false,
      page: 'contentNotes',
      pages: [
        {id: 'notes', name: 'Notes'},
        {id: 'contentNotes', name: 'Contents'},
        {id: 'node', name: 'Nodes'},
        {id: 'chains', name: 'Chains'},
        {id: 'settings', name: 'Settings'}
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
    // '$store.state.workspace.item': {
    //   handler (to, from) {
    //     this.$log('item CHANGED', to)
    //   }
    // }
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
