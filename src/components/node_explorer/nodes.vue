<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px', zIndex: 100000}`).row.full-width.items-center.bg-grey-3
    //- q-btn(flat color="grey-6" icon="keyboard_arrow_left" no-caps style=`width: 40px; height: 40px`)
    div(
      v-for="(f, fi) in nodeFull.fragments" :key="fi"
      @click="fragmentClick(f, fi)"
      :class=`{'bg-grey-3': fi === fragmentActive, 'bg-grey-4': fi !== fragmentActive}`
      ).col.full-height.cursor-pointer
      .row.full-height.justify-center.items-center
        div(:style=`{height: '40px', width: '70px', overflow: 'hidden', ...getRadius}`).row
          img(:src="node.thumbUrl[fi]" :style=`{width: '100%', objectFit: 'cover'}`)
  div(body-scroll-lock-ignore).col.full-width.scroll.q-pt-md
    node-masonry(:nodes="$nodesDistinct(nodes[fragmentActive])" @nodeClick="nodeClick" nameAtTheBottom)
    //- div(v-for="n in 1" :key="n" style=`height: 300px`).row.full-width {{n}}
</template>

<script>
import nodeMasonry from 'components/node_masonry'

export default {
  name: 'nodeExplorer__nodes',
  props: ['node', 'nodeFull', 'nodes'],
  components: {nodeMasonry},
  data () {
    return {
      fragmentActive: 0
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
    fragmentClick (f, fi) {
      this.$log('fragmentClick', f, fi)
      // this.$q.notify(`fragmentClick: ${fi}`)
      this.$set(this, 'fragmentActive', fi)
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$router.push(`/app/node/${n.oid}`)
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
