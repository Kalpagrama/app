<template lang="pug">
workspace
</template>

<script>
// TODO: code splitting in vue.js app
import workspace from 'components/workspace'

export default {
  name: 'page_app_workspace',
  components: {workspace},
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  },
  watch: {
  },
  async mounted () {
    this.$log('mounted')
    // upload workspace?
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
