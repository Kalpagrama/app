<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: options.isFit ? '100%' : 'auto',
    }`
  ).row.full-width.items-start.content-start
  //- content explorer btn
  transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    content-explorer(
      v-if="isActive"
      :composition="composition"
      :options="options")
  //- preview
  img(
    @click="$emit('previewClick')"
    :src="composition.thumbUrl"
    draggable="false"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      height: options.isFit ? '100%' : 'auto',
      objectFit: options.isFit ? 'contain' : 'contain'
    }`
    ).full-width
</template>

<script>
import contentExplorer from './content_explorer.vue'

export default {
  name: 'compositionPlayer_playerImage',
  components: {contentExplorer},
  props: {
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    options: {
      type: Object,
      default () {
        return {
          isFit: false,
        }
      }
    }
  },
  data () {
    return {
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        // this.$log('isActive TO', to, composition.oid)
      }
    },
  },
  methods: {
  },
  mounted () {
  }
}
</script>
