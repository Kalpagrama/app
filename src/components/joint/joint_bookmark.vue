<template lang="pug">
q-btn(
  @click="start()"
  round flat
  :color="jointBookmark ? 'green' : 'grey-9'"
  :icon="jointBookmark ? 'bookmark' : 'bookmark_outline'"
  :loading="loading")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointBookmark',
  props: ['joint', 'isActive', 'isVisible'],
  data () {
    return {
      loading: false,
      jointBookmark: null,
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('isActive TO', to)
          let [jointBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.joint.oid}})
          if (jointBookmark) this.jointBookmark = jointBookmark
        }
      }
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.loading = true
      let [jointBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.joint.oid}})
      if (!jointBookmark) {
        let jointBookmarkInput = {
          type: 'JOINT',
          oid: this.joint.oid,
          name: this.joint.name,
          thumbUrl: ''
        }
        jointBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, jointBookmarkInput)
      }
      this.$log('jointBookmark', jointBookmark)
      this.jointBookmark = jointBookmark
      this.loading = false
    }
  },
}
</script>
