<template lang="pug">
  div(:style=`{position: 'relative'}`).row.full-width.items-start.content-start
    // header
    .row.full-width.q-px-md.q-pb-sm.b-30
      q-resize-observer(@resize="headerHeight = $event.height")
      //- tabs sticky
      q-tabs(
        v-model="categoryId"
        switch-indicator="false" no-caps dense
      active-color="green"
      ).full-width.text-grey-8
        q-tab(
          v-for="(p,pi) in categories" :key="p.name"
          :name="p.name" :label="p.character")

    //- tab panels
    q-tab-panels(
      v-model="categoryId"
      :swipeable="$q.platform.is.mobile"
      :animated="$q.platform.is.mobile"
      :style=`{height: scrollAreaHeight - headerHeight + 'px'}`).full-width.b-30
      q-tab-panel(
        v-for="(p,pi) in categories" :key="p.name" :name="p.name"
        :style=`{
            background: 'none',
            minHeight: '70vh',
          }`
      ).row.full-width.items-start.content-start.justify-center.q-pa-none
        div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          masonry(
            :cols="3"
            :gutter="{default: 6}").full-width.items-start.content-start
            div(
              v-for="(gif, gi) in gifs" :key="gif.id"
              :style=`{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
              }`
              @click="$emit('item', {oid: null, type: 'GIF', thumbUrl: gif.media[0]['tinygif']['url'], url: gif.media[0]['gif']['url']})"
            ).row.full-width.items-start.content-start.q-mb-sm
              //- img
              img(
                :src="gif.media[0]['tinygif']['url']"
                draggable="false"
                :style=`{
                  pointerEvents: 'none',
                }`
              ).full-width
</template>

<script>
export default {
  name: 'kalpaFinder_pageGif',
  props: ['scrollAreaHeight', 'searchString'],
  data () {
    return {
      tenorSearch: '',
      tenorUrl: 'https://api.tenor.com/v1',
      tenorKey: 'EVS1EYKI5ZRC',
      gifs: [],
      categories: [],
      categoryId: null,
      showHeader: true,
      headerHeight: 0
    }
  },
  computed: {
    tenorUrlSearch () {
      return `${this.tenorUrl}/search?key=${this.tenorKey}&q=${this.searchString}&limit=50`
    },
    tenorUrlTrending () {
      return `${this.tenorUrl}/trending?key=${this.tenorKey}&locale=ru_RU&limit=50`
    },
    tenorUrlCategories () {
      // return `${this.tenorUrl}/categories?key=${this.tenorKey}&locale=ru_RU`
      return `${this.tenorUrl}/categories?key=${this.tenorKey}&locale=ru_RU&type=emoji`
    },
  },
  watch: {
    searchString: {
      async handler (to, from) {
        console.log('searchString TO', to)
        let {data} = await this.$axios.get(this.tenorUrlSearch)
        this.gifs = data.results
        console.log('data', data)
      }
    },
    categoryId: {
      async handler (to, from) {
        console.log('searchString TO', to)
        if (to) {
          let category = this.categories.find(c => c.name === to)
          let {data: dataTrending} = await this.$axios.get(category.path + '&limit=50')
          this.gifs = dataTrending.results
          this.$log('this.gifs', this.gifs)
        }
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted', this.scrollAreaHeight)
    // load initial trending gifs
    let {data: dataCategories} = await this.$axios.get(this.tenorUrlCategories)
    this.$log('mounted', dataCategories)
    this.categories.splice(0, this.categories.length, ...dataCategories.tags)
    this.categoryId = this.categories[0].name
  }
}
</script>
