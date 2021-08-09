<template lang="pug">
  div(
    v-if="itemsRes"
    :style=`{
    position: 'relative',
    borderStyle: 'solid',
    borderRadius: '10px',
    borderColor: '#222',
  }`
  ).row.full-width
    graph-view(:height="700" :graph="graph")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import {assert} from 'src/system/utils'

export default {
  name: 'pageGraph',
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
      let rootNode = {
        id: this.node.oid,
        oid: this.node.oid,
        name: this.node.name,
        type: this.node.type,
        thumbUrl: this.node.thumbUrl,
      }
      this.graph.nodes.push(rootNode);
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
