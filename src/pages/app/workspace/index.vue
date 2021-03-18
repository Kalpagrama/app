<template lang="pug">
router-view
</template>

<script>
export default {
  mounted () {
    this.$log('mounted')
    let userTutorials = this.$store.getters.currentUser().profile.tutorial
    if (!userTutorials.content_first) {
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'workspace_first', mode: 'slides-only'}])
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
