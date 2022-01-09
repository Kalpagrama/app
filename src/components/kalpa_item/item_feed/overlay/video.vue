<template lang="pug">
div(
  @click.self="onClick, player.playing ? player.pause():player.play()"
  @mousemove="onMouseMove"
  @mouseout="onMouseOut"
  @mouseover="onMouseOver"
).row.fit.bg-10.br
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="isOverlayShow"
      :style=`{
        position: 'absolute', zIndex: 20, bottom: '0px',
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
      }`
    ).row.full-width.items-center.content-center.justify-center
      .row.fit.relative-position.bg.items-center.content-center.justify-center
        .row.full-width.items-center.content-center.justify-center
          q-icon(:name="player.playing ? 'pause' : 'play_arrow'" color="white" size="70px" @click="player.playing ? player.pause():player.play()")
        .row.full-width.absolute-top-left.q-pa-sm
          .row.cursor-pointer
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
          .col
          .row.q-pa-sm
            q-icon(name="more_vert" color="white" size="sm")
</template>

<script>
export default {
  name: 'videoOverlay',
  props: ['item', 'player'],
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
      this.$logT('onMouseOver')
      this.hasMouse = true
      this.updateState()
    },
    onMouseOut () {
      this.$logT('onMouseOut')
      this.hasMouse = false
      if (this.timerMouseOut) clearTimeout(this.timerMouseOut)
      this.timerMouseOut = setTimeout(() => {
        this.updateState()
      }, 2000)
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
  }
}
</script>
