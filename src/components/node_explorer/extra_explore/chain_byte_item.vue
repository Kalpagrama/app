<template lang="pug">
.row.fit.q-px-xs.q-pt-xs
  div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.bg-grey-9
    img(
      v-if="node"
      :src="node.meta.items[0].thumbUrl" draggable="false"
      :style=`{borderRadius: '10px', overflow: 'hidden', objectFit: 'contain', pointerEvents: 'none'}`).full-width
    .row.full-width.q-pa-sm
      span(v-if="node").text-white.text-bold {{ node.name }}
</template>

<script>
export default {
  name: 'extraExplore_chainByteItem',
  props: ['nodeExplore', 'chain'],
  data () {
    return {
      chainFull: null
    }
  },
  computed: {
    node () {
      if (!this.chainFull) return null
      let link = this.chainFull.links[0]
      if (link.leftItem.oid === this.nodeExplore.oid) return link.rightItem
      else return link.rightObject
    }
  },
  methods: {
    async chainLoad () {
      try {
        // this.$log('chainLoad start')
        let res = await this.$store.dispatch('objects/get', { oid: this.chain.oid, priority: 0 })
        // this.$log('chainLoad done', res)
        this.chainFull = res
      }
      catch (e) {
        this.$log('chainLoad error', e)
      }
    }
  },
  mounted () {
    // this.$log('mounted')
    this.chainLoad()
  }
}
</script>
