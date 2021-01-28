<template lang="pug">
//- .row.full-width.justify-center
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
div(
  ref="dc"
  ).row.full-width
  //- @update="itemUpdate"
  dynamic-scroller(
    v-if="itemsRes"
    :items="itemsRes.items"
    :min-item-size="300"
    :emit-update="true"
    :buffer="$q.screen.height*2"
    keyField="id"
    :style=`{
      height: $q.screen.height-2+'px',
      width: '100%',
    }`)
    //- template(v-slot:before)
      div(:style=`{height: 300+'px',}`).row.full-width
    template(v-slot="{ item, index, active }")
      dynamic-scroller-item(
        :item="item"
        :active="active"
        :size-dependencies=`[
          item.id,
        ]`
        :data-index="index"
        )
        div(
          :accessKey="index"
          :class=`{
            //- 'bg-red': indexMiddle === index,
          }`
          :style=`{
            paddingBottom: '50px',
          }`
          v-observe-visibility=`{
            throttle: 200,
            callback: indexMiddleHandler,
            intersection: {
              root: $refs.dc,
              rootMargin: '-50% 0px',
            }
          }`
          ).row.full-width.justify-center
          div(
            :style=`{
              maxWidth: 700+'px',
              position: 'relative',
            }`
            ).row.full-width.items-start.content-start
            node-feed(
              :node="item.object"
              :isVisible="true"
              :isActive="indexMiddle === index")
            //- node-feed(
              v-if="item.object.type === 'NODE'"
              :key="item.id"
              :node="item.object"
              :isVisible="true"
              :isActive="indexMiddle === index")
            //- joint-feed(
              v-if="item.object.type === 'JOINT'"
              :key="item.id"
              :joint="item.object"
              :isVisible="true"
              :isActive="indexMiddle === index")
            //- h1.text-white {{ index }} -- {{ item.id }}
            //- Wc4Jij3Iz0
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
// import feedItem from './feed_item.vue'

// import nodeFeed from 'components/node_feed/index.vue'
// import jointFeed from 'components/joint_feed/index.vue'

export default {
  name: 'feeds_feed',
  props: ['feed'],
  components: {
    // feedItem
    // nodeFeed,
    // jointFeed,
  },
  data () {
    return {
      bookmarks: [],
      // items: [],
      itemsRes: null,
      indexMiddle: 0,
    }
  },
  methods: {
    itemUpdate (start, end) {
      this.$log('itemUpdate', start, end)
    },
    indexMiddleHandler (isVisible, entry, idx) {
      let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.indexMiddle = index
        this.$log('indexMiddle', index)
      }
      else {
        if (index === this.indexMiddle) {
          // this.indexMiddle = -1
        }
      }
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
    },
    // items () {
    //   if (this.itemsRes) {
    //     let lastIndex = localStorage.getItem('items-feed-last-index')
    //     if (lastIndex) {
    //       this.$log('lastIndex', lastIndex)
    //       return this.itemsRes.items.slice(parseInt(lastIndex))
    //     }
    //     else {
    //       return this.itemsRes.items
    //     }
    //   }
    //   else {
    //     return []
    //   }
    // }
  },
  watch: {
    indexMiddle: {
      handler (to, from) {
        if (this.itemsRes) {
          if (this.itemsRes.items.length - to < 5) {
            this.$q.notify({type: 'positive', message: 'Next'})
            this.itemsRes.next()
          }
        }
      }
    },
    feed: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('feed TO', to)
        // if (to && to.bookmarks) {
        //   let {items} = await this.$rxdb.find({
        //     selector: {
        //       rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        //       id: {$in: to.bookmarks}
        //     },
        //     sort: [{updatedAt: 'desc'}]
        //   })
        //   this.bookmarks = items
        // }
        // let {items} = await this.$rxdb.find({
        //   selector: {
        //     rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        //     // id: {$in: to.bookmarks}
        //   },
        //   sort: [{updatedAt: 'desc'}]
        // })
        // this.bookmarks = items
        this.itemsRes = await this.$rxdb.find(this.queryFeedItems, true)
        // let itemsFeed = this.$store.state.ui.itemsFeed
        // let itemsFeed = window['items-feed']
        // if (!itemsFeed) {
        //   itemsFeed = await this.$rxdb.find(this.queryFeedItems, true)
        //   // this.$store.commit('ui/stateSet', ['itemsFeed', itemsFeed])
        //   window['items-feed'] = itemsFeed
        // }
        // this.itemsRes = itemsFeed
        // let {items} = await this.$rxdb.find({
        //   selector: {
        //     rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        //     // id: {$in: to.bookmarks}
        //   },
        //   sort: [{updatedAt: 'desc'}]
        // })
        // this.items = items
      }
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // let lastIndex = this.indexMiddle
    // if (localStorage.getItem('items-feed-last-index')) {
    //   lastIndex += this.indexMiddle
    // }
    // alert('lastIndex: => ' + lastIndex)
    // localStorage.setItem('items-feed-last-index', lastIndex)
  }
}
</script>
