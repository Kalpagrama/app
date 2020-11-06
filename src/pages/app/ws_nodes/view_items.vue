<template lang="pug">
q-page(
  :style=`{
    paddingTop: 94+paddingTop+'px',
  }`
  ).row.full-width.justify-center
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`
    ).b-30
    .row.full-width.q-px-sm
      slot(name="top")
      //- search
      .row.full-width.justify-center
        div(
          :style=`{
            maxWidth: $store.state.ui.pageWidth+'px',
            borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-start
          div(:style=`{maxWidth: '700px',}`).col
            ws-search(
              @searchString="searchString = $event"
              @contentKalpa="contentKalpaFound"
              )
          q-btn(
            @click="$router.push('/workspace/node/new')"
            round flat color="grey-4" icon="add").full-height
          q-btn(
            round flat color="grey-4" icon="tune").full-height
      //- types
      .row.full-width.justify-center.q-pt-xs
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          q-btn(
            v-for="(type,ii) in types" :key="type.id"
            @click="typeId = type.id"
            flat no-caps dense
            :color="typeId === type.id ? 'green' : 'grey-7'"
            :class=`{
              'b-40': typeId === type.id
            }`
            :style=`{}`).q-mr-xs.q-mb-xs.q-px-xs {{ type.name }}
  //- items
  .row.full-width.items-start.content-start
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'wsNodes_viewItems',
  props: {
    paddingTop: {
      type: Number,
      default: 0
    }
  },
  components: {
    typeDrafts: () => import('./type_drafts.vue'),
    typePublished: () => import('./type_published.vue'),
  },
  data () {
    return {
      searchString: '',
      typeId: 'drafts'
    }
  },
  computed: {
    types () {
      return [
        {id: 'drafts', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
      ]
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // try to find bookmark with this content
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
      // open content ?
      await this.$wait(500)
      this.$router.push('/content/' + contentKalpa.oid)
    }
  }
}
</script>
