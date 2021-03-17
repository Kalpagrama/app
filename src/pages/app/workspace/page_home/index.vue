<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //- header
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
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$tt('Workspace')}}
            //- q-btn(
              @click="menuOpened = true"
              round flat color="white" icon="menu")
            q-btn(
              round flat color="white" icon="more_vert")
      //- guest
      div(
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
      //- user
      div(
        v-if="$store.getters.currentUser().profile.role !== 'GUEST'"
        :style=`{
          paddingTop: '8px',
        }`
        ).row.full-width.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
          }`).row.full-width.items-start.content-start
          widget-collections().q-mb-sm
          widget-watch-later.q-mb-sm
          widget-history.q-mb-sm
          widget-upload().q-mb-sm
</template>

<script>
import widgetCollections from './widget_collections/index.vue'
import widgetBookmarks from './widget_bookmarks/index.vue'
import widgetWatchLater from './widget_watch_later/index.vue'
import widgetHistory from './widget_history/index.vue'
import widgetUpload from './widget_upload/index.vue'

export default {
  name: 'pageHome',
  components: {
    widgetCollections,
    widgetBookmarks,
    widgetWatchLater,
    widgetHistory,
    widgetUpload,
  }
}
</script>
