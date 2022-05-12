<template lang="pug">
div(
  :style=`{
    // background: (player.nodeMode && player.nodeMode.in('edit', 'focus')) ? 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 20%)' : isOverlayShow ? 'rgba(0,0,0,0.7)':'rgba(0,0,0,0)'
    background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 35%)'
  }`
  @click="$router.push('/content/'+item.oid)"
  ).row.full-width.relative-position.cursor-pointer
  .row.full-width.items-end.content-end
    div().row.full-width
      div.row.full-width.q-px-sm
        feed-pult-overlay(:player="player" :contentKalpa="item" @touchPan="onClick()")
div(@click="player.mutedToggle()").row.content-center.items-center.justify-center.cursor-pointer.absolute-top-right.q-ma-lg.op-90
  div(:style=`{height: '30px', width: '150px'}`).row
    .row.relative-position.content-center.items-center
      div(v-show="player.muted" :style=`{height: '30px', width: '110px'}`).row.b-0.op-70
      span(v-show="player.muted").text-white.absolute.q-pa-xs.q-pb-xs {{$t('Включить звук')}}
    .col
    .row.relative-position.content-center.items-center.justify-center
      div(:style=`{height: '30px', width: '30px'}`).row.b-0.op-70
      q-icon(:name="player.muted ? 'volume_off' : 'volume_up'" color="white" size="sm" ).absolute
        q-tooltip(
          v-if="!player.muted"
          anchor="center left" self="center right"
          transition-show="jump-right"
          transition-hide="jump-up"
        ) {{$t('Выключить звук')}}
</template>

<script>
import feedPultOverlay from 'src/components/content_player/player_video/player_pult/feed_pult_overlay'
export default {
  name: 'videoFeedOverlay',
  props: ['item', 'player'],
  components: {feedPultOverlay},
  data () {
    return {
      // isOverlayShow: false,
      // hasMouse: false,
      // lastMouseMove: null,
      // lastMouseClick: null
    }
  },
  // emits: ['play', 'pause'],
  methods: {
    // onClick () {
    //   this.isOverlayShow = true
    //   this.lastMouseClick = Date.now()
    //   if (this.timerClick) clearTimeout(this.timerClick)
    //   this.timerClick = setTimeout(() => {
    //     this.lastMouseClick = null
    //     this.updateState()
    //   }, 2000)
    // },
    // onMouseOver () {
    //   // this.$logT('onMouseOver')
    //   this.hasMouse = true
    //   this.updateState()
    // },
    // onMouseOut () {
    //   // this.$logT('onMouseOut')
    //   this.hasMouse = false
    //   if (this.timerMouseOut) clearTimeout(this.timerMouseOut)
    //   this.timerMouseOut = setTimeout(() => {
    //     this.updateState()
    //   }, 0)
    // },
    // onMouseMove () {
    //   this.lastMouseMove = Date.now()
    //   this.updateState()
    //   if (this.timerMouseMove) clearTimeout(this.timerMouseMove)
    //   this.timerMouseMove = setTimeout(() => {
    //     this.updateState()
    //   }, 2000)
    // },
    // updateState() {
    //   // this.$logT('updateState')
    //   if (!this.player.playing) this.isOverlayShow = true
    //   else if (this.lastMouseClick) this.isOverlayShow = true
    //   else if (this.hasMouse){
    //     if (this.lastMouseMove && Date.now() - this.lastMouseMove >= 2000) this.isOverlayShow = false
    //     else this.isOverlayShow = true
    //   }
    //   else this.isOverlayShow = false
    // }
  },
  mounted () {
    // // this.updateState()
    // if (this.timerMounted) clearTimeout(this.timerMounted)
    // this.timerMounted = setTimeout(() => {
    //   this.updateState()
    // }, 2000)
  }
}
</script>
