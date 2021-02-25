<template lang="pug">
.row.full-width
  q-btn(
    @click="nodeVideoRefresh()"
    round flat color="white" icon="refresh")
  .col
    div(
      :style=`{
        position: 'relative',
        height: '40px',
      }`
      ).row.full-width
      q-btn(
        @click="isOpened ? $emit('hide') : $emit('open')"
        flat color="white" no-caps
        ).full-width {{ isOpened  ? 'Свернуть' : 'Открыть' }}
  q-btn(
    @click="$emit('close')"
    round flat color="white" icon="clear")
</template>

<script>
export default {
  name: 'playerVideo',
  props: ['player', 'contentKalpa', 'node', 'isOpened'],
  computed: {
  },
  methods: {
    nodeVideoRefresh () {
      this.$log('nodeVideoRefresh')
      let t = this.node.items[0].layers[0].figuresAbsolute[0].t
      this.player.setCurrentTime(t)
      this.player.play()
    }
  }
}
</script>
