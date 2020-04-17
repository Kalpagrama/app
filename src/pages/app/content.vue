<template lang="pug">
content-explorer(v-if="content" :content="content")
</template>

<script>
export default {
  name: 'pageApp-content',
  data () {
    return {
      content: null
    }
  },
  computed: {
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to && to.params.oid) {
          this.$log('$route CHANGED to.params.oid', to.params.oid)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, priority: 0 })
      this.$log('contentLoad done', content)
      return content
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
