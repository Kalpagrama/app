<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="search" color='grey-7' @click="searchStart()")
  .col.full-width
    .row.full-width.items-start.content-start
      div(
        v-for="(s, si) in subscriptions" :key="si"
        :style=`{minHeight: '60px'}`
        ).row.full-width.items-center
        small {{ s }}
</template>

<script>
export default {
  name: 'pageApp__home__subscriptions',
  data () {
    return {
    }
  },
  computed: {
    subscriptions () {
      return this.$store.getters.currUser.subscriptions
    }
  },
  methods: {
    searchStart () {
      this.$logD('searchStart')
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
