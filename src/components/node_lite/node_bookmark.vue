<template lang="pug">
q-btn(
  @click="bookmarked ? bookmarkDelete() : bookmarkCreate()"
  round flat
  color="white"
  :icon="bookmarked ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', right: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLite__nodeBookmark',
  props: ['node', 'isActive'],
  data () {
    return {
      loading: false,
      bookmarked: false,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let bookmark = await this.bookmarkFind()
          if (bookmark) {
            this.bookmarked = true
          }
        }
      }
    }
  },
  methods: {
    async bookmarkFind () {
      // this.$log('bookmarkFind')
      let {items: [item]} = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid, type: 'NODE'
      }
      })
      // this.$log('bookmarkFind item', item)
      return item
    },
    async bookmarkDelete () {
      try {
        // this.$log('bookmarkDelete')
        this.loading = true
        await this.$wait(300)
        let bookmark = await this.bookmarkFind()
        if (bookmark) {
          await this.$rxdb.remove(bookmark.id)
          this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark deleted!'})
          this.bookmarked = false
          this.loading = false
        }
        else {
          throw new Error('No such bookmark!')
        }
      }
      catch (e) {
        this.$log('bookmarkDelete error', e)
        this.loading = false
      }
    },
    async bookmarkCreate () {
      try {
        // this.$log('bookmarkCreate start')
        this.loading = true
        await this.$wait(300)
        let bookmarkInput = {
          oid: this.node.oid,
          type: 'NODE',
          name: this.node.name,
          thumbOid: this.node.meta.items[0].thumbUrl,
          wsItemType: 'WS_BOOKMARK'
        }
        let bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        // this.$log('bookmarkCreate bookmark', bookmark)
        this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark added!'})
        this.loading = false
        this.bookmarked = true
      }
      catch (e) {
        this.$log('bookmarkCreate error', e)
        this.loading = false
        this.$q.notify({type: 'negative', position: 'top', message: e.message || e.toString()})
      }
    },
  },
}
</script>
