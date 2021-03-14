<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  container
  :style=`{
    height: $q.screen.height+'px',
  }`).b-30
  q-footer(v-if="$q.screen.lt.md")
    kalpa-menu-mobile
  q-header(
    reveal
    :style=`{
      paddingTop: 'env(safe-area-inset-top)',
    }`).b-30
    .row.full-width.justify-center.b-30.q-pt-sm.q-px-sm
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        div(:style=`{height: '60px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.justify-between.b-40
          .col
            q-input(
              v-model="searchString"
              flat borderless dark
              icon="search"
              :placeholder="$tt('Type here to search...')"
              :debounce="500"
              :style=`{}`
              :input-style=`{
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
              }`
              ).full-width
              template(v-slot:prepend)
                q-icon(name="search" color="white" size="30px").q-ml-md
              template(v-slot:append)
                q-btn(
                  v-if="searchString.length > 0"
                  @click="searchString = ''"
                  round flat dense color="white" icon="clear").q-mr-sm
  q-page-container
    component(
      :is="`page-${pageId}`"
      :oid="$route.params.oid"
      :searchString="searchString"
      @close="viewId = 'trends'")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_trends',
  components: {
    pageTrends: () => import('./page_trends/index.vue'),
    pageSearch: () => import('./page_search/index.vue'),
  },
  data () {
    return {
      pageId: 'trends',
      searchString: '',
    }
  },
  watch: {
    searchString: {
      handler (to, from) {
        this.$log('searchString TO', to)
        if (to.length > 0) {
          this.pageId = 'search'
        }
        else {
          this.pageId = 'trends'
        }
      }
    }
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'rgb(30,30,30)'
  }
}
</script>
