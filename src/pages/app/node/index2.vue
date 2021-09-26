<template lang="pug">
kalpa-layout()
  template(v-slot:footer)
    nav-mobile(
      v-if="$q.screen.lt.md"
      :pageId="pageId"
      @pageId="pageIdChange")
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        // образ
        .row.full-width.br
          div(:style=`{height: '200px'}`).col-6.br
            q-carousel(animated v-model="slide" thumbnails infinite)
              q-carousel-slide(:name="1" img-src="http://localhost:8282/images/rainbow.jpg")
              q-carousel-slide(:name="2" img-src="http://localhost:8282/icons/badge1.png")
              q-carousel-slide(:name="3" img-src="http://localhost:8282/icons/apple-launch-640x1136.png")
              q-carousel-slide(:name="4" img-src="http://localhost:8282/icons/icon-512x512.png")
          div(:style=`{height: '200px'}`).col-6.br описание
        // суть + смыслы + автор
        .row.full-width.br
          div(:style=`{height: '200px'}`) essence + author
        // actions
        .row.full-width.scroll.br
          div(:style=`{height: '50px', width: '700px', overflow: 'scroll'}`) actions
        // comments
        .row.full-width.br
          div(:style=`{height: '200px'}`) comments
        // similar
        .row.full-width.br
          div(:style=`{height: '200px'}`) similar

</template>

<script>

export default {
  name: 'pageApp_node2',
  components: {
  },
  data () {
    return {
     slide: 1
    }
  },
  async mounted () {
    this.$log('mounted', this.node)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
