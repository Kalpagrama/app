<style lang="sass">
.q-header
  background: none !important
.q-footer
  background: none !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{position: 'absolute', zIndex: 10000, top: '0px',}`).row.full-width.justify-center
    div(:style=`{height: '50px', maxWidth: '800px', borderRadius: '0 0 10px 10px', overflow: 'hidden'}`
      ).row.full-width.items-center.content-center.justify-between.b-40
      q-tabs(
        :value="$route.params.oid" @input="$router.push({params: {oid: $event}})"
        no-caps active-color="white"
        ).fit.text-white
        q-tab(v-for="c in categories" :key="c.sphere.oid" :name="c.sphere.oid" :label="c.alias")
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
// import menuRight from './menu_right'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trendsExplorer',
  // components: {menuRight},
  props: ['category'],
  data () {
    return {
      showMenuRight: false,
      pointerEventsTimeout: null,
      pointerEvents: false,
      categoryPicking: false,
      categories: []
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
  async mounted () {
    this.$log('mounted')
    this.categories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
