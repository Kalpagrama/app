<template lang="pug">
div(
  :style=`{minHeight: '80px'}`
  ).row.full-width.items-center.justify-between.bg-green.q-px-sm
  div(
    :style=`{position: 'relative', height: '150px'}`).row.full-width
    .col.full-height
      .row.full-height.items-center.content-center.justify-center
        q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="msLeft()")
    .col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ hours }}
    .col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ minutes }}
    div(:style=`{position: 'relative', overflow: 'hidden'}`).col.full-height
      //-  v-if="si+1 < secondsTotal"
      //- .column.fit
      //-   .col.full-width.scroll
      //-     div(:style=`{height: '50%'}`).row.full-width.br
      //-     div(
      //-       v-for="(s, si) in 60"
      //-       ).row.full-width.justify-center
      //-       span(:style=`{fontSize: '17px'}`).text-white {{ si+1 }}
      //-     div(:style=`{height: '50%'}`).row.full-width.br
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ seconds }}
    .col.full-height
      .row.full-height.items-center.content-center.justify-center
        span.text-white {{ ms }}
    .col.full-height
      .row.full-height.items-center.content-center.justify-center
        q-btn(round flat dense color="white" icon="keyboard_arrow_right" @click="msRight()")
  //- .row.full-width.bg-red
  //-   small.full-width minutesTotal: {{minutesTotal}}
  //-   small.full-width hoursTotal: {{hoursTotal}}
  //-   small.full-width secondTotal: {{secondsTotal}}
</template>

<script>
export default {
  name: 'ncFveCutSetTime',
  props: ['cut', 'index', 'pointIndex', 'player', 'now'],
  data () {
    return {
      value: 0
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
