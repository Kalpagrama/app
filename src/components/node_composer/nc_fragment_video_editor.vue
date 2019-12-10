<template lang="pug">
div(:style=`{position: 'relative'}`).column.full-width.bg-black
  div(
    v-if="cut"
    :style=`{position: 'absolute', zIndex: 103, top: '-34px', height: '24px'}`).row.full-width.q-px-md
    div(:style=`{position: 'relative'}`).row.fit
      div(:style=`{
        position: 'absolute', zIndex: 106, top: 0, height: '100%',
        left: (cut.start/content.duration)*100+'%',
        width: ((cut.end-cut.start)/content.duration)*100+'%',
        borderRadius: '4px', background: $randomColor(cut.type)}`)
  q-btn(
    round flat icon="timer" color="green" @click="$emit('cutTimer')"
    :style=`{position: 'absolute', zIndex: 110, top: '-82px', right: '90px'}`).shadow-1
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutDialogAction")
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    div(
      v-if="cutTimerDialogOpened"
      :style=`{position: 'absolute', bottom: '0px', zIndex: 12000, height: 'calc(100% - 0px)', borderRadius: '10px 10px 0 0'}`
      ).row.full-width.items-between.bg-black
      nc-fragment-video-editor-start(:player="player" @close="cutTimerDialogOpened = false")
  nc-fragment-video-editor-pan(:player="player" :content="content" :width="width" :cut="cut" @cut="cutChanged")
  div(:style=`{}`).col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
      //- cut
      div(
        v-for="(c, ci) in cuts" :key="c.type"
        :style=`{minHeight: '44px', overflow: 'hidden', borderRadius: '10px'}`
        ).row.full-width.q-mb-sm.bg-grey-10
        //- cut inactive
        div(
          :style=`{height: '44px'}`
          ).row.full-width
          //- name
          div(@click="cutClick(c, ci)").col
            .row.fit.items-center.content-center
              div(:style=`{height: '44px', width: '44px'}`).row.items-center.justify-center
                div(:style=`{height: '20px', width: '20px', borderRadius: '4px', background: $randomColor(c.type)}`
                  ).row.items-center.justify-center
                  small.text-white {{ci}}
              .col.full-height
                .row.fit.items-center.content-center
                  .row.full-width
                    span.text-white {{ c.type }}
                  .row.full-width.items-start
                    small.text-white {{ $time((parseInt(c.start*100))/100) }} - {{ $time((parseInt(c.end*100))/100) }}
          //- more
          q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
        //- cut ACTIVE
        div(
          v-if="cutIndex === ci"
          :style=`{height: '100px'}`
          ).row.full-width.items-end.q-pa-sm
          q-btn(no-caps flat color="red")
            span {{$t('Delete')}}
          .col
          q-btn(round flat icon="timer" color="green" @click="startDialogOpened = true").br
          q-btn(push no-caps color="green" @click="cutPlay()")
            span {{ $t('Play') }}
      q-btn(outline color="green" size="md" icon="add" @click="cutCreate()"
        :style=`{height: '40px', borderRadius: '10px'}`).full-width
  //- debug
  div(v-if="false").row.full-width.bg-red
    small cut: {{cut}}
  //- footer
  div(:style=`{position: 'relative', height: '60px'}`).row.full-width.items-center.content-center.bg-grey-10
    //- q-btn(round flat icon="more_vert" color="white").q-mx-sm
    span.text-white.q-mb-xs.q-ml-md Fragment name
    //- progress
    div(:style=`{position: 'absolute', bottom: '0px', height: '6px'}`).row.full-width
      div(:style=`{width: 56+'%', borderRadius: '0 3px 3px 0'}`).row.full-height.bg-green
</template>

<script>
import ncFragmentVideoEditorPan from './nc_fragment_video_editor_pan'
import ncFragmentVideoEditorStart from './nc_fragment_video_editor_start'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFragmentVideoEditorPan, ncFragmentVideoEditorStart},
  props: ['width', 'index', 'node', 'content', 'player'],
  data () {
    return {
      cutIndex: -1,
      startDialogOpened: false,
      cutTimerDialogOpened: false,
      cutSetNameDialogOpened: false,
      cutSetStartDialogOpened: false,
      fragmentSetNameDialogOpened: false
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
    // node: {
    //   deep: true,
    //   handler (to, from) {
    //     this.$log('node CHANGED', to)
    //   }
    // }
  },
  methods: {
    cutDialogAction (action) {
      this.$log('cutDialogAction', action)
      switch (action) {
        case 'setName': {
          break
        }
        case 'setStart': {
          this.startDialogOpened = true
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
    cutTimer () {
      this.$log('cutTimer', this.cutTimerDialogOpened)
      this.cutTimerDialogOpened = true
    },
    cutChanged (e) {
      this.$log('cutChanged', e)
      this.$set(this.node.meta.fragments[this.index].relativeCuts, this.cutIndex, e)
    },
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
      this.$set(this, 'cutIndex', ci)
    },
    cutPlay () {
      this.$log('cutPlay')
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
    cutCreate (now) {
      // TODO: type is UID for now
      this.$log('cutCreate', this.player.currentTime)
      let cut = {
        type: Date.now().toString(),
        name: '',
        thumbUrl: '',
        start: this.player.currentTime,
        end: this.player.currentTime + 3
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
