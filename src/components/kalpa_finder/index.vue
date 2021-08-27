<template lang="pug">
.row.full-widith.scroll
  //header + tabs
  div(
    :style=`{height: '160px'}`
    ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      //- header
      .row.full-width.items-center.content-center.q-pa-sm
        .col.q-pl-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ headerTitle_ }}
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //- tabs
      .row.full-width.items-center.content-center.q-px-sm.q-py-xs
        .row.q-pl-sm
          span.text-white.q-mr-sm {{$t('From')}}:
        .col
          .row.full-width.scroll
            .row.full-width.items-center.content-center.no-wrap
              q-btn(
                v-for="p in pages" :key="p.id"
                flat no-caps dense
                :color="p.id === pageId ? 'green' : 'white'"
                :class=`{
                  'b-40': p.id === pageId,
                }`
                :style=`{
                  whiteSpace: 'nowrap',
                }`
                @click="pageId = p.id"
                ).q-mr-sm.q-px-sm {{ p.name }}
              div(:style=`{width: '100px',minWidth: '100px',}`).row

      //- search bar
      .row.full-width.justify-center.q-px-sm
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width
          q-input(
            v-model="searchString"
            borderless dark
            :placeholder="$t('Search')"
            :input-style=`{
                  padding: '16px',
                  background: 'rgb(40,40,40)',
                  borderRadius: '10px',
                }`
          ).full-width
  component(
    v-bind="$props"
    :is="pages.find(p=>p.id === pageId).component"
    :useHeader="false"
    :height="$q.screen.height-160"
    :pagesFilter="pagesFilter"
    :searchStringShow="false"
    :searchString="searchString"
    mode="select"
    :page="page"
    @item="$emit('item', $event)")
</template>

<script>
import pageWsSearch from 'src/pages/app/workspace/page_search/index.vue'
import pageSearch from 'src/pages/app/trends/page_search'
import pageGif from './page_gif/index.vue'

export default {
  name: 'kalpaFinder',
  props: {
    height: {
      type: Number,
      required: true,
    },
    pageId_: {type: String},
    pagesFilter: {type: Array},
    pagesShow: {type: Boolean, default: true},
    // pages: {type: Object},
    searchString: {type: String},
    headerTitle: {
      type: String,
      // default: 'Выбрать элемент для связи'
    }
  },
  components: {
    pageWsSearch,
    pageSearch,
    pageGif,
  },
  data () {
    return {
      pageId: 'workspace',
    }
  },
  computed: {
    headerTitle_ () {
      if (this.headerTitle) return this.headerTitle
      else return this.$t('Find your item')
    },
    page () {
      if (this.pageId) return this.pages[this.pageId]
      else return null
    },
    pages () {
      return [
        {id: 'workspace', name: this.$t('Workspace'), component: 'page-ws-search'},
        {id: 'kalpagrama', name: this.$t('Kalpagrama'), component: 'page-search'},
        {id: 'gif', name: this.$t('Gif'), component: 'page-gif'},
        // {id: 'search', name: 'Search', component: 'page-search'},
      ]
    }
  },
  methods: {
    // pagesFilter (pages) {
    //   return pages.filter(p => {
    //     // return p.id !== 'joints'
    //     return !['joints', 'spheres'].includes(p.id)
    //   })
    // }
  },
}
</script>
