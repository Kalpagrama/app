<template lang="pug">
div(
  :style=`{
    paddingBottom: 'env(safe-area-inset-bottom)',
  }`
  ).row.full-width.items-center.content-center.justify-between.q-px-md
  q-btn(
    flat color="white" no-caps icon="west"
    :style=`{
      width: '50px', height: '50px',
    }`
    @click="$router.back()"
    )
    small {{$t('Back')}}
  //- .col
  q-btn(
    flat no-caps icon="filter_tilt_shift"
    :color="pageId === 'drafts' ? 'green' : 'white'"
    :style=`{
      width: '50px', height: '50px',
    }`
    @click="$emit('pageId', pageId === 'drafts' ? null : 'drafts')"
    )
    small {{$t('Drafts')}}
  q-btn(
    flat no-caps icon="adjust"
    :color="pageId === 'nodes' ? 'green' : 'white'"
    :style=`{
      width: '50px', height: '50px',
    }`
    @click="$emit('pageId', pageId === 'nodes' ? null : 'nodes')"
    )
    small {{$t('Nodes')}}
  q-btn(
    flat no-caps
    :color="pageId === 'info' ? 'green' : 'white'"
    @click="$emit('pageId', pageId === 'info' ? null : 'info')"
    :style=`{
      width: '50px', height: '50px',
    }`
    )
    q-icon(name="fas fa-info" size="19px").q-mb-xs
    small {{$t('Info')}}
  //- .col
  kalpa-menu-popup-global(
    :showLabel="true"
    color="white"
    :offset="[16,0]"
    :style=`{
      width: '50px', height: '50px',
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
