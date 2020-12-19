<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: styles.height,
    }`
  ).row.full-width.items-start.content-start
  //- preview
  img(
    draggable="false"
    loading="lazy"
    :src="composition.thumbUrl"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      height: styles.height,
      objectFit: styles.objectFit,
      //- border: (player && player.currentTime < figures[0].t) ? '2px solid red' : 'none'
    }`
    ).full-width
  //- video wrapper
  content-player(
    v-if="isActive && isVisible"
    @player="player = $event"
    :contentKalpa=`{
      url: composition.url,
      type: 'VIDEO',
      contentSource: 'KALPA',
    }`
    :figures="figures"
    :styles=`{
      height: styles.height,
      objectFit: styles.objectFit,
    }`
    :options=`{
      mini: true,
      showBar: options.showBar
    }`
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      borderRadius: '10px',
      opacity: (figures && player && (player.currentTime < figures[0].t || player.currentTime > figures[1].t)) ? 0 : 1
    }`).fit
  //- .row.full-width.bg-red
    span {{ figures }}
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'compositionPlayer_playerVideo',
  components: {
    contentPlayer
  },
  props: {
    oid: {type: String},
    isVisible: {type: Boolean},
    isActive: {type: Boolean},
    composition: {type: Object, required: true},
    styles: {type: Object, default: {}},
    options: {
      type: Object,
      default () {
        return {
          loop: true,
          showBar: true
        }
      }
    }
  },
  data () {
    return {
      player: null,
    }
  },
  computed: {
    figures () {
      if (this.composition.outputType === 'VIDEO') {
        let arr = this.composition.url.split('#t=')
        if (arr.length > 1) {
          let [start, end] = arr[1].split(',')
          return [
            {t: parseFloat(start)},
            {t: parseFloat(end)},
          ]
        }
        else {
          return false
        }
      }
      else {
        return false
      }
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
