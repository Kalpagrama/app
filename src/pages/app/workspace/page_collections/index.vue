<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  q-header
    .row.full-width.justify-center
      div(
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
        ).row.full-width.items-center.content-center.q-pa-sm
        q-btn(
          round flat color="white" icon="west"
          @click="$routerKalpa.back()"
          ).q-mr-sm
        span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ $tt('Collections') }}
  q-page-container
    q-page
      .row.full-width
        h1.text-white collections
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageCollections',
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
    collections () {
      const collectionAll = {
        id: 'all',
        name: 'All',
      }
      return [collectionAll, ...this.collectionsRes.items]
    },
  }
}
</script>
