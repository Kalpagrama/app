<template lang="pug">
.row.full-width.items-start.content-start.justify-center.q-pt-sm
  div(:style=`{position: 'fixed', bottom: '0px', zIndex: 10000,}`).row.full-width.items-center.content-center.bg-red.bg
    q-btn(round flat color="white" icon="west")
    q-btn(flat color="white" @click="$router.push('/trends')") To trends
    q-btn(flat color="white" @click="isActive_ = !isActive_") {{ isActive_ ? 'Videos on' : 'Images only' }}
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.items-start.content-start
    list-feed(
      v-if="sphereOid"
      :itemStyles=`{
        paddingBottom: '50px',
      }`
      :query="query")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible,isPreload}`)
        item-feed(
          :itemFull="item.populatedObject"
          :isActive="isActive_ && isActive"
          :isVisible="isVisible"
          :isPreload="isPreload")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'uiLayout',
  props: ['oid'],
  data () {
    return {
      category: null,
      isActive_: true,
    }
  },
  computed: {
    sphereOid () {
      return this.category?.sphere.oid
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.sphereOid,
          sortStrategy: 'ACTIVITY', // AGE
        },
        populateObjects: true,
      }
    },
  },
  watch: {
    '$route.query.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.category = this.$store.getters.nodeCategories.find(c => c.sphere.oid === to)
        }
        // go to the first category: ALL
        else {
          this.$router.replace({query: {oid: this.$store.getters.nodeCategories[0].sphere.oid}})
        }
      }
    }
  },
}
</script>
