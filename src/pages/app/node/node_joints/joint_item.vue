<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.items-between
  //- left side with content: node, sphere, content, user
  .col.full-height
    node-lite(
      v-if="item && item.type === 'NODE'"
      :isActive="isActive" :isVisible="isVisible"
      :node="item.metaStatic"
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
  //- right padding for real
  div(:style=`{width: '70px',}`).row.full-height.justify-center
  //- right side for line and voting for the joint...
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
      width: '70px', minHeight: '100px',
    }`
    ).row.full-height.justify-center
    div(:style=`{height: '100%', width: '1px'}`).bg-green
    div(
      v-if="item"
      :style=`{
        position: 'absolute', zIndex: 1100, bottom: '0px',
        marginBottom: item.type === 'NODE' ? '70px' : '4px',
      }`
      ).row.full-width.justify-center
      q-btn(
        @click="vote()"
        round flat dense color="green"
        :style=`{height: '60px'}`
        ).b-30
        q-icon(name="insert_link" color="green" size="30px")
        .row.full-width.justify-center.q-mb-sm
          span(:style=`{fontSize: '16px'}`) {{ jointFull ? jointFull.rate*100 : '' }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'jointItem',
  props: ['node', 'joint', 'isActive', 'isVisible'],
  data () {
    return {
      jointFull: null
    }
  },
  computed: {
    item () {
      if (this.jointFull) {
        if (this.jointFull.leftItem.oid === this.node.oid) return this.jointFull.rightItem
        else return this.jointFull.leftItem
      }
      else return null
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        this.$log('isActive TO', to)
        // TODO: if we got all in metaStatic need? we to load jointFull...
        if (!this.jointFull) this.jointFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.joint.oid)
        if (to) {
          // if (this.jointFull) this.jointFull = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
          // this.$log('jointFull', this.jointFull)
        }
        this.$log('jointFull', this.jointFull)
      }
    }
  },
  methods: {
    async vote () {
      this.$log('vote')
    }
  }
}
</script>
