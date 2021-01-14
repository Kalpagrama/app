<template lang="pug">
q-layout(
  view="hHh Lpr lff")
  q-drawer(
    side="right"
    v-model="menuOpened"
    )
    div(
      :style=`{
        borderRadius: '10px 0 0 10px',
      }`
      ).column.fit.b-30
      div(:style=`{height: '60px'}`).row.full-width.q-my-sm
      .col.full-width.scroll
        .row.full-width.items-start.content-start.q-px-sm
          div(v-for="n in 100" :key="n").row.full-width.q-pa-md.q-mb-sm.br {{ n }}
  q-header(
    reveal
    :style=`{
      paddingTop: 'env(safe-area-inset-top)'
    }`)
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-px-sm
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40.q-my-sm
          q-btn(
            round flat color="white" icon="construction")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
          q-btn(
            @click="menuOpened = true"
            round flat color="white" icon="menu")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '20px',
        paddingBottom: '70px',
      }`).column.full-width.justify-between
      widget-bookmarks
      widget-url
      //- create
      .row.full-width.q-pa-sm
        q-btn(
          outline color="green" no-caps
          :style=`{
            height: '60px',
          }`
          ).full-width Создать
</template>

<script>
export default {
  name: 'wsCreate',
  components: {
    widgetBookmarks: () => import('./widget_bookmarks/index.vue'),
    widgetUrl: () => import('./widget_url/index.vue')
  },
  data () {
    return {
      menuOpened: false,
    }
  },
  computed: {
  },
  watch: {
  },
  methods: {
    // itemFound (item) {
    //   this.$log('itemFound', item)
    //   this.contentKalpaFound(item)
    // },
    // contentKalpaFound (contentKalpa) {
    //   this.$log('contentKalpaFound', contentKalpa)
    //   this.$router.replace('/content/' + contentKalpa.oid)
    // }
  },
  mounted () {
    this.$log('mounted')
    // document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
