<template lang="pug">
div(
  :style=`{height: '35px', borderRadius: '10px', overflow: 'hidden'}`
  ).row.full-width.items-center.content-center.q-px-sm.q-mb-xs.bg-grey-9
  span(v-if="node").text-white {{ node.name }}
</template>

<script>
export default {
  name: 'chainListItem',
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
