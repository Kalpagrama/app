<template lang="pug">
  div#q-app
    router-view
</template>

<script>
export default {
    name: 'App',
    beforeMount() {
      this.$store.commit('providers/init', this);
    }
};
</script>

<style>
</style>
