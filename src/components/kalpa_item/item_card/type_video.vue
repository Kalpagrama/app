<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-stat.content-start
  img(
    draggable="false"
    :src="item.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`).full-width
  content-player(
    v-if="contentKalpa"
    @player="playerReady"
    :contentKalpa="contentKalpa"
    :isActive="true"
    :isVisible="true"
    :isMini="false"
    :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
    }`
    :options=`{
      loop: true,
      //- nodeOid: node.oid,
      footerOverlay: true,
      showBar: false,
      showHeader: true,
      showFooter: true,
      showContext: false,
      mode: 'feed',
    }`
    :styles=`{
      height: '100%',
      objectFit: 'contain',
    }`
    ).fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'

export default {
  name: 'typeVideo',
  components: {
    contentPlayer
  },
  props: ['item', 'isActive'],
  data () {
    return {
      contentKalpa: null,
      player: null,
    }
  },
  computed: {
    start () {
      return this.item.layers[0].figuresAbsolute[0].t
    },
    end () {
      return this.item.layers[0].figuresAbsolute[1].t
    }
  },
  watch: {
    item: {
      immediate: true,
      async handler (to, from) {
        this.$log('item TO', to.layers[0].contentOid)
        this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to.layers[0].contentOid)
      }
    },
    'player.currentTime': {
      handler (to, from) {
        if (to < this.start) this.player.setCurrentTime(this.start)
        if (to > this.end) this.player.setCurrentTime(this.start)
      }
    },
    isActive: {
      handler (to, from) {
        this.$log('isActive', to)
        if (!this.player) return
        if (to) {
          this.player.play()
        }
        else {
          this.player.pause()
        }
      }
    }
  },
  methods: {
    playerReady (player) {
      this.$log('playerReady', player)
      this.player = player
      if (!this.isActive) this.player.pause()
      // this.player.setState('figureOffset', this.item.layers[0].figuresAbsolute)
    }
  }
}
</script>
