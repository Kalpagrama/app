<template lang="pug">
.column.fit.items-center.justify-center
  //- span {{ share }}
</template>

<script>
  import { Store, get, clear } from 'src/statics/scripts/idb-keyval/idb-keyval.mjs'
  export default {
  name: 'shareLayout',
  data () {
    return {
    }
  },
  watch: {
    $route: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$logD('$route CHANGED', to)
        // this.$set(this, 'share', to.params)
      }
    }
  },
  async mounted () {
    this.$logD('mounted')
    const swShareStore = new Store('sw-share', 'request-formData')
      let formData = await get('formData', swShareStore)
    this.$logD('formData=', formData)
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
