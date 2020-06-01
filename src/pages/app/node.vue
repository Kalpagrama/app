<template lang="pug">
node-explorer(:node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp-node',
  data () {
    return {
      node: null,
      nodeLoading: false,
      nodeLoadingError: null
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.node = await this.nodeLoad(to)
        }
      }
    }
  },
  methods: {
    async nodeLoad (oid) {
      try {
        this.$log('nodeLoad start', oid)
        this.nodeLoading = true
        let sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
        this.$log('nodeLoad sphere', sphere)
        this.nodeLoading = false
        this.nodeLoadingError = null
        this.$log('nodeLoad done')
        return sphere
      }
      catch (e) {
        this.$log('nodeLoad error', e)
        this.nodeLoading = false
        this.nodeLoadingError = e
        return null
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
