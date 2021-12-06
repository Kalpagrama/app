<template lang="pug">
router-view
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'pageWorkspace',
  data () {
    return {}
  },
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted')
    this.$eventBus.$emit('notice-check', { notice: 'tutorial_workspace', force: false })
  },
    beforeUnmount()
    {
      this.$log('beforeDestroy')
    }
  }
</script>
