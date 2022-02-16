<template lang="pug">
div(
  :style=`{
    // background: (player.nodeMode && player.nodeMode.in('edit', 'focus')) ? 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 20%)' : isOverlayShow ? 'rgba(0,0,0,0.7)':'rgba(0,0,0,0)'
    background: (player.nodeMode && player.nodeMode.in('edit', 'focus')) ? 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 35%)' : isOverlayShow ? ($q.platform.is.mobile ? 'rgba(0,0,0,0.6)' : 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 35%)'):'rgba(0,0,0,0)'
  }`
  @click="onClick(), $q.platform.is.mobile ? '' :(player.playing ? player.pause():player.play())"
  @mousemove="onMouseMove"
  @mouseout="onMouseOut"
  @mouseover="onMouseOver"
  ).row.full-width
  .column.full-width
    // top
    div(v-show="isOverlayShow"  :style=`{minHeight: 50 + 'px'}`).row.full-width.q-pa-xs
      div(v-if="player.isFullscreen && item.contentProvider !== 'YOUTUBE'").row.full-width.cursor-pointer
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
      //q-btn(v-if="player.muted" text-color="white" color="grey-10" round dense flat no-caps :label="$t('Без звука')" ).absolute
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
        q-icon(v-show="(player.nodeMode && player.nodeMode.in('edit', 'focus')) ? false : isOverlayShow" :style=`{opacity: '100%'}` :name="player.playing ? 'pause' : 'play_arrow'" color="white" size="70px" @click="player.playing ? player.pause():player.play()")
      .row.col-2
        q-btn(flat :style=`{borderRadius: '50% 0 0 50%'}` @click.stop="player.seek(player.seekTime)").fit
          q-tooltip(
            anchor="center middle" self="center middle"
            transition-show="jump-right"
            transition-hide="jump-up"
          ) +{{player.seekTime}}{{$t('сек')}}
    // bottom
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(v-if="isOverlayShow || (player.nodeMode && player.nodeMode.in('edit', 'focus'))" @click.stop="").row.full-width.q-px-sm
        player-pult-overlay(:player="player" :contentKalpa="item" @touchPan="onClick()")
div(v-if="player.muted" @click="player.mutedToggle()").row.content-center.items-center.justify-center.cursor-pointer.absolute-top-right.q-ma-lg.op-90
  .row.relative-position.content-center.items-center.justify-center
    div(:style=`{height: '30px', width: '30px'}`).row.b-0.op-40
    //span.text-white.absolute {{$t('Включить звук')}}
    q-icon(name="volume_off" color="white" size="sm" ).absolute
      q-tooltip(
        anchor="center left" self="center right"
        transition-show="jump-right"
        transition-hide="jump-up"
      ) {{$t('Включить звук')}}
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
    // this.updateState()
    if (this.timerMounted) clearTimeout(this.timerMounted)
    this.timerMounted = setTimeout(() => {
      this.updateState()
    }, 2000)
  }
}
</script>
