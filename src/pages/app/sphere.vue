<template lang="pug">
component(
  v-if="sphere"
  :is="`${$route.name}-explorer`"
  :sphere="sphere"
  :loading="sphereLoading")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

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
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (to) {
          this.sphere = await this.sphereLoad(to)
        } else {
          if (!this.nodeCategories.length) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
          // по-моему - что-то тут не так...
          if (this.nodeCategories.length > 4 && this.$route.name === 'trends') {
            this.$router.replace({params: {oid: this.nodeCategories[4].sphere.oid}})
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
        let sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, oid)
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
    if (!this.nodeCategories.length) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
