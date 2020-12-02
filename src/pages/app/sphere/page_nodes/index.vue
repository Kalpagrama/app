<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
    paddingBottom: '50vh'
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand position="top"
    :style=`{
      zIndex: 1000,
    }`
    )
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        slot
  kalpa-loader(
    v-if="sphere" :query="query" :limit="12" v-slot=`{items, next}`)
    list-middle(
      :items="items"
      :itemStyles=`{marginBottom: '50px',}`
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        //- paddingTop: '8px',
      }`)
      q-infinite-scroll(@load="next" :offset="$q.screen.height")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
        node-feed(:node="item" :isActive="isActive" :isVisible="isVisible" :width="width")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_sphere_viewNodes',
  props: ['sphere'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          oidSphere: this.sphere.oid
        },
        populateObjects: true,
      }
    }
  }
}
</script>
