<template lang="pug">
router-view
</template>

<script>
export default {
  name: 'workspace',
  created () {
    this.$log('created')
    let userTutorials = this.$store.getters.currentUser().profile.tutorial
    this.$log('userTutorials', userTutorials)
    if (!userTutorials.workspace_first) {
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'workspace_first', mode: 'slides-only'}])
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
