<template lang="pug">
div(:style=`{position: 'relative'}`).row.fit
  //- div(style=`position: absolute`).row.full-width
  //- node-preview(v-if="!visible")
  div(v-if="!visible").row.fit.items-center.justify-center.bg-grey-2
    q-spinner(size="50px" color="primary" :thickness="2")
  //- preview video
  //- view video
  node-video(v-if="visible && type === 'VIDEO'" :fragment="fragment")
  node-image(v-if="visible && type === 'IMAGE'" :fragment="fragment")
  //- node-quote
  //- node-audio
  slot(v-if="type === 'none'" name="none" :type="type" :state="state")
</template>

<script>
import nodeVideo from './node_video'
import nodeImage from './node_image'
export default {
  name: 'fragment',
  components: { nodeVideo, nodeImage },
  props: {
    state: {
      type: String,
      default: 'preview'
    },
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
    }
  },
  watch: {
    state: {
      handler (to, from) {
        this.$log('state CHANGED', to)
      }
    },
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
      // state: 'loading',
      states: ['loading', 'preview', 'editing', 'ready', 'new'],
      // type: 'none',
      types: ['image', 'video', 'none'],
      editor: null,
      editorReady: false
    }
  }
}
</script>
