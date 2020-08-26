<template lang="pug">
.row.full-width.bg-blue.q-pa-sm
  small {{ composition.outputType }}
</template>

<script>
export default {
  name: 'compositionBar_video',
  props: ['player', 'composition', 'contentKalpa'],
  data () {
    return {
    }
  }
}
</script>
