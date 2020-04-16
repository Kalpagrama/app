<template lang="pug">
</template>

<script>
// import assert from 'assert'
import axios from 'axios'
const UNSPLASH_ACCESS_KEY = 'uI2AymszzNmMOoiYyNh8H1fI6EQeSfLBNy0qhQAJkOA'

export default {
  name: 'listDummy',
  data () {
    return {
      items: [],
      itemsPage: 1,
      itemsLoading: false
    }
  },
  methods: {
    async itemsMore () {
      if (this.itemsLoading) return
      this.$log('itemsMore')
      this.itemsPage += 1
      this.items = [...this.items, ...await this.itemsLoad(this.itemsPage)]
    },
    async itemsLoad (page = 1) {
      try {
        this.$log('itemsLoad start')
        this.itemsLoading = true
        await this.$wait(500)
        let res = await axios.get(
          `https://api.unsplash.com/search/photos?query=Money&per_page=30&page=${page}`,
          {
            headers: {
              Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
              'Accept-Version': 'v1'
            }
          }
        )
        this.$log('itemsLoad done')
        let items = res.data.results.map(i => {
          return {
            oid: i.id + Date.now(),
            thumbUrl: i.urls.regular,
            name: i.description || ''
          }
        })
        this.itemsLoading = false
        return items
      }
      catch (e) {
        this.$log('itemsLoad error', e)
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.items = await this.itemsLoad(1)
  }
}
</script>
