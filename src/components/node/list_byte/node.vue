<template lang="pug">
div(
  :style=`{position: 'relative', paddingBottom: 60+60+'px'}`
  ).row.full-width.items-start.content-start
  //- composition ONE
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
    img(
      :src="node.thumbUrl"
      :style=`{width: '100%', objectFit: 'contain'}`)
    composition(
      v-if="nodeFull" :composition="nodeFull.compositions[0]"
      :style=`{position: 'absolute', zIndex: 100, opacity: 1}`)
  //- essence
  div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
    span.text-bold.text-white {{ node.name }}
  //- composition TWO
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
    img(
      :src="node.thumbUrl"
      :style=`{width: '100%', objectFit: 'contain'}`)
    composition(
      v-if="nodeFull" :composition="nodeFull.compositions[1]"
      :style=`{position: 'absolute', zIndex: 100, opacity: 1}`)
</template>

<script>
import composition from 'components/node/composition'

export default {
  name: 'nodeListByteNode',
  components: {composition},
  props: ['node', 'nodeFullReady', 'visible', 'active'],
  data () {
    return {
      nodeFull: null
    }
  },
  methods: {
    async nodeLoad () {
      if (this.nodeFull) return
      let oid = this.node.oid
      this.$log(` nodeLoad start indx=${this.index}  oid=${oid}`)
      let node = null
      try {
        node = await this.$store.dispatch('objects/get', { oid, priority: 0 })
        this.nodeFullError = null
      } catch (err) {
        // this.$logE('nodeLoad error', err)
        this.$emit('hide') // не показывать это ядро
        node = null
        this.nodeFullError = err
      }
      if (node) {
        // this.$log(`np-test: nodeLoad OK ! indx=${this.index}  oid=${oid}`, node)
        this.nodeFull = node
        this.$nextTick(async () => {
          if (this.visible) await this.play()
        })
      }
    },
  },
  async mounted () {
    this.$log('mounted')
    this.nodeLoad(this.node.oid)
  }
}
</script>
