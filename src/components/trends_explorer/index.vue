<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
//- kalpa-layout(
//-   :title="$t('pageTrends', 'Тренды')"
//-   :style=`{height: $q.screen.height+'px',}`)
//-   template(v-slot:footer)
//-     div(:style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.q-pa-sm.b-60
//-       q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
//-       .col
//-       q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = true")
//-   template(v-slot:header)
//-     div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.q-pa-sm.b-60
//-       q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
//-       .col
//-         .row.fit.items-center.content-center.q-px-sm
//-           q-icon(name="blur_on" color="white" size="34px").q-mr-sm
//-           span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ category.alias }}
//-   template(v-slot:drawerRight)
//-     menu-right(:style=`{maxWidth: '260px',}`)
//-   template(v-slot:page)
div(:style=`{position: 'relative'}`).column.fit
  //- navigation
  q-btn(
    @click="$store.commit('ui/stateSet', ['appShowMenu', true])"
    round flat color="white" icon="menu"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', right: '24px',}`)
  q-btn(
    @click="$router.back()"
    round flat color="white" icon="keyboard_arrow_left"
    :style=`{position: 'absolute', zIndex: 1000, bottom: '24px', left: '24px',}`)
  //- category picker
  q-btn(
    @click="categoryPicking = true"
    no-caps color="green" icon-right="keyboard_arrow_down"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '24px',
      left: '50%',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
    }`
    ).q-px-sm {{ category.alias }}
    q-menu(cover anchor="bottom middle" max-width="300px")
      div(v-if="categoryPicking").row.b-80
        menu-right(:style=`{minHeight: '500px',}`)
        //- .row.full-width.items-center.content-center.justify-center.q-pa-md
        //-   span(:style=`{fontSize: '20px'}`).text-white.text-bold {{ $t('pageApp_workspace_title', 'Мастерская') }}
        //- router-link(
        //-   v-for="p in pages" :key="p.id" :to="'/workspace/'+p.path"
        //-   ).row.full-width.items-center.content-center.justify-center.q-pa-md
        //-   span.text-white.text-bold {{ p.name }}
  //- header
  div(:style=`{position: 'absolute', zIndex: 10000, top: '0px',}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.justify-between.b-60
      .row.full-width.items-center.content-center.q-px-md.q-py-sm
        q-icon(name="whatshot" color="white" size="30px").q-mr-sm
        span(:style=`{fontSize: '20px',}`).text-bold.text-white {{ category.alias }}
  //- body
  .col.full-width
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items, itemsMore}`)
        list-middle(
          :root="$refs.kBox"
          :items="items" :more="itemsMore"
          :style=`{}`)
          template(v-slot:itemFirst)
            div(:style=`{height: '70px'}`).row.full-width
          template(v-slot:item=`{item, index, indexMiddle}`)
            node(
              ctx="list" layout="PIP"
              :node="item" :index="index" :essence="true"
              :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
              :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
              :active="index === indexMiddle"
              :mini="false")
          template(v-slot:itemLast)
            div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
import menuRight from './menu_right'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trendsExplorer',
  components: {menuRight},
  props: ['category'],
  data () {
    return {
      showMenuRight: false,
      pointerEventsTimeout: null,
      pointerEvents: false,
      categoryPicking: false,
    }
  },
  computed: {
    sphereOid () {
      return this.category.sphere.oid
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
    onWheel (e) {
      // this.$log('onWheel', e)
      if (this.pointerEventsTimeout !== undefined) clearTimeout(this.pointerEventsTimeout)
      this.pointerEvents = 'none'
      this.pointerEventsTimeout = setTimeout(() => {
        this.pointerEvents = 'auto'
      }, 100)
    }
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
