<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    div(:style=`{paddingBottom: '600px',}`).row.full-width.items-start.content-start
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
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Workspace')}}
            //- tutorial
            q-btn(
              @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'workspace_first', useIntro: false, useProfileEditor: false}])"
              round flat color="white" icon="fas fa-info")
      //- guest
      view-guest(
        v-if="$store.getters.isGuest")
      //- user
      div(
        v-else
        :style=`{
          paddingTop: '8px',
        }`
        ).row.full-width.justify-center.q-px-sm
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
          }`).row.full-width.items-start.content-start
          widget-upload().q-mb-md
          .row.full-width.q-px-md
            widget-contents().q-mb-sm
            widget-collections().q-mb-sm
            widget-bookmarks().q-mb-sm
            //- widget-watch-later.q-mb-sm
            //- widget-history.q-mb-sm
</template>

<script>
import widgetCollections from './widget_collections/index.vue'
import widgetBookmarks from './widget_bookmarks/index.vue'
import widgetContents from './widget_contents/index.vue'
import widgetWatchLater from './widget_watch_later/index.vue'
import widgetHistory from './widget_history/index.vue'
import widgetUpload from './widget_upload/index.vue'
import viewGuest from './view_guest/index.vue'

export default {
  name: 'pageHome',
  components: {
    widgetCollections,
    widgetBookmarks,
    widgetContents,
    widgetWatchLater,
    widgetHistory,
    widgetUpload,
    viewGuest,
  }
}
</script>
