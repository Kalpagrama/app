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
        span.text-white.text-bold {{$tt('History')}}
    //- scrolled bookmarks preview max 10...
    .row.full-width.scroll
      //- bookmarks mockup
      div(v-if="true").row.full-width.no-wrap.q-pa-sm
        div(
          v-for="n in 8" :key="n"
          :style=`{
            height: '50px', width: '50px', minWidth: '50px',
            borderRadius: '10px',
          }`
          ).row.b-40.q-mr-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'widgetHistory',
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
