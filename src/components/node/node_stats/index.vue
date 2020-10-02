<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '10px', overflow: 'hidden',
  }`
  ).row.full-width.b-30
  //- header
  //- .row.full-width.q-px-md
    q-tabs(
      v-model="viewId"
      dark active-color="green"
      ).text-grey-8.full-width
      q-tab(v-for="(v,vi) in views" :key="v.id" :name="v.id" :icon="v.icon")
  //- views
  div(:style=`{borderRadius: '10px',}`).row.full-width.b-40
    component(
      v-if="stats"
      :is="`view-voted`" :stats="stats"
      :style=`{
        minHeight: '400px',
      }`
      @close="$emit('close')")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import viewVoted from './view_voted.vue'

export default {
  name: 'nodeStats',
  props: ['node'],
  components: {
    viewRemade: () => import('./view_remade.vue'),
    viewJoined: () => import('./view_joined.vue'),
    viewShared: () => import('./view_shared.vue'),
    viewBookmarked: () => import('./view_bookmarked.vue'),
    // viewVoted: () => import('./view_voted.vue'),
    viewVoted,
  },
  data () {
    return {
      viewId: 'voted',
      stats: null,
    }
  },
  computed: {
    views () {
      return [
        {id: 'remade', icon: 'cached'},
        {id: 'joined', icon: 'link'},
        {id: 'shared', icon: 'share'},
        {id: 'bookmarked', icon: 'bookmark'},
        {id: 'voted', icon: 'adjust'},
      ]
    }
  },
  async created () {
    this.$log('created')
    this.stats = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.node.oid}})
    // this.stats = {
    //   remade: [],
    //   joined: [],
    //   shared: [],
    //   bookmarked: [],
    //   voted: []
    // }
  }
}
</script>
