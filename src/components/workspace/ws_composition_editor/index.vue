<template lang="pug">
.column.fit.b-50
  div(
    :style=`{
      position: 'relative',
      height: videoHeight+'px',
      borderRadius: '10px',
      overflow: 'hidden',
    }`).row.full-width.b-30
    h1 video
  .col.full-width
    small.text-white {{ value }}
</template>

<script>
export default {
  name: 'wsCompositionEditor',
  props: ['value'],
  data () {
    return {
    }
  },
  computed: {
    stateExplorer  () {
      return {
        set: (key, val) => {
          this[key] = val
        }
      }
    },
    videoHeight () {
      return this.$q.screen.height * 0.4
    }
  }
}
</script>
