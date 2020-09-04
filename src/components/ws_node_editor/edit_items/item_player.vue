<style lang="sass">
.q-carousel__control
  z-index: 1000 !important
  bottom: 100px
.q-carousel
  height: auto !important
</style>

<template lang="pug">
.row.full-width.b-30
  //- item player wrapper...
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start.b-30
    //- item preview
    img(
      :src="item.thumbUrl" draggable="false"
      :style=`{
        borderRadius: '10px', zIndex: 100,
        opacity: 0.1,
      }`).full-width
    //- div(:style=`{height: '400px',}`).row.full-width.bg-red
    //- item edit
    //- item add
    //- q-btn(
      v-if="player"
      @click="$emit('itemAdd')"
      round push color="green" icon="add"
      :style=`{
        position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
        right: '20px', top: 'calc(50% - 20px)',
        borderRadius: '50%'
      }`)
    //- item player
    ws-content-player(
      v-if="isActive && contentKalpa"
      :contentKalpa="contentKalpa"
      @player="player = $event"
      :options=`{
        showBar: false,
        showActions: false,
      }`
      :style=`{
        position: 'absolute', zIndex: 100,
      }`).fit
    //- composition bar wrapper
    //- div(
      :style=`{
        position: 'absolute', zIndex: 3100, bottom: '0px',
        height: '50px',
      }`
      ).row.full-width.bg-yellow
    div(
      v-if="isActive && player"
      :style=`{
        position: 'absolute', zIndex: 3000, order: -1,
        bottom: '0px', height: '74px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '600px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '10px',
        }`
        ).row.fit
        composition-bar(
          :isActive="true"
          :player="player" :contentKalpa="contentKalpa"
          :composition="item"
          actionsPosition="top"
          :style=`{
            maxHeight: '40px',
          }`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import wsContentPlayer from 'components/ws_content_player/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'wsNodeEditor_itemPlayer',
  components: {wsContentPlayer, compositionBar},
  props: ['isActive', 'item', 'itemIndex'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      playerStarted: false,
    }
  },
  watch: {
    // 'player.currentTime': {
    //   handler (to, from) {
    //     this.$log('player.currentTime TO', to)
    //     if (!this.playerStarted) {
    //       this.playerStarted = true
    //     }
    //     // handle T changes...
    //   }
    // }
  },
  methods: {
    // playerCreated (player) {
    //   this.$log('playerCreated', player)
    //   this.player = player
    //   let t = this.item.layers[0].figuresAbsolute[0].t
    //   this.player.setCurrentTime(t)
    //   this.$wait(500).then(() => {
    //     this.playerStarted = true
    //   })
    // },
  },
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.layers[0].contentOid)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
