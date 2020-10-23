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
import wsSphereFinder from 'components/ws_sphere_finder/index.vue'

export default {
  name: 'nodeLite__nodeBookmark',
  components: {wsSphereFinder},
  props: ['node', 'isActive', 'isVisible'],
  data () {
    return {
      loading: false,
      nodeBookmark: null,
      searchString: '',
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          // let nodeBookmark = await this.$rxdb.get(RxCollectionEnum.WS_BOOKMARK, this.node.oid)
          let [nodeBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid}})
          if (nodeBookmark) this.nodeBookmark = nodeBookmark
        }
        else {
          this.loading = false
          this.spheresAdding = false
          if (this.$refs.sphereSelectorMenu) this.$refs.sphereSelectorMenu.hide()
        }
      }
    }
  },
  methods: {
    async start () {
      this.$log('start')
      this.loading = true
      // let nodeBookmark = await this.$rxdb.get(RxCollectionEnum.WS_BOOKMARK, this.node.oid)
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
      }
      this.$log('nodeBookmark', nodeBookmark)
      this.nodeBookmark = nodeBookmark
      this.spheresAdding = true
      this.loading = false
      this.$emit('done')
    },
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.nodeBookmark.spheres.find(id => id === sphere.id)
      if (sphereFind) {
        this.nodeBookmark.spheres = this.nodeBookmark.spheres.filter(id => id !== sphere.id)
      }
      else {
        this.nodeBookmark.spheres.push(sphere.id)
      }
      this.$refs.sphereSelectorMenu.hide()
    },
  },
}
</script>
