<template lang="pug">
  .row.full-width.items-start.content-start.justify-center.q-pt-sm
    div(
      :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`
    ).row.full-width.items-start.content-start
      list-feed(
        :itemStyles=`{
        paddingBottom: '50px',
      }`
        :query="query")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          item-feed(
            :item="item.populatedObject"
            :isActive="isActive"
            :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageRecommendations',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT', 'BLOCK'] },
          oidSphere: this.node.oid,
          deep: 5,
          sortStrategy: 'AGE' // 'ACTIVITY', // AGE
        },
        populateObjects: true,
      }
    },
  },
}
</script>
