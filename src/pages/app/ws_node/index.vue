<template lang="pug">
ws-node-editor(
  v-if="node" :node="node"
  :title="title")
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
      title: 'Ядро' + this.node ? this.node.name : ''
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
            this.node = this.nodeNew
          }
          else {
            let {items: [item]} = await this.$rxdb.find({
              selector: {
                rxCollectionEnum: RxCollectionEnum.WS_NODE,
                id: to
              }
            })
            this.$log('item', item)
            this.node = item
          }
        }
      }
    },
    // node: {},
  },
  methods: {
    nodeAdd () {
      this.$log('nodeAdd')
    },
    publishCheck () {
      if (!this.node.category) throw new Error('No node.category !')
      // if (this.node.name.length === 0) throw new Error('No node.essence !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 5) throw new Error('5 items maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      // throw new Error('Wrong!')
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(500)
        this.publishCheck()
        let createdNode = await NodeApi.nodeCreate(this.node)
        await this.node.updateExtended('stage', 'published', false)
        await this.node.updateExtended('oid', createdNode.oid, false)
        this.$log('publish done', createdNode.oid)
        this.publishing = false
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: 'Ядро отправлено на публикацию!'})
      }
      catch (e) {
        this.$log('publish error', e)
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          message: e.toString()})
        this.publishing = false
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
