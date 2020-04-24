<template lang="pug">
.column.full-width
  //- header
  .row.full-width.justify-center
    div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.content-center.q-px-md
      span.text-bold.text-white What in your workspace here
  //- body
  .col.full-width.scroll
    div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.justify-center
      //- span.text-white extra ws
</template>

<script>
export default {
  name: 'contentExplorer_extraWs',
  data () {
    return {
      count: null,
      countInterval: null
    }
  },
  computed: {
    one () {
      return this.count
    },
    two () {
      return this.one * 2
    }
  },
  mounted () {
    this.$log('mounted')
    // this.countInterval = setInterval(() => {
    //   this.count += 1
    // }, 2000)
    this.$wait(400).then(() => {
      this.count = 10
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // clearInterval(this.countInterval)
  }
}
</script>
