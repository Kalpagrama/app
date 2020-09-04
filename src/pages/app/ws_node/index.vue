<template lang="pug">
ws-node-editor(
  v-if="node"
  :node="node"
  :title="title"
  @out="outHandle")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsNode',
  components: {},
  meta () {
    return {
      title: this.node ? this.node.name : ''
    }
  },
  data () {
    return {
      publishing: false,
      node: null,
      nodeNew: {
        name: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        wsItemType: 'WS_NODE',
        thumbOid: '',
        stage: 'draft',
      }
    }
  },
  computed: {
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          if (to === 'new') {
            this.$q.notify({type: 'positive', message: 'Creating new node'})
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
            let {items: [item]} = await this.$rxdb.find({
              selector: {
                rxCollectionEnum: RxCollectionEnum.WS_NODE,
                id: to
              }
            })
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
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
