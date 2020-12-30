<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(
    v-if="viewId !== 'search'"
    reveal @reveal="headerRevealed = $event"
    :style=`{
      paddingTop: 'env(safe-area-inset-top)',
    }`).b-30
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.q-px-sm.b-40
          q-icon(name="explore" color="white" size="30px").q-mx-sm
          span(:style=`{fontSize: '18px', userSelect: 'none'}`).text-bold.text-white Новое
          .col
          q-btn(
            @click="viewId = 'search'"
            round flat color="white" icon="search")
  q-page-container
    component(:is="`view-${viewId}`" :oid="$route.params.oid" @close="viewId = 'trends'" :headerRevealed="headerRevealed")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_trends',
  components: {
    viewTrends: () => import('./view_trends.vue'),
    viewSearch: () => import('./view_search.vue'),
  },
  data () {
    return {
      viewId: 'trends',
      headerRevealed: false
    }
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
