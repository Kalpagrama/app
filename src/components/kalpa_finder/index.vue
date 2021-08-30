<template lang="pug">
.row.full-widith
  //header + tabs
  div(
    :style=`{ height: '155px'}`
    ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
      //- header
      .row.full-width.items-center.content-center.q-pa-sm
        .col.q-pl-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ headerTitle_ }}
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      div(:style=`{position: 'sticky', top: '0px', zIndex: 1000}`).row.full-width.q-px-md.b-30
        q-tabs(
          v-model="pageId"
          switch-indicator no-caps dense
          active-color="green"
        ).full-width.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
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
  //page-published(:useNavHeader="false" :searchStringShow="false" :searchString="searchString").br
  //page-collections(:useNavHeader="false" :searchStringShow="false" :searchString="searchString").br
  //page-search(:useNavHeader="false" :searchStringShow="false" :searchString="searchString")
  //page-gif(:useHeader="false" :searchStringShow="false" :searchString="searchString").br
  component(
    :is="'page-' + pageId"
    :useNavHeader="false"
    mode="select"
    :searchStringShow="false"
    :searchString="searchString"
    @item="$emit('item', $event)")
</template>

<script>
import pagePublished from 'src/pages/app/workspace/page_published/index.vue'
import pageCollections from 'src/pages/app/workspace/page_collections/index.vue'
import pageSearch from 'src/pages/app/search'
import pageGif from './page_gif/index.vue'
import pageWsSearch from 'src/pages/app/workspace/page_search/index.vue'

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
    pagePublished,
    pageCollections,
    pageSearch,
    pageGif,
  },
  data () {
    return {
      pageId: 'published',
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
        {id: 'published', name: this.$t('published')},
        {id: 'collections', name: this.$t('collections')},
        {id: 'search', name: this.$t('Kalpagrama')},
        {id: 'gif', name: this.$t('Gif')},
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
