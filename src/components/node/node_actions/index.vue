<template lang="pug">
.row.full-width.items-center.content-center.q-pa-sm
  q-btn(
    round flat dense color="grey-9" icon="bookmark_outline").q-mr-sm
  q-btn(
    round flat dense color="grey-9")
    q-icon(name="logout").rotate-270
  .col
  vote-ball(
    :node="node"
    @click.native="voteBallClick")
</template>

<script>
import voteBall from './vote_ball.vue'

export default {
  name: 'nodeActionsRight',
  props: ['node'],
  components: {
    voteBall,
  },
  methods: {
    voteBallClick () {},
  },
}
</script>
