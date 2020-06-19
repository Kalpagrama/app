<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- menu right
  div(
    v-if="$q.screen.width > 1260"
    :style=`{
      position: 'absolute', zIndex: 9999,
      right: -$store.state.ui.panelMaxWidth+'px',
      maxWidth: $store.state.ui.panelMaxWidth+'px',
    }`).row.full-width.justify-start.q-px-sm.q-pt-sm
    menu-right(
      :style=`{
        maxWidth: '300px',
      }`).b-50
  q-layout(
    view="hHh lpR fFf"
    container :style=`{height: $q.screen.height+'px'}`).b-30
    //- kalpa-menu-right
    //-   menu-right
    q-header(reveal :style=`{zIndex: 30000}`).row.full-width.justify-center
      div(
        :style=`{
        borderRadius: '0 0 10px 10px', overflow: 'hidden',
          maxWidth: $store.state.ui.maxWidthPage+'px'
        }`).row.full-width.items-center.b-50.q-py-md.q-px-sm
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
        span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ '# ' + sphere.name}}
    q-drawer(v-model="showMenuRight" side="right")
      menu-right(:inDrawer="true")
    q-footer(
      v-if="$q.screen.xs"
      reveal).row.full-width.justify-center
      div(
        v-if="!$store.state.ui.appShowMenu"
        :style=`{borderRadius: '10px 10px 0 0'}`
        ).row.full-width.items-center.content-center.q-pa-sm.b-50
        q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])").b-60
        .col.q-pb-sm.q-px-sm
          //- kalpa-buttons(:value="pagesHot" :id="$route.params.page" @id="$router.push({params: {page: $event}})").justify-center
        q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = !showMenuRight").b-60
    //- kalpa-menu-footer(:options=`{showMenuPage: true}`)
    //-   template(v-slot:menuRight=`{inDrawer}`)
    //-     menu-right(:inDrawer="inDrawer")
    q-page-conainter
      q-page
        kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
          template(v-slot=`{items}`)
            list-middle(:items="items" :options=`{paddingTop: 86, paddingBottom: $q.screen.height/3}`)
              template(v-slot:item=`{item, index, indexMiddle}`)
                node(
                  ctx="list" layout="PIP"
                  :node="item" :index="index" :essence="true"
                  :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
                  :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
                  :active="index === indexMiddle"
                  :mini="false")
</template>

<script>
import menuRight from './menu_right'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trendsExplorer',
  components: {menuRight},
  props: ['sphere'],
  data () {
    return {
      showMenuRight: false
    }
  },
  computed: {
    sphereOid () {
      return this.sphere.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
    this.$q.addressbarColor.set('rgb(30,30,30)')
    document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
