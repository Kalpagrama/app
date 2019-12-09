<template lang="pug">
div(:style=`{overflow: 'hidden'}`).column.full-width.bg-black
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutDialogAction")
  nc-fragment-video-editor-pan(:player="player" :content="content" :width="width" :cut="cut" @cut="cutChanged")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pa-md
      div(
        v-for="(c, ci) in cuts" :key="c.name"
        :style=`{minHeight: '40px', overflow: 'hidden', borderRadius: '10px'}`
        ).row.full-width.items-center.q-px-sm.q-mb-sm.bg-grey-10
        div(@click="cutClick(c, ci)").col.full-height
          .row.fit.items-center.content-center.q-px-sm
            div(:style=`{height: '20px', width: '20px', borderRadius: '4px', background: $randomColor(c.name)}`
              ).row.items-center.justify-center.q-mr-md
              small.text-white {{ci}}
            small(:class={'text-bold': ci === cutIndex}).text-white {{(parseInt(c.start*100))/100}}-
            small(:class={'text-bold': ci === cutIndex}).text-white {{(parseInt(c.end*100))/100}}
        q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
        //- leave-active-class="animated slideOutUp"
        transition(appear enter-active-class="animated slideInDown")
          div(
            v-if="cutIndex === ci"
            :style=`{height: '100px'}`
            ).row.full-width.items-start
            q-btn(round icon="play_circle_filled" color="green" @click="cutPlay()")
      q-btn(outline color="green" size="md" icon="add" @click="cutCreate()"
        :style=`{height: '40px', borderRadius: '10px'}`).full-width
  div(:style=`{position: 'relative', height: '75px'}`).row.full-width.items-start
    q-btn(round flat icon="more_vert" color="white").q-ml-md
    div(:style=`{position: 'absolute', bottom: '0px', height: '10px'}`).row.full-width
      div(:style=`{width: progress+'%'}`).row.full-height.bg-green
</template>

<script>
import ncFragmentVideoEditorPan from './nc_fragment_video_editor_pan'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFragmentVideoEditorPan},
  props: ['width', 'index', 'node', 'content', 'player'],
  data () {
    return {
      cutIndex: -1,
      // cuts: [],
      progress: 0,
      progressInterval: null
    }
  },
  computed: {
    cut () {
      if (this.cutIndex >= 0) {
        return this.cuts[this.cutIndex]
      } else {
        return null
      }
    },
    cuts () {
      return this.node.meta.fragments[this.index].relativeCuts
    },
    cutDialogOptions () {
      return {
        header: false,
        headerName: '',
        actions: {
          up: {name: 'Up'},
          down: {name: 'Down'},
          delete: {name: 'Delete', color: 'red'}
        }
      }
    }
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  },
  methods: {
    cutDialogAction (action) {
      this.$log('cutDialogAction', action)
      switch (action) {
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
      this.$log('cutCreate', this.player.currentTime)
      let cut = {
        type: 'default',
        name: Date.now().toString(),
        thumbUrl: '',
        start: this.player.currentTime,
        end: this.player.currentTime + 3
      }
      this.node.meta.fragments[this.index].relativeCuts.push(cut)
    },
    cutDelete (index) {
      this.$log('cutDelete', index)
      this.$delete(this.node.meta.fragments[this.index].relativeCuts, index)
    }
  },
  mounted () {
    this.$log('mounted')
    this.progressInterval = setInterval(() => {
      if (this.progress === 100) clearInterval(this.progressInterval)
      this.progress += 10
    }, 1000)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    clearInterval(this.progressInterval, false)
  }
}
</script>
