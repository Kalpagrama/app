<style lang="stylus">
</style>

<template lang="pug">
k-colls(ref="wsItemsColls" :coll="coll" @coll="coll = $event" :colls="collsFiltered" :tabs="true" :style=`{height: height || '100%'}`)
  template(v-slot:spheres)
    ws-spheres
  template(v-slot:fragments)
    ws-fragments
  template(v-slot:contents)
    ws-contents
  template(v-slot:nodes)
    ws-nodes
</template>

<script>
import wsSpheres from './ws_spheres'
import wsContents from './ws_contents'
import wsFragments from './ws_fragments'
import wsNodes from './ws_nodes'

export default {
  name: 'wsItems',
  components: {wsSpheres, wsContents, wsFragments, wsNodes},
  props: ['ctx', 'types', 'height'],
  data () {
    return {
      coll: 'fragments',
      colls: [
        {id: 'spheres', name: 'Spheres'},
        {id: 'contents', name: 'Contents'},
        {id: 'fragments', name: 'Fragments'},
        {id: 'nodes', name: 'Nodes'}
      ]
    }
  },
  computed: {
    collsFiltered () {
      if (this.types) {
        return this.colls.filter((c, ci) => {
          return this.types.includes(c.id)
        })
      } else {
        return this.colls
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
