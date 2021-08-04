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
      graph: { nodes: [], joints: [] },
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
  },
  methods: {},
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
    if (this.itemsRes) {
      this.$log('this.itemsRes.items', this.itemsRes.items)
      for (let item of this.itemsRes.items) {
        let joint = item.populatedObject
        assert(joint.type === 'JOINT')
        let jointCopy = JSON.parse(JSON.stringify(joint))
        delete jointCopy.items // есть  itemsShort
        this.graph.joints.push(jointCopy)
      }
    }
    await this.itemsRes.setProperty('currentId', null)
    await this.itemsRes.gotoStart()
  }
}
</script>
