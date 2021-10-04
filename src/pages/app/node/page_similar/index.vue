<template lang="pug">
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{ maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start
      //.row.full-width.items-start.content-start.text-h6.text-bold.text-white {{$t('Similar')}}
      tab-list-feed(
        :type="'customPPV'"
        :scrollAreaHeight="0"
        :query="query"
        :itemHeightApprox="500"
        :itemActivePersist="false").row.full-width
        template(v-slot:item=`{item,itemState,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          item-feed(
            :itemShortOrFull="item"
            :itemState="itemState"
            :itemIndex="itemIndex"
            :isActive="isActive"
            :isVisible="isVisible"
            :isPreload="isPreload"
            :scrolling="scrolling"
            :showActions="false").q-pb-md
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageSimilar',
  props: {
    node: {type: Object},
    types: {type: Array, default: ['NODE', 'JOINT', 'BLOCK']},
  },
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: this.types },
          oidSphere: this.node.oid,
          deep: 5,
          sortStrategy: 'HOT' // 'ACTIVITY', // AGE
        },
        populateObjects: false,
      }
    },
  },
}
</script>
