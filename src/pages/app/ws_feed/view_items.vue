<template lang="pug">
.row.full-width
  small.text-white {{feed}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'viewItems',
  props: ['id'],
  data () {
    return {
      feed: null
    }
  },
  watch: {
    id: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          if (to === 'all') {
            this.feed = {
              id: 'all',
              name: 'All bookmarks',
              // feeds: [],
              bookmarks: [],
              // spheres: []
            }
          }
          else {
            this.feed = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, to)
          }
        }
      }
    }
  },
}
</script>
