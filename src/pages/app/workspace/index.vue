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
    this.$log('userTutorials.workspace_first', userTutorials.workspace_first)
    if (userTutorials.workspace_first === false) {
      this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'workspace_first', useIntro: true, useProfileEditor: false}])
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
