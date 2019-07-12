<template lang="pug">
.column.fit
  div(style=`height: 60px; borderBottom: 1px solid #eee`
    ).row.full-width.items-center.bg-white.q-px-md
      span {{$t('explore')}}
  .col.scroll
</template>

<script>
export default {
  name: 'pageApp__Explore',
  meta: {
    title: 'Kalpa - Explore'
  },
  data () {
    return {
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
