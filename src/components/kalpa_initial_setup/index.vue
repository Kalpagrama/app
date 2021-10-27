<template lang="pug">

</template>

<script>
import { ObjectApi } from 'src/api/object'

export default {
  name: 'kalpaInitialSetup',
  props: {
  },
  data () {
    return {
    }
  },
  created () {
    this.$log('created')
  },
  async mounted () {
    this.$log('mounted')
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
    // await ObjectApi.update(this.$store.getters.currentUser.oid, 'profile.tutorial', tutorialCurrent)
  }
}
</script>
