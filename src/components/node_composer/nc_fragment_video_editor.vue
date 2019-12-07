<template lang="pug">
div(:style=`{overflow: 'hidden'}`).column.full-width.bg-black
  k-dialog-bottom(ref="cutDialog" :options="cutDialogOptions" @action="cutDialogAction")
  nc-fragment-video-editor-pan(:player="player" :content="content" :width="width")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-md
      div(v-for="(c, ci) in cuts" :key="ci"
        :style=`{height: '40px', overflow: 'hidden', borderRadius: '10px'}`
        ).row.full-width.items-center.q-px-sm.q-mb-sm.bg-grey-10
        div(@click="cutClick(c, ci)").col.full-height
          .row.fit.items-center.content-center.q-px-sm
            div(:style=`{height: '20px', width: '20px', borderRadius: '4px', background: $randomColor(ci)}`)
            small.text-white {{(parseInt(c.start*100))/100}}-
            small.text-white {{(parseInt(c.end*100))/100}}
        q-btn(round flat icon="more_vert" color="grey-8" @click="cutMoreClick(c, ci)")
      //- div(:style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.justify-center.bg-grey-10
      q-btn(outline color="green" size="md" icon="add" @click="cutCreate()"
        :style=`{height: '50px', borderRadius: '10px'}`).full-width
  div(:style=`{position: 'relative', height: '75px'}`).row.full-width.items-start
    q-btn(round flat icon="more_vert" color="white").q-ml-md
    div(:style=`{position: 'absolute', bottom: '0px', height: '10px'}`).row.full-width
      div(:style=`{width: 56+'%'}`).row.full-height.bg-green
</template>

<script>
import ncFragmentVideoEditorPan from './nc_fragment_video_editor_pan'

export default {
  name: 'ncFragmentVideoEditor',
  components: {ncFragmentVideoEditorPan},
  props: ['width', 'content', 'player'],
  data () {
    return {
      cutIndex: -1,
      cuts: []
    }
  },
  computed: {
    frames () {
      return this.content.frameUrls.filter((f, fi) => {
        return fi % 2 === 0
      })
    },
    framesCount () {
      return this.content.frameUrls.length
    },
    frameDuration () {
      return this.content.duration / this.framesCount
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
    cutClick (c, ci) {
      this.$log('cutClick', c, ci)
    },
    cutMoreClick (c, ci) {
      this.$log('cutMoreClick', c, ci)
      this.cutIndex = ci
      this.$refs.cutDialog.show()
    },
    cutCreate () {
      this.$log('cutCreate', this.player.currentTime)
      this.cuts.push({
        type: 'default',
        name: Date.now().toString(),
        thumbUrl: '',
        start: this.player.currentTime,
        end: this.player.currentTime + 3
      })
    },
    cutUp () {
      this.$log('pointUp')
    },
    cutDown () {
      this.$log('pointDown')
    },
    cutDelete (index) {
      this.$log('pointDelete')
      this.cuts = this.cuts.filter((c, ci) => ci !== index)
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
