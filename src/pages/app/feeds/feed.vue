<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
    list-feed(
      :itemStyles=`{
        paddingBottom: '50px',
      }`
      :query="queryFeedItems" :itemKey="'id'")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
        item-feed(
          :item="item.populatedObject"
          :isActive="isActive"
          :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {
  },
  data () {
    return {
    }
  },
  methods: {
  },
  computed: {
    queryFeedItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.$store.getters.currentUser.oid,
          // subscription: {$in: this.feedSubscriptions}
          matterReason: {$ne: 'AUTHOR'}, // только события относительно объектов, где я не являюсь автором объекта
          eventType: {$in: ['OBJECT_CREATED']} // только события о создании объектов
        },
        populateObjects: true
      }
      return res
    }
  },
  watch: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
