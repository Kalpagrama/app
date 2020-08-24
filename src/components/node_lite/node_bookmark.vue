<template lang="pug">
q-btn(
  @click="bookmarked ? bookmarkDelete() : bookmarkCreate()"
  round flat
  :color="bookmarked ? 'white' : 'grey-2'"
  :icon="bookmarked ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '0px', right: '0px',
    background: 'rgba(0,0,0,0.2)',
  }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLite__nodeBookmark',
  props: ['oid', 'type', 'name', 'isActive'],
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
      this.$log('bookmarkFind')
      let {items: [item]} = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.oid, type: 'NODE'
      }
      })
      this.$log('bookmarkFind item', item)
      return item
    },
    async bookmarkDelete () {
      this.$log('bookmarkDelete')
      let bookmark = await this.bookmarkFind()
      if (bookmark) {
        await this.$rxdb.remove(bookmark.id)
        this.bookmarked = false
      }
    },
    async bookmarkCreate () {
      try {
        this.$log('bookmarkCreate start')
        this.laoding = true
        await this.$wait(500)
        let bookmarkInput = {
          oid: this.oid,
          type: this.type,
          name: this.name,
          wsItemType: 'WS_BOOKMARK'
        }
        let bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        this.$log('bookmarkCreate bookmark', bookmark)
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
