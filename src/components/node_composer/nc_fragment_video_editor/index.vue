<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width.bg-black
  //- cut on video progress bar
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 103, top: '-34px', height: '24px'}`).row.full-width.q-px-md
    div(:style=`{position: 'relative'}`).row.fit
      div(:style=`{
        position: 'absolute', zIndex: 106, top: 0, height: '100%',
        left: (cut.start/content.duration)*100+'%',
        width: ((cut.end-cut.start)/content.duration)*100+'%',
        borderRadius: '4px', background: $randomColor(cut.type)}`)
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
      :fragment="node.fragments[index]" @close="fragmentNameDialogOpened = false"
      :style=`{position: 'absolute', zIndex: 10000, top: 0}`)
  //- pan
  nc-fve-cut-pan(:player="player" :content="content" :width="width" :cut="cut" @cut="cutChanged")
  //- body
  div(:style=`{}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
      //- cut
      div(
        v-for="(c, ci) in cuts" :key="c.type"
        :style=`{position: 'relative', minHeight: '44px', overflow: 'hidden', borderRadius: '10px'}`
        ).row.full-width.q-mb-sm.bg-grey-10
        //- cut wrapper
        div(
          :style=`{position: 'relative', height: '44px'}`
          ).row.full-width
          //- name
          .col
            .row.fit.items-center.content-center
              div(:style=`{height: '44px', width: '44px'}`).row.items-center.justify-center
                div(:style=`{height: '36px', width: '36px', borderRadius: '10px', background: $randomColor(c.type)}`
                  ).row.items-center.justify-center
                  small.text-white {{ci}}
              .col.full-height
                div(@click="cutNameClick(c, ci)").row.fit.items-center.content-center
                  .row.full-width
                    span(v-if="c.name" ).text-white {{ c.name }}
                  .row.full-width.items-start
                    small.text-white {{ $time((parseInt(c.start*100))/100) }} - {{ $time((parseInt(c.end*100))/100) }}
          //- more
          q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)").q-mr-xs
        //- cut ACTIVE
        transition(appear enter-active-class="animated fadeIn")
          div(
            v-if="cutIndex === ci"
            :style=`{height: '56px'}`
            ).row.full-width.items-center.justify-between.q-px-xs
            q-btn(no-caps round flat icon="delete_outline" color="red" @click="cutIndex = ci, $refs.cutDeleteDialog.show()")
            //- .col
            q-btn(round flat icon="timer" color="green" @click="cutTimerDialogOpened = true")
            q-btn(
              round no-caps @click="cutPlay(c, ci)"
              :flat="cutPlaying !== ci" :push="cutPlaying === ci"
              :icon="cutPlaying === ci ? 'pause' : 'play_arrow'"
              :color="cutPlaying === ci ? 'red' : 'green'")
        //- cut INACTIVE
        div(
          v-if="cutIndex !== ci" @click="cutClick(c, ci)"
          :style=`{position: 'absolute'}`).row.fit
      q-btn(outline color="green" size="md" icon="add" @click="cutCreate([])"
        :style=`{height: '40px', borderRadius: '10px'}`).full-width
  //- debug
  div(v-if="false").row.full-width.bg-red
    small cut: {{cut}}
  //- footer
  div(:style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.content-center.bg-grey-10
    span(@click="fragmentNameDialogOpened = true").text-white.q-mb-xs.q-ml-md {{ node.fragments[index].name || $t('Set fragment name')}}
    //- progress
    div(:style=`{position: 'absolute', bottom: '0px', height: '6px'}`).row.full-width
      div(:style=`{width: 56+'%', borderRadius: '0 3px 3px 0'}`).row.full-height.bg-green
</template>

<script>
import ncFveCutPan from './nc_fve_cut_pan'
import ncFveCutTimer from './nc_fve_cut_timer'
import ncFveCutName from './nc_fve_cut_name'
import ncFveFragmentName from './nc_fve_fragment_name'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFveCutPan, ncFveCutTimer, ncFveCutName, ncFveFragmentName},
  props: ['width', 'index', 'node', 'content', 'player', 'now'],
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
      return this.node.meta.fragments[this.index].relativeCuts
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
          if (to > this.cut.end) {
            this.player.setCurrentTime(this.cut.start)
          }
          if (to < this.cut.start) {
            this.player.setCurrentTime(this.cut.start)
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
    cutTimer (isFirst) {
      this.$log('cutTimer', 'isFirst:', isFirst)
      this.cutTimerDialogOpened = true
    },
    cutChanged (e) {
      this.$log('cutChanged', e)
      this.$set(this.node.meta.fragments[this.index].relativeCuts, this.cutIndex, e)
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
        this.player.setCurrentTime(this.cut.start)
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
      // TODO: type is UID for now
      this.$log('cutCreate', this.player.currentTime)
      let cut = {
        type: Date.now().toString(),
        name: '',
        thumbUrl: '',
        start: start || this.player.currentTime,
        end: end ? end : start ? start + 10 : this.player.currentTime + 10
      }
      this.node.meta.fragments[this.index].relativeCuts.push(cut)
      this.cutClick(cut, this.node.meta.fragments[this.index].relativeCuts.length - 1)
    },
    cutDelete (index) {
      this.$log('cutDelete', index)
      this.cutIndex = -1
      this.$delete(this.node.meta.fragments[this.index].relativeCuts, index)
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
