<template lang="pug">
.row.full-width
  span composition
</template>

<script>
export default {
  name: 'composition',
  props: ['value'],
  data () {
    return {
      composition: {},
      compositionNew: {
        spheres: [],
        layers: [
          {
            contentOid: '123',
            content: {},
            figures: [
              {t: 0, points: []},
              {t: 10, points: []}
            ]
          }
        ]
      }
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
