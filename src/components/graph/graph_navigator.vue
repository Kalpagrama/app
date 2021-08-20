<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    borderStyle: 'solid',
    borderRadius: '10px',
    borderColor: '#222',
  }`
  ).row.full-width
    graph-view(ref="graphView" :showAddBtn="false" :height="height" :graphD3="graph"
      @discover="discover" @node_click="discover")
    q-spinner(v-if="inProcess" size="60px" color="white" thickness=3 :style=`{opacity: 0.5, position: 'absolute', top: '50%', left: '50%', marginLeft: '-30px', marginTop: '-30px'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import itemPreview from 'src/components/kalpa_item/item_preview'
import essenceActions from 'src/components/essence/essence_actions.vue'

import { assert } from 'src/system/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'graphNavigator',
  props: ['oid', 'height'],
  components: { itemPreview, essenceActions },
  data () {
    return {
      itemsRes: null,
      inProcess: false,
      graph: { nodes: [], joints: [], selectedItem: null, transform: null }
    }
  },
  computed: {},
  methods: {
    query (oidSphere) {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: oidSphere,
          sortStrategy: 'AGE'
        },
        populateObjects: true
      }
    },
    async addAdjacent (oid) {
      try {
        this.$log('addAdjacent', this.rootItem)
        let rootNode = this.graph.nodes.find(n => n.oid === oid)
        if (!rootNode) {
          let fullNode = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
          rootNode = this.$refs.graphView.addNodeToGraph(cloneDeep(fullNode))
        }
        if (rootNode.discovered) return
        this.inProcess = true
        this.itemsRes = await this.$rxdb.find(this.query(oid), true)
        this.$log('this.itemsRes', JSON.parse(JSON.stringify(this.itemsRes.items)))
        await this.itemsRes.setProperty('currentId', null)
        await this.itemsRes.gotoStart()
        for (let item of this.itemsRes.items) {
          let joint = item.populatedObject
          assert(joint.type === 'JOINT')
          let jointCopy = JSON.parse(JSON.stringify(joint))
          // jointCopy.items - тут полные сущности. Они нам не нужны(и хранить их в графе не надо)
          jointCopy.items = jointCopy.itemsShort
          // this.$log('jointCopy=', jointCopy)
          this.$refs.graphView.addJointToGraph(jointCopy, false)
        }
        rootNode.discovered = true
        this.graph.selectedItem = rootNode
      } finally {
        this.$wait(700).then(() => {
          this.inProcess = false
        })
      }
    },
    async discover (item) {
      await this.addAdjacent(item.oid)
      // this.$emit('discover', item)
    }
  },
  async beforeMount () {
    this.$log('beforeMount', this.oid)
    assert(this.oid)
    if (this.$store.state.ui.graph && this.$store.state.ui.graph.nodes.find(n => n.oid === this.oid)) this.graph = cloneDeep(this.$store.state.ui.graph)
    else await this.addAdjacent(this.oid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['graph', this.graph])
  }
}
</script>
