<template lang="pug">
div(id="q-app")
  router-view
</template>

<script>
import Vue from 'vue'

export default {
  name: 'App',
  data () {
    return {
      name: 'kalpagrama',
      height: 100,
    }
  },
  created () {
    window.stores.storeApp = this
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    delete window.stores.storeApp
  }
}
</script>
