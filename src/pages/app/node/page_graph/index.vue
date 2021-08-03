<template lang="pug">
  div(
    v-if="itemsRes"
    :style=`{
    position: 'relative',
  }`
  ).row.full-width
    graph-view(:height="700" :graph="graph")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import * as assert from 'assert'

export default {
  name: 'pageJoints',
  props: ['node'],
  components: {
  },
  data () {
    return {
      itemsRes: null,
      itemsSliderShow: false,
      itemsSliderJoint: null
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.node.oid,
          sortStrategy: 'AGE'
        },
        populateObjects: true
      }
    },
    graph () {
      let graph = { nodes: [], joints: [] }
      if (this.itemsRes) {
        this.$log('this.itemsRes.items', this.itemsRes.items)
        for (let item of this.itemsRes.items) {
          let joint = item.populatedObject
          assert(joint.type === 'JOINT')
          let leftNode = joint.itemsShort[0]
          let rightNode = joint.itemsShort[1]
          if (!graph.nodes.find(n => n.oid === leftNode.oid)) graph.nodes.push(JSON.parse(JSON.stringify(leftNode)))
          if (!graph.nodes.find(n => n.oid === rightNode.oid)) graph.nodes.push(JSON.parse(JSON.stringify(rightNode)))
          let jointType = this.$nodeItemTypesPairs.find(p => p.id.includes(joint.vertices[0]) && p.id.includes(joint.vertices[1])).name
          graph.joints.push({oid: joint.oid, type: jointType, source: leftNode.oid, target: rightNode.oid})
        }
      }
      this.$log('graph', graph)
      return graph
    }
  },
  methods: {},
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
    await this.itemsRes.setProperty('currentId', null)
    await this.itemsRes.gotoStart()
  }
}
</script>
