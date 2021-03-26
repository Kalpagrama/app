<template lang="pug">
//- component(
  :is="playerComponent[composition.outputType]"
  v-bind="$props")
  slot
div(
  :style=`{
    position: 'relative',
    paddingBottom: paddingBottom+'%',
    background: 'rgb(40,40,40)',
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.bg-black
  from-video(
    v-if="composition.outputType === 'VIDEO'"
    :composition="composition"
    :isActive="isActive")
  div(
    v-else
    :style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-start.content-start
    img(
      :src="composition.thumbUrl"
      :style=`{
        objectFit: 'contain',
        borderRadius: '10px',
      }`
      ).fit
</template>

<script>
import fromVideo from './from_video/index.vue'

export default {
  name: 'composition',
  components: {
    fromVideo,
  },
  props: [
    'compositionKey',
    'composition',
    'isVisible',
    'isActive',
    'isMini',
    'options',
    'styles'
  ],
  data () {
    return {
      playerComponent: {
        VIDEO: 'type-video',
        IMAGE: 'type-image',
        BOOK: 'type-book',
        WEB: 'type-web',
      }
    }
  },
  computed: {
    paddingBottom () {
      let width = this.composition.thumbWidth
      let height = this.composition.thumbHeight
      let r = height / width * 100
      if (r > 100) {
        r = 100
      }
      if (r < 30) {
        r = 30
      }
      return r
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>
