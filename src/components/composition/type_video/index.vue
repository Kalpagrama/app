<template lang="pug">
div(
  :style=`{
  position: 'relative',
  height: styles.height,
  borderRadius: '10px',
  background: 'rgb(10,10,10)',
}`
).row.full-width.items-start.content-start
  slot
  //- preview
  //- loading="lazy"
  img(
    draggable="false"
    :key="compositionKey"
    :src="composition.thumbUrl"
    :style=`{
    borderRadius: '10px', overflow: 'hidden',
    userSelect: 'none',
    height: styles.height,
    objectFit: styles.objectFit,
    //- objectFit: 'cover',
    //- opacity: previewOpacity,
    //- opacity: isActive ? videoOpacity === 0 ? 1 : 0 : 1,
  }`
  ).full-width
  //- video wrapper
  content-player(
    v-if="isActive && isVisible"
    @player="playerCreated"
    :contentKalpa=`{
    oid: composition.layers[0].contentOid,
    name: composition.layers[0].contentName || 'Контекст',
    url: url,
    type: 'VIDEO',
    // contentSource: 'KALPA',
  }`
    :options="options"
    :styles="styles"
    :style=`{
    position: 'absolute', zIndex: 100, top: '0px',
    //- opacity: videoOpacity,
  }`).fit
</template>

<script>
import contentPlayer from 'src/components/content_player/index.vue'
import { assert } from 'src/system/common/utils'
import { ContentApi } from 'src/api/content'

export default {
  name: 'typeVideo',
  components: {
    contentPlayer
  },
  props: {
    compositionKey: { type: String },
    composition: { type: Object, required: true },
    isActive: { type: Boolean },
    isVisible: { type: Boolean },
    isMini: { type: Boolean },
    options: { type: Object },
    styles: {
      type: Object,
      default () {
        return {}
      }
    },
    muted: { type: Boolean, default: false },
  },
  data () {
    return {
      player: null
    }
  },
  computed: {
    url () {
      return ContentApi.urlSelect(this.composition)
    },
    previewOpacity () {
      if (this.player) {
        if (this.player.duration) {
          return 0
        } else {
          return 1
        }
      } else {
        return 1
      }
    },
    figureOffset () {
      let arr = this.url.split('#t=')
      if (arr.length > 1) {
        let [start, end] = arr[1].split(',')
        return [
          { t: parseFloat(start) },
          { t: parseFloat(end) }
        ]
      } else {
        return null
      }
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
        } else {
          this.player = null
        }
      }
    },
    'player.currentTime': {
      handler (to, from) {
        // if (!this.player) return
        if (to && to >= this.player.duration) {
          // this.$log('player.currentTime === player.duration')
          this.player.setCurrentTime(0)
          this.player.play()
        }
      }
    }
  },
  methods: {
    videoLoaded () {
      // this.$log('videoLoaded', this.compositionKey)
    },
    playerCreated (player) {
      // this.$log('playerCreated', player)
      this.player = player
      if (this.figureOffset) this.player.setState('figureOffset', this.figureOffset)
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeUnmount () {
    // this.$log('beforeDestroy')
  }
}
</script>
