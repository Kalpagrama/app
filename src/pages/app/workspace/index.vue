<template lang="pug">
router-view
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'pageWorkspace',
  data () {
    return {
    }
  },
  watch: {
    '$store.getters.currentUser.profile.tutorial': {
      immediate: true,
      async handler (to, from) {
        this.$log('user.profile.tutorial changed to', to)
        if (to && !to.workspace_first) {
          this.$store.commit('ui/stateSet', ['kalpaTutorial', {id: 'workspace_first', useIntro: true, useProfileEditor: true}])
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
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
