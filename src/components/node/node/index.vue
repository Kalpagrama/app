<template lang="pug">
.row.full-width
  composition
  //- composition
  div(
    :style=`{minHeight: '60px'}`
    ).row.full-width
    span 
</template>

<script>
import composition from 'components/node/composition'

export default {
  name: 'node',
  props: ['node', 'nodeFullReady'],
  components: {composition},
  data () {
    return {
      nodeFull: null
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
