<template lang="pug">
q-btn(
  @click="start()"
  round flat
  :color="linkBookmark ? 'green' : 'grey-9'"
  :icon="linkBookmark ? 'bookmark' : 'bookmark_outline'"
  :loading="loading")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'linkBookmark',
  props: ['link', 'isActive', 'isVisible'],
  data () {
    return {
      loading: false,
      linkBookmark: null,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('isActive TO', to)
          let [linkBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.link.oid}})
          if (linkBookmark) this.linkBookmark = linkBookmark
        }
      }
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.loading = true
      let [linkBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.link.oid}})
      if (!linkBookmark) {
        let linkBookmarkInput = {
          oid: this.link.oid,
          name: this.link.name,
          thumbUrl: '',
          type: 'JOINT',
          wsItemType: 'WS_BOOKMARK',
          spheres: []
        }
        linkBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, linkBookmarkInput)
      }
      this.$log('linkBookmark', linkBookmark)
      this.linkBookmark = linkBookmark
      this.loading = false
    }
  },
}
</script>
