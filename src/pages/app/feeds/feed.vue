<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start.q-pt-sm
    kalpa-loader(
      v-if="true" :query="queryFeedItems" :limit="12" v-slot=`{items, next, nexting}`)
      list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
        q-infinite-scroll(@load="next" :offset="$q.screen.height")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
          feed-item(
            v-if="item.subject"
            :item="item" :isActive="isActive" :isVisible="isVisible")
          //- div(
            v-if="item.type === 'OBJECT_CREATED'"
            ).row.full-width.br
            small.text-white {{ item.type }}
        template(v-slot:append)
          div(:style=`{height: '50px'}`).row.full-width.justify-center
            q-spinner-dots(v-show="nexting" color="green" size="50px")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import feedItem from './feed_item.vue'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {feedItem},
  data () {
    return {
      bookmarks: [],
    }
  },
  computed: {
    feedSubscriptions () {
      if (this.bookmarks.length > 0) {
        return this.bookmarks.reduce((acc, val) => {
          if (val.oid) {
            acc.push(val.oid)
          }
          return acc
        }, [])
      }
      else {
        return []
      }
    },
    queryFeedItems () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_FEED,
          oidSphere: this.$store.getters.currentUser().oid,
          // subscription: {$in: this.feedSubscriptions}
          matterReason: {$ne: 'AUTHOR'}, // только события относительно объектов, где я не являюсь автором объекта
          eventType: {$in: ['OBJECT_CREATED']} // только события о создании объектов
        },
        populateObjects: true
      }
      // add subscription array if not empty
      // if (this.feedSubscriptions.length > 0) {
      //   res.selector.subscription = {$in: this.feedSubscriptions}
      // }
      return res
    }
  },
  watch: {
    feed: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('feed TO', to)
        if (to && to.bookmarks) {
          let {items} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
              id: {$in: to.bookmarks}
            },
            sort: [{updatedAt: 'desc'}]
          })
          this.bookmarks = items
        }
      }
    }
  }
}
</script>
