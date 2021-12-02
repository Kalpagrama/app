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
      to="/workspace/drafts"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="filter_tilt_shift" color="white" size="24px").q-mr-sm
      .col
        span.text-white.text-bold {{$t('My drafts')}}
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
        //span(v-for="d in bookmarksRes.items" :key="d.id") {{// d.items}}
        router-link(
          v-for="b in bookmarksRes.items" :key="b.oid"
          :to="getUrl(b)"
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
  name: 'widgetDrafts',
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
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          wsItemType: {$in: [RxCollectionEnum.WS_NODE, RxCollectionEnum.WS_BLOCK, RxCollectionEnum.WS_JOINT]},
        },
        limit: 10,
        sort: [{createdAt: 'desc'}]
      }
      return res
    }
  },
  methods: {
    getUrl(wsItem) {
      switch (wsItem.wsItemType) {
        case RxCollectionEnum.WS_NODE: return '/content/' + wsItem.items[0]?.layers[0]?.contentOid + '?wsNodeId=' + wsItem.id
        case RxCollectionEnum.WS_SPHERE: return '/sphere/' + wsItem.oid
        default: return '/workspace'
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    if (this.showItems) this.bookmarksRes = await this.$rxdb.find(this.query)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
