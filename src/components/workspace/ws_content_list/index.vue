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
  .row.full-width.items-center.content-center
    //- navigation
    div(
      v-if="mode === 'standalone'"
      :style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('content', 'Контент')}}
    content-search(
      @searchString="searchString = $event"
      )
    //- content type picker
    .row.full-width.justify-start
      q-tabs(v-model="type" no-caps dense active-color="green" align="left").text-white
        q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  //- body
  .col.full-width.scroll
    .row.fit.items-start.content-start.justify-center
      kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
        template(v-slot=`{items, itemsMore}`)
          //- div(v-if="items.length > 0" :style=`{maxWidth: '800px', paddingBottom: '400px',}`).row.full-width.q-px-sm
          list-masonry(
            v-if="type === 'IMAGE'" :items="items")
            template(v-slot:item=`{item}`)
              content-item(:content="item" @pick="contentPicked(item)")
          div(
            v-else).row.full-width.q-pt-md
            content-item(
              v-for="(c,ci) in items" :key="c.id" :content="c"
              @pick="contentPicked(c)")
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
      this.content = content
      this.contentExplorerOpened = true
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
