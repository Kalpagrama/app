<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  div(:style=`{position: 'absolute', top: 0, zIndex: 100, minHeight: '70px'}`).row.full-width.items-center.justify-between.q-px-md
    span.text-bold {{ $t(source.name) }}
    q-btn(round flat icon="more_horiz" color="grey-8" dense style=`opacity: 0.8`).bg-grey-9
  div(:style=`{position: 'relative', paddingTop: '100%'}`).row.full-width
    div(:style=`{position: 'absolute', top: 0, left: 0, right: 0}`).row.fit.items-center.justify-center.bg-red
      span {{$t('iframe')}}
  .col.scroll
    //- iframe(:src="" :src="videoUrlYoutube" playsinline)
</template>

<script>
export default {
  name: 'contentFinder__sourceYoutube',
  props: ['source'],
  data () {
    return {
      preview: ''
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
