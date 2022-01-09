<template lang="pug">
div(
  @click.self="onClick"
  @mousemove="onMouseMove"
  @mouseout="onMouseOut"
  @mouseover="onMouseOver"
).row.fit.bg-10
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(v-if="isOverlayShow"
      :style=`{
        position: 'absolute', zIndex: 20, bottom: '0px',
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
      }`
    ).row.full-width.items-center.content-center.justify-center
      .row.fit.relative-position.items-center.content-center.justify-center
        div(@click.self="player.playing ? player.pause():player.play()").row.fit.items-center.content-center.justify-center
          q-icon(:name="player.playing ? 'pause' : 'play_arrow'" color="white" size="70px" @click="player.playing ? player.pause():player.play()")
        .row.full-width.absolute-top-left.no-pointer-events.no-wrap
          div(:style=`{minHeight: '100px'}`).row.full-width.relative-position
            div(v-show="item.contentProvider === 'YOUTUBE'"
              :style=`{
                height: '100%', zIndex: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,1) 60px, rgba(0,0,0,0) 100%)',
            }`).row.full-width.absolute-top.no-pointer-events.no-wrap
            div(:style=`{zIndex: 10}`).row.full-width.q-pa-sm
              div(:style=`{maxWidth: '80vw'}`).row.non-selectable
                .row.items-start.content-start.justify-center.q-pr-sm
                  img(
                    :src="item.author.thumbUrl"
                    :style=`{height:'50px', width: '50px', objectFit: 'cover', borderRadius: '50px'}`
                  )
                .row.col.items-start.content-start.justify-center
                  .row.full-width
                    span(:style=`{fontSize: fontSize + 'px'}`).text-white.ellipsis {{ item.name }}
                  .row.full-width
                    small(:style=`{fontSize: fontSize - 2 + 'px'}`).text-white.ellipsis {{ item.author.name }}
              .col
              .row.q-pa-sm.all-pointer-events
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
  computed: {
    fontSize() {
      if (!this.$screenProps.isMobile) return 16
      else return 13
    },
  },
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
  }
}
</script>
