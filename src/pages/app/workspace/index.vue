<template lang="pug">
router-view
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'workspace',
  data () {
    return {
      user: this.$store.getters.currentUser()
    }
  },
  watch: {
    'user.profile.tutorial': {
      immediate: true,
      async handler (to, from) {
        this.$log('user.profile.tutorial changed to', to)
        if (to && !to.workspace_first) {
          this.$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'workspace_first', useIntro: true, useProfileEditor: true}])
        }
      }
    }
  },
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
