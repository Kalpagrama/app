<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width.bg-black
  //- cut on video progress bar
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 103, top: '-13px', height: '8px', pointerEvents: 'none'}`).row.full-width.q-px-md
    div(:style=`{position: 'relative'}`).row.fit
      div(
        v-for="(c, ci) in cuts" :key="ci"
        v-if="ci !== cutIndex"
        :style=`{
          position: 'absolute', zIndex: 106, top: 0, height: '100%', opacity: 0.6,
          left: (c.points[0].x/fragment.content.duration)*100+'%',
          width: ((c.points[1].x-c.points[0].x)/fragment.content.duration)*100+'%',
          borderRadius: '4px', background: c.color}`)
      div(:style=`{
        position: 'absolute', zIndex: 106, top: 0, height: '100%', opacity: 1,
        left: (cut.points[0].x/fragment.content.duration)*100+'%',
        width: ((cut.points[1].x-cut.points[0].x)/fragment.content.duration)*100+'%',
        borderRadius: '4px', background: cut.color}`)
  //- dialogs
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutDialogAction")
  k-dialog-bottom(ref='cutDeleteDialog' :options="{actions: {delete: {name: 'Delete', color: 'red'}}}" @action="cutDelete(cutIndex)")
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    nc-fve-cut-timer(
      v-if="cutSetTimeDialogOpened"
      :player="player" :cut="cut" :pointIndex="cutSetTimePointIndex"
      @point="cutSetTime(cutSetTimePointIndex, $event)" @close="cutSetTimeDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, bottom: 0, height: 'calc(100% - 190px)'}`)
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    nc-fve-cut-name(
      v-if="cutNameDialogOpened"
      :cut="cut" @close="cutNameDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, top: 0}`)
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    nc-fve-fragment-name(
      v-if="fragmentNameDialogOpened"
      :fragment="fragment" @close="fragmentNameDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, top: 0}`)
  //- pan
  nc-fve-cut-pan(:player="player" :fragment="fragment" :width="width" :cut="cut" :cutIndex="cutIndex" :now="now" :fragmentDuration="fragmentDuration")
  //- actions
  //- cut CREATE
  div(:style=`{height: '50px'}`).row.full-width.q-my-sm.q-px-md
    .col.q-pr-sm
      q-btn(
        outline no-caps color="green" size="md" @click="cutCreate()"
        :style=`{height: '50px', borderRadius: '10px'}`).full-width.q-mb-sm
        span {{ $t('Add cut here') }}
    q-btn(
      outline icon="add" color="green"
      :style=`{width: '50px', height: '50px', borderRadius: '10px'}`)
  //- body
  div(:style=`{}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-md
      //- cut
      div(
        v-for="(c, ci) in cuts" :key="c.type"
        :style=`{position: 'relative', minHeight: '50px', overflow: 'hidden', borderRadius: '10px'}`
        :class=`{'bg-grey-10': ci !== cutIndex, 'bg-grey-5': ci === cutIndex}`
        ).row.full-width.q-mb-sm
        //- cut wrapper
        div(
          :style=`{position: 'relative', height: '50px'}`
          ).row.full-width
          //- play
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(
              round flat
              :icon="cutPlaying === ci ? 'pause' : 'play_arrow'"
              :color="cutPlaying === ci ? 'red' : 'green'"
              @click="cutPlay(c, ci)")
          //- start
          div(@click="cutSetTime(0)").col.full-height.cursor-pointer
            .row.fit.items-center.justify-end.q-pr-sm
              span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white {{ $time((parseInt(c.points[0].x*100))/100) }}
          div().row.full-height.items-center.justify-center
            span(:style=`{fontSize: '16px'}`).text-white.text-bold.q-mx-xs -
          //- end
          div(@click="cutSetTime(1)").col.full-height.cursor-pointer
            .row.fit.items-center.justify-start.q-pl-sm
              span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white {{ $time((parseInt(c.points[1].x*100))/100) }}
          //- actions
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
        //- cut INACTIVE tint
        div(
          v-if="cutIndex !== ci" @click="cutClick(c, ci)"
          :style=`{position: 'absolute', zIndex: 100, background: 'rgba(0,0,0,0.2)'}`).row.fit.cursor-pointer
        //- cut PLAYING tint
        div(
          v-if="cut && cutPlaying === ci"
          :style=`{
            position: 'absolute', zIndex: 100, right: 0, background: 'rgba(0,0,0,0.5)', pointerEvents: 'none',
            width: ((cut.points[1].x-now)/(cut.points[1].x-cut.points[0].x))*100+'%'}`
          ).row.full-height
  //- debug
  div(v-if="false").row.full-width.bg-red
    small cut: {{cut}}
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
  //- progress
  div(
    v-if="false"
    :style=`{position: 'absolute', top: '0px', height: '4px'}`).row.full-width
    div(:style=`{width: 56+'%', borderRadius: '0 2px 2px 0'}`).row.full-height.bg-green
</template>

<script>
import ncFveCutPan from './nc_fve_cut_pan'
import ncFveCutTimer from './nc_fve_cut_timer'
import ncFveCutName from './nc_fve_cut_name'
import ncFveFragmentName from './nc_fve_fragment_name'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFveCutPan, ncFveCutTimer, ncFveCutName, ncFveFragmentName},
  props: ['width', 'height', 'fragment', 'player', 'now', 'editing'],
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
    cutDialogOptions () {
      let options = {
        header: false,
        headerName: this.cut ? this.cut.name : '',
        confirm: true,
        confirmName: 'Play',
        actions: {
          setName: {name: 'Set name'},
          down: {name: 'Down'},
          up: {name: 'Up'},
          delete: {name: 'Delete', color: 'red'},
        }
      }
      if (this.cutIndex === 0) delete options.actions.up
      if (this.cutIndex === this.cuts.length - 1) delete options.actions.down
      return options
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
            // this.cutSetTime(0)
          }
        }
      }
    },
    now: {
      handler (to, from) {
        // this.$log('now CHANGED', to)
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
    cutDialogAction (action) {
      this.$log('cutDialogAction', action)
      switch (action) {
        case 'confirm': {
          this.cutPlay(this.cut, this.cutIndex)
          break
        }
        case 'setName': {
          // TODO: open cut namedialog
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
          this.cutDelete(this.cutIndex)
          break
        }
      }
      this.cutIndex = -1
    },
    cutNameClick (c, ci) {
      this.$log('cutNameClick', c, ci)
      this.cutIndex = ci
      this.cutNameDialogOpened = true
    },
    cutPlay (c, ci) {
      this.$log('cutPlay', c, ci)
      this.fragmentPlaying = false
      if (this.cutPlaying === ci) {
        this.player.pause()
        this.cutPlaying = -1
      } else {
        this.cutPlaying = ci
        // this.player.setCurrentTime(this.cut.points[0].x)
        this.player.play()
      }
    },
    cutSetTime (pointIndex, value) {
      this.$log('cutSetTime', pointIndex, value)
      if (value) {
        this.cut.points[pointIndex].x = value
      } else {
        this.cutSetTimePointIndex = pointIndex
        this.cutSetTimeDialogOpened = true
      }
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
    cutMoreClick (c, ci) {
      this.$log('cutMoreClick', c, ci)
      this.cutIndex = ci
      this.$refs.cutDialog.show()
    },
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      if (ci === this.cutIndex) return
      this.$set(this, 'cutIndex', ci)
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
    },
    cutDelete (index) {
      this.$log('cutDelete', index)
      this.cutIndex = -1
      this.$delete(this.fragment.cuts, index)
    }
  },
  mounted () {
    this.$log('mounted', this.cuts.length)
    if (this.cuts.length > 0) {
      this.cutIndex = 0
      // this.player.setCurrentTime(this.cut.points[0].x)
      // this.player.play()
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
