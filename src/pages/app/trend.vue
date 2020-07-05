<template lang="pug">
trends-explorer(
  v-if="category"
  :category="category"
  )
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import assert from 'assert'

export default {
  name: 'pageApp--trend',
  data () {
    return {
      nodeCategories: [],
      category: null,
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
          this.category = this.nodeCategories.find(c => c.sphere.oid === to)
        } else {
          this.$router.replace({params: {oid: this.nodeCategories[0].sphere.oid}}) // идем на категорию "Все подряд"
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
