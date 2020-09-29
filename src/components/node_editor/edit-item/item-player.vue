<template lang="pug">
.row.fit.items-start.content-start
    //- player START
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
    //- player STOP
    q-btn(
      v-if="playerPlaying"
      @click="playerPlaying = false, player = null"
      flat dense color="white"
      :style=`{
        position: 'absolute', zIndex: 1000,
        top: 'calc(50% - 20px)', left: '0px',
        //- borderRadius: '50%',
      }`)
      q-icon(name="stop" color="white" size="30px")
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
      v-if="player && playerPlaying"
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
          :barStyles=`{
            background: 'rgba(0,0,0,0.5)',
            border: '2px solid #4caf50',
          }`
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
  props: ['isActive', 'item'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      playerPlaying: false
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive TO', to)
        if (to) {
          this.playerPlaying = true
        }
        else {
          this.playerPlaying = false
        }
      }
    }
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
