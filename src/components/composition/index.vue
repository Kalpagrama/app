<template lang="pug">
//- component(
//  :is="data.playerComponent[composition.outputType]"
//  v-bind="$props")
//  slot
div(
  :style=`{
  // borderRadius: '10px',
  // overflow: 'hidden',
}`
).row.full-width.bg-black
  q-resize-observer(@resize="onResize")
  div(
    :style=`{
    position: 'relative',
    paddingBottom: paddingBottom+'%',
    background: 'rgb(40,40,40)',
    // borderRadius: '10px',
  }`
  ).row.full-width.bg-black
    context(
      v-if="showContext && composition.outputType !== 'VIDEO'"
      :nodeOid="nodeOid"
      :composition="composition"
      :itemState="data"
      :isActive="isActive"
      :isVisible="isVisible"
      :height="data.height"
      :width="data.width"
      :style=`{
      position: 'absolute', zIndex: 200, bottom: '0px', left: '0px', right: '0px', transform: 'translate3d(0,0,10px)',
    }`)
    from-video(
      v-if="composition.outputType === 'VIDEO'"
      :composition="composition"
      :itemState="data"
      :isActive="isActive"
      :isVisible="isVisible"
      :objectFit="isSquare ? 'cover' : null"
      :height="data.height"
      :width="data.width"
      :options="options || data.options"
      :muted="muted"
      @playing="$emit('playing')"
      @ended="$emit('ended')"
    )
      template(v-slot:footer=`{player}`)
        context(v-if="showContext"
          :nodeOid="nodeOid"
          :composition="composition"
          :itemState="data"
          :isActive="isActive"
          :isVisible="isVisible"
          :height="data.height"
          :width="data.width"
          :player="player"
          :style=`{
          position: 'absolute', zIndex: 200, bottom: '0px', left: '0px', right: '0px', transform: 'translate3d(0,0,10px)',
        }`)
    from-book(
      v-else-if="composition.outputType === 'BOOK'"
      :composition="composition"
      :itemState="data"
      :isActive="isActive"
      :isVisible="isVisible"
      :objectFit="isSquare ? 'cover' : null"
      :height="data.height"
      :width="data.width")
    div(
      v-else
      :style=`{position: 'absolute', zIndex: 10,}`).row.fit.items-start.content-start
      img(
        :src="url"
        :style=`{
        objectFit: isSquare ? 'fit' : 'contain',
        // borderRadius: '10px',
      }`
      ).fit
</template>

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
<script>
import { ContentApi } from 'src/api/content'
import context from './context/index.vue'
import fromVideo from './from_video/index.vue'
import fromBook from './from_book/index.vue'
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'composition',
  components: {
    context,
    fromVideo,
    fromBook
  },
  props: {
    compositionKey: {},
    composition: {},
    showContext: { type: Boolean, default: true },
    itemState: {
      type: Object,
      default () {
        return {}
      }
    },
    isVisible: {},
    isActive: {},
    isMini: {},
    options: {},
    styles: {},
    nodeOid: {},
    isSquare: {},
    muted: { type: Boolean, default: false },
  },

  computed: {
    url () {
      return ContentApi.urlSelect(this.composition)
    },
    paddingBottom () {
      if (this.isSquare) return 100
      if (this.composition.outputType === 'BOOK') {
        return 56.25
      } else {
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
    },
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name + this.composition.oid
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          playerComponent: {
            VIDEO: 'type-video',
            IMAGE: 'type-image',
            BOOK: 'type-book',
            WEB: 'type-web'
          },
          height: 0,
          width: 0,
          options: {}
        }))
      }
      return this.itemState[key]
    }
  },
  methods: {
    onResize (e) {
      this.data.width = e.width
      this.data.height = e.height
    }
  }
}
</script>
