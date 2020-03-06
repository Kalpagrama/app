<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).row.full-width
  div(
    :class=`{
      'column': $q.screen.width < 800,
      'row': $q.screen.width >= 800
    }`
    ).fit
    //- composition container
    div(
      :class=`{
        'row': $q.screen.width < 800,
        'full-width': $q.screen.width < 800,
        'col': $q.screen.width >= 800
      }`
      :style=`{
        height: $q.screen.width < 800 ? $q.screen.height/3+'px' : '100%'
      }`)
      composition(
        v-if="content"
        ctx="workspace" :value="{layers: [{content, figuresAbsolute: [], figuresRelative: [], spheres: []}]}" :visible="true" :active="true" :mini="false")
    //- extra container
    div(
      :class=`{
        'col': $q.screen.width < 800,
        'full-width': $q.screen.width < 800,
        'row': $q.screen.width >= 800,
        'full-height': $q.screen.width >= 800
      }`).bg-grey-10
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
