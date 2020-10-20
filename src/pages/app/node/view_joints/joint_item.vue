<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.items-between.fit
  //- left side with content: node, sphere, content, user
  .col.full-height
    //- item
    node-mini(
      v-if="item && item.type === 'NODE'"
      :isActive="isActive" :isVisible="isVisible"
      :node="item"
      :marginBottom="80")
    div(
      v-if="item && item.type === 'WORD'"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        marginTop: '50px',
        marginBottom: '30px',
      }`
      ).row.full-width.q-pa-sm.b-40
      span.text-white.q-ml-sm {{ item.name }}
    //- footer
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      small.text-white {{ joint.jointType }}
      .col
      span(:style=`{fontSize: '16px'}`).text-white.text-bold {{ joint.rate*100 }}
  //- right padding for real
  div(:style=`{width: '60px',}`).row.full-height.justify-center
  //- right side for line and voting for the joint...
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
      width: '60px', minHeight: '100px',
    }`
    ).row.full-height.justify-center
    div(:style=`{height: '100%', width: '2px'}`).bg-green
    div(
      v-if="item"
      :style=`{
        position: 'absolute', zIndex: 1100, bottom: '0px',
        marginBottom: '60px'
      }`
      ).row.full-width.justify-center
      q-btn(
        @click="vote()"
        round flat dense color="green"
        :style=`{height: '60px'}`
        ).full-width.b-30
        q-icon(name="adjust" color="green" size="30px")
        //- .row.full-width.justify-center.q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointItem',
  props: ['node', 'joint', 'isActive', 'isVisible'],
  data () {
    return {
    }
  },
  computed: {
    item () {
      if (this.joint.leftItem.oid === this.node.oid) return this.joint.rightItem
      else return this.joint.leftItem
    }
  },
  methods: {
    async vote () {
      this.$log('vote')
    }
  }
}
</script>
