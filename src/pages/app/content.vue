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
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to) {
          this.$log('$route CHANGED to.params.oid', to)
          this.content = await this.contentLoad(to)
        }
        else {
          this.$q.notify({color: 'red', textColor: 'white', message: 'No content!'})
        }
      }
    }
  },
  methods: {
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$rxdb.findByOid(oid, 0)
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
