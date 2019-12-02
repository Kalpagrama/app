<template lang="pug">
workspace
</template>

<script>
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
    this.$logD('mounted')
    // upload workspace?
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
