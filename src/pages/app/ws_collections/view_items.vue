<template lang="pug">
q-page(
  :style=`{
    paddingTop: 58+paddingTop+'px',
  }`
  ).row.full-width.justify-center
  q-dialog(
    v-model="collectionCreatorOpened"
    transition-show="none"
    transition-hide="none"
    :maximized="$q.screen.width < 800")
    collection-creator(
      @close="collectionCreatorOpened = false")
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000,}`).b-30
    .row.full-width.q-px-sm.b-30
      slot(name="top")
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
            @click="collectionCreatorOpened = true"
            round flat color="grey-4" icon="add").full-height
          //- q-btn(
            round flat color="grey-4" icon="tune").full-height
  kalpa-loader(
    :immediate="true"
    :query="queryFeeds" :limit="1000" v-slot=`{items,next}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start
      div(
        :style=`{
        }`
        ).row.full-width
        //- feed-all(
          v-if="searchString.length === 0"
          :maxWidth="maxWidth")
          template(v-slot:tint=`{item}`)
            slot(name="tint" :item="item")
        collection-item(
          v-for="(collection,ii) in items" :key="collection.id"
          @click.native="$router.push('/workspace/collection/'+collection.id)"
          :maxWidth="maxWidth"
          :collection="collection")
          template(v-slot:tint=`{item}`)
            slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'wsCollection_viewItems',
  props: {
    paddingTop: {
      type: Number,
      default: 0
    }
  },
  components: {
    feedAll: () => import('./feed_all.vue'),
    collectionItem: () => import('./collection_item.vue'),
    collectionCreator: () => import('./collection_creator.vue')
  },
  data () {
    return {
      searchString: '',
      collectionCreatorOpened: false,
    }
  },
  computed: {
    queryFeeds () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION,
        }
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    maxWidth () {
      if (this.$q.screen.width < this.$store.state.ui.pageWidth) return this.$q.screen.width / 2
      else return this.$store.state.ui.pageWidth / 4
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // try to find bookmark with this content
      let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      if (bookmark) await bookmark.restoreFromTrash()
      else {
        let bookmarkInput = {
          oid: contentKalpa.oid,
          type: contentKalpa.type,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl,
          // wsItemType: 'WS_BOOKMARK',
          // spheres: [],
          // feeds: [],
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
