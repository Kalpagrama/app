<template lang="pug">
div(
  @click.self="onClickSelf"
  :style=`{
    position: 'absolute', zIndex: 1000,
    overflow: 'hidden',
    borderRadius: '10px',
    //- background: tintShow ? 'rgba(0,0,0,0.5)' : 'none',
  }`
  ).row.fit
  //- tint
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="tintShow"
      :style=`{
        position: 'absolute', zIndex: 1001,
        background: 'rgba(0,0,0,0.5)',
        //- pointerEvents: 'none',
      }`
      ).row.fit.items-center.content-center.justify-center
      q-btn(
        round flat color="white"
        @click="onClickSelf")
        q-icon(name="play_arrow" size="80px")
  //- header
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      :style=`{
        position: 'absolute', zIndex: 1002,
        //- top: '60px',
        top: '0px',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.pageWidth+'px',
        }`
        ).row.full-width.justify-start
        q-btn(
          flat color="white" no-caps icon="select_all"
          :to="'/content/'+contentKalpa.oid"
          :style=`{
          }`).row.q-py-xs
          div(
            v-if="true || !isMini"
            :style=`{
            }`
            ).col
            span(
              :style=`{
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
              }`).q-ml-sm {{ contentKalpa.name }}
  //- bar
  transition(enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    tint-bar(
      v-if="true"
      v-bind="$props"
      :style=`{
        position: 'absolute', zIndex: 1002,
        //- bottom: '16px',
        bottom: '0px',
      }`)
</template>

<script>
import tintBar from './tint_bar.vue'

export default {
  name: 'playerTint',
  props: ['player', 'isActive', 'isVisible', 'isMini', 'contentKalpa'],
  components: {
    tintBar,
  },
  data () {
    return {
      tintShow: false,
    }
  },
  methods: {
    onClickSelf (e) {
      this.$log('onClickSelf', e)
      if (this.player.playing) {
        this.player.pause()
        this.tintShow = true
      }
      else {
        this.player.play()
        this.tintShow = false
      }
    }
  }
}
</script>
