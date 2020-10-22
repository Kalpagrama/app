<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page
      //- header
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
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
            kalpa-follow(
              v-if="contentKalpa"
              :oid="contentKalpa.oid")
            q-btn(
              @click="contentBookmarkCreate()"
              round flat
              :color="contentBookmark ? 'green' : 'white'"
              :icon="contentBookmark ? 'bookmark' : 'bookmark_outline'")
      //- body
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.q-pt-sm
          div(
            :style=`{
              position: 'relative',
              borderRadius: '10px', overflow: 'hidden',
            }`).row.full-width.b-40
            img(
              :src="contentKalpa.url" draggable="false"
              :style=`{
                objectFit: 'contain'
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
    query: {
      immediate: true,
      async handler (to, from) {
        // find bookmark
        // let contentBookmark = await this.$rxdb.get(RxCollectionEnum.WS_BOOKMARK, this.contentKalpa.oid)
        let [contentBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
        this.$log('contentBookmark', contentBookmark)
        if (contentBookmark) this.contentBookmark = contentBookmark
      }
    }
  },
  methods: {
    async contentBookmarkCreate () {
      this.$log('contentBookmarkCreate')
      // let contentBookmark = await this.$rxdb.get(RxCollectionEnum.WS_BOOKMARK, this.contentKalpa.oid)
      let [contentBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
      if (!contentBookmark) {
        let contentBookmarkInput = {
          oid: this.contentKalpa.oid,
          name: this.contentKalpa.name,
          thumbUrl: this.contentKalpa.thumbUrl,
          type: 'CONTENT',
          contentType: this.contentKalpa.type,
          wsItemType: 'WS_BOOKMARK',
          spheres: []
        }
        contentBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, contentBookmarkInput)
      }
      this.$log('contentBookmark', contentBookmark)
      this.contentBookmark = contentBookmark
    },
  }
}
</script>
