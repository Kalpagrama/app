<template lang="pug">
div(style=`position: relative`).column.fit.bg-white
  div(style=`position: absolute; top: 0px; right: 0px; height: 60px; width: 60px`).row.items-center.justify-center
    q-btn(outline round icon="clear" color="primary" @click="$emit('close')")
  //- .col
  result
  //- div(style=`height: 90px`).row.full-width something
  div(style=`position: relative`).col
    editor
</template>

<script>
import result from './result'
import editor from './editor'
export default {
  name: 'pageAppEditorVideo',
  components: {result, editor},
  data () {
    return {
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
