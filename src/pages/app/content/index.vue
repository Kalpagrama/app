<template lang="pug">
div(:style=`{height: $q.screen.height+'px'}`).row.full-width
  composition(
    v-if="content"
    ctx="workspace" :value="{layers: [{content, figuresAbsolute: [], figuresRelative: [], spheres: []}]}" :visible="true" :active="true" :mini="false")
</template>

<script>
export default {
  name: 'pageAppContent',
  components: {},
  props: [],
  data () {
    return {
      content: null
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler (to, from) {
        if (to && to.params.oid) {
          this.$log('$route CHANGED to.params.oid', to.params.oid)
          this.content = null
          await this.$wait(300)
          this.content = await this.contentLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    async contentFound (content) {
      this.$log('contentFound', content)
      // add content to ws
      let res = await this.$store.dispatch('workspace/wsItemAdd', content.oid)
      this.$log('res', res)
      // go to content/oid
      this.$router.push('/content/' + content.oid)
    },
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
