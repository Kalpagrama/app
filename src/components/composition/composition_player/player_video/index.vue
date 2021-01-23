<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: styles.height,
  }`
  ).row.full-width.items-start.content-start
  slot
  //- preview
  img(
    draggable="false"
    loading="lazy"
    :src="composition.thumbUrl"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      userSelect: 'none',
      height: styles.height,
      //- height: 'calc(' + styles.height + ' - 100px)',
      objectFit: styles.objectFit,
      //- border: (player && figures && player.currentTime < figures[0].t) ? '2px solid red' : '2px solid rgb(30,30,30)',
      marginBottom: marginBottom+'px',
    }`
    ).full-width
  //- video wrapper
  content-player(
    v-if="isActive && isVisible"
    @player="playerCreated"
    :contentKalpa=`{
      oid: composition.layers[0].contentOid,
      name: composition.layers[0].contentName,
      //- url: composition.url,
      url: compositionUrl,
      type: 'VIDEO',
      contentSource: 'KALPA',
    }`
    :isActive="isActive"
    :isVisible="isVisible"
    :isMini="isMini"
    :options="options"
    :figures="figures"
    :styles="styles"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
      //- opacity: (figures && player && (player.currentTime < figures[0].t || player.currentTime > figures[1].t)) ? 0 : 1
    }`).fit
</template>

<script>
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'compositionPlayer_Video',
  components: {
    contentPlayer
  },
  props: {
    composition: {type: Object, required: true},
    isActive: {type: Boolean},
    isVisible: {type: Boolean},
    isMini: {type: Boolean},
    options: {type: Object},
    styles: {type: Object, default: {}},
  },
  data () {
    return {
      player: null,
      marginBottom: 0,
    }
  },
  watch: {
    'player.figure': {
      handler (to, from) {
        if (to) {
          this.$tween.to(this, 0.3, {
            marginBottom: 230,
          })
        }
        else {
          this.$tween.to(this, 0.3, {
            marginBottom: 0
          })
        }
      }
    },
    // 'player.currentTime': {}
    // player: {
    //   handler (to, from) {
    //     if (to) {
    //       if (this.composition.outputType === 'VIDEO') {
    //         // let arr = this.composition.url.split('#t=')
    //         // if (arr.length > 1) {
    //         //   let [start, end] = arr[1].split(',')
    //         //   this.player.setCurrentTime(parseFloat(start))
    //         // }
    //         // else {
    //         //   // do nothing
    //         // }
    //         this.player.play()
    //       }
    //     }
    //   }
    // }
  },
  computed: {
    compositionUrl () {
      if (this.composition.outputType === 'VIDEO') {
        let arr = this.composition.url.split('#t=')
        if (arr.length > 1) {
          // return arr[0]
          return this.composition.url
        }
        else {
          // return arr[0]
          return this.composition.url
        }
      }
      else {
        return this.composition.url
      }
    }
  },
  methods: {
    playerCreated (player) {
      this.$log('playerCreated', player)
      this.player = player
      if (this.composition.outputType === 'VIDEO') {
        let arr = this.composition.url.split('#t=')
        if (arr.length > 1) {
          let [start, end] = arr[1].split(',')
          let figureOffset = [
            {t: parseFloat(start)},
            {t: parseFloat(end)},
          ]
          this.player.setState('figureOffset', figureOffset)
        }
      }
    }
  },
  mounted () {
    // this.$log('mounted')
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
