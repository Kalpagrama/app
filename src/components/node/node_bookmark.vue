<template lang="pug">
q-btn(
  @click="start()"
  round flat
  :color="nodeBookmark ? 'green' : 'grey-9'"
  :icon="nodeBookmark ? 'bookmark' : 'bookmark_outline'"
  :loading="loading")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'nodeBookmark',
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      loading: false,
      nodeBookmark: null,
    }
  },
  computed: {
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          let [nodeBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid}})
          if (nodeBookmark) this.nodeBookmark = nodeBookmark
        }
      }
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.loading = true
      let [nodeBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid}})
      if (!nodeBookmark) {
        let nodeBookmarkInput = {
          oid: this.node.oid,
          name: this.node.name,
          thumbUrl: this.node.items[0].thumbUrl,
          type: 'NODE',
          wsItemType: 'WS_BOOKMARK',
          spheres: []
        }
        nodeBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, nodeBookmarkInput)
        // TODO: subscribe to node...
        await UserApi.subscribe(this.node.oid)
      }
      this.$log('nodeBookmark', nodeBookmark)
      this.nodeBookmark = nodeBookmark
      this.loading = false
    }
  },
}
</script>
