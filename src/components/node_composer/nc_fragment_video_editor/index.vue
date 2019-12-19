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
      v-if="cutTimerDialogOpened"
      :boom="cutTimerDialogBoom"
      :player="player" :cut="cut" @boom="cutBoom" @close="cutTimerDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, top: 0}`)
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
  nc-fve-cut-pan(:player="player" :fragment="fragment" :width="width" :cut="cut" :now="now" @cut="cutChanged")
  //- body
  div(:style=`{}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
      //- cut CREATE
      //- q-btn(
      //-   outline no-caps color="green" size="md" icon="add" @click="cutCreate([])"
      //-   :style=`{height: '60px', borderRadius: '10px'}`).full-width.q-mb-sm
      //-   span {{ $t('Add cut') }}
      //- cut border: cutIndex === ci ? '3px solid '+c.color : '3px solid black'
      div(
        v-for="(c, ci) in cuts" :key="c.type"
        :style=`{position: 'relative', minHeight: '50px', overflow: 'hidden', borderRadius: '10px'}`
        :class=`{'bg-grey-10': ci !== cutIndex, 'bg-grey-5': ci === cutIndex}`
        ).row.full-width.q-mb-sm
        //- cut wrapper
        div(
          :style=`{position: 'relative', height: '50px'}`
          ).row.full-width
          //- name
          //- .col
            .row.fit.items-center.content-center
              //- div(:style=`{height: '44px', width: '44px'}`).row.items-center.justify-center
              //-   div(:style=`{height: '36px', width: '36px', borderRadius: '10px', background: c.color}`
              //-     ).row.items-center.justify-center
              //-     small.text-white {{ci}}
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="play_arrow" color="green" @click="cutMoreClick(c, ci)")
          .col.full-height
            .row.fit.items-center.justify-end.q-pr-sm
              span(:style=`{fontSize: '16px'}`).text-white {{ $time((parseInt(c.points[0].x*100))/100) }}
          div().row.full-height.items-center.justify-center
            span(:style=`{fontSize: '16px'}`).text-white.text-bold.q-mx-xs -
          .col.full-height
            .row.fit.items-center.justify-start.q-pl-sm
              span(:style=`{fontSize: '16px'}`).text-white {{ $time((parseInt(c.points[1].x*100))/100) }}
          div(:style=`{height: '50px', width: '50px'}`).row.items-center.content-center.justify-center
            q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
                //- div(@click="cutNameClick(c, ci)").row.fit.items-center.content-center
                //-   .row.full-width
                //-     span(v-if="c.name" ).text-white {{ c.name }}
                //-   .row.full-width.items-start
                //-     small.text-white {{ $time((parseInt(c.points[0].x*100))/100) }} - {{ $time((parseInt(c.points[1].x*100))/100) }}
          //- more
          //- q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)").q-mr-xs
        //- cut ACTIVE
        //- transition(appear enter-active-class="animated fadeIn")
        //-   div(
        //-     v-if="cutIndex === ci"
        //-     :style=`{height: '56px'}`
        //-     ).row.full-width.items-center.justify-between.q-px-xs
        //-     q-btn(no-caps round flat icon="delete_outline" color="red" @click="cutIndex = ci, $refs.cutDeleteDialog.show()")
        //-     //- .col
        //-     q-btn(round flat icon="timer" color="green" @click="cutTimerDialogOpened = true")
        //-     q-btn(
        //-       round no-caps @click="cutPlay(c, ci)"
        //-       :flat="cutPlaying !== ci" :push="cutPlaying === ci"
        //-       :icon="cutPlaying === ci ? 'pause' : 'play_arrow'"
        //-       :color="cutPlaying === ci ? 'red' : 'green'")
        //- cut INACTIVE
        div(
          v-if="cutIndex !== ci" @click="cutClick(c, ci)"
          :style=`{position: 'absolute'}`).row.fit
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
      cutTimerDialogOpened: false,
      cutTimerDialogBoom: false,
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
    boom () {
      this.$log('boom')
      this.cutTimerDialogBoom = true
      this.cutTimerDialogOpened = true
    },
    fragmentPlay () {
      this.$log('fragmentPlay')
    },
    cutBoom (arr) {
      this.$log('cutBoom', arr)
      this.cutTimerDialogBoom = false
      this.cutCreate(arr)
      this.$emit('close')
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
    cutChanged (cut) {
      this.$log('cutChanged', cut)
      this.fragment.cuts[this.cutIndex] = cut
    },
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      if (ci === this.cutIndex) return
      this.$set(this, 'cutIndex', ci)
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
    cutCreate ([start, end]) {
      this.$log('cutCreate', this.player.currentTime)
      let cut = {
        name: '',
        color: this.$randomColor(Date.now().toString()),
        thumbUrl: '',
        style: null,
        points: [
          {x: start || this.player.currentTime},
          {x: end ? end : start ? start + 10 : this.player.currentTime + 10}
        ]
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
      this.player.setCurrentTime(this.cut.points[0].x)
      // this.cutPlay(this.cut, 0)
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
