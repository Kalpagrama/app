<template lang="pug">
ws-node-editor(
  v-if="node"
  :node="node"
  :title="title"
  @outHanlde="outHandle")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item/index.vue'

export default {
  name: 'pageApp_wsNode',
  components: {nodeItem},
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
        category: null,
        layout: 'PIP',
        wsItemType: 'WS_NODE',
        stage: 'draft',
      }
    }
  },
  computed: {
    title () {
      if (this.$route.params.id) return 'Node creator'
      else return 'Node editor'
    }
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
