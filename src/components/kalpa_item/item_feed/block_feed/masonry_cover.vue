<template lang="pug">
  .row.scroll
    div(ref="cover").row.full-width.wrap
      div(v-for='(item, i) in block.graph.nodes' :key='i'
        :style=`{height: null,  width: cellWidth,}`)
        div().fit.q-pa-xs
          img(
            :src="item.thumbUrl"
            :style=`{
              borderRadius: '10px',
              objectFit: 'cover',
            }`
          ).fit
</template>

<script>
export default {
  name: 'masonryCover',
  components: {},
  props: {
    block: { type: Object }
  },
  data () {
    return {}
  },
  computed: {
    cellWidth () {
      if (this.block.graph.nodes.length === 2) return '50%'
      if (this.block.graph.nodes.length === 3) return '33%'
      if (this.block.graph.nodes.length >= 4) return '25%'
      return '100%'
    }
  },
  methods: {},
  mounted () {
  }
}
</script>
