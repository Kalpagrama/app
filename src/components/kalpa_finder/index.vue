<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container).b-30
  q-header(reveal).b-30
    .row.full-width.justify-center.q-px-sm
      slot(name="header")
      //- pages
      div(
        v-if="pagesShow"
        :style=`{marginBottom: '-2px'}`).row.full-width.q-pl-sm
        q-tabs(
          v-model="pageId" no-caps
          dense active-color="green"
          ).full-width.text-grey-6
          q-tab(
            v-for="p in pagesFiltered" :key="p.id"
            :name="p.id" :label="p.name")
      //- search
      .row.full-width
        ws-search(
          @searchString="searchString = $event"
          @contentKalpa="$emit('contentKalpa', $event)")
  q-page-container
    component(
      v-bind="$props"
      :is="`page-${pageId}`"
      :searchString="searchString"
      :page="page"
      :style=`{}`)
      template(v-slot:tint=`{item}`)
        slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

// filters: {[page-id]: filter, [page-id]: filter, [page-id]: options}

export default {
  name: 'kalpaFinder',
  props: {
    pageId_: {type: String, default: 'workspace'},
    pagesFilter: {type: Array},
    pagesShow: {type: Boolean, default: true},
    workspaceTypes: {type: Array},
    kalpaTypes: {type: Array},
    pages: {type: Object},
  },
  components: {
    pageWorkspace: () => import('./page_workspace/index.vue'),
    pageKalpa: () => import('./page_kalpa.vue'),
    pageNodesMine: () => import('./page_nodes_mine.vue'),
    pageNodesBookmark: () => import('./page_nodes_bookmark.vue'),
    pageWeb: () => import('./page_web/index.vue'),
    pageGif: () => import('./page_gif/index.vue'),
    // pageQuery: () => import('./page_query.vue')
  },
  data () {
    return {
      // pageId: 'workspace',
      pageId: null,
      searchString: ''
    }
  },
  computed: {
    page () {
      if (this.pageId) return this.pages[this.pageId]
      else return null
    },
    pagesFiltered () {
      return [
        {id: 'workspace', name: 'Мастерская', component: 'page-workspace'},
        {id: 'kalpagrama', name: 'Кальпаграма', component: 'page-kalpa'},
        {id: 'nodes-mine', name: 'Мои ядра', component: 'page-nodes-mine'},
        {id: 'nodes-bookmark', name: 'Ядра из закладок', component: 'page-nodes-bookmark'},
        {id: 'gif', name: 'Gif', component: 'page-gif'},
        {id: 'web', name: 'Web', component: 'page-web'},
      ].filter(p => {
        if (this.pages) {
          return this.pages[p.id]
        }
        else {
          return true
        }
        // if (this.pagesFilter) return this.pagesFilter.includes(p.id)
        // else return true
      })
    }
  },
  watch: {
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
      let [bookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) {
        await bookmark.restoreFromTrash() // на тот случай если он сейчас в корзине
      } else {
        let bookmarkInput = {
          type: contentKalpa.type,
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl
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
