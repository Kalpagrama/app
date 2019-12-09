<template lang="pug">
.column.full-width.q-px-md
  .col.full-width
    .row.fit.items-start.justify-center
      .row.full-width.q-my-md
        .col
          input(
            ref="hourInput"
            v-model="hour" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('hour', $event)"
            :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
          .row.full-width.justify-center
            small.text-white {{ $t('hour') }}
        .col
          input(
            ref="minuteInput"
            v-model="minute" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('minute', $event)"
            autofocus
            :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
          .row.full-width.justify-center
            small.text-white {{ $t('minute') }}
        .col
          input(
            ref="secondInput"
            v-model="second" placeholder="00" type="number" :maxlength="2" :min="0" :max="59" @input="$event => inputChanged('second', $event)"
            :style=`{fontSize: '40px', background: 'none'}`).full-width.text-white.text-center.kinput
          .row.full-width.justify-center
            small.text-white {{ $t('second') }}
  div(:style=`{position: 'relative', overflow: 'hidden', height: '90px'}`).row.full-width.items-center.q-py-md
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="canSave"
        color="green" no-caps push @click="confirm()"
        :style=`{height: '60px', borderRadius: '10px'}`).full-width
        span.text-bold {{ $t('Set start') }}
    transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
      q-btn(
        v-if="!canSave"
        color="green" no-caps flat @click="cancel()"
        :style=`{height: '60px'}`).full-width
        span.text-bold {{ $t('Cancel') }}
</template>

<script>
export default {
  name: 'ncFragmentVideoEditorStart',
  props: ['player'],
  data () {
    return {
      hour: '',
      minute: '',
      second: ''
    }
  },
  computed: {
    canSave () {
      if (this.hour || this.minute || this.second) return true
      else return false
    }
  },
  watch: {
    minute: {
      handler (to, from) {
        this.$log('minute CHANGED', to)
        this.player.setCurrentTime(parseInt(to) * 60)
      }
    }
  },
  methods: {
    inputChanged (key, e) {
      this.$log('inputChanged')
      if (e.target.value.length > 2) {
        this.$log('TOO MUCH')
        this[key] = e.target.value[2]
      }
    },
    confirm () {
      this.$log('confirm', this.hour, this.minute, this.second)
      this.$emit('close')
    },
    cancel () {
      this.$log('cancel', this.hour, this.minute, this.second)
      this.$emit('close')
    }
  },
  mounted () {
    this.$log('mounted')
    this.$refs.minuteInput.focus()
  }
}
</script>
