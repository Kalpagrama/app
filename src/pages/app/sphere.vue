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
      nodeCategories: [],
      sphere: null,
      sphereLoading: false,
      sphereLoadingError: null
    }
  },
  computed: {
     spheresTop () {
      return this.nodeCategories.reduce((acc, val) => {
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
    nodeCategories: {
      deep: false,
      immediate: true,
      async handler (to, from) {
        // по-моему - что-то тут не так...
        if (this.nodeCategories.length < 4) return
        if (!this.$route.params.oid){
          if (this.$route.name === 'trends') {
            this.$router.replace({params: {oid: this.nodeCategories[4].sphere.oid}})
          }
          else {
            this.$router.replace({params: {oid: this.$store.getters.currentUser.oid}})
          }
        }
      }
    },
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.sphere = await this.sphereLoad(to)
        }
      }
    }
  },
  methods: {
    async sphereLoad (oid) {
      try {
        this.$log('sphereLoad start', oid)
        this.sphereLoading = true
        let sphere = await this.$rxdb.findByOid(oid, 0)
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
  async beforeCreate() {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get('nodeCategories')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
