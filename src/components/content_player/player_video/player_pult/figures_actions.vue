<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '40px',
  }`
  ).row.full-width.items-center.content-center.justify-center
  div(
    :style=`{
      maxWidth: '400px',
    }`
    ).row.fit.items-center.content-center
    q-btn(round flat dense color="grey-2" @click="figureForward(0,false)")
      q-icon(name="keyboard_arrow_left" color="grey-2" size="26px")
    q-btn(round flat dense color="grey-2" @click="figureForward(0,true)")
      q-icon(name="keyboard_arrow_right" color="grey-2" size="26px")
    .col
    q-btn(round flat dense color="grey-2" @click="figureCut(0)")
      q-icon(name="flip" color="grey-2" size="22px").rotate-180
    small(
      :class=`{
        'text-red': player.figures[1].t-player.figures[0].t > this.$store.getters.currentUser.settings.quota.nodeMaxDurationSec,
        'text-grey-2': player.figures[1].t-player.figures[0].t <= this.$store.getters.currentUser.settings.quota.nodeMaxDurationSec
        }`
      :style=`{
        userSelect: 'none',
        pointerEvents: 'none',
        fontSize: '10px',
        minWidth: $q.screen.gt.xs ? '76px' : '50px',
        textAlign: 'center',
      }`
      ).text-bold.q-mx-sm {{ $time(player.figures[1].t-player.figures[0].t) }}
    q-btn(round flat dense color="grey-2" @click="figureCut(1)")
      q-icon(name="flip" color="grey-2" size="22px")
    .col
    q-btn(round flat dense color="grey-2" @click="figureForward(1,false)")
      q-icon(name="keyboard_arrow_left" color="grey-2" size="26px")
    q-btn(round flat dense color="grey-2" @click="figureForward(1,true)")
      q-icon(name="keyboard_arrow_right" color="grey-2" size="26px")
</template>

<script>
export default {
  name: 'playerPult__figureActions',
  props: ['player', 'contentKalpa'],
  data () {
    return {
      figureForwardTimer: null,
    }
  },
  methods: {
    async figureCut (pointIndex) {
      this.$log('figureCut', pointIndex)
      let t = this.player.currentTime
      if (pointIndex === 0) {
        // wanna start AFTER the end
        if (t >= this.player.figures[1].t) {
          this.$set_deprecated(this.player.figures[0], 't', t)
          this.$set_deprecated(this.player.figures[1], 't', Math.min(t + 10, this.player.duration))
        }
        // before the end is OK
        else {
          this.$set_deprecated(this.player.figures[0], 't', t)
        }
      }
      else if (pointIndex === 1) {
        // wanna end BEFORE the start
        if (t <= this.player.figures[0].t) {
          this.$set_deprecated(this.player.figures[0], 't', t)
          this.$set_deprecated(this.player.figures[1], 't', Math.min(t + 10, this.player.duration))
        }
        // after the start is OK
        else {
          this.$set_deprecated(this.player.figures[1], 't', t)
        }
      }
      // go to the layer new (maybe) start and play
      if (pointIndex === 0) {
        // play ? and figures FOCUS
        this.player.setState('figureFocused', true)
        this.player.setCurrentTime(this.player.figures[0].t)
        await this.$wait(700)
        this.player.play()
      }
      else if (pointIndex === 1) {
        // play last 3 second if possible, and figures FOCUS
        this.player.setState('figureFocused', true)
        let t = this.player.figures[1].t - 3
        if (t < this.player.figures[0].t) {
          t = this.player.figures[0].t
        }
        await this.$wait(700)
        this.player.setCurrentTime(t)
        this.player.play()
      }
    },
    async figureForward (pointIndex, goingForward) {
      // this.$log('figureForward', pointIndex, goingForward)
      this.player.pause()
      let t = this.player.figures[pointIndex].t
      // add tick of 0.1 to t of figures
      if (goingForward) t += 0.1
      else t -= 0.1
      // check t > 0 and t < duration
      if (t < 0) t = 0
      if (t > this.player.duration) t = this.player.duration
      // this.$log('t', t)
      this.$set_deprecated(this.player.figures[pointIndex], 't', t)
      this.player.events.emit('figures-forward-start')
      this.player.setCurrentTime(t)
      // check timer ? clear timeout
      if (this.figureForwardTimer) {
        clearTimeout(this.figureForwardTimer)
        this.figureForwardTimer = null
      }
      // no timer ? its first click !
      else {
        this.$log('figureForward FIRST')
      }
      // wait for the end..
      this.figureForwardTimer = setTimeout(async () => {
        this.$log('figureForward FINAL')
        this.player.setState('figureFocused', true)
        this.player.events.emit('figures-forward-end')
        if (pointIndex === 0) {
          // do nothing ? focus and play
          this.player.play()
        }
        if (pointIndex === 1) {
          // play last 3 sec if possible ?
          // or from the start...
          let t = this.player.figures[1].t - 3
          if (t < this.player.figures[0].t) {
            t = this.player.figures[0].t
          }
          await this.$wait(300)
          this.player.setCurrentTime(t)
          this.player.play()
        }
      }, 700)
    }
  },
}
</script>
