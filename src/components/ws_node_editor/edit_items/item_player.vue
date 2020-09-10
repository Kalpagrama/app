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
    //- item player toggle...
    q-btn(
      v-if="!playerPlaying"
      @click="playerPlaying = true"
      round flat color="white"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: 'calc(50% - 50px)', left: 'calc(50% - 50px)',
        borderRadius: '50%',
      }`)
      q-icon(name="play_arrow" color="white" size="100px")
    q-btn(
      v-if="playerPlaying"
      @click="playerPlaying = false, player = null"
      round flat color="white"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: '10px', left: 'calc(50% - 25px)',
        borderRadius: '50%',
      }`)
      q-icon(name="clear" color="white" size="50px")
    //- item player
    ws-content-player(
      v-if="playerPlaying && isActive && contentKalpa"
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
    div(
      v-if="player"
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

import wsContentPlayer from 'components/content_player/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'wsNodeEditor_itemPlayer',
  components: {wsContentPlayer, compositionBar},
  props: ['isActive', 'item', 'itemIndex'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      playerPlaying: false
    }
  },
  watch: {
  },
  methods: {
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
