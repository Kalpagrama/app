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
      to="/workspace/history"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="history" color="white" size="24px").q-mr-sm
      .col
        span.text-white.text-bold {{$t('History')}}
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- bookmarks mockup
      div(v-if="showItems && !bookmarksRes").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 10" :key="n"
          :style=`{
          height: '50px', width: '50px', minWidth: '50px',
          borderRadius: '10px',
        }`
        ).row.b-40.q-mr-sm
      //- bookmarks loaded
      div(v-if="showItems && bookmarksRes").row.full-width.no-wrap.q-pa-sm
        router-link(
          v-for="b in bookmarksRes.items" :key="b.oid"
          :to="itemLink(b)"
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
              v-if="!bookmarksErrored.includes(b.oid)"
              draggable="false"
              :src="b.thumbUrl"
              :style=`{
              objectFit: 'cover',
              borderRadius: '10px',
            }`
              @error="bookmarksErrored.push(b.oid)"
            ).fit
            div(
              v-else
              :style=`{
              borderRadius: '10px',
            }`
            ).row.fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetHistory',
  props: ['showItems'],
  data () {
    return {
      bookmarksRes: null,
      // bookmarks: null,
      bookmarksErrored: []
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_HISTORY
        },
        limit: 10,
        sort: [{createdAt: 'desc'}]
      }
      return res
    }
  },
  methods: {
    itemLink (item) {
      let itemMap = {
        NODE: '/node/',
        USER: '/user/',
        WORD: '/sphere/',
        SENTENCE: '/sphere/',
        JOINT: '/joint/',
        VIDEO: '/content/',
        IMAGE: '/content/',
        BOOK: '/content/',
        WEB: '/content/',
      }
      return itemMap[item.type] + item.oid
    }
  },
  async mounted () {
    this.$log('mounted')
    this.bookmarksRes = await this.$rxdb.find(this.query)
    // alert(JSON.stringify(this.bookmarksRes.items))
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
