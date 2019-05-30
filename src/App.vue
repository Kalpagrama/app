<template lang="pug">
  div#q-app
    router-view
</template>

<script>
export default {
    name: 'App',
    beforeMount() {
      // this.$store.commit('providers/init', this);
    },
    mounted () {
      this.$log('mounted', this.$route)
      window.HELP_IMPROVE_VIDEOJS = false
    }
}
</script>
