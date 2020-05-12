<template lang="pug">
div(id="q-app")
  router-view
</template>
<script>
  export default {
    name: 'App',
    mounted () {
      alert('app mounted: ' + window.location.toString())
    }
  }
</script>
