<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    borderStyle: 'solid',
    borderRadius: '10px',
    borderColor: '#222',
  }`
  ).row.full-width
    graph-view(ref="graphView" :showAddBtn="false" :maxHeight="height" :graphD3="graph" :getJoints="getJoints", :oidRoot="oid")
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
      graph: { nodes: [], joints: [], selectedItem: null }
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
    async getJoints (oid) {
      this.itemsRes = await this.$rxdb.find(this.query(oid))
      this.$log('this.itemsRes', JSON.parse(JSON.stringify(this.itemsRes.items)))
      await this.itemsRes.setProperty('currentId', null)
      await this.itemsRes.gotoStart()
      let joints = []
      for (let item of this.itemsRes.items) {
        let joint = item.populatedObject
        assert(joint.type === 'JOINT')
        let jointCopy = JSON.parse(JSON.stringify(joint))
        // jointCopy.items - тут полные сущности. Они нам не нужны(и хранить их в графе не надо)
        jointCopy.items = jointCopy.itemsShort
        // this.$log('jointCopy=', jointCopy)
        joints.push(jointCopy)
      }
      return joints
    },
  },
  async beforeMount () {
    this.$log('beforeMount', this.oid)
    assert(this.oid)
    if (this.$store.state.ui.graph && this.$store.state.ui.graph.nodes.find(n => n.oid === this.oid)) this.graph = cloneDeep(this.$store.state.ui.graph)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['graph', cloneDeep(this.graph)])
  }
}
</script>
