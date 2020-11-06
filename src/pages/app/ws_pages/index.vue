<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start.justify-center
        slot(name="header")
        .row.full-width.items-start.content-start
          .row.full-width.q-pa-xs
            .col
              div(
                :style=`{
                  position: 'relative', zIndex: 100,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width
                q-input(
                  v-model="searchString"
                  filled dark dense color="grey-6"
                  label="Find page"
                  ).full-width
            q-btn(round flat dense color="green" icon="add" @click="pageCreate()")
          kalpa-loader(:query="query" :limit="1000")
            template(v-slot=`{items,next}`)
              .row.full-width.items-start.content-start.q-px-xs.q-py-md
                div(
                  v-for="(page,pageIndex) in items" :key="page.id"
                  ).row.full-width.q-mb-sm
                  router-link(
                    :to="`/workspace/page/${page.id}`"
                    :style=`{
                      height: '60px',
                      borderRadius: '10px', overflow: 'hidden',
                    }`).row.full-width.items-center.content-center.q-px-md.b-40.cursor-pointer
                    span.text-white {{ page.name }}
                    .row.full-width
                      small.text-grey-7.q-mr-sm [{{ page.items.length }}]
                      small.text-grey-7 {{ $date(page.updatedAt) }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import pageEditor from './page_editor'

export default {
  name: 'pageApp_wsPages',
  components: {pageEditor},
  data () {
    return {
      page: null,
      pageNew: {
        name: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        thumbUrl: '',
        stage: 'page',
      },
      searchString: ''
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'page'
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async pageCreate () {
      this.$log('pageCreate')
      let pageInput = JSON.parse(JSON.stringify(this.pageNew))
      let {id} = await this.$rxdb.set(RxCollectionEnum.WS_NODE, pageInput)
      this.$router.push(`/workspace/page/${id}`).catch(e => e)
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
