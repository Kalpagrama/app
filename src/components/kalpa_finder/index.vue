<template lang="pug">
  .row.full-widith
    //header + tabs
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-start.content-start.justify-center.q-px-sm
      q-resize-observer(@resize="headerHeight = $event.height")
      //- header
      .row.full-width.items-center.content-center
        .col
          span(:style=`{fontSize: '18px'}`).row.justify-center.text-white.text-bold {{ headerTitle_ }}
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      //search String
      q-input(
        v-if="searchStringShow"
        v-model="searchString"
        flat borderless dark dense autofocus
        icon="search"
        :placeholder="$t('Type here to search...')"
        :debounce="500"
        :style=`{height: '40px'}`
        :input-style=`{
                width: '500px',
                color: 'grey',
                fontSize: '16px',
                fontWeight: 'bold',
              }`
        @focus=""
      ).row.full-width
        template(v-slot:prepend)
          q-icon(name="search" :color="'green'" size="25px").q-mx-md
      .row.full-width.b-30
        q-btn(v-if="!searchStringShow" flat no-caps color="grey" icon="search" @click="searchStringShow = true").no-border-radius
        q-tabs(
          v-model="pageId"
          switch-indicator no-caps dense
          align="justify"
          active-color="green"
        ).col.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
    component(
      :is="'list-' + pageId"
      :useNavHeader="false"
      :scrollAreaHeight="scrollAreaHeight"
      searchInputState="disabled"
      :searchString="searchString"
      :pageFilter="pageFilter"
      :itemMiddlePersist="itemMiddlePersist"
      mode="select"
      @item="$emit('item', $event)")
</template>

<script>
import listPublished from 'src/components/kalpa_lists/published.vue'
import listCollections from 'src/components/kalpa_lists/collections.vue'
import listSearchKalpa from 'src/components/kalpa_lists/search_kalpa.vue'
import listGif from './page_gif/index.vue'

export default {
  name: 'kalpaFinder',
  props: {
    height: {
      type: Number,
      required: true
    },
    pageFilter: {
      type: Object,
      default: {
        whiteList: ['all', 'nodes', 'joints', 'blocks', 'contents', 'users', 'spheres']
      }
    },
    pagesShow: { type: Boolean, default: true },
    itemMiddlePersist: { type: Boolean, default: true },
    searchString: { type: String },
    headerTitle: {
      type: String
      // default: 'Выбрать элемент для связи'
    }
  },
  components: {
    listPublished,
    listCollections,
    listSearchKalpa,
    listGif
  },
  data () {
    return {
      pageId: null,
      searchStringShow: false,
      headerHeight: 0
    }
  },
  watch: {
    pageId: {
      handler (to, from) {
        if (!this.searchString) this.searchStringShow = false
        if (this.itemMiddlePersist) this.$store.commit('ui/stateSet', ['pageIdFinder', to])
      }
    },
    searchString: {
      handler (to, from) {
        this.searchStringShow = !!to
      }
    }
  },
  computed: {
    scrollAreaHeight () {
      // this.$logW('this.$q.screen.height=', this.$q.screen.height)
      // this.$logW('scrollAreaHeight=', (this.height || this.$q.screen.height) - this.headerHeight)
      return (this.height || this.$q.screen.height) - this.headerHeight
    },
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
        { id: 'published', name: this.$t('published') },
        { id: 'collections', name: this.$t('collections') },
        { id: 'search-kalpa', name: this.$t('Kalpagrama') },
        { id: 'gif', name: this.$t('Gif') }
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
  mounted () {
    this.$log('mounted scrollAreaHeight=', this.scrollAreaHeight)
    let pageId
    if (this.itemMiddlePersist) pageId = this.pages.find(p => p.id === this.$store.state.ui.pageIdFinder)?.id
    this.pageId = pageId || 'published'
  }
}
</script>
