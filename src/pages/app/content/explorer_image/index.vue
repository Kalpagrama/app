<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      //- header
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.q-pt-sm
          .row.full-width.items-start.content-start
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('out', ['back'])")
            .col
              div(:style=`{borderRadius: '10px',}`
                ).row.full-width.items-center.content-center.justify-between.b-40
                q-icon(name="select_all" color="white" size="30px").q-mx-sm
                div(:style=`{overflowX: 'auto'}`).col
                  span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentKalpa.name }}
                q-btn(round flat color="grey-8" icon="more_vert")
              div(:style=`{paddingLeft: '44px',}`).row.full-width.justify-start
                q-tabs(
                  v-model="viewId"
                  no-caps dense active-color="white" switch-indicator).text-grey-8
                  q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
      //- body
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px'}`).row.full-width.q-pt-sm
          div(
            :style=`{
              position: 'relative', height: '500px',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.b-40
            img(
              :src="contentKalpa.urlOriginal" draggable="false"
              :style=`{
                objectFit: 'contain'
              }`).fit
          //- small.text-white {{ contentKalpa }}
        //- view dynamic component
      component(
        :is="`view-${viewId}`"
        :ref="`view-${viewId}`"
        :player="player"
        :contentKalpa="contentKalpa"
        :contentBookmark="contentBookmark")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import viewDetails from './view_details/index.vue'
import viewNodes from './view_nodes/index.vue'
// viewNodesMine, viewNodesAll

export default {
  name: 'contentExplorerImage',
  components: {viewDetails, viewNodes},
  props: ['contentKalpa'],
  data () {
    return {
      viewId: 'fragments',
      player: null,
      contentBookmark: null
    }
  },
  computed: {
    views () {
      return [
        {id: 'details', name: this.$t('wsContentExplorer_image_viewDetails_title', 'Детали')},
        {id: 'fragments', name: this.$t('wsContentExplorer_image_viewDrafts_title', 'Фрагменты')},
        {id: 'nodes', name: this.$t('wsContentExplorer_image_viewNodes_title', 'Ядра')},
      ]
    }
  },
  watch: {
    '$route.query.viewId': {
      immediate: true,
      async handler (to, from) {
        // find bookmark
        let {items: [contentBookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        this.$log('contentBookmark', contentBookmark)
        if (contentBookmark) this.contentBookmark = contentBookmark
      }
    }
  }
}
</script>
