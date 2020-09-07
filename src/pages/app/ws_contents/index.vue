<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        content-search(
          @content="contentPicked"
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
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentSearch from './content_search'
import contentItem from './content_item'

export default {
  name: 'pageApp_wsContents',
  components: {contentSearch, contentItem},
  props: {
    mode: {
      type: String,
      default () {
        return 'standalone' // standalone, picker, readonly, etc
      }
    },
    options: {
      type: Object,
      default () {
        return {
          types: [],
          typesAll: true,
          needComposition: false
        }
      }
    }
  },
  meta () {
    return {
      title: 'Content'
    }
  },
  data () {
    return {
      type: 'VIDEO',
      searchString: '',
      // content
      content: null,
      contentExplorerOpened: false,
    }
  },
  computed: {
    types () {
      return [
        {id: 'workspace.contents.video', name: this.$t('Video', 'Видео')},
        {id: 'workspace.contents.image', name: this.$t('Images', 'Картинки')},
        {id: 'workspace.contents.audio', name: this.$t('Audio', 'Аудио')},
        {id: 'workspace.contents.books', name: this.$t('Books', 'Книги')},
        // {id: 'workspace.contents.web', name: this.$t('Web', 'Веб')}
      ]
    },
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // add type filter
      if (this.type !== 'all') {
        res.selector.contentType = this.type
      }
      // add sort
      res.sort = [{updatedAt: 'desc'}]
      // TODO: add spheres
      return res
    }
  },
  methods: {
    contentPicked (content) {
      this.$log('contentPicked', this.mode, content)
      if (this.mode === 'standalone') {
        this.$router.push(`/workspace/content/${content.id}`).catch(e => e)
      }
      else {
        this.content = content
        this.contentExplorerOpened = true
      }
    },
    compositionPicked (composition) {
      this.$log('compositionPicked', composition)
      this.$emit('composition', JSON.parse(JSON.stringify(composition)))
      this.$emit('close')
    },
    contentExplored () {
      this.$log('contentExplored', this.mode)
    },
  }
}
</script>
