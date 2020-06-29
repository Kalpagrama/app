<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
kalpa-layout(
  title="Trends"
  :style=`{height: $q.screen.height+'px',}`)
  template(v-slot:footer)
    div(:style=`{maxWidth: '800px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).row.full-width.q-pa-sm.b-60
      q-btn(round flat dense color="white" icon="menu" @click="$store.commit('ui/stateSet', ['appShowMenu', true])")
      .col
      q-btn(round flat dense color="white" icon="menu_open" @click="showMenuRight = true")
  template(v-slot:header)
    div(:style=`{maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`).row.full-width.items-center.content-center.q-pa-sm.b-60
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      .col.q-px-sm
        span(:style=`{fontSize: '18px',}`).text-white.text-bold {{ '# ' + sphere.name}}
  template(v-slot:drawerRight)
    menu-right(:style=`{maxWidth: '260px',}`)
  template(v-slot:page)
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items, itemsMore}`)
        list-middle(
          :root="$refs.kBox"
          :items="items" :more="itemsMore" :options=`{paddingTop: 86, paddingBottom: $q.screen.height/3}`
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
      showMenuRight: false,
      pointerEventsTimeout: null,
      pointerEvents: false,
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
