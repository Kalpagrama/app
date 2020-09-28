<template lang="pug">
.column.fit
  //- header
  .row.full-width.q-pt-sm.q-px-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="tenorSearch"
        filled dark dense color='grey-7'
        placeholder="Search GIF"
        :debounce="600"
        ).full-width
    .row.full-width
      q-tabs(
        v-model="viewId"
        dense active-color="white" no-caps switch-indicator
        ).full-width.text-grey-6
        q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  //- body
  .col.full-width.scroll
    //- favorite
    div(v-if="viewId === 'favorite'").row.full-width.items-start.content-start.justify-center
      h6.text-white Your favorite GIFs will be here soon :)
    //- search
    div(v-if="viewId === 'search'").row.full-width.items-start.content-start.q-pr-sm
      masonry(
        :cols="8"
        :gutter="{default: 6}").full-width
        div(
          v-for="(gif, gi) in gifs" :key="gif.id"
          :style=`{
            position: 'relative',
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.q-mb-sm
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
        {id: 'favorite', name: 'Favorite'},
        {id: 'search', name: 'Search'},
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
