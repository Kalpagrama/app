<template lang="pug">
div(:style=`{position: 'relative'}`).row.full-width
  div.row.full-height.bg-black
    slot(name="menuDesktop")
  .col
    content-explorer(
      v-if="$route.params.oid && content" :content="content"
      @create="content = null, $router.push('/content')")
    div(v-if="$route.params.oid && !content").row.fit.items-center.content-center.justify-center.bg-black
      q-spinner(size="50px" color="green")
    content-finder(
      v-if="!$route.params.oid"
      :sources="['device', 'url', 'ws']"
      :style=`{height: $q.screen.height+'px'}`
      ).bg-black
</template>

<script>
import contentFinder from 'components/content/finder'
import contentExplorer from 'components/content/explorer'

export default {
  name: 'pageAppContent',
  components: {contentExplorer, contentFinder},
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
    async contentLoad (oid) {
      this.$log('contentLoad start', oid)
      let content = await this.$store.dispatch('objects/get', { oid, fragmentName: 'objectFullFragment', priority: 0 })
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
