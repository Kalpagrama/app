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
  //- middle controls
  div(v-if="$q.screen.gt.sm").col
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
  //- middle figure
  //- figures-controls(
    v-if="player.figures"
    :player="player" :contentKalpa="contentKalpa")
  div(v-if="$q.screen.gt.sm").col
  //- create player.figure
  q-btn(
    v-if="!player.figures"
    @click="figureCreate()"
    round flat color="green" icon="add_circle_outline")
  //- destroy player.figure
  q-btn(
    v-if="player.figures && !player.nodePlaying"
    @click="figureDelete()"
    round flat color="red" icon="clear")
</template>

<script>
import figuresControls from './figures_controls.vue'

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
    figureCreate () {
      this.$log('figureCreate')
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы создать ядро, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        // remove nodePlaying
        this.player.setState('nodePlaying', null)
        let start = this.player.currentTime
        let end = start + 30 > this.player.duration ? this.player.duration : start + 30
        let figures = [{t: start, points: []}, {t: end, points: []}]
        this.player.setState('figures', figures)
        // this.player.events.emit('figure-create')
      }
    },
    figureDelete () {
      this.$log('figureDelete')
      this.player.setState('figures', null)
      // this.player.events.emit('figure-delete')
    },
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
