<template lang="pug">
.row.full-width
  div(
    :style=`{
      borderRadius: '10px',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width
    //- header
    router-link(
      to="/workspace/collections"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="tab" color="white" size="24px").q-mr-sm
      .col
        span.text-white.text-bold {{$t('My collections')}}
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- bookmarks mockup
      div(v-if="!collectionsRes").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 10" :key="n"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-40.q-mr-sm
      //- bookmarks loaded
      div(v-if="collectionsRes && bookmarksRes").row.full-width.no-wrap.q-pa-sm
        router-link(
          v-for="(c,ci) in collections" :key="c.id"
          :to="'/workspace/collection/'+c.id"
          :style=`{
            height: '50px', width: '58px', minWidth: '58px',
          }`
          ).row.q-pr-sm
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.fit.b-40
            img(
              draggable="false"
              :src="bookmarksRes && bookmarksRes.items.length && c.id === 'all' ? bookmarksRes.items[0].thumbUrl : c.thumbUrl"
              :style=`{
                objectFit: 'cover',
                borderRadius: '10px',
              }`
              ).fit
            //- div(
              v-else
              :style=`{
                borderRadius: '10px',
              }`
              ).row.fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetCollections',
  data () {
    return {
      collectionsRes: null,
      bookmarksRes: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_COLLECTION,
        },
        limit: 10,
        sort: [{createdAt: 'desc'}]
      }
      return res
    },
    queryBookmarks () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: {$in: ['IMAGE', 'VIDEO', 'BOOK']}
        },
        limit: 1,
        sort: [{createdAt: 'desc'}]
      }
      return res
    },
    collections () {
      const collectionAll = {
        id: 'all',
        name: 'All',
      }
      return [collectionAll, ...this.collectionsRes.items]
    },
  },
  async mounted () {
    this.$log('myComponent mounted')
    this.collectionsRes = await this.$rxdb.find(this.query)
    this.bookmarksRes = await this.$rxdb.find(this.queryBookmarks)
  }
}
</script>
