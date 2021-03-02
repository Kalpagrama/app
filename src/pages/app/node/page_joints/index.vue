<template lang="pug">
div(
  v-if="itemsRes"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  .row.full-width.q-px-md.q-py-sm.text-white.text-bold
    span.q-mr-sm Связи
    div(
      v-if="itemsRes && itemsRes.totalCount > 0"
      ).row
      span.q-mr-sm -
      span {{ itemsRes ? itemsRes.totalCount : '' }}
  joints-slider(
    v-if="itemsSliderShow"
    :oid="node.oid"
    :joint="itemsSliderJoint"
    :style=`{
      position: 'absolute', zIndex: 1000, top: '-70px',
    }`)
  div(
    v-for="(joint, jointIndex) in itemsRes.items"
    :key="joint[itemsRes.itemPrimaryKey]"
    ).col-6.q-pa-xs
    div(
      @click="jointClick(joint)"
      :style=`{
        position: 'relative',
        paddingBottom: '100%',
      }`
      ).row.full-width
      joint-item(
        :oid="node.oid"
        :joint="joint.populatedObject"
        :style=`{
          position: 'absolute', zIndex: 10,
          background: 'rgba(35,35,35)',
          borderRadius: '10px',
        }`).fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import jointItem from './joint_item.vue'
import jointsSlider from './joints_slider.vue'

export default {
  name: 'pageJoints',
  props: ['node'],
  components: {
    jointItem,
    jointsSlider,
  },
  data () {
    return {
      itemsRes: null,
      itemsSliderShow: false,
      itemsSliderJoint: null,
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.node.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    jointClick (joint) {
      this.$log('jointClick', joint)
      this.$router.push(`/joint/${joint.oid}?oid=${this.node.oid}`)
    },
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
  }
}
</script>
