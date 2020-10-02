<template lang="pug">
.row.full-width
  node-editor(
    v-if="node && $route.params.item === undefined"
    :node="node"
    :title="title"
    @out="outHandle")
  item-editor(
    v-if="node && $route.params.item !== undefined"
    :item="node.items[parseInt($route.params.item)]"
    @close="$router.back()")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsNode',
  components: {
    nodeEditor: () => import('components/node_editor/index.vue'),
    itemEditor: () => import('components/node_editor/item_editor.vue')
  },
  data () {
    return {
      publishing: false,
      node: null,
      nodeNew: {
        name: '',
        description: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'VERTICAL',
        wsItemType: 'WS_NODE',
        thumbUrl: '',
      }
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            // this.$q.notify({type: 'positive', position: 'top', message: 'Creating new node'})
            this.node = JSON.parse(JSON.stringify(this.nodeNew))
            var unwatch = this.$watch(
              'node',
              async (_from, _to) => {
                this.$log('node _TO', to)
                // create node...
                if (unwatch) unwatch()
                let nodeInput = JSON.parse(JSON.stringify(this.node))
                let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
                this.$router.replace(`/workspace/node/${node.id}`)
              },
              {
                deep: true,
              }
            )
          }
          else {
            let item = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
            this.$log('FOUND node', item)
            this.node = item
          }
        }
      }
    },
  },
  methods: {
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
