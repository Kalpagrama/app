<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- ws content explorer
  q-dialog(
    v-model="contentExplorerOpened" position="bottom"
    @hide="contentExplored")
    ws-content-explorer(
      v-if="content" :value="content"
      mode="picker"
      @close="contentExplorerOpened = false"
      @compositionPicked="compositionPicked"
      :options=`{}`
      :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px',}`).b-50
  //- header
  div(:style=`{}`).row.full-width.justify-center
    //- standalone header for navigation
    div(
      v-if="mode === 'standalone'"
      :style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsContentList_title', 'Контент')}}
    .row.full-width.justify-center
      content-search(
        @content="contentPicked"
        @searchString="searchString = $event"
        :style=`{maxWidth: '800px',}`)
    //- content type picker
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`).row.full-width.justify-start.q-px-md
        q-tabs(v-model="type" no-caps dense active-color="white" align="left").text-grey-4
          q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  //- body
  div(:style=`{}`).col.full-width.scroll
    .row.fit.justify-center
      div(:style=`{maxWidth: '800px',}`).row.fit.items-start.content-start.justify-center
        kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
          template(v-slot=`{items, itemsMore}`)
            list-masonry(
              v-if="type === 'IMAGE'" :items="items")
              template(v-slot:item=`{item}`)
                content-item(:content="item" @pick="contentPicked(item)")
            div(
              v-else).row.full-width.q-px-sm
              content-item(
                v-for="(c,ci) in items" :key="c.id" :content="c"
                @pick="contentPicked(c)")
      div(:style=`{height: '200px',}`).row.full-width
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

import contentSearch from './content_search'
import contentItem from './content_item'

export default {
  name: 'wsContentList',
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
