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
      to="/workspace/watch-later"
      :style=`{}`).row.full-width.items-center.content-center.q-pa-md
      q-icon(name="watch_later" color="white" size="24px").q-mr-sm
      .col
        span.text-white.text-bold {{$t('Watch later')}}
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- bookmarks mockup
      div(v-if="true").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 7" :key="n"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-40.q-mr-sm
      //- bookmarks loaded
      //- div(v-if="bookmarks").row.full-width.no-wrap.q-pa-sm
        router-link(
          v-for="b in bookmarks" :key="b.oid"
          :to="'/content/'+b.oid"
          :style=`{
            height: '50px', width: '58px', minWidth: '58px',
          }`
          ).row.q-pr-sm
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.fit.b-50
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
  name: 'widgetWatchLater',
  data () {
    return {
      bookmarks: null,
      bookmarksErrored: []
    }
  },
  computed: {
    // query () {
    //   let res = {
    //     selector: {
    //       rxCollectionEnum: RxCollectionEnum.WS_ANY,
    //       type: {$in: ['IMAGE', 'VIDEO', 'BOOK']},
    //     },
    //     limit: 10,
    //     sort: [{createdAt: 'desc'}]
    //   }
    //   return res
    // }
  },
  methods: {
  }
}
</script>
