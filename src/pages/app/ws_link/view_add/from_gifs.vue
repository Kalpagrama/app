<template lang="pug">
.row.full-width.items-start.content-start
  //- header
  div(
    :style=`{position: 'sticky', zIndex: 1000, top: '0px',}`
    ).row.full-width.q-px-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="tenorSearch"
        filled dark dense color='grey-7'
        placeholder="Search GIF"
        :debounce="600"
        ).full-width
    .row.full-width.q-px-md
      q-tabs(
        v-model="viewId"
        dense active-color="green" no-caps switch-indicator
        ).full-width.text-grey-6
        q-tab(name="bookmarked" icon="bookmark")
        q-tab(name="search" :label="$t('Search', 'Поиск')")
  //- body
  .row.full-width
    //- favorite
    div(v-if="viewId === 'bookmarked'").row.full-width.items-start.content-start.justify-center
      h6.text-white Your favorite GIFs will be here soon :)
    //- search
    div(v-if="viewId === 'search'").row.full-width.items-start.content-start.q-pr-sm
      masonry(
        :cols="3"
        :gutter="{default: 6}").full-width.items-start.content-start
        div(
          v-for="(gif, gi) in gifs" :key="gif.id"
          :style=`{
            position: 'relative',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.items-start.content-start.q-mb-sm
          slot(name="tint" :item="gif" :itemKey="gif.id")
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
  name: 'kalpaLinker_fromGifs',
  data () {
    return {
      tenorSearch: '',
      tenorUrl: 'https://api.tenor.com/v1',
      tenorKey: 'EVS1EYKI5ZRC',
      gifs: [],
      viewId: 'search',
      views: [
        {id: 'bookmarked', name: 'Избранные'},
        {id: 'search', name: 'Поиск'},
      ],
    }
  },
  computed: {
    tenorUrlSearch () {
      return `${this.tenorUrl}/search?key=${this.tenorKey}&q=${this.tenorSearch}&limit=50`
    },
    tenorUrlTrending () {
      return `${this.tenorUrl}/trending?key=${this.tenorKey}&locale=ru_RU&limit=50`
    },
  },
  watch: {
    tenorSearch: {
      async handler (to, from) {
        console.log('tenorSearch TO', to)
        let {data} = await this.$axios.get(this.tenorUrlSearch)
        this.gifs = data.results
        console.log('data', data)
      }
    }
  },
  methods: {
  },
  async mounted () {
    this.$log('mounted')
    // load initial trending gifs
    let {data} = await this.$axios.get(this.tenorUrlTrending)
    this.gifs = data.results
  }
}
</script>
