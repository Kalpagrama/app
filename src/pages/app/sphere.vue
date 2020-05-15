<template lang="pug">
component(
  v-if="sphere"
  :is="`${$route.name}-explorer`"
  :sphere="sphere"
  :loading="sphereLoading")
</template>

<script>
export default {
  name: 'pageApp-sphere',
  data () {
    return {
      sphere: null,
      sphereLoading: false,
      sphereLoadingError: null
    }
  },
  computed: {
    spheresTop () {
      return this.$store.state.node.categories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            oid: val.sphere.oid,
            name: val.sphere.name
          })
        }
        return acc
      }, [])
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.sphere = await this.sphereLoad(to)
        }
        else {
          if (this.$route.name === 'trends') {
            this.$router.replace({params: {oid: this.spheresTop[0].oid}})
          }
          else {
            this.$router.replace({params: {oid: this.$store.getters.currentUser.oid}})
          }
        }
      }
    }
  },
  methods: {
    async sphereLoad (oid) {
      try {
        this.$log('sphereLoad start', oid)
        this.sphereLoading = true
        let sphere = await this.$store.dispatch('objects/get', { oid, priority: 0 })
        this.$log('sphereLoad sphere', sphere)
        this.sphereLoading = false
        this.sphereLoadingError = null
        this.$log('sphereLoad done')
        return sphere
      }
      catch (e) {
        this.$log('sphereLoad error', e)
        this.sphereLoading = false
        this.sphereLoadingError = e
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
