<template lang="pug">
q-btn(
  @click="start()"
  round flat
  color="white"
  :icon="nodeBookmark ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', right: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
  q-menu(
    ref="sphereSelectorMenu"
    dark cover anchor="top right")
    ws-sphere-finder(
      v-if="nodeBookmark"
      ref="wsSphereFinder"
      :useSearch="true"
      :selectedIds="nodeBookmark.spheres"
      :hiddenIds="[]"
      @sphere="sphereAdd")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import wsSphereFinder from 'components/ws_sphere_finder/index.vue'

export default {
  name: 'nodeLite__nodeBookmark',
  components: {wsSphereFinder},
  props: ['node', 'nodeFull', 'isActive', 'isVisible'],
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
          let {items: [nodeBookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid}})
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
      let {items: [nodeBookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.node.oid}})
      if (!nodeBookmark) {
        let nodeBookmarkInput = {
          oid: this.node.oid,
          name: this.node.name,
          thumbOid: this.node.meta.items[0].thumbUrl,
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
