<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- category picker
  q-btn(
    @click="categoryPicking = true"
    no-caps color="green" icon-right="keyboard_arrow_down"
    :style=`{
      position: 'absolute', zIndex: 1000, bottom: '14px',
      left: '50%',
      marginRight: '-50%',
      transform: 'translate(-50%, 0)',
    }`
    ).q-px-sm {{ category.alias }}
    q-menu(cover anchor="bottom middle" max-width="300px")
      div(v-if="categoryPicking").row.b-80
        menu-right(:style=`{minHeight: '500px',}`)
  //- header
  div(:style=`{position: 'absolute', zIndex: 10000, top: '0px',}`).row.full-width.justify-center
    div(:style=`{height: '60px', maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.justify-between.b-60
      .row.full-width.items-center.content-center.q-px-sm
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
}
</script>
