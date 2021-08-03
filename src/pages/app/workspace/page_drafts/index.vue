<template lang="pug">
  kalpa-layout(
    :height="_height")
    template(v-slot:header)
      div(
        v-if="useHeader"
      ).row.full-width.justify-center.q-px-sm.q-pt-sm.b-30
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          slot(name="header")
          div(
            v-if="!$slots.header"
            :style=`{
            height: '60px',
            borderRadius: '10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-sm.b-40
            q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
            .col.full-height
              .row.fit.items-center.content-center.justify-center
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('Drafts')}}
            q-btn(round flat color="white" icon="more_vert")
    template(v-slot:body)
      div(:style=`{paddingTop: useHeader ? '76px' : '0px',}`).row.full-width.items-start.content-start
        //- search bar
        div(
        ).row.full-width.justify-center.q-px-sm
          div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
            q-input(
              v-model="searchString"
              borderless dark
              :placeholder="$t('Search')"
              :input-style=`{
              padding: '16px',
              background: 'rgb(40,40,40)',
              borderRadius: '10px',
            }`
            ).col.full-width
            q-btn(
              :style=`{width: '60px'}`
              icon="add"
              outline color="grey-8" no-caps
            @click="createItem"
            ).q-mx-xs
        //- tabs sticky
        div(
          :style=`{
          position: 'sticky', top: '0px', zIndex: 1000,
        }`).row.full-width.q-px-md.b-30
          q-tabs(
            v-model="pageId"
            switch-indicator no-caps dense
            active-color="green"
          ).full-width.text-grey-8
            q-tab(
              v-for="(p,pi) in pages" :key="p.id"
              :name="p.id" :label="p.name")
        //- tab panels
        q-tab-panels(
          v-model="pageId"
          :swipeable="$q.platform.is.mobile"
          :animated="$q.platform.is.mobile"
          :style=`{}`).full-width.b-30
          q-tab-panel(
            v-for="(p,pi) in pages" :key="p.id" :name="p.id"
            :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-pa-sm
            list-feed(
              :query="query"
              :itemsPerPage="24"
              :itemMiddlePersist="false"
              :itemsMax="100"
              :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
            }`)
              template(v-slot:item=`{item:draft,itemIndex:draftIndex,isActive,isVisible}`)
                draft-list-item(
                  :draft="draft"
                  :mode="mode"
                  @draft="draftSelectHandle"
                ).q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import draftListItem from 'src/components/draft/draft_list_item.vue'

export default {
  name: 'workspace_pageDrafts',
  props: {
    height: { type: Number },
    useHeader: { type: Boolean, default: true },
    mode: { type: String },
    pagesFilter: { type: Function }
  },
  components: {
    draftListItem
  },
  data () {
    return {
      pageId: 'nodes',
      draftSelected: null,
      searchString: ''
    }
  },
  watch: {
    pageId: {
      // immediate: true,
      handler (to, from) {
        if (this.$route.query.pageId !== to) this.$router.replace({ path: this.$route.path, query: {...this.$route.query, pageId: to }})
      }
    },
    '$route.query.pageId': {
      immediate: true,
      handler (to, from) {
        this.pageId = to || this.pageId
      }
    }
  },
  computed: {
    _height () {
      return this.height || this.$q.screen.height
    },
    pages () {
      let pages = [
        // {id: 'collections', name: this.$t('Collections')},
        { id: 'nodes', name: this.$t('Nodes') },
        { id: 'joints', name: this.$t('Joints') },
        { id: 'blocks', name: this.$t('Blocks') }
      ]
      if (this.pagesFilter) return this.pagesFilter(pages)
      else return pages
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY
        },
        sort: [{ createdAt: 'desc' }]
      }
      // Get types
      if (this.pageId === 'nodes') {
        res.selector.wsItemType = RxCollectionEnum.WS_NODE
      } else if (this.pageId === 'joints') {
        res.selector.wsItemType = RxCollectionEnum.WS_JOINT
      } else if (this.pageId === 'blocks') {
        res.selector.wsItemType = RxCollectionEnum.WS_BLOCK
      } else throw new Error('bad type: ' + this.pageId)
      // Search by name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = { $regex: nameRegExp }
      }
      return res
    }
  },
  methods: {
    draftSelectHandle (draft) {
      this.$log('draftSelectHandle', draft)
      if (this.mode === 'select') {
        this.$emit('draft', draft)
      } else {
        this.draftSelected = draft
      }
    },
    createItem () {
      // eslint-disable-next-line no-constant-condition
      if (this.pageId === 'blocks') {
        this.$router.push('/workspace/create?mode=block')
      } else if (this.pageId === 'nodes') {
        this.$router.push('/workspace/contents')
      } else {
        this.$notify('warn', this.$t('not implemented'))
      }
    }
  }
}
</script>
