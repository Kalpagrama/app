<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container)
  q-header(reveal)
    div(
      :style=`{
        //- paddingTop: 'env(safe-area-inset-top)',
        //- background: 'rgb(35,35,35)',
      }`
      ).row.full-width.justify-center.q-px-sm.b-30
      slot(name="header")
      //- pages
      div().row.full-width.justify-center
        //- q-btn(rounnd flat dense color="white" icon="construction")
        .col
          div(
            v-if="pagesShow"
            :style=`{marginBottom: '-2px', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pl-sm
            q-tabs(
              v-model="pageId" no-caps
              dense active-color="green"
              aling="left"
              ).text-grey-6
              q-tab(
                v-for="p in pagesFiltered" :key="p.id"
                :name="p.id" :label="p.name")
      //- search
      div(
        v-if="!searchString"
        ).row.full-width.justify-center
        //- ws-search(
          @searchString="searchStringLocal = $event"
          @contentKalpa="contentKalpaFound"
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
          }`)
  q-page-container
    q-page.row.full-width.justify-center.q-pa-sm
      component(
        v-bind="$props"
        :is="`page-${pageId}`"
        :searchString="searchStringLocal"
        :page="page"
        :style=`{
          maxWidth: 600+'px',
        }`)
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder',
  props: {
    pageId_: {type: String},
    pagesFilter: {type: Array},
    pagesShow: {type: Boolean, default: true},
    pages: {type: Object},
    searchString: {type: String},
  },
  components: {
    // wsSearch: () => import('components/ws_search/index.vue'),
    pageContent: () => import('./page_content/index.vue'),
    pageWorkspace: () => import('./page_workspace/index.vue'),
    pageKalpagrama: () => import('./page_kalpagrama/index.vue'),
    pageNodes: () => import('./page_nodes/index.vue'),
    pageWeb: () => import('./page_web/index.vue'),
    pageGif: () => import('./page_gif/index.vue'),
  },
  data () {
    return {
      pageId: null,
      searchStringLocal: ''
    }
  },
  computed: {
    page () {
      if (this.pageId) return this.pages[this.pageId]
      else return null
    },
    pagesFiltered () {
      return [
        {id: 'nodes', name: 'Ядра', component: 'page-nodes'},
        {id: 'workspace', name: 'Закладки', component: 'page-workspace'},
        {id: 'kalpagrama', name: 'Поиск', component: 'page-kalpagrama'},
        {id: 'content', name: 'Загрузки', component: 'page-content'},
        {id: 'gif', name: 'Gif', component: 'page-gif'},
        // {id: 'web', name: 'Web', component: 'page-web'},
      ].filter(p => {
        if (this.pages) {
          return this.pages[p.id]
        }
        else {
          return true
        }
      })
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
