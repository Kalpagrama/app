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
  q-resize-observer(@resize="onResize")
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
      v-if="composition.outputType !== 'VIDEO'"
      :nodeOid="nodeOid"
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible"
      :height="height"
      :width="width"
      :style=`{
        position: 'absolute', zIndex: 200, bottom: '0px', left: '0px', right: '0px', transform: 'translate3d(0,0,10px)',
      }`)
    from-video(
      v-if="composition.outputType === 'VIDEO'"
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible"
      :objectFit="isSquare ? 'cover' : null"
      :height="height"
      :width="width")
      template(v-slot:footer=`{player}`)
        context(
          :nodeOid="nodeOid"
          :composition="composition"
          :isActive="isActive"
          :isVisible="isVisible"
          :height="height"
          :width="width"
          :player="player"
          :style=`{
            position: 'absolute', zIndex: 200, bottom: '0px', left: '0px', right: '0px', transform: 'translate3d(0,0,10px)',
          }`)
    from-book(
      v-else-if="composition.outputType === 'BOOK'"
      :composition="composition"
      :isActive="isActive"
      :isVisible="isVisible"
      :objectFit="isSquare ? 'cover' : null"
      :height="height"
      :width="width")
    div(
      v-else
      :style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-start.content-start
      img(
        :src="url"
        :style=`{
          objectFit: isSquare ? 'fit' : 'contain',
          borderRadius: '10px',
        }`
        ).fit
  //- div(:style=`{height: '28px'}`).row.full-width
</template>

<script>
import { ContentApi } from 'src/api/content'
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
    'styles',
    'nodeOid',
    'isSquare'
  ],
  data () {
    return {
      playerComponent: {
        VIDEO: 'type-video',
        IMAGE: 'type-image',
        BOOK: 'type-book',
        WEB: 'type-web',
      },
      height: 0,
      width: 0,
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.composition) },
    paddingBottom () {
      if (this.isSquare) return 100
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
        if (r < 56.25) {
          r = 56.25
        }
        return r
      }
    }
  },
  watch: {
  },
  methods: {
    onResize (e) {
      this.width = e.width
      this.height = e.height
    }
  }
}
</script>
