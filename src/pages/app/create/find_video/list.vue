<template lang="pug">
.row.full-width
  div(v-for="(v, vi) in items" :key="v.videoId"
    style=`minHeight: 90px`
    ).row.full-width.bg-white.q-my-sm.q-px-sm
    //- preview
    div(@click="itemClick(v, vi)" v-if="v.videoId !== item").row.full-width
      div(style=`height: 90px; width: 120px`).row.items-center.justify-center.bg-red
        //- q-icon(name="fab fa-youtube" color="white" size="30px")
        img(:src="v.thumbnailUrl" width="100%" height="100%")
      .col
        .row.fit.items-start.content-start.q-pa-sm
          .row.full-width
            //- p(style=`word-break: break-all`) {{ v.snippet.title | cut(50) }}
            p(style=`word-break: break-all`) {{ v.title || 'Loading...' | cut(50) }}
          .row.full-width
            small.text-grey-8 Views: {{ v.views }}
    //- select video
    div(v-if="item === v.videoId").row.full-width.items-center.justify-end
      div(style=`height: 200px`).row.full-width.bg
        img(:src="v.thumbnailUrl" width="100%" height="100%")
      div(style=`height: 70px;`).row.full-width.items-center.justify-end
        q-btn(cancel flat color="primary" no-caps @click="item = ''").q-mr-sm Отмена
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
      items: [],
      item: '',
      nextPageToken: null
    }
  },
  methods: {
    async getVideo (id) {
      this.$log('getVideo', id)
      // let { data } = await this.$axios.get(`https://www.youtube.com/watch?v=${id}`)
      let { data } = await this.$axios.get(`https://q8qre.sse.codesandbox.io/videos?id=${id}`)
      this.$log('data', data)
      // return data.match(/<h1[^>]*>([^<]+)<\/h1>/)[1]
      return data
    },
    showMore () {
      this.$log('showMore')
      // TODO: update nextPageToken and ?
    },
    itemClick (i, ii) {
      this.$log('itemClick', i, ii)
      this.item = i.videoId
    },
    videoSelect (v, vi) {
      this.$log('videoSelect', v, vi)
      this.$emit('videoSelect', v)
      this.$emit('close')
    },
    async itemsFind () {
      const params = {
        maxResults: 9,
        part: 'id',
        videoType: 'any',
        type: 'video',
        q: this.search || 'Бэтмен',
        key: 'AIzaSyB8GBdF67E-F0P8eG3o5egrylnepVAsPLg',
      }
      let { data: { items, nextPageToken } } = await this.$axios.get('https://www.googleapis.com/youtube/v3/search', { params })
      this.$log('items', items)
      this.nextPageToken = nextPageToken
      // await Promise.all(
      //   this.items = items.map(async (i) => {
      //     i = await this.getVideo(i.id.videoId)
      //     return i
      //   })
      // )
      let data = []
      // this.items = items
      items.map(async (i) => {
        this.$log('item id', i.id.videoId)
        data.push(await this.getVideo(i.id.videoId))
        // i = await this.getVideo(i.id.videoId)
        // return i
      })
      // this.$log('done')
      this.items = data
      // this.items = items
      // this.$set(this, 'items', items)
      // this.items = items
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
