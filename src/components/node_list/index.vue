<template lang="pug">
div(:style=`{marginBottom: '60px'}`).row.full-width.items-start.content-start.justify-start
  //- node item
  div(
    v-for="(n, ni) in nodes" :key="n.oid"
    @click="nodeClick(n, ni)"
    @mouseover="nodeOver = n.oid"
    @mouseleave="nodeOver = undefined"
    :style=`{position: 'relative', height: '50px', marginBottom: '40px'}`
    ).row.no-wrap.reverse.items-end.content-end.q-mr-md.cursor-pointer
    img(v-for="(t, ti) in nodeThumbs(n)" :key="ti" :src="t"
      :style=`{zIndex: 10, borderRadius: '10px', marginRight: ti === 0 ? '0px' : '-15px', height: 50+'px'}` draggable="false")
    div(
      :style=`{position: 'absolute', borderRadius: '0px 0px 10px 10px', left: '0px', top: nodeHeight-10+'px', zIndex: 1, maxHeight: '36px', overflow: 'hidden'}`
      ).row.full-width.q-px-sm.q-pt-sm.bg-white
      small.text-black.q-my-sm {{n.name | cut(60)}}
</template>

<script>
export default {
  name: 'nodeList',
  props: ['nodes', 'selected'],
  data () {
    return {
      nodeOver: undefined,
      nodeHeight: 50
    }
  },
  computed: {
  },
  methods: {
    nodeThumbs (n) {
      if (n.thumbUrl) {
        let arr = JSON.parse(JSON.stringify(n.thumbUrl))
        let arrr = arr.reverse()
        return arrr
      }
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('nodeClick', n, ni)
    },
    moreClick (n, ni) {
      this.$log('modeClick')
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>

<style lang="stylus">
.nodelist-item:hover
  background: white !important
</style>
