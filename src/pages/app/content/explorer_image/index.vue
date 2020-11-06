<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      //- header
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pt-sm
          div(
            v-if="contentKalpa"
            :style=`{
              height: '60px',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.items-center.content-center.b-40.q-px-sm
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
            q-icon(name="select_all" color="white" size="30px").q-mr-sm
            .col
              span(:style=`{fontSize: '1rem', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentKalpa.name }}
            kalpa-bookmark(
              v-if="contentKalpa"
              :oid="contentKalpa.oid"
              type="CONTENT"
              :name="contentKalpa.name"
              :thumbUrl="contentKalpa.thumbUrl"
              :isActive="true")
      //- body
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pt-sm
          div(
            :style=`{
              position: 'relative',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.b-40
            img(
              :src="contentKalpa.url" draggable="false"
              :style=`{
                objectFit: 'contain',
                maxHeight: $q.screen.heigth*0.8+'px',
                borderRadius: '10px',
              }`).fit
          .row.full-width
            .row.full-width.justify-start.q-px-md
              q-tabs(
                v-model="viewId"
                no-caps dense active-color="green" switch-indicator).full-width.text-grey-8
                q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
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
  props: ['contentKalpa', 'query'],
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
        {id: 'details', name: 'Детали'},
        {id: 'fragments', name: 'Мои ядра'},
        {id: 'nodes', name: 'Все ядра'},
      ]
    }
  },
  watch: {
  },
  methods: {
  }
}
</script>
