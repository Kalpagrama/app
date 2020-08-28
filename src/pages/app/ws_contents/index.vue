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
          q-tabs(v-model="type" no-caps dense active-color="white" align="left" switch-indicator).full-width.text-grey-8
            q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  q-page-container
    q-page(style="padding-top: 8px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '200px',}`).row.full-width.items-start.content-start
          q-tab-panels(
            v-model="type" infinite animated
            :style=`{margin: 0, padding: 0, background: 'none'}`).full-width
            q-tab-panel(
              v-for="t in types" :key="t.id" :name="t.id"
              :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
                template(v-slot=`{items, itemsMore}`)
                  list-masonry(
                    v-if="t.id === 'IMAGE'" :items="items").full-width.q-px-sm
                    template(v-slot:item=`{item}`)
                      content-item(:content="item" @pick="contentPicked(item)")
                  div(
                    v-else).row.full-width.q-px-sm
                    content-item(
                      v-for="(c,ci) in items" :key="c.id" :content="c"
                      @pick="contentPicked(c)")
      //- q-page-sticky(expand position="top" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px'}`).row.full-width.q-px-md
            q-tabs(v-model="type" no-caps dense active-color="white" align="left" switch-indicator).text-grey-8
              q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
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
        {id: 'VIDEO', name: this.$t('Video', 'Видео')},
        {id: 'IMAGE', name: this.$t('Images', 'Картинки')},
        {id: 'BOOK', name: this.$t('Books', 'Книги')},
        {id: 'WEB', name: this.$t('Web', 'Веб')}
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
