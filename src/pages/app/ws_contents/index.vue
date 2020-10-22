<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width
    //- header
    .row.full-width.items-start.q-px-sm
      content-search(
        @contentKalpa="contentKalpaFound"
        @searchString="searchString = $event"
        :style=`{}`)
    div(:style=`{paddingRight: '50px',}`).row.full-width.q-pl-md
      q-tabs(
        :value="typeId" @input="typeIdChanged"
        no-caps dense active-color="green" align="left" switch-indicator
        ).full-width.text-grey-8
        q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  .row.full-width
    component(:is="`type-${typeId}`" :searchString="searchString")
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsContents',
  props: {
    mode: {type: String, default () { return 'standalone' }},
    type: {type: String, default () { return 'video' }},
    query: {type: Object, default () { return {} }}
  },
  components: {
    typeVideo: () => import('./type_video.vue'),
    typeImage: () => import('./type_image.vue'),
    typeAudio: () => import('./type_audio.vue'),
    typeBooks: () => import('./type_books.vue'),
  },
  data () {
    return {
      typeId: 'video',
      searchString: '',
    }
  },
  computed: {
    types () {
      return [
        {id: 'video', name: this.$t('Video', 'Видео')},
        {id: 'image', name: this.$t('Images', 'Картинки')},
        {id: 'audio', name: this.$t('Audio', 'Аудио')},
        {id: 'books', name: this.$t('Books', 'Книги')},
      ]
    },
  },
  watch: {
    type: {
      immediate: true,
      handler (to, from) {
        this.$log('type TO', to)
        if (to) {
          this.typeId = to
        }
      }
    }
  },
  methods: {
    typeIdChanged (val) {
      this.$log('typeIdChanged', val)
      if (this.mode === 'standalone') {
        this.$router.push({params: {type: val}})
      }
      else {
        this.typeId = val
      }
    },
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      if (this.mode === 'standalone') {
        // go to content page immediate
        this.$router.push(`/content/${contentKalpa.oid}`).catch(e => e)
      }
      // add content bookmark async
      // let bookmarkFound = await this.$rxdb.get(RxCollectionEnum.WS_BOOKMARK, contentKalpa.oid)
      let [bookmarkFound] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      this.$log('bookmarkFound', bookmarkFound)
      if (bookmarkFound) {
        if (bookmarkFound.deletedAt > 0) {
          alert('content was deleted!, restoring...')
          this.$delete(bookmarkFound, 'deletedAt')
        }
      }
      else {
        let bookmarkInput = {
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbUrl: contentKalpa.thumbUrl,
          type: 'CONTENT',
          contentType: contentKalpa.type,
          wsItemType: 'WS_BOOKMARK',
          spheres: [],
        }
        bookmarkFound = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        this.$log('bookmarkFound')
      }
      if (this.mode === 'pick') {
        this.$emit('content', bookmarkFound)
      }
    },
  }
}
</script>
