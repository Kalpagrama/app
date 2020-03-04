<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).row.full-width
  div(:style=`{position: 'relative'}`).col.full-height
    //- content.name, and layer name ??
    span(
      v-if="content"
      :style=`{
        position: 'absolute', zIndex: 2000, top: '10px', left: '10px',
        borderRadius: '10px', background: 'rgba(0,0,0,0.2)'
      }`
      ).q-pa-sm.text-green.text-bold {{ content.name }}
    composition(
      v-if="content"
      ctx="workspace" :value="{layers: [{content, figuresAbsolute: [], figuresRelative: [], spheres: []}]}" :visible="true" :active="true" :mini="false")
  div(:style=`{width: '400px'}`).row.full-height
    extra(:content="content")
</template>

<script>
import extra from './extra'

export default {
  name: 'contentExplorer',
  components: {extra},
  props: ['mode', 'content'],
  data () {
    return {
    }
  },
  computed: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
