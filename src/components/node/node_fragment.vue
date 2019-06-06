<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- node-preview
  div(v-if="state === 'preview' && !$slots.none").row.fit.items-center.justify-center.bg-grey-2
    img(:src="preview" width="100%" height="100%" @click="state = 'active'")
  //- node-video
  node-video(v-if="visible && state === 'active' && type === 'VIDEO'" :url="fragment.content.url")
  //- node image
  node-image(v-if="visible && state === 'active' && type === 'IMAGE'" :url="fragment.content.url")
  //- node-quote
  //- node-audio
  //- none
  slot(v-if="type === 'none'" name="none" :type="type" :state="state")
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'
export default {
  name: 'nodeFragment',
  components: { nodeVideo, nodeImage },
  props: {
    type: {
      type: String,
      default: 'none'
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
      states: ['preview', 'active'],
      // type: 'none',
      types: ['image', 'video', 'none'],
      editor: null,
      editorReady: false
    }
  }
}
</script>
