<template lang="pug">
.row.full-width.justify-center
  node-feed(
    v-if="node"
    :node="node"
    :isActive="isOpened"
    :isVisible="isOpened"
    :showActions="isOpened"
    :showHeader="isOpened"
    :showItems="isOpened"
    :style=`{
      maxWidth: 600+'px',
    }`)
    template(v-slot:wrapper-inside)
      div(
        v-if="!isOpened"
        @click="nodeOpen()"
        :style=`{
          position: 'absolute', zIndex: 1000,
        }`
        ).row.fit.cursor-pointer
    template(v-slot:footer)
      div(:style=`{order: 100}`).row.full-width.br
        player-video(
          v-if="contentKalpa.type === 'VIDEO'"
          :player="player"
          :contentKalpa="contentKalpa"
          :node="node"
          @close="nodeClose()")
</template>

<script>
import playerVideo from './player_video.vue'

export default {
  name: 'nodePlaying',
  props: ['contentKalpa', 'player', 'node'],
  components: {
    playerVideo,
  },
  data () {
    return {
      isOpened: false,
    }
  },
  methods: {
    async nodeOpen () {
      this.$log('nodeOpen')
      if (this.contentKalpa.type === 'VIDEO') {
        this.player.pause()
      }
      this.isOpened = true
    },
    async nodeClose () {
      this.$log('nodeClose')
      if (this.contentKalpa.type === 'VIDEO') {
        this.player.play()
      }
      // await this.$wait(100)
      this.player.setState('nodePlaying', null)
      this.isOpened = false
    }
  }
}
</script>
