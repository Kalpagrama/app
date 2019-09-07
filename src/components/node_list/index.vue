<template lang="pug">
div(:style=`{marginBottom: '200px'}`).row.full-width.items-start.content-start.justify-start.q-px-sm
  //- node item
  div(v-for="(n, ni) in nodes" :key="n.oid"
    @click="nodeClick(n, ni)"
    @mouseover="nodeOver = n.oid"
    @mouseleave="nodeOver = undefined"
    :style=`{position: 'relative', marginBottom: '40px'}`
    ).q-mr-md.cursor-pointer
    div(:style=`{position: 'relative'}`).row.full-width.justify-start
      div(:style=`{position: 'relative', height: nodeHeight+'px', borderRadius: '10px', overflow: 'hidden', border: '3px solid none'}`).row.full-width
        img(v-for="(t, ti) in n.thumbUrl" :key="ti" :src="t" :style=`{height: nodeHeight+'px'}` draggable="false").col
        //- img(:src="n.thumbUrl[1]" :style=`{height: '75px'}`).col
      div(:style=`{position: 'absolute', left: '8px', top: nodeHeight+'px', zIndex: 100, maxHeight: '18px', overflow: 'hidden'}`).row.full-width.q-pr-md
        small.text-black {{n.name | cut(30)}}
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
    getRadius () {
      return {
        borderBottomLeftRadius: '100%12px',
        borderBottomRightRadius: '100%12px',
        borderTopLeftRadius: '100%12px',
        borderTopRightRadius: '100%12px'
      }
    }
  },
  methods: {
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
    // setInterval(() => {
    //   this.$emit('more')
    // }, 2000)
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
