<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        content-search(
          @contentKalpa="contentKalpaFound"
          @searchString="searchString = $event"
          :style=`{}`)
        .row.full-width.q-px-md
          q-tabs(
            :value="$route.name" @input="$router.push({name: $event})"
            no-caps dense active-color="white" align="left" switch-indicator
            ).full-width.text-grey-8
            q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  q-page-container
    router-view(:searchString="searchString")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsContents',
  props: {
  },
  meta () {
    return {
      title: 'Workspace - Contents'
    }
  },
  data () {
    return {
      searchString: '',
    }
  },
  computed: {
    types () {
      return [
        {id: 'workspace.contents.video', name: this.$t('Video', 'Видео')},
        {id: 'workspace.contents.image', name: this.$t('Images', 'Картинки')},
        {id: 'workspace.contents.audio', name: this.$t('Audio', 'Аудио')},
        {id: 'workspace.contents.books', name: this.$t('Books', 'Книги')},
        // {id: 'workspace.contents.web', name: this.$t('Web', 'Веб')},
      ]
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      // go to content page immediate
      this.$router.push(`/content/${contentKalpa.oid}`).catch(e => e)
      // add content bookmark async
      let {items: [bookmarkFound]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      this.$log('bookmarkFound', bookmarkFound)
      if (!bookmarkFound) {
        let bookmarkInput = {
          oid: contentKalpa.oid,
          name: contentKalpa.name,
          thumbOid: contentKalpa.thumbUrl,
          type: 'CONTENT',
          contentType: contentKalpa.type,
          wsItemType: 'WS_BOOKMARK',
          spheres: [],
        }
        bookmarkFound = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
        this.$log('bookmarkFound')
      }
    },
  }
}
</script>
