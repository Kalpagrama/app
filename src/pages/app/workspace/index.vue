<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  //- q-drawer(
    side="right"
    v-model="menuOpened")
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
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(
          :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(
            round flat color="white" icon="construction")
          .col
            .row.fit.items-center.content-center.justify-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold Мастерская
          //- q-btn(
            @click="menuOpened = true"
            round flat color="white" icon="menu")
          q-btn(
            round flat color="white" icon="more_vert")
  q-page-container
    q-page(
      v-if="$store.getters.currentUser().profile.role === 'GUEST'"
      :style=`{
        height: '80vh',
      }`
      ).row.full-width.justify-center
      div(:style=`{maxWidth: 600+'px'}`).row.full-width.items-center.content-center.justify-center
        .row.full-width.justify-center
          q-icon(name="login" color="grey-8" size="100px")
        div(
          :style=`{textAlign: 'center'}`
          ).row.full-width.justify-center
          span.text-white Вы сможете добавлять медиа контент по ссылке с YouTube, просматривать свои закладки, загружать файлы с устройства.
        .row.full-width.justify-center.q-pt-md
          q-btn(
            outline color="white" no-caps
            :to="'/auth/sign-in'"
            :style=`{
              height: '50px',
            }`)
            h1.text-white Войти в аккаунт
    q-page(
      v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
      :style=`{
        paddingTop: '16px',
      }`
      ).row.full-width.justify-center.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width.items-start.content-start
        //- .col-xs-12.col-sm-5
        widget-watch-later.q-mb-sm
        widget-history.q-mb-sm
        widget-bookmarks.q-mb-md
        //- .col-xs-12.col-sm-7
        widget-upload
</template>

<script>
import widgetWatchLater from './widget_watch_later/index.vue'
import widgetBookmarks from './widget_bookmarks/index.vue'
import widgetUpload from './widget_upload/index.vue'
import widgetHistory from './widget_history/index.vue'

export default {
  name: 'wsIndex',
  components: {
    widgetWatchLater,
    widgetBookmarks,
    widgetUpload,
    widgetHistory,
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
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'rgb(30,30,30)'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
