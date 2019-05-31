<template lang="pug">
.row.full-width
  div(v-for="(v, vi) in items" :key="v.etag"
    style=`minHeight: 90px`
    ).row.full-width.bg-white.q-my-sm.q-px-sm
    //- preview
    div(@click="itemClick(v, vi)").row.full-width
      div(style=`height: 90px; width: 120px`).row.items-center.justify-center.bg-red
        //- q-icon(name="fab fa-youtube" color="white" size="30px")
        img(:src="v.snippet.thumbnails.default.url" width="100%" height="100%")
      .col
        .row.fit.items-start.content-start.q-pa-sm
          .row.full-width
            p(style=`word-break: break-all`) {{ v.snippet.title | cut(50) }}
    //- select video
    div(v-if="item === v.etag" style=`height: 80px`).row.full-width.items-center.justify-end.q-px-sm
      q-btn(cancel flat color="primary" no-caps @click="item = ''").q-mr-sm Cancel
      q-btn(outline color="primary" @click="videoSelect(v, vi)" no-caps) Use this video
  //- div(style=`height: 50px`).row.full-width.items-center.justify-center
  //-   q-btn(style=`minWidth: 300px` outline color="primary" @click="showMore") Show more
</template>

<script>
// import { throttle } from 'quasar'
export default {
  name: 'findVideoList',
  props: {
    search: {type: String}
  },
  data () {
    return {
      items: [],
      item: '',
      nextPageToken: null
    }
  },
  methods: {
    showMore () {
      this.$log('showMore')
      // TODO: update nextPageToken and ?
    },
    itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      this.item = i.etag
    },
    videoSelect (v, vi) {
      this.$log('videoSelect', v, vi)
      this.$emit('videoSelect', v)
      this.$emit('close')
    },
    async itemsFind () {
      const params = {
        maxResults: 50,
        part: 'snippet',
        videoType: 'any',
        type: 'video',
        q: encodeURIComponent(this.search || 'Добро'),
        key: 'AIzaSyB8GBdF67E-F0P8eG3o5egrylnepVAsPLg',
      }
      let { data: { items, nextPageToken } } = await this.$axios.get('https://www.googleapis.com/youtube/v3/search', { params })
      this.nextPageToken = nextPageToken
      this.items = items
    }
  },
  watch: {
    search: {
      immediate: true,
      async handler (to, from) {
        this.$log('search UPDATED: ', to)
        if (to !== from) {
          await this.itemsFind()
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
