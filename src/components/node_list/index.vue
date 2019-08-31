<template lang="pug">
div(:style=`{marginBottom: '200px'}`).row.full-width.items-start.content-start.justify-start.q-px-md
  //- node item
  div(v-for="(n, ni) in nodes" :key="n.oid" @click="$router.push(`/app/node/${n.oid}`)"
    @mouseover="nodeOver = n.oid"
    @mouseleave="nodeOver = undefined"
    :style=`{position: 'relative', marginBottom: '40px'}`
    ).q-mr-md
    div(:style=`{position: 'relative'}`).row.full-width.justify-start
      div(:style=`{position: 'relative', height: '75px', borderRadius: '8px', overflow: 'hidden'}`).row.full-width
        img(:src="n.thumbUrl[0]" :style=`{height: '75px'}`).col
        img(:src="n.thumbUrl[1]" :style=`{height: '75px'}`).col
      div(:style=`{position: 'absolute', left: '8px', top: '75px', zIndex: 1000}`).row.full-width.q-pr-md
        small {{n.name | cut(140)}}
</template>

<script>
export default {
  name: 'nodeList',
  props: ['nodes'],
  data () {
    return {
      nodeOver: undefined
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
