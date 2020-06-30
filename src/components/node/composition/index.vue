<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
  q-dialog(
    v-model="compositionEditorOpened" position="bottom"
    @show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    ws-composition-editor(
      v-if="compositionWorkspace"
      @close="compositionEditorOpened = false"
      :value="compositionWorkspace"
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`).b-50
  //- composition name
  q-btn(
    v-if="compositionContents.length > 0 && !mini"
    @click="compositionContentNameClick()"
    flat color="white" no-caps
    :style=`{
      position: 'absolute', zIndex: 2000,
      top: '8px', left: '8px',
      transform: 'translate3d(0,0,0)',
      background: 'rgba(0,0,0,0.3)',
    }`
    ).row.justify-start
    //- .row.full-width.justify-start
    //-   small.text-grey-2 from:
    //- .row.full-width
    span.text-white {{ compositionContents[0].name }}
  //- menu
  q-btn(
    v-if="!mini"
    round flat color="white" icon="more_vert"
    :style=`{
      position: 'absolute', zIndex: 2000,
      top: '8px', right: '8px',
      transform: 'translate3d(0,0,0)',
      background: 'rgba(0,0,0,0.1)',
      borderRadius: $store.state.ui.borderRadius+'px',
    }`)
    kalpa-menu-popup(
      v-if="true"
      :actions="actions"
      :style=`{
        minWidth: '200px',
      }`)
  //- preview
  img(
    :src="preview"
    :style=`{
      objectFit: 'contain',
      opacity: videoLoaded ? 0 : 1,
      maxHeight: $q.screen.height-120+'px',
    }`
    ).full-width
  //- debug
  //- kalpa-debug(
  //-   v-if="composition && !mini && false"
  //-   :options=`{url: composition.url, videoLoaded,currentTime,duration}`
  //-   :style=`{position: 'absolute', top: 0, zIndex: 1000,transform: 'translate3d(0,0,0)'}`)
  video-controls(
    v-if="!mini && $refs.videoRef"
    :currentTime="currentTime"
    :duration="duration"
    :player="$refs.videoRef"
    :playing="playing")
  video(
    v-if="composition && composition.url.length > 0 && active"
    ref="videoRef"
    type="video/mp4"
    :src="composition.url"
    :autoplay="true"
    :loop="loop"
    :muted="muted"
    :controls="controls"
    :playsinline="playsinline"
    preload="auto"
    @loadeddata="videoLoadeddata"
    @play="playing = true"
    @pause="playing = false"
    @timeupdate="videoTimeupdate"
    @click="videoClick"
    @ended="videoEnded"
    :style=`{
      position: 'absolute', zIndex: 100,
      objectFit: 'contain',
    }`
    ).fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import videoControls from './video_controls'

export default {
  name: 'composition',
  components: {videoControls},
  props: {
    preview: {
      type: String
    },
    value: {
      type: Object,
      required: true
    },
    loop: {type: Boolean},
    visible: {type: Boolean},
    active: {type: Boolean},
    mini: {type: Boolean}
  },
  data () {
    return {
      composition: null,
      compositionContents: [],
      compositionWorkspace: null,
      videoLoaded: false,
      currentTime: 0,
      duration: 0,
      playing: false,
      playsinline: true,
      muted: false,
      compositionEditorOpened: false,
    }
  },
  computed: {
    actions () {
      let res = {
        save: {
          name: 'Save',
          fn: () => {
            this.$emit('save')
          }
        }
      }
      this.compositionContents.map(c => {
        res[`explore-${c.oid}`] = {
          name: `Explore:  "${c.name}"`,
          fn: (_, ckey) => {
            this.$log('explore content', _, ckey)
            this.$router.push(`/workspace/content/import?url=${c.url}`).catch(e => e)
          }
        }
      })
      return res
    }
  },
  watch: {
    visible: {
      immediate: true,
      async handler (to, from) {
        // this.$log('visible TO', to)
        if (to) {
          this.$log('visible TRUE => load composition: ', this.value.oid)
          this.composition = await this.$rxdb.get(RxCollectionEnum.OBJ, this.value.oid)
        }
        else {
          this.videoLoaded = false
        }
      }
    },
    active: {
      immediate: true,
      handler (to, from) {
        this.$log('active TO', to)
        if (to) {
          // if (this.$refs.videoRef) this.$refs.videoRef.play()
          this.compositionMore()
        }
        else {
          // if (this.$refs.videoRef) this.$refs.videoRef.pause()
          this.videoLoaded = false
        }
      }
    },
    '$store.state.ui.active': {
      handler (to, from) {
        this.$log('$store.state.ui.active TO',)
        if (to === false && this.$refs.videoRef) this.$refs.videoRef.pause()
      }
    }
  },
  methods: {
    async compositionContentNameClick () {
      this.$log('compositionContentNameClick')
      if (this.$refs.videoRef) this.$refs.videoRef.pause()
      let composition = await this.compositionWs(this.compositionContents[0])
      this.$log('composition', composition)
      this.compositionWorkspace = composition
      this.compositionEditorOpened = true
    },
    async compositionWs (content) {
      let compositionInput = {
        wsItemType: 'WS_CONTENT',
        thumbOid: content.thumbUrl,
        contentOid: content.oid,
        contentType: 'COMPOSITION',
        name: this.composition.name,
        layers: this.composition.layers.map((l, li) => {
          return {
            id: `${Date.now()}::${li}`,
            color: this.$randomColor(`${Date.now()}::${li}`),
            contentOid: content.oid,
            figuresAbsolute: l.figuresAbsolute,
            figuresRelative: [],
            spheres: [{name: ''}],
          }
        }),
        spheres: [],
        operation: { items: null, operations: null, type: 'CONCAT' }
      }
      this.$log('compositionInput', compositionInput)
      let composition = await this.$rxdb.set(RxCollectionEnum.WS_CONTENT, compositionInput)
      return composition
    },
    videoEnded (e) {
      this.$log('videoEnded', e)
      this.$emit('ended')
    },
    async compositionMore () {
      this.$log('compositionMore')
      if (!this.composition) return
      let res = []
      await Promise.all(this.composition.layers.map(async (l, li) => {
        let content = await this.$rxdb.get(RxCollectionEnum.OBJ, l.contentOid)
        res.push(content)
      }))
      this.$log('res', res)
      this.compositionContents = res
    },
    videoClick () {
      this.$log('videoClick')
      if (this.muted) {
        this.muted = false
      }
      else {
        if (this.playing) {
          this.$refs.videoRef.pause()
        }
        else {
          this.$refs.videoRef.play()
        }
      }
      // this.muted = false
    },
    videoTimeupdate (e) {
      // this.$log('videoTimeupdate', e)
      this.currentTime = e.target.currentTime
    },
    videoLoadeddata (e) {
      // this.$log('videoLoadeddata', e)
      this.duration = e.target.duration
      this.videoLoaded = true
    }
  },
  mounted () {
    // this.$log('mounted')
    // this.composition
  }
}
</script>
