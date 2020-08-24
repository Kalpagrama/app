<style lang="sass">
.feed-item
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  router-link(
    v-for="(n,ni) in 100" :key="n" :to="'/feeds/feed/'+n"
    :style=`{
      height: '60px', borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-center.content-center.q-pa-md.b-50.q-mb-xs.feed-item
    span.text-white.text-bold Feed {{ ni }}
  q-page-sticky(position="bottom" :offset="[0, 60]")
    q-btn(
      @click="feedAddStart()"
      push round color="green" icon="add"
      :style=`{borderRadius: '50%'}`)
</template>

<script>
export default {
  name: 'pageApp__feeds__home',
  data () {
    return {
    }
  },
  methods: {
    feedAddStart () {
      this.$log('feedAddStart')
    }
  }
}
</script>
