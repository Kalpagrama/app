<template lang="pug">
</template>

<script>
export default {
  name: 'pageAppRefresh',
  async mounted () {
    await this.$store.dispatch('cache/clear')
    await this.$store.dispatch('auth/logout')
    window.location.reload(true)
  }
}
</script>
