<template lang="pug">
//- q-layout(
//-   view="hHh lpR fFf"
//-   container :style=`{height: $q.screen.height+'px'}`).b-30
//-   q-header(
//-     v-if="true"
//-     reveal :style=`{zIndex: 30000}`).row.full-width.justify-center
//-     div(
//-       :style=`{
//-         maxWidth: $store.state.ui.maxWidthPage+'px',
//-         zIndex: 30000,
//-         borderRadius: '0 0 10px 10px', overflow: 'hidden'
//-       }`
//-       ).row.full-width.items-center.content-center.justify-start.b-50.q-py-md.q-px-sm
//-       q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
//-       span(:style=`{fontSize: '16px'}`).text-white.text-bold Home
//-   q-footer(
//-     v-if="$q.screen.xs"
//-     reveal
//-     ).row.full-width.justify-center
//-     div(
//-       v-if="!$store.state.ui.appShowMenu"
//-       :style=`{
//-         maxWidth: $store.state.ui.maxWidthPage+'px',
//-         zIndex: 30000,
//-         borderRadius: '10px 10px 0 0'
//-       }`
//-       ).row.full-width.items-center.content-center.q-pa-sm.b-50
//-       q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])").b-60
//-       .col.q-pb-sm.q-px-sm
//-         //- kalpa-buttons(:value="pagesHot" :id="$route.params.page" @id="$router.push({params: {page: $event}})").justify-center
//-       //- q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = !showMenuRight").b-60
//-   //- kalpa-menu-footer(:options=`{showMenuPage: false}`)
//-     //- template(v-slot:menuRight)
//-     //-   menu-right
//-   //- page
//-   q-page-conainter
//-     q-page
//-       kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
//-         template(v-slot=`{items}`)
//-           list-middle(:items="items" :options=`{paddingTop: 86, paddingBottom: $q.screen.height/3}`)
//-             template(v-slot:item=`{item, index, indexMiddle}`)
//-               node(
//-                 ctx="list" layout="PIP"
//-                 :node="item" :index="index" :essence="true"
//-                 :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
//-                 :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
//-                 :active="index === indexMiddle"
//-                 :mini="false")
kalpa-layout(:style=`{height: $q.screen.height+'px'}` :rightDrawerScroll="true")
  template(v-slot:header)
    div(
      :style=`{
        maxWidth: '800px',
        zIndex: 30000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-start.b-50.q-pa-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      .col.q-px-sm
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Home
  template(v-slot:drawerRight)
    menu-right(:style=`{maxWidth: '400px'}`)
  template(v-slot:page)
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        list-middle(:items="items" :options=`{paddingTop: 86, paddingBottom: $q.screen.height/3}`)
          template(v-slot:itemFirst)
            div(:style=`{height: '100px'}`).row.full-width
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
  name: 'homeExplorer',
  components: {menuRight},
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser() ? this.$store.getters.currentUser().oid : null
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
