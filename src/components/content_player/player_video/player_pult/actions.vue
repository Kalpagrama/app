<template lang="pug">
div(
  :style=`{
    position: 'relative',
    height: '70px',
  }`
  ).row.full-width.items-center.content-center.justify-between.q-px-md
  //- left
  q-btn(
    @click="player.mutedToggle()"
    round flat
    :color="player.muted ? 'red' : 'white'"
    :icon="player.muted ? 'volume_off' : 'volume_up'")
  div(v-if="$q.screen.gt.sm").col
  //- controls default without figures
  div(
    v-if="player.nodeMode !== 'edit'"
    ).col-6
    .row.full-width.justify-between
      q-btn(
        @click="player.forward(false)"
        round flat  color="white" icon="replay_5").col
      q-btn(
        @click="player.playing ? player.pause() : player.play()"
        round flat color="white").col
        q-icon(
          size="34px"
          :name="player.playing ? 'pause' : 'play_arrow'")
      q-btn(
        @click="player.forward(true)"
        round flat  color="white" icon="forward_5").col
  //- controls for figures
  figures-controls(
    v-if="player.nodeMode === 'edit'"
    :player="player" :contentKalpa="contentKalpa")
  div(v-if="$q.screen.gt.sm").col
  //- create player.figure
  q-btn(
    v-if="player.nodeMode !== 'edit'"
    @click="nodeCreate()"
    round flat color="green" icon="add_circle_outline")
  //- destroy player.figure
  q-btn(
    v-if="player.node && player.nodeMode === 'edit'"
    @click="nodeDelete()"
    round flat color="red" icon="clear")
</template>

<script>
import figuresControls from './figures_controls.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'playerPult__actions',
  components: {
    figuresControls,
  },
  props: ['player', 'contentKalpa'],
  data () {
    return {
      actionsSize: 'md',
    }
  },
  methods: {
    nodeCreate () {
      this.$log('nodeCreate')
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы создать ядро, войдите в аккаунт'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        // Create node input
        let start = this.player.currentTime
        let end = start + 30 > this.player.duration ? this.player.duration : start + 30
        let figures = [{t: start, points: []}, {t: end, points: []}]
        let nodeInput = {
          name: '',
          category: null,
          spheres: [],
          layout: 'HORIZONTAL',
          vertices: [],
          items: [
            {
              id: Date.now().toString(),
              thumbUrl: this.contentKalpa.thumbUrl,
              thumbHeight: this.contentKalpa.thumbHeight,
              thumbWidth: this.contentKalpa.thumbWidth,
              outputType: 'VIDEO',
              layers: [
                {
                  id: Date.now().toString(),
                  contentOid: this.contentKalpa.oid,
                  figuresAbsolute: figures,
                },
              ],
              operation: { items: null, operations: null, type: 'CONCAT'},
              type: ObjectTypeEnum.COMPOSITION,
            },
          ]
        }
        this.player.setState('node', nodeInput)
        this.player.setState('nodeMode', 'edit')
        this.player.events.emit('node-created')
      }
    },
    nodeDelete () {
      this.$log('nodeDelete')
      this.player.setState('node', null)
      this.player.setState('nodeMode', null)
      this.player.events.emit('node-deleted')
    },
  }
}
</script>
