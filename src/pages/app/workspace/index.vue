<template lang="pug">
div(:style=`{height: '100vh'}`).row.full-width.justify-center.items-center.bg-grey-4
  span workspace
</template>

<script>
export default {
  name: 'pageApp__Workspace',
  components: {},
  data () {
    return {
    }
  },
  methods: {
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('$route CHANGED', to)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
