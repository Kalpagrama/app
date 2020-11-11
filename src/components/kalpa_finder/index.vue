<template lang="pug">
q-layout(
  view="hHh Lpr lff"
  container).b-30
  q-header.b-30
    .row.full-width.justify-center.q-px-sm
      slot(name="header")
      //- pages
      div(
        v-if="pagesShow"
        :style=`{marginBottom: '-2px'}`).row.full-width.q-px-sm
        q-tabs(
          v-model="pageId" no-caps
          dense active-color="green"
          ).text-grey-6
          q-tab(
            v-for="p in pages" :key="p.id"
            :name="p.id" :label="p.name")
      //- search
      .row.full-width
        ws-search(
          @searchString="searchString = $event"
          @contentKalpa="contentKalpaFound")
  q-page-container
    //- slot(:name="`page-${pageId}`" :searchString="searchString")
    component(
      v-bind="$props"
      :is="`page-${pageId}`"
      :searchString="searchString"
      :style=`{}`)
      template(v-slot:tint=`{item}`)
        slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder',
  props: {
    pageId_: {type: String, default: 'workspace'},
    pagesFilter: {type: Array},
    pagesShow: {type: Boolean, default: true},
    workspaceTypes: {type: Array},
    kalpaTypes: {type: Array},
  },
  components: {
    pageWorkspace: () => import('./page_workspace.vue'),
    pageKalpa: () => import('./page_kalpa.vue'),
    pageNodesMine: () => import('./page_nodes_mine.vue'),
    pageNodesBookmark: () => import('./page_nodes_bookmark.vue'),
    // pageQuery: () => import('./page_query.vue')
  },
  data () {
    return {
      pageId: 'workspace',
      searchString: ''
    }
  },
  computed: {
    pages () {
      return [
        {id: 'workspace', name: 'Мастерская', component: 'page-workspace'},
        {id: 'kalpa', name: 'Кальпаграма', component: 'page-kalpa'},
        {id: 'nodes-mine', name: 'Мои ядра', component: 'page-nodes-mine'},
        {id: 'nodes-bookmark', name: 'Ядра из закладок', component: 'page-nodes-bookmark'}
      ].filter(p => {
        if (this.pagesFilter) return this.pagesFilter.includes(p.id)
        else return true
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
