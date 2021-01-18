<template lang="pug">
.row.full-width
  div(
    :style=`{
      position: 'relative',
      height: '30px',
      //- background: barMouseover ? 'rgba(255,0,0,0.1)' : 'none',
      //- borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-start
    //- currentTime/duration
    transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="!mini"
        :style=`{
          position: 'absolute', zIndex: 1000,
          left: '14px',
          top: '-19px',
          userSelect: 'none',
          pointerEvents: 'none',
        }`
        ).row
        small.text-bold.text-white.q-mr-xs {{ $time(currentTime) }}
        small.text-bold.text-grey-6 / {{ $time(duration) }}
    //- left padding
    div(
      :style=`{
        width: padding+'px',
        pointerEvents: 'none',
      }`
      ).row.items-end.content-end
      //- div(
        :style=`{
          height: height+'px',
          borderRadius: currentTime === 0 ? '0 2px 2px 0' : '0px',
        }`
        ).row.full-width.bg-green
    //- middle
    .col.full-height
      div(
        @click="barClick"
        @mouseenter="barMouseover = true"
        @mouseleave="barMouseover = false"
        v-touch-pan.left.right.prevent.mouse="barPan"
        ref="bar-body"
        accessKey="bar-body"
        :style=`{
          position: 'relative',
          //- background: barMouseover ? 'rgba(0,0,0,0.1)' : 'none',
          borderRadius: '10px',
        }`
        ).row.fit.items-center.contnet-center
        //- .b-80
        //- points
        //- div(
          v-for="(f,fi) in player.points" :key="fi"
          v-if="player.points && player.points.length > 0"
          :style=`{
            position: 'absolute', zIndex: 2050, top: '0px',
            left: f[0].t/duration*100+'%',
            width: '2px',
            background: 'rgba(255,255,255, 0.5)',
            pointerEvents: 'none',
          }`
          ).row.full-height
        //- figures
        div(
          v-for="(f,fi) in player.figures" :key="fi"
          v-if="player.figures && player.figures.length > 0"
          :style=`{
            position: 'absolute', zIndex: 100,
            left: f[0].t/duration*100+'%',
            width: (f[1].t-f[0].t)/duration*100+'%',
            //- height: 'calc(100% + 6px)',
            top: '10%',
            height: '80%',
            //- border: '2px solid rgb(76,175,80)',
            borderRadius: '4px',
            //- borderRadius: '50%',
            //- background: 'rgba(255,255,255,0.2)',
            background: 'rgba(76,175,80, 0.5)',
            pointerEvents: 'none',
          }`
          ).row
        //- tint
        div(
          v-show="panning"
          :style=`{
            position: 'absolute', zIndex: 10,
            pointerEvents: 'none',
          }`
          ).row.fit.items-center.content-center
          div(
            :style=`{
              height: height+'px',
              borderRadius: '2px',
            }`
            ).row.full-width.b-50
        div(
          :style=`{
            position: 'relative',
            zIndex: 200,
            height: height+'px',
            width: (currentTime/duration)*100+'%',
            //- borderRadius: '0 2px 2px 0',
            borderRadius: '4px',
            pointerEvents: 'none',
          }`
          ).row.bg-red
          //- right circle
          div(
            v-show="panning"
            :style=`{
              position: 'absolute', zIndex: 1001,
              right: -(height*heightK)/2+'px',
              top: -((height*heightK)-height)/2+'px',
              width: (height*heightK)+'px',
              height: (height*heightK)+'px',
              pointerEvents: 'none',
              borderRadius: '50%',
            }`
            ).row.bg-red
    //- right padding
    div(
      :style=`{
        width: padding+'px',
        pointerEvents: 'none',
      }`
      ).row.items-end.content-end
      //- div(
        v-show="currentTime === duration"
        :style=`{
          height: height+'px',
        }`
        ).row.full-width.bg-green
</template>

<script>
export default {
  name: 'playerBarMini',
  props: ['player', 'figures', 'mini'],
  data () {
    return {
      padding: 10,
      height: 2,
      heightMini: 2,
      heightMaxi: 4,
      heightK: 2.8,
      // TODO: on panning barEnd is bigger...
      heightKDelta: 0,
      panning: false,
      currentTimeMove: 0,
      currentTimePercent: null,
      currentTimePanned: 0,
      barMouseover: false,
    }
  },
  created () {
    // if (this.start) {
    // }
    this.$log('created')
    this.player.play()
    if (this.$q.platform.is.capacitor || this.$q.platform.is.desktop) {
      let muted = localStorage.getItem('k_muted')
      if (muted === 'false') {
        this.player.setState('muted', false)
      }
    }
  },
  computed: {
    start () {
      return this.figures ? this.figures[0].t : false
    },
    end () {
      return this.figures ? this.figures[1].t : false
    },
    currentTime () {
      if (this.start && this.end) {
        return this.player.currentTime - this.start
      }
      else {
        return this.player.currentTime
      }
    },
    duration () {
      if (this.start && this.end) {
        return this.end - this.start
      }
      else {
        return this.player.duration
      }
    }
  },
  watch: {
    // panning: {
    //   handler (to, from) {}
    // },
    mini: {
      immediate: true,
      handler (to, from) {
        this.$log('mini TO', to)
        if (to) {
          // this.height = this.heightMini
          this.$tween.to(this, 0.2, {
            height: this.heightMini,
            onComplete: () => {
              this.$log('mini DONE')
            }
          })
        }
        else {
          // this.height = this.heightMaxi
          this.$tween.to(this, 0.2, {
            height: this.heightMaxi,
            onComplete: () => {
              this.$log('mini DONE')
            }
          })
        }
      }
    },
    'player.currentTime': {
      handler (to, from) {
        if (this.start && this.end) {
          // this.$log('player.currentTime TO', to, this.end)
          if (to >= this.end) {
            // this.$log('PLAYER TO START start&&end', to, this.end)
            this.setCurrentTime(0)
            this.player.play()
          }
          // if (to < this.start) {
          //   this.setCurrentTime(0)
          //   // this.player.play()
          // }
          // if (to === this.start) {
          //   this.player.play()
          // }
        }
        else {
          // this.player.play()
        }
      }
    }
  },
  methods: {
    setCurrentTime (t) {
      // this.$log('setCurrentTime', t)
      // this.$q.notify({type: 'negative', message: 'setCurrentTime' + t})
      if (this.start && this.end) {
        this.player.setCurrentTime(t + this.start)
      }
      else {
        this.player.setCurrentTime(t)
      }
    },
    barClick (e) {
      // this.$log('barClick', e)
      // this.$log('barClick accessKey', e.target.accessKey)
      // if (e.target.accessKey !== 'bar-body') return
      this.$emit('started')
      let left = e.layerX
      let width = e.target.clientWidth
      if (left > width) return
      // this.$log('left/width', left, width)
      let t = (left / width) * this.duration
      // this.$log('t', this.$time(t))
      this.player.events.emit('bar-click', {t: t})
      this.setCurrentTime(t)
    },
    barPan (e) {
      // this.$log('barPan', e)
      if (e.isFirst) {
        this.$emit('started')
        this.panning = true
      }
      if (e.isFinal) {
        this.$emit('ended')
        this.panning = false
      }
      let rect = this.$refs['bar-body'].getBoundingClientRect()
      let left = e.position.left - rect.left
      let width = rect.width
      // this.$log('left/width', left, width)
      if (left < 0 || left > width) {
        this.$log('left < 0 || left > width !')
        return
      }
      this.barClick({layerX: left, target: {clientWidth: width}})
    }
  }
}
</script>
