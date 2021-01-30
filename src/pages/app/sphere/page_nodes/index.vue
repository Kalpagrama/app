<template lang="pug">
.row.full-width.justify-center.b-30.q-pt-sm
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    kalpa-loader(
        v-if="sphere" :query="query" :limit="12" v-slot=`{items, next}`)
        list-middle(
          :items="items"
          :itemStyles=`{marginBottom: '50px',}`
          :style=`{
            //- maxWidth: $store.state.ui.pageWidth+'px',
            //- paddingTop: '8px',
          }`)
          q-infinite-scroll(@load="next" :offset="$q.screen.height")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
            node-feed(:node="item.populatedObject" :isActive="isActive" :isVisible="isVisible" :width="width")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeFeed from 'components/node_feed/index.vue'

export default {
  name: 'pageApp_sphere_pageNodes',
  props: ['sphere'],
  components: {
    nodeFeed,
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          // objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.sphere.oid
        },
        populateObjects: true,
      }
    }
  }
}
</script>
