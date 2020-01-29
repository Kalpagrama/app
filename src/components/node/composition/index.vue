<template lang="pug">
.row.full-width
  
  slot(name="editor" :player="player")
</template>

<script>
export default {
  name: 'compositionEditor',
  data () {
    return {
      compositionNew: {
        oid: '',
        type: '',
        name: '',
        thumbUrl: '',
        layers: [
          {
            contentOid: '123',
            content: {},
            figures: [{points: [], t: 0}, {points: [], t: 10}],
            url: ''
          }
        ]
      },
      player: null
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
