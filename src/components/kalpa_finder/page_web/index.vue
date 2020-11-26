<template lang="pug">
q-page(
  :style=`{
    paddingTop: 8+40+'px',
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    position="top" expand
    :style=`{zIndex: 1000}`
    )
    .row.full-width.justify-start.q-px-md
      q-tabs(
        v-model="viewId"
        align="left"
        dense active-color="green" no-caps switch-indicator inline-label
        ).text-grey-6
        q-tab(name="all" label="Все")
        q-tab(name="image" label="Картинки")
        q-tab(name="video" label="Видео")
  //- body
  .row.full-width.justify-center
    span.text-white Searching DuckDuckGo...
</template>

<script>
export default {
  name: 'kalpaFinder_pageWeb',
  data () {
    return {
      viewId: 'all',
    }
  },
  mounted () {
    this.$log('mounted')
    // use duckduckgo search by word, and type, images, videos, webpages?
    // filter this shit...
  }
}
</script>
