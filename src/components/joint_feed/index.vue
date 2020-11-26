<template lang="pug">
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionPlayer from 'components/composition/composition_player/index.vue'

export default {
  name: 'jointFeed',
  props: {
  },
  components: {
    compositionPlayer,
    nodeActions: () => import('components/node/node_actions.vue')
  },
  data () {
    return {
      stats: null,
      itemOpened: 0,
      itemActive: 0,
      rightItemOpened: false,
    }
  },
  methods: {
    jointClick () {
      this.$log('jointClick')
      this.$router.push(`/joint/${this.joint.oid}`).catch(e => e)
    }
  },
  async mounted () {
    // this.$log('mounted')
    // this.stats = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'objectStat', {params: {oid: this.joint.oid}})
  }
}
</script>
