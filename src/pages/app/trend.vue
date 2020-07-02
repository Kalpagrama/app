<template lang="pug">
trends-explorer(
  v-if="sphere"
  :sphere="sphere"
  )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp--trend',
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
            name: val.alias // val.sphere.name
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
        if (this.nodeCategories.length === 0) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
        if (to) {
          this.sphere = await this.sphereLoad(to)
        } else {
          this.$router.replace({params: {oid: this.nodeCategories[4].sphere.oid}})
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
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
