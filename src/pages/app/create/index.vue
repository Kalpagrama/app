<template lang="pug">
.column.fit.bg-white
  //- workspace(v-if="false")
  //- editor-node(v-if="true")
  router-view
</template>

<script>
// user drafs in workspace
import editorNode from 'components/editor_node'
export default {
  name: 'pageApp_Create',
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
