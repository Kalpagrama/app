<template lang="pug">
q-layout(view="hHh lpR fFf")
  q-header
    div(:style=`{height: '60px'}`).row.full-width.items-center
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
        q-btn(round flat color="white" icon="keyboard_arrow_left")
      span Жидкий металл
  q-page-container
    q-page
      node-explorer
</template>

<script>
import nodeExplorer from 'components/node_explorer'

export default {
  name: 'pageApp__Node',
  components: { nodeExplorer },
  props: ['width', 'height'],
  data () {
    return {
      node: null,
      needFull: false,
      tab: 'node',
      active: false,
      nodeFull: null,
      nodesCurrent: [null, null],
      nodes: [[], []]
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>

<style lang="stylus" scoped>
</style>
