<style lang="sass">
.ws-menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px', background: '#333'}`)
  //- menu
  div(
    v-if="$q.screen.width > $store.state.ui.maxWidthPage+$store.state.ui.maxWidthMenu*2"
    :style=`{
      position: 'fixed',
      top: '0px',
      zIndex: 1000,
      width: $store.state.ui.maxWidthMenu+'px',
      height: $q.screen.height+'px',
      right: ($q.screen.width-$store.state.ui.maxWidthPage)/2-$store.state.ui.maxWidthMenu+'px',
      paddingTop: '68px',
    }`).row.items-start.content-start.q-px-sm.q-pb-sm
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden'
      }`
      ).column.full-width.bg-grey-9
      //- .col.full-width.scroll
      .row.full-width.items-start
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
  //- item editors
  q-dialog(
    v-model="pageDialogOpened" :maximized="true" position="bottom"
    @hide="itemEdited")
    div(
      @click.self="pageDialogOpened = false"
      :style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width.justify-center.q-pb-sm
      ws-item-saver(v-if="$store.state.workspace.item" :value="$store.state.workspace.item")
        template(v-slot=`{item}`)
          composition-editor(
            v-if="item"
            ctx="workspace"
            :composition="item.rawData"
            @cancel="pageDialogOpened = fals"
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px'
            }`)
  //- header
  q-header()
    div(:style=`{background: '#333'}`).row.full-width.justify-center
      div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '0 0 10px 10px'}`).row.full-width
        .col.full-height
          .row.fit.items-center.content-center.justify-start.q-px-sm
            .row.full-height.items-center.content-center.q-mr-sm
              q-btn(round flat color="white")
                q-icon(name="school" size="30px")
            .row.full-height.items-center.content-center
              span(:style=`{fontSize: '20px', lineHeight: 1}`).text-white Workspace
              span(:style=`{lineHeight: 1.1}`).text-white.full-width {{ pages.find(p => p.id === $route.params.page).name }}
  //- footer
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
          ws-spheres(v-if="$route.params.page === 'spheres'")
          ws-items(
            v-else
            ctx="workspace"
            :pages="pages" :page="$route.params.page"
            @page="$router.push({params: {page: $event}}).catch(e=>e)"
            @item="itemClick"
            @add="itemAdd"
            :style=`{
              borderRadius: '10px', overflow: 'hidden'
            }`).bg-grey-9
</template>

<script>
import wsItems from './ws_items'
import wsSpheres from './ws_spheres'
import wsSettings from './ws_settings'
import wsItemSaver from './ws_item_saver'

export default {
  name: 'workspaceIndex',
  components: {wsItems, wsSpheres, wsSettings, wsItemSaver},
  props: [],
  data () {
    return {
      pageDialogOpened: false,
      page: 'contentNotes',
      pages: [
        {id: 'note', name: 'Notes'},
        {id: 'contentNotes', name: 'Contents'},
        {id: 'node', name: 'Nodes'},
        {id: 'chain', name: 'Chains'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'settings', name: 'Settings'}
      ]
    }
  },
  computed: {
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
          this.$router.replace({params: {page: 'contentNotes'}})
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
