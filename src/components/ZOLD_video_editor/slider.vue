<template lang="pug">
div(style=`position: relative; height: 260px`).row.full-width
  //- tools
  div(style=`position: relative; zIndex: 100; height: 50px`
    ).row.full-width.items-center.justify-end.bg-black.q-px-sm
    q-btn(round flat icon="refresh" color="white" size="md" @click="mediaElement.setCurrentTime(startSec)")
    q-btn(round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" size="md" @click="mute")
  //- slider
  div(style=`position: relative; height: 180px`).row.full-width.items-center.content-center
    //- debug
    div(v-if="false" style=`position: absolute; height: 100px; top: -200px; color: white; opacity: 0.9`
      ).row.full-width.items-start.conent-start.q-px-sm.bg-green
      small.row.full-width startSec/startPx  {{startSec}} / {{startPx}}
      small.row.full-width endSec/endPx {{endSec}} / {{endPx}}
      small.row.full-width currentSec/currentPx {{current}} / {{currentPx}}
      small.row.full-width durationSec/durationPx {{durationSec}} / {{durationPx}}
      small.row.full-width durationTotalSec/durationTotalPx {{durationTotalSec}} / {{durationTotalPx}}
      //- small.row.full-width {{ mediaElement.duration }}
    //- frame
    //- length
    div(style=`position: relative; height: 50px;`).row.full-width.bg-grey-7
      //- start
      //- q-icon(
      //-   name="keyboard_arrow_down" color="yellow" size="50px"
      //-   :style=`{position: 'absolute', zIndex: 100, width: '10px', height: '10px', borderRadius: '50%', top: '-12px', left: startPx+'px'}`).bg-yellow
      div(:style=`{position: 'absolute', zIndex: 100, width: '80px', height: '40px', borderRadius: '20px', top: '-44px', left: startPx-35+'px'}`
        v-touch-pan.mouse="dragStart").row.items-center.justify-between.bg-yellow
        div(style=`height: 40px; width: 40px`).row.items-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_left" @click="tickStartLeft()")
        div(style=`height: 40px; width: 40px`).row.items-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_right" @click="tickStartRight()")
      //- now
      div(:style=`{position: 'absolute', zIndex: 102, width: '10px', height: '50px', top: '0px', left: currentPx+'px'}`
        v-touch-pan.mouse="dragNow").bg-black
      //- duration
      div(:style=`{position: 'absolute', zIndex: 101, left: startPx+'px', height: '50px', top: '0px', width: durationPx+'px'}`
        v-touch-pan.mouse="dragCenter"
        ).row.items-center.content-center.justify-center.bg-yellow
        .row.full-width.justify-center.items-end
          span {{ `${Math.round(durationSec).toString()}c` | cut(6) }}
        q-icon(name="more_horiz" color="black" size="25px")
      //- end
      //- q-icon(
      //-   name="keyboard_arrow_up" color="yellow" size="50px"
      //-   :style=`{position: 'absolute', zIndex: 100, width: '10px', height: '10px', borderRadius: '50%', top: '4px', left: endPx+'px'}`)
      div(:style=`{position: 'absolute', zIndex: 100, width: '80px', height: '40px', borderRadius: '20px', bottom: '-44px', left: endPx-35+'px'}`
        v-touch-pan.mouse="dragEnd").row.items-center.justify-between.bg-yellow
        div(style=`height: 40px; width: 40px`).row.items-center.content-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_left" @click="tickEndLeft()")
        div(style=`height: 40px; width: 40px`).row.items-center.content-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_right" @click="tickEndRight()")
</template>

<script>
export default {
  name: 'slider',
  props: ['mediaElement', 'duration', 'current', 'start', 'end'],
  data () {
    return {
      startSec: 0,
      endSec: 0,
      time: null,
      muted: true,
      durationMax: 180
    }
  },
  watch: {
    startSec: {
      immediate: true,
      handler (to, from) {
        // this.$log('emit startSec', to)
        this.$emit('startSec', to)
      }
    },
    endSec: {
      immediate: true,
      handler (to, from) {
        // this.$log('emit endSec', to)
        this.$emit('endSec', to)
      }
    }
  },
  computed: {
    startPx () {
      return this.secPx(this.startSec)
    },
    endPx () {
      return this.startPx + this.durationPx
    },
    currentPx () {
      return this.secPx(this.current)
    },
    durationTotalSec () {
      return this.duration
    },
    durationTotalPx () {
      return window.innerWidth - 100
    },
    durationSec () {
      return this.endSec - this.startSec
    },
    durationPx () {
      return this.secPx(this.durationSec)
    }
  },
  methods: {
    mute () {
      if (this.muted) {
        this.mediaElement.setMuted(false)
      } else {
        this.mediaElement.setMuted(true)
      }
      this.muted = !this.muted
    },
    getTime (sec) {
      return sec
    },
    secPx (sec) {
      return Math.round((sec * this.durationTotalPx) / this.durationTotalSec)
    },
    pxSec (px) {
      // return Math.round((this.durationTotalSec * px) / this.durationTotalPx)
      return (this.durationTotalSec * px) / this.durationTotalPx
    },
    dragStart (e) {
      // this.$log('dragStart', e)
      let p = e.position.left - 50
      if (e.direction === 'left') {
        if (p > 0 && this.durationSec < this.durationMax) {
          this.startSec = this.pxSec(p)
          this.mediaElement.setCurrentTime(this.startSec)
        }
      } else {
        if (this.pxSec(p) < this.endSec) {
           this.startSec = this.pxSec(p)
           this.mediaElement.setCurrentTime(this.startSec)
        }
      }
    },
    dragNow (e) {
      // this.$log('dragNow', e.position.left)
      let p = e.position.left - 50
      if (p >= this.startPx && p <= this.endPx) {
        this.mediaElement.setCurrentTime(this.pxSec(p))
      }
    },
    dragCenter (e) {
      // this.$log('dragCenter', e)
      let p = e.position.left
      if (e.direction === 'right' || e.direction === 'left') {
        let nextStartSec = this.startSec + this.pxSec(e.delta.x)
        let nextEndSec = this.startSec + this.durationSec + this.pxSec(e.delta.x)
        if (nextEndSec <= this.durationTotalSec && nextStartSec > 0) {
          this.startSec = nextStartSec
          this.endSec = nextEndSec
          this.mediaElement.setCurrentTime(this.startSec)
        }
      }
    },
    dragEnd (e) {
      let p = e.position.left - 50
      this.draggingEnd = true
      if (e.direction === 'right') {
        if (p < this.durationTotalPx && this.durationSec < this.durationMax) {
          this.endSec = this.pxSec(p)
          this.mediaElement.setCurrentTime(this.pxSec(p) - 0.01)
        }
      } else {
        if (this.pxSec(p) > this.startSec && p > 0) {
          this.endSec = this.pxSec(p)
          this.mediaElement.setCurrentTime(this.pxSec(p) - 0.01)
        }
      }
    },
    tickStartLeft () {
      // this.$log('tickStartLeft')
      let nextSec = this.startSec - 0.5
      if (nextSec > 0) {
        this.startSec = nextSec
      }
      this.mediaElement.setCurrentTime(this.startSec)
    },
    tickStartRight () {
      // this.$log('tickEndRight')
      let nextSec = this.startSec + 0.5
      if (nextSec < this.endSec) {
        this.startSec = nextSec
      }
      this.mediaElement.setCurrentTime(this.startSec)
    },
    tickEndLeft () {
      // this.$log('tickEndLeft')
      // if not smalles start sec or 0
      let nextSec = this.endSec - 0.5
      if (nextSec > this.startSec) {
        this.endSec = nextSec
      }
      this.mediaElement.setCurrentTime(this.endSec)
    },
    tickEndRight () {
      // this.$log('tickEndRight')
      let nextSec = this.endSec + 0.5
      if (this.durationTotalSec - nextSec < 0.5) {
        this.endSec = this.durationTotalSec
      } else {
        if (nextSec < this.durationTotalSec) {
          this.endSec = nextSec
        }
      }
      this.mediaElement.setCurrentTime(this.endSec)
    }
  },
  mounted () {
    this.$log('mounted', this.start, this.end)
    this.mediaElement.setVolume(1)
    this.startSec = this.start
    this.mediaElement.setCurrentTime(this.start)
    this.endSec = this.end
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
