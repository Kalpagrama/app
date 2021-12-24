<template lang="pug">
kalpa-layout
  template(v-slot:footer)
    kalpa-menu-mobile(v-if="$q.screen.lt.md && !$store.state.ui.userTyping")
  template(v-slot:body)
    .row.full-width.items-start.content-start
      //iframe(src="https://kalpa.app/trends" height="900px" width="500px")
      //- header
      .row.full-width.justify-center.b-30
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
              @click="showKalpaTutorial('tutorial_workspace')"
              round flat color="white" icon="help_outline")
      //- guest
      view-guest(v-if="$store.getters.isGuest").q-mt-sm
      q-spinner(v-else-if="!$store.state.core.wsReady" size="50px" color="green").absolute-center
      //- user
      div(
        v-else
        ).row.full-width.justify-center.q-px-sm
        div( :style=`{ maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start
          widget-upload(@uploaded="$router.push('/content/' + $event.contentKalpa.oid)").q-my-sm
            template(v-slot:bottom)
              q-btn(outline no-caps color="grey" :label="$t('Create')" @click="addItemMenuShow = true").full-width.br-10.q-mt-sm
                q-dialog(
                  v-model="addItemMenuShow"
                  position="standard"
                  :maximized="false"
                )
                  div(:style=`{background: 'rgb(35,35,35)',borderRadius: '10px'}`).row.full-width.q-pa-md.justify-center
                    q-btn(
                      outline color="grey-8"
                      size="xl"
                      align="center"
                      :to="''"
                      :label="$t('Essence core')"
                      icon='adjust'
                      round flat no-caps
                    ).row.full-width.create-item.q-pa-sm
                    q-btn(
                      outline color="grey-8"
                      align="center"
                      size="xl"
                      :to="'/workspace/edit?mode=block'"
                      :label="$t('Essence block')"
                      icon='dashboard_customize'
                      round flat no-caps
                    ).row.full-width.create-item.q-pa-sm
          .row.full-width
            widget-contents().q-mb-sm
            widget-collections().q-mb-sm
            widget-drafts().q-mb-sm
            widget-published().q-mb-sm
            widget-history.q-mb-sm
            //widget-bookmarks().q-mb-sm
            //widget-watch-later.q-mb-sm
</template>

<script>
import widgetCollections from './widget_collections/index.vue'
import widgetBookmarks from './widget_bookmarks/index.vue'
import widgetDrafts from './widget_drafts/index.vue'
import widgetPublished from './widget_published/index.vue'
import widgetContents from './widget_contents/index.vue'
import widgetWatchLater from './widget_watch_later/index.vue'
import widgetHistory from './widget_history/index.vue'
import widgetUpload from './widget_upload/index.vue'
import viewGuest from 'src/components/kalpa_guard/view_guest.vue'

export default {
  name: 'pageHome',
  data () {
    return {
      addItemMenuShow: false,
    }
  },
  components: {
    widgetCollections,
    widgetBookmarks,
    widgetDrafts,
    widgetPublished,
    widgetContents,
    widgetWatchLater,
    widgetHistory,
    widgetUpload,
    viewGuest,
  },
  methods: {
    showKalpaTutorial (notice) {
      this.$log('showKalpaTutorial TODO!')
      this.$eventBus.$emit('notice-check', { notice: notice, force: true })
    }
  }
}
</script>
