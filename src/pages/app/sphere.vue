<template lang="pug">
sphere-explorer(
  v-if="sphere"
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
          this.$router.replace({params: {oid: this.$store.getters.currentUser.oid}})
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
