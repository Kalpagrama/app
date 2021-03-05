<template lang="pug">
div(
  v-if="node"
  ).row.full-width.justify-center
  node-feed(
    :node="node"
    :isActive="true"
    :isVisible="true"
    :showActions="false")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAppNodeRender',
  data () {
    return {
      node: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  created () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
