<template lang="pug">
div(style=`position: relative`).column.fit
  q-btn(round icon="add" style=`position: absolute; bottom: 10px; right: 10px` color="primary" size="lg")
  slot(name="header")
  .col.scroll
</template>

<script>
export default {
  name: 'pageApp__Workspace__Nodes',
  data () {
    return {
    }
  },
  methods: {
    nodeCreate () {
      this.$log('nodeCreate')
    }
  },
  mounted () {
    this.$log('mounted')
    // load all the drafts of nodes from localStorage and parse in as nodes...
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
