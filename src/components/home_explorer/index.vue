<template lang="pug">
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
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .col
        span.text-white.text-bold.q-mx-md Домашняя
      q-btn(round flat color="white" icon="menu_open")
  .col.full-width
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items,itemsMore}`)
        list-middle(:items="items" :more="itemsMore")
          //- template(v-slot:itemFirst)
          //-   div(:style=`{height: '70px'}`).row.full-width
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
