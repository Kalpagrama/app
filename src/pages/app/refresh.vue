<template lang="pug">
.row.full-width.window-height.items-center.content-center.justify-center
  q-spinner(color="green" size="50px")
</template>

<script>
export default {
  name: 'pageApp-refresh',
  // beforeRouteEnter (to, from, next) {
  //   let refreshPath = localStorage.getItem('refresh-path')
  //   if (refreshPath) {
  //     if (refreshPath === '/refresh') refreshPath = '/'
  //     next(refreshPath)
  //   }
  //   else {
  //     next()
  //   }
  // },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED')
        let refreshPath = localStorage.getItem('refresh-path')
        this.$log('refreshPath', refreshPath)
        if (refreshPath) {
          if (refreshPath === '/refresh') refreshPath = '/'
          localStorage.removeItem('refresh-path')
          this.$router.replace(refreshPath).catch(e => e)
        }
        else {
          await this.$wait(200)
          await this.$store.dispatch('cache/clear')
          localStorage.setItem('refresh-path', from ? from.fullPath : '/')
          window.location.reload()
        }
      }
    }
  }
}
</script>
