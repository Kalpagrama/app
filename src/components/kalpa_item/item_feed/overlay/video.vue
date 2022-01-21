<template lang="pug">
div(
  :style=`{background: isOverlayShow ? 'rgba(0,0,0,0.7)':'rgba(0,0,0,0)'}`
  @click="onClick(), player.playing ? player.pause():player.play()"
  @mousemove="onMouseMove"
  @mouseout="onMouseOut"
  @mouseover="onMouseOver"
  ).row.full-width.bg-10
  .column.full-width
    // top
    div(v-show="isOverlayShow").row.full-width.q-pa-xs
      .row.full-width.cursor-pointer
        .row.items-center.content-center.justify-center.q-pr-sm
          img(
            :src="item.author.thumbUrl"
            :style=`{height:'50px', width: '50px', objectFit: 'cover', borderRadius: '50px'}`
          )
        .col
          .row.full-width
            span.text-white.text-subtitle1.ellipsis {{ item.name }}
          .row.full-width
            small.text-white.text-bold.ellipsis {{ item.author.name }}
        .row.q-pa-sm
          q-icon(name="more_vert" color="white" size="sm")
    // middle
    .row.col
      .row.col-2
        q-btn(flat :style=`{borderRadius: '0 50% 50% 0'}` @click.stop="player.seek(-player.seekTime)").fit
          q-tooltip(
            anchor="center middle" self="center middle"
            transition-show="jump-right"
            transition-hide="jump-up"
          ) +{{player.seekTime}}{{$t('сек')}}
      .row.col.items-center.content-center.justify-center
        q-icon(v-show="isOverlayShow" :name="player.playing ? 'pause' : 'play_arrow'" color="white" size="70px" @click="player.playing ? player.pause():player.play()")
      .row.col-2
        q-btn(flat :style=`{borderRadius: '50% 0 0 50%'}` @click.stop="player.seek(player.seekTime)").fit
          q-tooltip(
            anchor="center middle" self="center middle"
            transition-show="jump-right"
            transition-hide="jump-up"
          ) +{{player.seekTime}}{{$t('сек')}}
    // bottom
    div(v-show="isOverlayShow || player.nodeMode === 'edit'" @click.stop="").row.full-width.q-px-sm
      player-pult-overlay(:player="player" :contentKalpa="item")
</template>

<script>
import playerPultOverlay from 'src/components/content_player/player_video/player_pult/pult_overlay'
export default {
  name: 'videoOverlay',
  props: ['item', 'player'],
  components: {playerPultOverlay},
  data () {
    return {
      isOverlayShow: false,
      hasMouse: false,
      lastMouseMove: null,
      lastMouseClick: null
    }
  },
  // emits: ['play', 'pause'],
  methods: {
    onClick () {
      this.isOverlayShow = true
      this.lastMouseClick = Date.now()
      if (this.timerClick) clearTimeout(this.timerClick)
      this.timerClick = setTimeout(() => {
        this.lastMouseClick = null
        this.updateState()
      }, 2000)
    },
    onMouseOver () {
      // this.$logT('onMouseOver')
      this.hasMouse = true
      this.updateState()
    },
    onMouseOut () {
      // this.$logT('onMouseOut')
      this.hasMouse = false
      if (this.timerMouseOut) clearTimeout(this.timerMouseOut)
      this.timerMouseOut = setTimeout(() => {
        this.updateState()
      }, 0)
    },
    onMouseMove () {
      this.lastMouseMove = Date.now()
      this.updateState()
      if (this.timerMouseMove) clearTimeout(this.timerMouseMove)
      this.timerMouseMove = setTimeout(() => {
        this.updateState()
      }, 2000)
    },
    updateState() {
      // this.$logT('updateState')
      if (!this.player.playing) this.isOverlayShow = true
      else if (this.lastMouseClick) this.isOverlayShow = true
      else if (this.hasMouse){
        if (this.lastMouseMove && Date.now() - this.lastMouseMove >= 2000) this.isOverlayShow = false
        else this.isOverlayShow = true
      }
      else this.isOverlayShow = false
    }
  },
  mounted () {
    this.updateState()
  }
}
</script>
