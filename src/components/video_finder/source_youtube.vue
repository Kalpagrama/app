<template lang="pug">
div(style=`position: relative`).column.fit
  //- input header
  div(:style=`{height: headerHeight+'px', zIndex: 100}`).row.full-width.items-center.content-center.q-px-sm
    .col
      q-input(v-model="search" filled :label="$t('search')" @keyup.enter="startSearch()" autofocus @blur="$q.screen.width < 600 ? startSearch() : false").full-width
        template(v-slot:append)
          q-btn(v-if="search.length > 0" round flat dense icon="clear" @click="cancelSearch()")
    q-btn(style=`height: 56px` color="primary" @click="startSearch()" :loading="loading").q-ml-sm {{$t('find')}}
  //- video results
  .col.scroll
    div(v-if="loading" style=`height: 200px`).row.full-width.justify-center.items-center
      q-spinner(size="50px" :thickness="2" color="primary")
    div(v-if="!loading").row.full-width.items-start.content-start
      q-resize-observer(@resize="onResize")
      div(v-for="(v, vi) in videos" :key="v.id"
        style=`minHeight: 90px; borderBottom: 1px solid #eee`
        :class="{hr: v.id !== videoSelectedId}"
        ).row.full-width.bg-white.q-pa-sm
        //- video mini
        div(@click="videoClick(v, vi)" v-if="v.id !== videoSelectedId").row.full-width
          div(style=`height: 90px; width: 153px`).row.items-center.justify-center
            div(style=`position: relative; borderRadius: 4px; overflow: hidden`).row.full-width
              div(style=`position: absolute; bottom: 4px; right: 4px; borderRadius: 4px`).row.bg-black.q-px-xs
                small.text-white {{$time(v.duration)}}
              img(:src="v.thumbnailUrl" width="100%" height="90px")
          .col
            .row.fit.items-start.content-start.q-px-sm
              .row.full-width
                span(style=`word-break: break-all`).text-bold {{ v.title | cut(50) }}
              .row.full-width
                span.text-grey-9 {{v.viewCount}} {{$t('views')}}
              div(v-if="v.creator").row.full-width
                small.text-grey-8 {{$t('by')}} {{v.creator}}
        //- video selected
        div(v-if="v.id === videoSelectedId").row.full-width.items-center.justify-end
          div(style=`minHeight: 200px`).row.full-width.q-mt-sm
            div(:style=`{position: 'relative', borderRadius: '4px', overflow: 'hidden', height: width*0.56+'px'}`).row.full-width
              div(style=`position: absolute; bottom: 4px; right: 8px; borderRadius: 8px`).row.bg-black.q-py-xs.q-px-sm
                span.text-white {{$time(v.duration)}}
              //- div(style=`position: absolute;` @click="videoWatch = v.id").row.fit.items-center.justify-center
              //-   q-icon(name="play_circle_outline" color="primary" size="80px").cursor-pointer
              img(v-if="videoWatch !== v.id" :src="v.thumbnailUrl" width="100%" @click="videoWatch = v.id")
              iframe(v-if="videoWatch === v.id" width="100%" height="100%" :src="'https://www.youtube.com/embed/'+v.id" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen autoplay)
          //- video title
          div.row.full-width.items-center.q-pt-sm
            .col
              .row.fit.items-center
                h6(style=`margin: 0px`) {{v.title | cut(50)}}
            q-btn(round flat color="primary" :icon="videoDetails ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              @click="videoDetails ? videoDetails = undefined : videoDetails = v.id")
          .row.full-width.items-end
            span.text-grey-9 {{v.viewCount}} {{$t('views')}}
          //- video details
          div(v-if="videoDetails === v.id" ).row.full-width.q-py-sm
            div(v-if="v.description || v.description.length > 0" style=`minHeight: 40px`).row.full-width
              span.text-grey-9 {{v.description | cut(100)}}
            .row.full-width.q-my-sm
              div(v-for="(t, ti) in v.tags" :key="ti"
                style=`height: 26px; borderRadius: 4px`
                ).row.items-center.q-pa-xs.bg-grey-3.q-mr-sm.q-mb-sm
                span {{t}}
          //- video tools
          div(style=`height: 70px;`).row.full-width.items-center.justify-end
            q-btn(style=`height: 50px; borderRadius: 4px` flat color="primary" no-caps @click="videoSelectedId = undefined").q-mr-sm {{$t('cancel')}}
            q-btn(style=`height: 50px; borderRadius: 4px` color="primary" @click="videoSelect(v, vi)" no-caps) {{$t('choose_video')}}
      //- show more
      div(v-if="false && videos.length > 0" style=`height: 70px`).row.full-width.items-center.justify-center.q-px-sm
        q-btn(style=`height: 50px; borderRadius: 4px; minWidth: 300px` outline color="primary").full-width {{$t('show_more')}}
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
      videoWatch: undefined,
      videoDetails: undefined,
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
      // this.videoWatch = v.id
    },
    videoSelect (v, vi) {
      this.$log('videoSelect', v, vi)
      let options = {type: 'VIDEO', source: 'from_youtube'}
      // TODO: ask really choose this video?
      this.$emit('ready', {...v, ...options})
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
