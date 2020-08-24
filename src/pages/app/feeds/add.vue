<template lang="pug">
.row.full-width.items-start.content-start
  h1.text-white feed creator...
  .row.full-width
    .col
    q-btn(color="green" no-caps @click="feedCreate()") Create feed
</template>

<script>
export default {
  name: 'pageApp__feeds__feedsAdd',
  data () {
    return {
    }
  },
  methods: {
    feedCreate () {
      this.$log('feedCreate')
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
