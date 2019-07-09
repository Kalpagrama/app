<template lang="pug">
div(style=`position: relative`).row.full-width
  //- input header
  div(:style=`{height: headerHeight+'px'}`).row.full-width.items-center.content-center.q-px-sm
    .col
      q-input(v-model="search" filled :label="$t('search')" @keyup.enter="startSearch()").full-width
        template(v-slot:append)
          q-btn(v-if="search.length > 0" round flat dense icon="clear" @click="cancelSearch()")
    q-btn(style=`height: 56px` color="primary" @click="startSearch()" :loading="loading").q-ml-sm {{$t('find')}}
  //- video results
  div(v-if="loading" style=`height: 200px`).row.full-width.justify-center.items-center
    q-spinner(size="50px" :thickness="2" color="primary")
  div(v-if="!loading").row.full-width
    q-resize-observer(@resize="onResize")
    div(v-for="(v, vi) in videos" :key="v.id"
      style=`minHeight: 90px; borderBottom: 1px solid #eee`
      ).row.full-width.bg-white.q-pa-sm.hr
      //- preview
      div(@click="videoClick(v, vi)" v-if="v.id !== videoSelectedId").row.full-width
        div(style=`height: 90px; width: 153px`).row.items-center.justify-center
          div(style=`borderRadius: 4px; overflow: hidden`).row.full-width
            img(:src="v.thumbnailUrl" width="100%" height="90px")
        .col
          .row.fit.items-start.content-start.q-pa-sm
            .row.full-width
              //- p(style=`word-break: break-all`) {{ v.snippet.title | cut(50) }}
              p(style=`word-break: break-all`) {{ v.title | cut(50) }}
            //- .row.full-width
            //-   small.text-grey-8 Views: {{ v.views }}
      //- select video
      div(v-if="v.id === videoSelectedId").row.full-width.items-center.justify-end
        div(style=`minHeight: 200px`).row.full-width.q-mt-sm
          div(:style=`{borderRadius: '4px', overflow: 'hidden', height: width*0.56+'px'}`).row.full-width
            img(:src="v.thumbnailUrl" width="100%")
        div(style=`height: 70px;`).row.full-width.items-center.justify-end
          q-btn(style=`height: 50px; borderRadius: 4px` outline color="primary" no-caps @click="videoSelectedId = undefined").q-mr-sm {{$t('cancel')}}
          q-btn(style=`height: 50px; borderRadius: 4px` color="primary" @click="videoSelect(v, vi)" no-caps) {{$t('choose_video')}}
    //- show more
    //- div(style=`height: 70px`).row.full-width.items-center.justify-center
    //-   q-btn(style=`height: 50px; minWidth: 300px` rounded outline color="primary" @click="showMore") {{$t('show_more')}}
</template>

<script>
export default {
  name: 'findVideoList',
  data () {
    return {
      loading: false,
      headerHeight: 300,
      videos: [],
      videoSelectedId: undefined,
      nextPageToken: null,
      search: '',
      width: 600
    }
  },
  methods: {
    onResize (e) {
      this.$log('onResize', e)
      this.width = e.width
    },
    cancelSearch () {
      this.$log('cancelSearch')
      this.search = ''
      this.videos = []
      this.$tween.to(this, 0.66, {headerHeight: 300})
    },
    async startSearch () {
      try {
        this.$log('startSearch start')
        if (this.search.length === 0) return
        this.loading = true
        this.$tween.to(this, 0.66, {headerHeight: 70})
        // await this.$wait(1000)
        await this.itemsFind()
        this.loading = false
        this.$log('startSearch done')
      } catch (error) {
        this.loading = false
        this.$log('startSearch error', error)
      }
    },
    showMore () {
      this.$log('showMore')
      // TODO: update nextPageToken and ?
    },
    videoClick (v, vi) {
      this.$log('videoClick', v, vi)
      this.videoSelectedId = v.id
    },
    videoSelect (v, vi) {
      this.$log('videoSelect', v, vi)
      let options = {type: 'VIDEO', source: 'from_youtube'}
      this.$emit('ready', {...v, ...options})
      this.$emit('close')
    },
    async itemsFind () {
      console.time('itemsFind')
      const params = {
        maxResults: 9,
        part: 'id',
        videoType: 'any',
        type: 'video',
        // eventType: 'completed',
        // videoDimension: '2d',
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
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
