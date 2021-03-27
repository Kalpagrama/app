<template lang="pug">
//- component(
  :is="playerComponent[composition.outputType]"
  v-bind="$props")
  slot
div(
  :style=`{
    borderRadius: '10px',
    overflow: 'hidden',
  }`
  ).row.full-width.bg-black
  div(
    :style=`{
      position: 'relative',
      paddingBottom: paddingBottom+'%',
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
      //- overflow: 'hidden',
    }`
    ).row.full-width.bg-black
    context(
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible"
      :style=`{
        position: 'absolute', zIndex: 200, bottom: '-28px', left: '0px', right: '0px',
      }`)
    from-video(
      v-if="composition.outputType === 'VIDEO'"
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible")
    from-book(
      v-else-if="composition.outputType === 'BOOK'"
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible")
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
  div(:style=`{height: '28px'}`).row.full-width
</template>

<script>
import context from './context/index.vue'
import fromVideo from './from_video/index.vue'
import fromBook from './from_book/index.vue'

export default {
  name: 'composition',
  components: {
    context,
    fromVideo,
    fromBook,
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
      if (this.composition.outputType === 'BOOK') {
        return 56.25
      }
      else {
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
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>
