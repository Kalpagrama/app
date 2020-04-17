<template lang="pug">
.row.full-width.window-height.items-center.content-center.justify-center
  q-spinner(color="green" size="50px")
</template>

<script>
export default {
  name: 'pageApp-logout',
  async mounted () {
    await this.$wait(1000)
    await this.$store.dispatch('cache/clear')
    await this.$store.dispatch('auth/logout')
  }
}
</script>
