<template lang="pug">
q-layout.bg-black
  q-resize-observer(@resize="onResize")
  //- video editor
  k-dialog-bottom(ref="videoEditorDialog" mode="actions" :options="videoEditorDialogOptions" @action="videoEditorAction")
  //- header
  //- menu
  div(:style=`{position: 'absolute', top: '0px', left: '0px', zIndex: 10000, height: '70px', width: '70px'}`).row.items-center.justify-center
    q-btn(
      round flat color="white" icon="menu" @click="$refs.videoEditorDialog.toggle()"
      :style=`{background: 'rgba(0,0,0,0.4)'}`)
  q-btn(
    color="accent" push no-caps @click="confirm()"
    :style=`{position: 'absolute', zIndex: 10000, top: '16px', left: '70px', width: 'calc(100% - 140px)'}`)
    span.text-white {{$t('Ready')}}
  //- cancel
  div(:style=`{position: 'absolute', top: '0px', right: '0px', zIndex: 10000, height: '70px', width: '70px'}`).row.items-center.justify-center
    q-btn(
      round flat color="white" icon="clear" @click="cancel()"
      :style=`{background: 'rgba(0,0,0,0.4)'}`)
  //- body
  q-page-container
    k-video(
      ref="kvideo" :src="value.content.url" autoplay playsinline type="video/mp4" crossorigin="Anonymous"
      :fragment="fragment" :timeline="true" :cut="cut"
      @duration="duration = $event" @now="now = $event"
      :style=`{position: 'relative', maxHeight: ($q.screen.height/2)-10+'px', height: ($q.screen.height/2)-10+'px', width: '100%'}`)
    editor(
      v-if="fragment" :fragment="fragment" :video="$refs.kvideo" :duration="duration" :now="now" :width="width"
      @cut="cut = $event" @fragment="$emit('fragment')"
      :style=`{height: $q.screen.height/2+10+'px'}`)
</template>

<script>
import editor from './editor'

export default {
  name: 'videoEditor',
  components: {editor},
  props: {
    value: {type: Object},
    inCreator: {type: Boolean, default () { return false }}
  },
  data () {
    return {
      width: 0,
      height: 0,
      duration: 0,
      now: 0,
      fragment: null,
      pointsMax: 20,
      cut: null
    }
  },
  computed: {
    videoEditorDialogOptions () {
      return {
        header: false,
        confirm: true,
        confirmName: 'Save & exit',
        actions: {
          similar: {name: 'Explore content cuts'},
          deleteAllCuts: {name: 'Delete all cuts', color: 'red'}
        }
      }
    }
  },
  watch: {
    fragment: {
      handler (to, from) {
        this.$logD('fragment CHANGED', to)
      }
    }
  },
  methods: {
    videoEditorAction (e) {
      this.$logD('videoEditorAction', e)
      switch (e) {
        case 'similar': {
          this.$logD('SIMILAR')
          break
        }
        case 'deleteAllCuts': {
          this.$logD('DELETEALLCUTS')
          break
        }
        case 'confirm': {
          this.$logD('CONFIRM')
          this.confirm()
          break
        }
      }
    },
    async confirm () {
      this.$logD('confirm start', this.$refs.kvideo)
      this.$refs.kvideo.pause()
      // validate fragment total length
      let total = this.fragment.relativeCuts.reduce((acc, val) => {
        acc += val.end - val.start
        return acc
      }, 0)
      this.$logD('total', total)
      for (let i = 0; i < this.fragment.relativeCuts.length; i++) {
        let cut = this.fragment.relativeCuts[i]
        let thumb = await this.$refs.kvideo.getScreenshot(cut.start)
        if (i === 0) this.fragment.thumbUrl = thumb
        cut.thumbUrl = thumb
      }
      this.$logD('confirm done')
      this.$emit('fragment', this.fragment)
    },
    async cancel () {
      this.$logD('cancel start')
      this.$emit('fragment', this.value)
      this.fragment = null
      this.$logD('cancel done')
    },
    onResize (e) {
      this.$logD('onResize', e)
      this.$set(this, 'width', e.width)
      this.$set(this, 'height', e.height)
    }
  },
  async mounted () {
    this.$logD('mounted')
    this.$set(this, 'fragment', JSON.parse(JSON.stringify(this.value)))
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
