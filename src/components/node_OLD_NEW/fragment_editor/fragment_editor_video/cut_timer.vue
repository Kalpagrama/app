<template lang="pug">
div(
  :style=`{minHeight: '50px'}`
  ).row.full-width.items-center.justify-between.bg-green
  div(
    :style=`{position: 'relative', height: '50px'}`).row.full-width
    //- MS LEFT
    div(
      @click="msLeft()"
      :style=`{position: 'relative', touchAction: 'manipulation'}` v-ripple=`{color: 'white'}`).col.full-height.cursor-pointer
      .row.full-height.items-center.content-center.justify-center
        q-btn(round flat dense color="white" icon="keyboard_arrow_left")
    //- HOURS
    div(v-if="showTimers").col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ hours }}
    //- MINUTES
    div(v-if="showTimers").col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ minutes }}
    //- SECONDS
    div(v-if="showTimers" :style=`{position: 'relative', overflow: 'hidden'}`).col.full-height
      .column.fit
        .col.full-width.scroll
          div(:style=`{height: '50%'}`).row.full-width.br
          div(
            v-for="(s, si) in 60"
            ).row.full-width.justify-center
            span(:style=`{fontSize: '17px'}`).text-white {{ si+1 }}
          div(:style=`{height: '50%'}`).row.full-width.br
    //- MS
    div(v-if="showTimers").col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ ms }}
    //- MS RIGHT
    div(
      @click="msRight()"
      :style=`{position: 'relative', touchAction: 'manipulation'}` v-ripple=`{color:'white'}`).col.full-height.cursor-pointer
      .row.full-height.items-center.content-center.justify-center
        q-btn(round flat dense color="white" icon="keyboard_arrow_right")
</template>

<script>
export default {
  name: 'FVEcutTimer',
  props: ['cut', 'index', 'pointIndex', 'player', 'now'],
  data () {
    return {
      value: 0,
      showTimers: false
    }
  },
  computed: {
    hours () {
      return Math.floor(this.value / (60 * 60))
    },
    hoursTotal () {
      return Math.floor(this.player.duration / (60 * 60))
    },
    minutes () {
      return Math.floor(this.value / 60)
    },
    minutesTotal () {
      return Math.floor(this.player.duration / 60)
    },
    seconds () {
      return Math.floor(this.value - (this.minutes * 60))
      // return 0
    },
    secondsTotal () {
      return Math.floor(this.player.duration)
    },
    ms () {
      let r = this.value - (this.minutes * 60)
      let ms = r.toString().split('.')[1].slice(0, 3)
      return ms
    }
  },
  watch: {
    cut: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('cut CHANGED', to)
        this.value = this.cut.points[this.pointIndex].x
      }
    },
    pointIndex: {
      immediate: true,
      handler (to, from) {
        this.$log('pointIndex CHANGED', to, this.cut)
        this.value = this.cut.points[to].x
        this.$log('value', this.value)
      }
    }
  },
  methods: {
    msLeft () {
      this.$log('msLeft')
      let from = this.cut.points[this.pointIndex].x
      let to = from - 0.050
      if (to < 0) return
      this.$set(this.cut.points[this.pointIndex], 'x', to)
      this.player.setCurrentTime(to)
    },
    msRight () {
      this.$log('msRight')
      let from = this.cut.points[this.pointIndex].x
      let to = from + 0.050
      if (to > this.player.duration) return
      this.$set(this.cut.points[this.pointIndex], 'x', to)
      this.player.setCurrentTime(to)
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
