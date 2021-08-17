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
    graph-view(ref="graphView" :showAddBtn="false" :height="700" :graphD3="graph" @nodeDblClick="setRoot" @nodeClick="gotoCube")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import { assert } from 'src/system/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'graphNavigator',
  props: ['oid'],
  components: {},
  data () {
    return {
      itemsRes: null,
      rootItem: null,
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
          oidSphere: this.rootItem.oid,
          sortStrategy: 'AGE'
        },
        populateObjects: true
      }
    }
  },
  methods: {
    async addAdjacent () {
      this.$log('addAdjacent', this.rootItem)
      this.itemsRes = await this.$rxdb.find(this.query, true)
      await this.itemsRes.setProperty('currentId', null)
      await this.itemsRes.gotoStart()
      this.$refs.graphView.addNodeToGraph(cloneDeep(this.rootItem), false)
      for (let item of this.itemsRes.items) {
        let joint = item.populatedObject
        assert(joint.type === 'JOINT')
        let jointCopy = JSON.parse(JSON.stringify(joint))
        // jointCopy.items - тут полные сущности. Они нам не нужны(и хранить их в графе не надо)
        jointCopy.items = jointCopy.itemsShort
        this.$refs.graphView.addJointToGraph(jointCopy, false)
      }
    },
    async setRoot(item) {
      this.$emit('setRoot', item)
      this.rootItem = item
      await this.addAdjacent()
    },
    async gotoCube(item) {
      this.$router.push('/cube/' + item.oid)
    }
  },
  async mounted () {
    this.$log('mounted', this.oid)
    assert(this.oid)
    this.rootItem = await this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
    await this.addAdjacent()
  }
}
</script>
