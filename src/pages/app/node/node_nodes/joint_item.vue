<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).row.full-width.items-between
  .col.full-height
    node-lite(
      v-if="item && item.type === 'NODE'"
      :isActive="isActive" :isVisible="isVisible"
      :node="item")
  div(:style=`{width: '80px',}`).row.full-height.justify-center
  div(
    :style=`{
      position: 'absolute', zIndex: 1000, right: '0px', top: '0px',
      width: '80px', minHeight: '100px',
    }`
    ).row.full-height.justify-center
    div(:style=`{height: '100%', width: '1px'}`).bg-green
    div(
      :style=`{position: 'absolute', zIndex: 1100, bottom: '100px'}`
      ).row.full-width.justify-center
      q-btn(
        @click="vote()"
        round flat icon="insert_link" color="green" stack
        size="lg"
        ).b-30 {{ jointFull ? jointFull.rate*100 : '' }}
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
        else return this.jointFull.meta.leftItem
      }
      else return null
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        this.$log('isActive TO', to)
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
