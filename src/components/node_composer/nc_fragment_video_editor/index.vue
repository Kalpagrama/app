<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width.bg-black
  //- cut&cuts on video progress bar
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 103, top: '-13px', height: '8px', pointerEvents: 'none'}`).row.full-width.q-px-md
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
  //- dialogs
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    nc-fve-fragment-name(
      v-if="fragmentNameDialogOpened"
      :fragment="fragment" @close="fragmentNameDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, top: 0}`)
  //- pan
  nc-fve-cut-pan(
    :player="player" :fragment="fragment" :width="width" :cut="cut"
    :cutIndex="cutIndex" :now="now" :fragmentDuration="fragmentDuration"
    @cutCreate="cutCreate()" @panningStarted="cutPlaying = -1, fragmentPlaying = false")
  //- body
  div.col.full-width.scroll
    nc-fve-cuts(
      :cut="cut" :cuts="cuts" :cutIndex="cutIndex" :now="now" :player="player" :editing="editing"
      @cutIndex="cutIndex = $event" @cutPlay="cutPlay")
  //- footer
  div(:style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.content-center.bg-grey-10
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(
        round flat @click="fragmentPlay()"
        :icon="fragmentPlaying ? 'pause' : 'play_arrow'"
        :color="fragmentPlaying ? 'red' : 'green'")
    .col.full-height
      .row.fit.items-center.content-center.q-pr-sm
        .row.full-width
          span(@click="fragmentNameDialogOpened = true").text-white {{ fragment.name || $t('Set fragment name') | cut(40) }}
        .row.full-width
          span(:style=`{color: fragmentDuration > 60 ? 'red' : 'green'}`).text-bold {{ $time(fragmentDuration) }}
</template>

<script>
import ncFveCuts from './nc_fve_cuts'
import ncFveCutPan from './nc_fve_cut_pan'
import ncFveFragmentName from './nc_fve_fragment_name'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFveCuts, ncFveCutPan, ncFveFragmentName},
  props: ['width', 'height', 'previewHeight', 'fragment', 'player', 'now', 'editing'],
  data () {
    return {
      now_: 0,
      cutIndex: -1,
      cutPlaying: -1,
      cutSetTimeDialogOpened: false,
      cutSetTimePointIndex: 0,
      cutNameDialogOpened: false,
      fragmentNameDialogOpened: false,
      fragmentPlaying: false
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
    }
  },
  watch: {
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
    },
    now: {
      handler (to, from) {
        this.$log('now CHANGED', to)
        // if (to && from && to.color === from.color) return
        if (this.cut && this.cutPlaying >= 0) {
          // this.player.pause()
          if (to >= this.cut.points[1].x) {
            if (this.fragmentPlaying) {
              this.$log('FRAGMENT PLAYING')
              if (this.cuts[this.cutIndex + 1]) {
                this.$log('NEXT CUT')
                this.cutIndex += 1
                this.cutPlaying += 1
                this.$nextTick(() => {
                  this.player.setCurrentTime(this.cut.points[0].x)
                })
              } else {
                this.$log('FIRST CUT AGAIN')
                this.cutIndex = 0
                this.cutPlaying = 0
                this.$nextTick(() => {
                  this.player.setCurrentTime(this.cut.points[0].x)
                })
              }
            } else {
              this.$log('CUT AGAIN')
              this.player.setCurrentTime(this.cut.points[0].x)
            }
          }
        } else {
          // this.$log('NO CUT PLAYING')
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
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      // this.$emit('cutIndex', ci)
      this.cutIndex = ci
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
      this.cutClick(cut, this.fragment.cuts.length - 1)
    }
  },
  mounted () {
    this.$log('mounted', this.cuts.length)
    if (this.cuts.length > 0) {
      this.cutIndex = 0
      this.fragmentPlay()
    } else {
      this.player.play()
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
