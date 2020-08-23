<template lang="pug">
//- node-explorer(:node="node" :nodeProgress="nodeProgress")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp-node',
  data () {
    return {
      node: null,
      nodeLoading: false,
      nodeLoadingError: null,
      nodeProgress: null,
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    },
    createProgress () {
      return this.$store.state.core.progressInfo.CREATE
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', this.$store.state.core.progressInfo.CREATE)
        if (to) {
          if (this.node && this.node.oid === to) return
          this.node = null
          await this.$wait(200)
          if (!this.nodeProgress) {
            this.node = await this.nodeLoad(to)
          }
        }
      }
    },
    '$store.state.core.progressInfo.CREATE': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('*** CREATE', to)
        if (to && to[this.oid]) {
          this.nodeProgress = to[this.oid]
          this.$log('*** nodeProgress ***' + this[this.oid])
          if (to[this.oid] === 100) {
            this.node = await this.nodeLoad(this.oid)
          }
        }
      }
    },
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
