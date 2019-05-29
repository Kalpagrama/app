<template lang="pug">
.row.full-width
  div(v-for="(v, vi) in items" :key="v.etag" @click="$emit('itemClick', v)"
    style=`height: 90px`
    ).row.full-width.bg-white.q-my-sm.q-px-sm.hr.cursor-pointer
    div(style=`height: 90px; width: 120px`).row.items-center.justify-center.bg-red
      //- q-icon(name="fab fa-youtube" color="white" size="30px")
      img(:src="v.snippet.thumbnails.default.url" width="100%" height="100%")
    .col
      .row.fit.items-start.content-start.q-pa-sm
        .row.full-width
          span {{ v.snippet.title | cut(50) }}
        .row.full-width
          small.text-grey-8 Views {{ Math.floor(Math.round(1 * (9999 * vi + 1)))}}
</template>

<script>
export default {
  name: 'findVideoList',
  props: {
  },
  data () {
    return {
      items: []
    }
  },
  async mounted () {
    this.$log('mounted')
    const params = {
        maxResults: 50,
        part: 'snippet',
        videoType: 'any',
        type: 'video',
        q: encodeURIComponent('death'),
        key: 'AIzaSyDE565pzxI68Nr49o4I1DkfXW3hwJHt1Ro',
    }
    let findItems = await this.$axios.get('https://www.googleapis.com/youtube/v3/search', { params })
    this.$log('findItems', findItems)
    this.$set(this, 'items', findItems.data.items)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
