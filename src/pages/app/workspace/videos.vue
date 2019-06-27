<template lang="pug">
div(style=`position: relative`).column.fit
  //- q-btn(style=`position: absolute; bottom: 10px; right: 10px` color="primary" round icon="add" size="lg" @click="videoAdd")
  slot(name="header")
  .col.scroll
</template>

<script>
export default {
  name: 'pageApp__Workspace__Videos',
  data () {
    return {
    }
  },
  methods: {
    videoAdd () {
      this.$log('videoAdd')
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
