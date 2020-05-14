<style lang="sass">
.ws-menu-item
  &:hover
    background: #888
</style>

<template lang="pug">
//- q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px', background: '#333'}`)
//- div(:style=`{position: 'relative'}`).row.full-width
div(:style=`{position: 'relative', height: $q.screen.height+'px'}`).column.full-width
  kalpa-menu-right
    menu-right(:pages="pages")
  //- header
  //- kalpa-menu-footer
  //-   template(v-slot:menuRight)
  //-     menu-right(:pages="pages")
  //- item editors
  //- q-dialog(
  //-   v-model="pageDialogOpened" :maximized="true" position="bottom"
  //-   @hide="itemEdited")
  //-   //- @click.self="pageDialogOpened = false"
  //-   div(
  //-     :style=`{position: 'relative', height: $q.screen.height+'px', background: 'rgba(0,0,0,0.8)'}`).row.full-width.justify-center
  //-     ws-item-saver(v-if="$store.state.workspace.item" :value="$store.state.workspace.item")
  //-       template(v-slot=`{item}`)
  //-         composition-editor(
  //-           v-if="item"
  //-           ctx="workspace"
  //-           :composition="item"
  //-           @cancel="pageDialogOpened = fals"
  //-           :style=`{
  //-             maxWidth: $store.state.ui.maxWidthPage+'px'
  //-           }`)
  //- .col.full-width
  //-   //- q-page-container
  //-   //-   q-page
  div(:style=`{}`).col.full-width.scroll.q-mb-sm
    .row.fit.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit
        ws-settings(v-if="$route.params.page === 'settings'")
        ws-tags(v-if="$route.params.page === 'tags'")
        ws-items(
          v-else
          ctx="workspace"
          :pages="pages" :page="$route.params.page"
          @page="$router.push({params: {page: $event}}).catch(e=>e)")
          template(v-slot:header)
            div(
              :style=`{position: 'relative', height: '60px', borderRadius: '10px'}`
              ).row.full-width.items-center.content-center.q-px-sm.b-100
              q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
              div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
                q-btn(round flat color="white" :style=`{borderRadius: '50%'}`)
                  q-icon(name="school" size="36px" color="white")
              .col
                .row.fit.items-center.content-center
                  span(:style=`{fontSize: '18px'}`).text-white.text-bold Workspace
                  .row.full-width
                    small.text-white {{ pages.find(p => p.id === $route.params.page).name }}
</template>

<script>
import wsItems from './ws_items'
import wsTags from './ws_tags'
import wsSettings from './ws_settings'
import wsItemSaver from './ws_item_saver'
import menuRight from './menu_right'

export default {
  name: 'workspaceIndex',
  components: {wsItems, wsTags, wsSettings, wsItemSaver, menuRight},
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
            // this.$router.replace('/workspace/' + to).catch(e => e)
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
