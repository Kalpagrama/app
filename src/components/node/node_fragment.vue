<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  div(v-if="!fragment" style=`position: absolute; zIndex: 1000`).row.fit
    slot(name="empty")
  div(v-if="fragment" style=`position: absolute; zIndex: 900; height: 60px; right: 0px; top: 0px`).row.items-center.q-px-xs
    slot(name="actions")
  div(v-if="!ready && preview" style=`position: absolute; zIndex: 800`).row.fit
    img(v-if="preview" :src="preview" width="100%" height="100%" @click="ready = true")
  div(v-else-if="type === 'VIDEO'").row.fit
    node-video(
      :index="index"
      :url="mini ? fragment.url : fragment.content.url"
      :startSec="getStartSec"
      :endSec="getEndSec"
      :mini="mini")
  div(v-else-if="type === 'IMAGE'").row.fit.bg-green
  //-   node-image(:url="fragment.content.url")
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'
export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    index: {type: Number},
    fragment: {type: Object},
    preview: {type: String},
    visible: {type: Boolean},
    mini: {type: Boolean}
  },
  methods: {
    contentReady (val) {
      this.$log('contentReady', val)
      this.ready = true
    }
  },
  computed: {
    type () {
      if (this.fragment) return this.fragment.content.type
      else return null
    },
    getStartSec () {
      if (this.fragment.relativePoints.length > 0) {
        return this.fragment.relativePoints[0]['x']
      } else {
        return 0
      }
    },
    getEndSec () {
      if (this.fragment.relativePoints.length > 1) {
        return this.fragment.relativePoints[1]['x']
      } else {
        return 10
      }
    }
  },
  data () {
    return {
      state: 'preview',
      states: ['none', 'preview', 'active'],
      // type: 'none',
      types: ['image', 'video', 'none'],
      editor: null,
      editorReady: false,
      started: false,
      ready: false
    }
  }
}
</script>
