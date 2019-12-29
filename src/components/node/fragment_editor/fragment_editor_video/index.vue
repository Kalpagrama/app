<template lang="pug">
div(
  :style=`{position: 'relative'}`
  ).column.full-width.bg-black
  //- div(:style=`{position: 'absolute', zIndex: 1000, top: '95px'}`).row.full-width.bg-red
  //-   small.full-width now: {{ now }}
  //- cuts on progress bar
  //- cut&cuts on video progress bar
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 400, top: '0px', height: '8px', pointerEvents: 'none'}`).row.full-width.q-px-md
    div(:style=`{position: 'relative'}`).row.fit
      //- cuts in progress bar
      div(
        v-for="(c, ci) in cuts" :key="ci"
        v-if="ci !== cutIndex"
        :style=`{
          position: 'absolute', zIndex: 106, top: 0, height: '100%', opacity: 0.6,
          left: (c.points[0].x/fragment.content.duration)*100+'%',
          width: ((c.points[1].x-c.points[0].x)/fragment.content.duration)*100+'%',
          borderRadius: '4px', background: c.color}`)
      //- cut on progress bar
      div(:style=`{
        position: 'absolute', zIndex: 106, top: 0, height: '100%', opacity: 1,
        left: (cut.points[0].x/fragment.content.duration)*100+'%',
        width: ((cut.points[1].x-cut.points[0].x)/fragment.content.duration)*100+'%',
        borderRadius: '4px', background: cut.color}`)
  //- cuts on frames pan
  cuts-on-frames(
    :editing="editing" :width="width" :fragment="fragment" :cut="cut" :cuts="cuts" :player="player" :now="now"
    @panningStarted="fragmentPlaying = false" @cutCreate="cutCreate")
  //- cuts-pan
  //- body
  div.col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
      k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutAction")
      div(
        :class=`{'bg-red': fragmentDuration > 60, 'bg-green': fragmentDuration < 60}`
        :style=`{borderRadius: '10px'}`).row.full-width.q-pa-sm.q-my-sm
        span.text-bold.text-white Total duration: {{ $time(fragmentDuration) }}
      fev-cut(
        v-for="(c, ci) in cuts" :key="c.color"
        :index="ci" :cut="c" :cutIndex="cutIndex" :cutPlaying="cutPlaying" :player="player" :now="now"
        @cutIndex="cutIndex = $event" @play="cutPlay"
        @action="$refs.cutDialog.show()").q-mb-sm
  div(:style=`{height: '66px'}`).row.full-width.bg-black
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      div(
        v-if="fragment.cuts.length > 0"
        :style=`{height: '66px', width: '66px'}`).row.items-center.content-center.justify-center
        q-btn(
          push round @click="fragmentPlay()"
          :color="fragmentPlaying ? 'red' : 'green'"
          :icon="fragmentPlaying ? 'pause' : 'play_arrow'")
    .col.full-height.q-px-md
      div(
        @click="fragmentNameSettingStart()"
        :style=`{position: 'relative'}` v-ripple=`{color: 'white'}`
        ).row.fit.items-center.content-center.cursor-pointer
        span(
          v-if="!fragmentNameSetting"
          :style=`{fontSize: '16px'}`
          ).text-white {{ fragment.name.length > 0 ? fragment.name : 'Set fragment name' }}
        input(
          v-if="fragmentNameSetting"
          ref="fragmentNameInput"
          v-model="fragment.name"
          @keyup.enter="fragmentNameSetting = false" @blur="fragmentNameSetting = false"
          :style=`{fontSize: '16px', margin: 0, padding: 0, borderRadius: '10px', overflow: 'hidden'}`
          ).full-width.kinput.text-white.bg-green
    div(:style=`{height: '66px', width: '66px'}`).row.items-center.justify-center
      q-btn(round flat color="white" icon="more_vert" @click="fragmentDialog()")
</template>

<script>
import fevCut from './cut'
import cutsOnFrames from './cuts_on_frames'

export default {
  name: 'nFEV',
  components: {fevCut, cutsOnFrames},
  props: ['ctx', 'fragment', 'width', 'height', 'mini', 'player', 'now', 'editing'],
  data () {
    return {
      cutIndex: -1,
      cutPlaying: -1,
      fragmentPlaying: false,
      fragmentNameSetting: false
    }
  },
  computed: {
    cut () {
      if (this.cutIndex >= 0) return this.cuts[this.cutIndex]
      else return null
    },
    cuts () {
      return this.fragment.cuts
    },
    fragmentDuration () {
      return this.cuts.reduce((acc, val) => {
        acc += val.points[1].x - val.points[0].x
        return acc
      }, 0)
    },
    cutDialogOptions () {
      let options = {
        header: this.cut ? this.cut.name.length > 0 : false,
        headerName: this.cut ? this.cut.name : '',
        confirm: true,
        confirmName: 'Export to forge',
        actions: {
          down: {name: 'Down'},
          up: {name: 'Up'},
          delete: {name: 'Delete', color: 'red'},
        }
      }
      if (this.cutIndex === 0) delete options.actions.up
      if (this.cutIndex === this.cuts.length - 1) delete options.actions.down
      return options
    }
  },
  watch: {
    now: {
      async handler (to, from) {
        // this.$log('now CHANGED', to)
        if (this.cutPlaying >= 0) {
          let cutStart = this.cut.points[0].x
          let cutEnd = this.cut.points[1].x
          if (to < cutStart || to > cutEnd) {
            this.$log('MUCH MUCH MUCH')
            this.player.setCurrentTime(cutStart)
            await this.$wait(200)
            if (this.fragmentPlaying) {
              if (this.cuts[this.cutPlaying + 1]) {
                this.cutIndex += 1
                this.cutPlaying += 1
              } else {
                this.cutIndex = 0
                this.cutPlaying = 0
              }
            }
          }
        }
      }
    },
    editing: {
      handler (to, from) {
        this.$log('editing CHANGED', to)
        if (to) {
          if (this.cuts.length === 0) {
            this.$log('FIRST EDIT CLICK, CREATE!')
            this.cutCreate()
          }
        }
      }
    }
  },
  methods: {
    fragmentPlay () {
      this.$log('fragmentPlay')
      if (this.fragment.cuts.length === 0) return
      if (this.fragmentPlaying) {
        this.fragmentPlaying = false
        this.cutIndex = -1
        this.cutPlaying = -1
        this.player.pause()
      } else {
        this.fragmentPlaying = true
        this.cutIndex = 0
        this.cutPlaying = 0
        this.player.play()
        this.player.setCurrentTime(this.cut.points[0].x)
      }
    },
    fragmentNameSettingStart () {
      this.$log('fragmentNameSettingStart')
      this.fragmentNameSetting = !this.fragmentNameSetting
      this.$nextTick(() => {
        if (this.$refs.fragmentNameInput) this.$refs.fragmentNameInput.focus()
      })
    },
    fragmentDialog () {
      this.$log('fragmentDialog')
    },
    cutPlay (ci) {
      this.$log('cutPlay', ci)
      this.fragmentPlaying = false
      if (this.cutPlaying === ci) {
        this.player.pause()
        this.cutPlaying = -1
      } else {
        this.cutPlaying = ci
        this.player.play()
      }
    },
    cutCreate (s, e) {
      this.$log('cutCreate', this.player.currentTime)
      let start = s || this.player.currentTime
      let end = e || start + 30
      if (end > this.fragment.content.duration) end = this.fragment.content.duration
      let cut = {
        name: '',
        color: this.$randomColor(Date.now().toString()),
        thumbUrl: '',
        style: null,
        points: [{x: start}, {x: end}]
      }
      this.fragment.cuts.push(cut)
      this.cutIndex = this.fragment.cuts.length - 1
    },
    cutDelete (index) {
      this.$log('cutDelete', index)
      this.cutIndex = -1
      this.$delete(this.fragment.cuts, index)
    },
    cutExport () {
      this.$log('cutExport', this.cut)
      // create node with one fragment...
    },
    cutUp (index) {
      this.$log('cutUp')
      let current = this.cuts[index]
      let to = this.cuts[index - 1]
      this.cuts[index] = to
      this.cuts[index - 1] = current
      this.$nextTick(() => {
        this.cutIndex = index - 1
      })
    },
    cutDown (index) {
      this.$log('cutDown')
      let current = this.cuts[index]
      let to = this.cuts[index + 1]
      this.cuts[index] = to
      this.cuts[index + 1] = current
      this.$nextTick(() => {
        this.cutIndex = index + 1
      })
    },
    cutAction (action) {
      this.$log('cutAction', action)
      switch (action) {
        case 'confirm': {
          this.$log('EXPORT')
          break
        }
        case 'up': {
          this.cutUp(this.cutIndex)
          break
        }
        case 'down': {
          this.cutDown(this.cutIndex)
          break
        }
        case 'delete': {
          if (confirm(this.$t('Delete cut?'))) this.cutDelete(this.cutIndex)
          break
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    if (this.cuts.length > 0) {
      this.cutIndex = 0
      this.fragmentPlay()
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
