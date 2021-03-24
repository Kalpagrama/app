<template lang="pug">
div(
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).row.full-widith
  div(
    :style=`{
      height: '100px',
    }`
    ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      //- header
      .row.full-width.items-center.content-center.q-pa-sm
        .col.q-pl-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ headerTitle_ }}
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- tabs
      .row.full-width.items-center.content-center.q-px-sm.q-py-xs
        .row.q-pl-sm
          span.text-white.q-mr-sm {{$t('From')}}:
        .col
          .row.full-width.scroll
            .row.full-width.items-center.content-center.no-wrap
              q-btn(
                v-for="p in pagesFiltered" :key="p.id"
                flat no-caps dense
                :color="p.id === pageId ? 'green' : 'white'"
                :class=`{
                  'b-40': p.id === pageId,
                }`
                :style=`{
                  whiteSpace: 'nowrap',
                }`
                @click="pageId = p.id"
                ).q-mr-sm.q-px-sm {{ p.name }}
              div(:style=`{width: '100px',minWidth: '100px',}`).row
  component(
    v-bind="$props"
    :is="`page-${pageId}`"
    :height="$q.screen.height-100"
    :searchString="searchStringLocal"
    :page="page"
    @item="$emit('item', $event)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

import pageWorkspace from './page_workspace/index.vue'
import pageNodes from './page_nodes/index.vue'
import pageSearch from './page_search/index.vue'
import pageGif from './page_gif/index.vue'

export default {
  name: 'kalpaFinder',
  props: {
    height: {
      type: Number,
      required: true,
    },
    pageId_: {type: String},
    pagesFilter: {type: Array},
    pagesShow: {type: Boolean, default: true},
    pages: {type: Object},
    searchString: {type: String},
    headerTitle: {
      type: String,
      // default: 'Выбрать элемент для связи'
    }
  },
  components: {
    pageWorkspace,
    pageSearch,
    pageNodes,
    pageGif,
  },
  data () {
    return {
      pageId: null,
      searchStringLocal: ''
    }
  },
  computed: {
    headerTitle_ () {
      if (this.headerTitle) return this.headerTitle
      else return this.$t('Find your item')
    },
    page () {
      if (this.pageId) return this.pages[this.pageId]
      else return null
    },
    pagesFiltered () {
      return [
        {id: 'workspace', name: this.$t('Workspace'), component: 'page-workspace'},
        {id: 'nodes', name: this.$t('My Nodes'), component: 'page-nodes'},
        {id: 'gif', name: this.$t('Gif'), component: 'page-gif'},
        // {id: 'search', name: 'Search', component: 'page-search'},
      ]
    }
  },
  watch: {
    searchString: {
      handler (to, from) {
        if (to) {
          this.searchStringLocal = to
        }
      }
    },
    pageId_: {
      immediate: true,
      handler (to, from) {
        this.$log('pageId_ TO', to)
        if (to) {
          this.pageId = to
        }
        else {
          if (this.pagesFiltered) {
            this.pageId = this.pagesFiltered[0].id
          }
        }
      }
    }
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // this.$router.replace('/content/' + contentKalpa.oid)
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        await bookmark.restoreFromTrash() // на тот случай если он сейчас в корзине
      } else {
        let bookmarkInput = {
          type: contentKalpa.type,
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl,
          isSubscribed: true
        }
        bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
      }
      // bookmark subscribe
      if (!await UserApi.isSubscribed(contentKalpa.oid)) await UserApi.subscribe(contentKalpa.oid)
      this.$emit('contentKalpa', contentKalpa)
    }
  },
}
</script>
