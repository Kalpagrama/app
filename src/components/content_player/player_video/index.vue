<template lang="pug">
player-default(
  v-bind="$props"
  @player="player = $event, $emit('player', $event)")
</template>

<script>
import playerDefault from './player_default/index.vue'
import playerPult from './player_pult/index.vue'

export default {
  name: 'contentPlayer__video',
  components: {
    playerDefault,
    playerPult
  },
  props: {
    contentKalpa: { type: Object, required: true },
    options: {type: Object},
  },
  emits: ['player'],
  data () {
    return {
      player: null
    }
  },
}
</script>
