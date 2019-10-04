<template lang="pug">
.column.fit.bg-white
  div(:style=`{height: '70px'}`).row.full-width
    div(:style=`{height: '70px', width: '70px'}` :class=`{'bg-grey-2': sourcesShow}`).row.items-center.justify-center
      q-btn(color="primary" round flat icon="menu" @click="sourcesShow = !sourcesShow")
    .col.full-height
      .row.fit.items-center.content-center.q-px-md
        span.text-bold Добавить фрагмент
        .row.full-width
          span {{ sources[source].name }}
  .col
    div(
      :style=`{position: 'relative'}`
      ).row.fit.justify-center.bg-white
      div(v-show="sourcesShow").row.full-height.bg-grey-2
        sources(:sources="sources" :source="source" @source="source = $event" :disable="disableSourcesSwitch")
      .col.full-height
        keep-alive
          component(v-if="sources[source]" :is="`source-${sources[source].type}`" :source="sources[source]"
            @sourcesToggle="sourcesShow = !sourcesShow"
            :progress="progress" @uploading="uploading" @uploaded="uploaded")
          div(v-else).row.fit.items-center.justify-center
            q-spinner(:thickness="2" color="primary" size="50px")
</template>

<script>
import sources from './sources'
import sourceUrl from './source_url'
import sourceWorkspace from './source_workspace'
import sourceYoutube from './source_youtube'
import sourceDevice from './source_device'

export default {
  name: 'contentFinder',
  components: {sources, sourceUrl, sourceWorkspace, sourceYoutube, sourceDevice},
  data () {
    return {
      source: 'url',
      sourcesShow: true,
      sources: {
        url: {type: 'url', name: 'по ссылке', nameMini: 'Url', icon: 'link'},
        workspace: {type: 'workspace', name: 'из мастерской', nameMini: false, icon: 'cloud'},
        device: {type: 'device', name: 'с устройства', nameMini: false, icon: 'folder'},
        youtube: {type: 'youtube', name: 'из Youtube', nameMini: 'YT', icon: 'fab fa-youtube'},
        google: {type: 'google', name: 'из Google', nameMini: 'G', icon: 'fab fa-google'},
        pinterest: {type: 'pinterest', name: 'из Pinterest', nameMini: 'G', icon: 'fab fa-pinterest'},
        vk: {type: 'vk', name: 'из Вконтакте', nameMini: 'VK', icon: 'fab fa-vk'},
        vimeo: {type: 'vimeo', name: 'из Vimeo', nameMini: 'VM', icon: 'fab fa-vimeo'},
        'yandexdisk-9120390123': {type: 'yandexdisk', name: 'из Яндекс Диск 1', nameMini: 'ЯД', icon: false},
        'yandexdisk-2392940324': {type: 'yandexdisk', name: 'из Яндекс Диск 2', nameMini: 'ЯД', icon: false},
        'googledrive-123912309': {type: 'googledrive', name: 'из Google drive 1', nameMini: 'GD', icon: 'fab fa-yandex'},
        'googledrive-129310239': {type: 'googledrive', name: 'из Google drive 2', nameMini: 'GD', icon: false},
        'dropbox-393403948': {type: 'dropbox', name: 'из Dropbox 1', nameMini: 'DP', icon: false},
        'dropbox-239023939': {type: 'dropbox', name: 'из Dropbox 2', nameMini: 'DP', icon: false}
      },
      type: undefined,
      types: {
        VIDEO: {name: 'Видео', icon: 'movie_creation', color: 'red'},
        IMAGE: {name: 'Изображение', icon: 'panorama', color: 'green'},
        AUDIO: {name: 'Аудио', icon: 'music_note', color: 'orange'},
        HTML: {name: 'Веб-страница', icon: 'language', color: 'blue'},
        BOOK: {name: 'Книга', icon: 'menu_book', color: 'brown'},
        CODE: {name: 'Репозиторий', icon: 'code', color: 'black'}
      },
      progress: null,
      disableSourcesSwitch: false
    }
  },
  computed: {
    width () {
      let w = this.$q.screen.width
      if (w > 500) return 500
      else return w
    }
  },
  methods: {
    close () {
      this.$log('close')
      // are u really wanna quit u will lost some info...
      this.$emit('close')
    },
    uploading (val) {
      this.$log('uploading')
      this.disableSourcesSwitch = val
    },
    async uploaded (oid) {
      this.$log('uploaded start', oid)
      let content = await this.contentGet(oid)
      // this.$log('content', content)
      this.$emit('content', content)
      this.$log('uploaded done')
    },
    async contentGet (oid) {
      this.$log('contentGet start', oid)
      let {data: {objectList: [content]}} = await this.$apollo.query({
        query: gql`
          query contentGet ($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              thumbUrl(preferWidth: 600)
              name
              ... on Video {
                url
                urlOriginal
                duration
                width
                height
              }
              ... on Image {
                url
                urlOriginal
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('contentGet done', content)
      return content
    },
    showError (msg) {
      this.$q.notify({message: msg, color: 'red', textColor: 'white'})
    }
  },
  mounted () {
    this.$log('mounted')
    const observer = this.$apollo.subscribe({
      client: 'ws',
      query: gql`
        subscription uploadProgress {
          progress {
            action
            progress
          }
        }
      `
    })
    observer.subscribe({
      next: ({data: {progress}}) => {
        this.$log('progress', progress)
        this.$set(this, 'progress', progress)
      },
      error: (error) => {
        this.$log('progress error', error)
      }
    })
    let bookmarkContent = this.$store.state.workspace.bookmarkContent
    this.$log('bookmarkContent', bookmarkContent)
    if (bookmarkContent) {
      // this.source = 'url'
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.observer = null
  }
}
</script>
