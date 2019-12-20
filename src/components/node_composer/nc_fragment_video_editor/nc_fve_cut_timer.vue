<template lang="pug">
.column.full-width.bg-black.q-px-md
  .col.full-width
    .row.fit.items-start.content-start.justify-center
      .row.full-width.q-my-md
        .row.full-width.justify-center
          span.text-white {{$t('Start')}}
        .row.full-width
          .col
            input(
              ref="hourInputStart"
              v-model="hourStart" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('hourStart', $event)"
              :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
            .row.full-width.justify-center
              small.text-white {{ $t('hour') }}
          .col
            input(
              ref="minuteInputStart"
              v-model="minuteStart" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('minuteStart', $event)"
              autofocus
              :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
            .row.full-width.justify-center
              small.text-white {{ $t('minute') }}
          .col
            input(
              ref="secondInputStart"
              v-model="secondStart" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('secondStart', $event)"
              :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
            .row.full-width.justify-center
              small.text-white {{ $t('second') }}
      div(:style=`{position: 'relative', overflow: 'hidden', height: '90px'}`).row.full-width.items-center.q-py-md
        transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="canSave"
            color="green" no-caps push @click="confirm()"
            :style=`{height: '60px', borderRadius: '10px'}`).full-width
            span.text-bold {{ $t('Save') }}
        transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
          q-btn(
            v-if="!canSave"
            color="green" no-caps flat @click="cancel()"
            :style=`{height: '60px'}`).full-width
            span.text-bold {{ $t('Cancel') }}
</template>

<script>
export default {
  name: 'ncFveCutTimer',
  props: ['cut', 'player', 'boom'],
  data () {
    return {
      hourStart: '',
      minuteStart: '',
      secondStart: '',
      // hourEnd: '',
      // minuteEnd: '',
      // secondEnd: '',
      startResult: undefined,
      // endResult: undefined
    }
  },
  computed: {
    canSave () {
      if (this.startSecond > 0) return true
      else return false
    },
    startSecond () {
      let sec = 0
      let duration = this.player.duration
      if (duration > 60 * 60 && this.hourStart.length > 0) sec += parseInt(this.hourStart) * 60 * 60
      if (duration > 60 && this.minuteStart.length > 0) sec += parseInt(this.minuteStart) * 60
      if (this.secondStart.length > 0) sec += parseInt(this.secondStart)
      return sec
    },
    // endSecond () {
    //   let sec = 0
    //   let duration = this.player.duration
    //   if (duration > 60 * 60 && this.hourEnd.length > 0) sec += parseInt(this.hourEnd) * 60 * 60
    //   if (duration > 60 && this.minuteEnd.length > 0) sec += parseInt(this.minuteEnd) * 60
    //   if (this.secondEnd.length > 0) sec += parseInt(this.secondEnd)
    //   return sec
    // }
  },
  watch: {
    startSecond: {
      handler (to, from) {
        this.$log('startSecond CHANGED', to, typeof to)
        if (to > 0 && this.player.duration > to) {
          this.player.setCurrentTime(to)
          this.startResult = to
          if (this.endSecond === 0) {
            // TODO: set endSecond plus 30 sec
          }
        }
      }
    },
    // endSecond: {
    //   handler (to, from) {
    //     this.$log('endSecond CHANGED', to, typeof to)
    //     if (to > 0 && to > this.startSecond && this.player.duration > to) {
    //       this.player.setCurrentTime(to)
    //       this.endResult = to
    //     }
    //   }
    // }
  },
  methods: {
    inputChanged (key, e) {
      this.$log('inputChanged')
      if (e.target.value.length > 2) {
        this.$log('TOO MUCH')
        this[key] = e.target.value[2]
      }
    },
    parseSec (sec) {
      let res = [0, 0, 0]
      let hrs = ~~(sec / 3600)
      let mins = ~~((sec % 3600) / 60)
      let secs = ~~sec % 60
      if (hrs > 0) res[0] = hrs.toString()
      if (mins > 0) res[1] = mins.toString()
      if (secs > 0) res[2] = secs.toString()
      return res
    },
    confirm () {
      this.$log('confirm', 'isFirst', this.isFirst)
      if (this.boom) {
        this.$emit('boom', [this.startResult])
      } else {
        this.cut.points[0].x = this.startResult
        // this.cut.points[1].x = this.endResult
      }
      this.cancel()
    },
    cancel () {
      this.$log('cancel')
      this.$emit('close')
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.cut) {
      let arrStart = this.parseSec(this.cut.points[0].x)
      // let arrEnd = this.parseSec(this.cut.points[1].x)
      this.$log('arrStart', arrStart)
      // this.$log('arrEnd', arrEnd)
      this.$set(this, 'hourStart', arrStart[0])
      this.$set(this, 'minuteStart', arrStart[1])
      this.$set(this, 'secondStart', arrStart[2])
      // this.$set(this, 'hourEnd', arrEnd[0])
      // this.$set(this, 'minuteEnd', arrEnd[1])
      // this.$set(this, 'secondEnd', arrEnd[2])
    }
    this.player.pause()
    this.$refs.minuteInputStart.focus()
  }
}
</script>
