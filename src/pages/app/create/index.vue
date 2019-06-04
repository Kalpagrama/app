<template lang="pug">
.column.fit.bg-white
  //- workspace(v-if="false")
  editor-node(v-if="true")
</template>

<script>
// user drafs in workspace
import editorNode from './editor_node'
export default {
  name: 'pageApp_NodeCreate',
  components: {editorNode},
  data () {
    return {
    }
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
