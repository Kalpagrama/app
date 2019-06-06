<template lang="pug">
div(style=`position: relative`).row.full-width
  //- loading
  div(v-if="loading" style=`position: absolute; zIndex: 100`).row.fit.items-center.justify-center
    q-spinner(size="50px" :thickness="2" color="primary")
  //- fake
  div(v-if="videos.length === 0").row.full-width
    div(
      v-for="v in 6" :key="v"
      style=`height: 90px`).row.full-width.bg-white.q-my-sm.q-px-sm
      div(style=`height: 90px; width: 120px`).row.q-pa-xs
        .row.fit.bg-grey-2
      .col
        .row.fit.items-start.content-start.q-pa-sm
          div(style=`height: 20px; minHeight: 20px; borderRadius: 4px`).row.full-width.bg-grey-2
  //- real
  div(v-else).row.full-width
    div(v-for="(v, vi) in videos" :key="v.id"
      style=`minHeight: 90px`
      ).row.full-width.bg-white.q-my-sm.q-px-sm
      //- preview
      div(@click="videoClick(v, vi)" v-if="v.id !== videoSelectedId").row.full-width
        div(style=`height: 90px; width: 120px`).row.items-center.justify-center.bg-red
          //- q-icon(name="fab fa-youtube" color="white" size="30px")
          img(:src="v.thumbnailUrl" width="100%" height="100%")
        .col
          .row.fit.items-start.content-start.q-pa-sm
            .row.full-width
              //- p(style=`word-break: break-all`) {{ v.snippet.title | cut(50) }}
              p(style=`word-break: break-all`) {{ v.title | cut(50) }}
            //- .row.full-width
            //-   small.text-grey-8 Views: {{ v.views }}
      //- select video
      div(v-if="v.id === videoSelectedId").row.full-width.items-center.justify-end
        div(style=`height: 200px`).row.full-width
          img(:src="v.thumbnailUrl" width="100%" height="100%")
        div(style=`height: 70px;`).row.full-width.items-center.justify-end
          q-btn(cancel flat color="primary" no-caps @click="videoSelectedId = undefined").q-mr-sm Отмена
          q-btn(rounded style=`height: 50px` color="primary" @click="videoSelect(v, vi)" no-caps) Выбрать видео
    //- show more
    div(style=`height: 70px`).row.full-width.items-center.justify-center
      q-btn(style=`height: 50px; minWidth: 300px` rounded outline color="primary" @click="showMore") Показать еще
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
      loading: false,
      videos: [],
      videoSelectedId: undefined,
      nextPageToken: null
    }
  },
  methods: {
    showMore () {
      this.$log('showMore')
      // TODO: update nextPageToken and ?
    },
    videoClick (v, vi) {
      this.$log('itemClick', v, vi)
      this.videoSelectedId = v.id
    },
    videoSelect (v, vi) {
      this.$log('videoSelect', v, vi)
      this.$emit('video', v)
      this.$emit('close')
    },
    async itemsFind () {
      if (this.search.length === 0) return
      this.loading = true
      console.time('itemsFind')
      const params = {
        maxResults: 9,
        part: 'id',
        videoType: 'any',
        type: 'video',
        q: this.search,
        key: 'AIzaSyB8GBdF67E-F0P8eG3o5egrylnepVAsPLg',
      }
      let { data: { items, nextPageToken } } = await this.$axios.get('https://www.googleapis.com/youtube/v3/search', { params })
      this.$log('items', items)
      this.nextPageToken = nextPageToken
      let ids = items.map(i => i.id.videoId)
      this.$log('ids', ids)
      let { data: { youtubeInfo: videos } } = await this.$apollo.query({
        query: gql`
          query getVideos($ids: [String!]!) {
            youtubeInfo(videoIds: $ids)
          }
        `,
        variables: {
          ids: ids
        }
      })
      console.timeEnd('itemsFind')
      this.$log('videos', videos)
      this.videos = videos
      this.loading = false
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
