<template lang="pug">
div(style=`position: relative; height: 190px`).row.full-width
  //- tools
  div(style=`position: relative; zIndex: 100; height: 60px`
    ).row.full-width.items-center.justify-end.bg-black.q-px-sm
    q-btn(round flat :icon="muted ? 'volume_off' : 'volume_up'" color="white" size="md" @click="mute")
  //- slider
  div(style=`position: relative; height: 130px`).row.full-width.items-center.content-center
    //- debug
    div(v-if="true" style=`position: absolute; height: 100px; top: -200px; color: white; opacity: 0.6`
      ).row.full-width.items-start.conent-start.q-px-sm.bg-green
      small.row.full-width startSec/startPx  {{startSec}} / {{startPx}}
      small.row.full-width endSec/endPx {{endSec}} / {{endPx}}
      small.row.full-width currentSec/currentPx {{currentSec}} / {{currentPx}}
      small.row.full-width durationSec/durationPx {{durationSec}} / {{durationPx}}
      small.row.full-width durationTotalSec/durationTotalPx {{durationTotalSec}} / {{durationTotalPx}}
      small.row.full-width {{ editor.duration }}
    //- frame
    //- length
    div(style=`position: relative; height: 3px;`).row.full-width.bg-grey-7
      //- start
      q-icon(
        name="keyboard_arrow_down" color="yellow" size="50px"
        :style=`{position: 'absolute', zIndex: 100, width: '10px', height: '10px', borderRadius: '50%', top: '-12px', left: startPx+'px'}`).bg-yellow
      div(:style=`{position: 'absolute', zIndex: 100, width: '80px', height: '40px', borderRadius: '20px', top: '-44px', left: startPx-35+'px'}`
        v-touch-pan.mouse="dragStart").row.items-center.justify-between.bg-yellow
        div(style=`height: 40px; width: 40px`).row.items-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_left" @click="startSec--")
        div(style=`height: 40px; width: 40px`).row.items-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_right" @click="startSec++")
      //- center
      div(:style=`{position: 'absolute', zIndex: 100, width: '10px', height: '10px', borderRadius: '50%', top: '-3px', left: currentPx+'px'}`
        v-touch-pan.mouse="dragCenter").bg-yellow
      //- end
      q-icon(
        name="keyboard_arrow_up" color="yellow" size="50px"
        :style=`{position: 'absolute', zIndex: 100, width: '10px', height: '10px', borderRadius: '50%', top: '4px', left: endPx+'px'}`)
      div(:style=`{position: 'absolute', zIndex: 100, width: '80px', height: '40px', borderRadius: '20px', bottom: '-44px', left: endPx-35+'px'}`
        v-touch-pan.mouse="dragEnd").row.items-center.justify-between.bg-yellow
        div(style=`height: 40px; width: 40px`).row.items-center.content-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_left" @click="endSec--")
        div(style=`height: 40px; width: 40px`).row.items-center.content-center.justify-center
          q-btn(round dense flat color="black" icon="keyboard_arrow_right" @click="endSec++")
</template>

<script>
export default {
  name: 'slider',
  props: ['editor', 'start', 'end'],
  data () {
    return {
      startSec: 0,
      endSec: 0,
      currentSec: 0,
      time: null,
      muted: false
    }
  },
  watch: {
    startSec: {
      immediate: true,
      handler (to, from) {
        this.$log('emit startSec', to)
        this.$emit('startSec', to)
      }
    },
    endSec: {
      immediate: true,
      handler (to, from) {
        this.$log('emit endSec', to)
        this.$emit('endSec', to)
      }
    },
    currentSec: {
      handler (to, from) {
        if (to >= this.endSec) {
          this.editor.setCurrentTime(this.startSec)
        }
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
      return this.secPx(this.currentSec)
    },
    durationTotalSec () {
      return this.editor.duration
    },
    durationTotalPx () {
      return window.innerWidth
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
        this.editor.setMuted(false)
      } else {
        this.editor.setMuted(true)
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
      // this.$log('dragStart', e.position.left)
      let p = e.position.left
      if (p > 0) {
        // this.$log('dragStart p', this.pxSec(p))
        this.startSec = this.pxSec(p)
        this.editor.setCurrentTime(this.startSec)
      }
    },
    dragCenter (e) {
      // this.$log('dragCenter', e.position.left)
      let p = e.position.left
      if (p >= this.startPx && p <= this.endPx) {
        this.editor.setCurrentTime(this.pxSec(p))
      }
    },
    dragEnd (e) {
      // this.$log('dragEnd', e.position.left)
      let p = e.position.left
      this.draggingEnd = true
      if (p < this.durationTotalPx) {
        // this.$log('dragEnd p', this.pxSec(p))
        this.editor.setCurrentTime(this.pxSec(p))
        this.endSec = this.pxSec(p)
      }
    }
  },
  mounted () {
    this.$log('mounted', this.start, this.end)
    this.editor.setVolume(1)
    this.startSec = this.start
    this.editor.setCurrentTime(this.start)
    this.currentSec = this.start
    this.endSec = this.end
    // update function
    this.time = setInterval(() => {
      this.currentSec = this.editor.currentTime
    }, 500)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    clearInterval(this.time)
  }
}
</script>
