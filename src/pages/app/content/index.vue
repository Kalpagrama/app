<template lang="pug">
div(:style=`{height: height+'px'}`).row.full-width
  content-explorer
</template>

<script>
import contentExplorer from 'components/content_explorer'

export default {
  name: 'pageApp__Content',
  components: {contentExplorer},
  props: ['width', 'height'],
  data () {
    return {
    }
  },
  watch: {
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
