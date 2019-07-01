<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  div(v-if="state !== 'active'" @click="state = 'active'"
    style=`position: absolute; zIndex: 500`).row.fit
    slot(name="editor")
    //- img(v-if="preview" :src="preview" width="100%" height="100%")
  div(v-if="type === 'VIDEO' && state === 'active'").row.fit
    node-video(
      @started="started = true"
      :index="index"
      :url="fragment.url"
      :startSec="getStartSec"
      :endSec="getEndSec")
      template(v-slot:actions)
        slot(name="actions")
  //- div(v-else-if="type === 'IMAGE' && state === 'active'").row.fit.bg-green
  //-   node-image(:url="fragment.content.url")
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'
export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    index: {
      type: Number
    },
    type: {
      type: String,
      default: 'VIDEO'
    },
    fragment: {
      default: () => {
        return {
          name: '',
          content: {
            type: 'VIDEO'
          }
        }
      }
    },
    visible: {
      type: Boolean
    },
    preview: {
      type: String
    }
  },
  computed: {
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
  watch: {
    type: {
      async handler (to, from) {
        this.$log('type CHANGED', to)
        if (to === 'VIDEO') {
        }
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
      started: false
    }
  }
}
</script>
