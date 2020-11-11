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
    pagesShow: {type: Boolean, default: true},
    workspaceTypes: {type: Array},
    kalpaTypes: {type: Array},
  },
  components: {
    pageWorkspace: () => import('./page_workspace.vue'),
    pageKalpa: () => import('./page_kalpa.vue')
  },
  data () {
    return {
      pageId: 'workspace',
      pages: [
        {id: 'workspace', name: 'Мастерская'},
        {id: 'kalpa', name: 'Кальпаграма'},
      ],
      searchString: ''
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
