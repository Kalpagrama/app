<template lang="pug">
div(
  :style=`{position: 'relative', overflow: 'hidden'}`
  ).row.full-width
  div(
    :style=`{position: 'relative', height: '76px'}`
    ).row.full-width.items-center.justify-center.br
    span frames
    q-btn(
      round push color="green" icon="add" @click="cutHere()"
      :style=`{position: 'absolute', right: '16px', top: '16px'}`)
</template>

<script>
export default {
  name: 'contentVideoExtractor',
  props: ['content', 'player'],
  data () {
    return {
    }
  },
  methods: {
    cutHere () {
      this.$log('cutHere')
      let now = this.player.now
      // create new composition, or? add layer to composition on the right
      this.$log('now', now)
      let composition = {
        layers: [
          {
            contentOid: this.content.oid,
            content: this.content,
            figures: [
              {t: now, points: []},
              {t: now + 1, points: []}
            ]
          }
        ],
        operation: {
          items: [0, 1],
          operations: null
        },
        outputType: 'VIDEO'
      }
      this.$log('composition', composition)
    },
    async compositionCreate () {
      this.$log('compositionCreate')
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
