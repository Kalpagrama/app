<template lang="pug">
div(
  :style=`{
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: '32px', paddingRight: '32px',
  }`
  ).row.full-width.items-center.content-center.justify-between
  q-btn(round flat color="white" no-caps icon="west" stack @click="$router.back()")
  div(v-if="$q.screen.gt.sm").col
  q-btn(
    flat no-caps icon="filter_tilt_shift"
    :color="pageId === 'drafts' ? 'green' : 'white'"
    :style=`{height: '44px',}`
    @click="$emit('pageId', 'drafts')"
    ).col
  q-btn(
    flat no-caps icon="adjust"
    :color="pageId === 'nodes' ? 'green' : 'white'"
    :style=`{height: '44px',}`
    @click="$emit('pageId', 'nodes')"
    ).col
  q-btn(
    flat no-caps
    :color="pageId === 'info' ? 'green' : 'white'"
    @click="$emit('pageId', 'info')"
    :style=`{height: '44px',}`
    ).col
    q-icon(name="fas fa-info" size="19px")
  div(v-if="$q.screen.gt.sm").col
  kalpa-menu-popup-global(
    :showLabel="false"
    :offset="[16,0]"
    :style=`{
      width: '44px',
      height: '44px',
    }`)
</template>

<script>
export default {
  name: 'navBottom',
  props: ['pageId'],
  data () {
    return {
    }
  },
  computed: {
  }
}
</script>
