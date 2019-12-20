<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width.bg-black
  //- cut on video progress bar
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 103, top: '-13px', height: '8px', pointerEvents: 'none'}`).row.full-width.q-px-md
    div(:style=`{position: 'relative'}`).row.fit
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
  nc-fve-cut-pan(:player="player" :fragment="fragment" :width="width" :cut="cut" :cutIndex="cutIndex" :now="now")
  //- actions
  //- cut CREATE
  div(:style=`{height: '50px'}`).row.full-width.q-my-sm.q-px-md
    .col.q-pr-sm
      q-btn(
        outline no-caps color="green" size="md" @click="cutCreate([])"
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
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="play_arrow" color="green" @click="cutMoreClick(c, ci)")
          div(@click="cutSetTime(0)").col.full-height.cursor-pointer
            .row.fit.items-center.justify-end.q-pr-sm
              span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white {{ $time((parseInt(c.points[0].x*100))/100) }}
          div().row.full-height.items-center.justify-center
            span(:style=`{fontSize: '16px'}`).text-white.text-bold.q-mx-xs -
          div(@click="cutSetTime(1)").col.full-height.cursor-pointer
            .row.fit.items-center.justify-start.q-pl-sm
              span(:style=`{fontSize: '16px', userSelect: 'none'}`).text-white {{ $time((parseInt(c.points[1].x*100))/100) }}
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
        //- cut INACTIVE tint
        div(
          v-if="cutIndex !== ci" @click="cutClick(c, ci)"
          :style=`{position: 'absolute', background: 'rgba(0,0,0,0.2)'}`).row.fit.cursor-pointer
  //- debug
  div(v-if="false").row.full-width.bg-red
    small cut: {{cut}}
  //- footer
  div(:style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.content-center.bg-grey-10
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="play_arrow" color="green" @click="fragmentPlay()")
    span(@click="fragmentNameDialogOpened = true").text-white {{ fragment.name || $t('Set fragment name')}}
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
  props: ['width', 'height', 'fragment', 'player', 'now'],
  data () {
    return {
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
      return {
        header: false,
        headerName: '',
        actions: {
          setName: {name: 'Set name'},
          setStart: {name: 'Set start'},
          setEnd: {name: 'Set name'},
          up: {name: 'Up'},
          down: {name: 'Down'},
          delete: {name: 'Delete', color: 'red'}
        }
      }
    }
  },
  watch: {
    now: {
      handler (to, from) {
        // this.$log('now CHANGED', to)
        if (this.cut && this.cutPlaying >= 0) {
          if (to > this.cut.points[1].x) {
            this.player.setCurrentTime(this.cut.points[0].x)
          }
          if (to < this.cut.points[0].x) {
            this.player.setCurrentTime(this.cut.points[0].x)
          }
        }
      }
    }
  },
  methods: {
    fragmentPlay () {
      this.$log('fragmentPlay')
    },
    cutDialogAction (action) {
      this.$log('cutDialogAction', action)
      switch (action) {
        case 'setName': {
          break
        }
        case 'setStart': {
          this.cutTimerDialogOpened = true
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
      if (this.cutPlaying === ci) {
        this.cutPlaying = -1
      } else {
        this.cutPlaying = ci
        this.player.setCurrentTime(this.cut.points[0].x)
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
    cutUp () {
      this.$log('pointUp')
    },
    cutDown () {
      this.$log('pointDown')
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
    if (this.cuts.length === 0) {
      this.$log('FIRST EDIT CREATE CUT AT CURRENT SECOND')
      this.cutCreate()
      this.cutSetTime(0)
    } else {
      this.$log('SET FIRST CUT')
      this.cutIndex = 0
      this.player.setCurrentTime(this.cut.points[0].x)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
