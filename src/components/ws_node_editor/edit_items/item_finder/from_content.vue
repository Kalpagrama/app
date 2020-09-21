<template lang="pug">
q-page(:style=`{paddingTop: '0px', paddingBottom: '200px'}`).row.full-width.items-start.content-start
  q-dialog(
    v-model="contentFragmentOpened" position="bottom" maximized
    @hide="contentBookmark = null")
    from-content-fragment(
      :contentBookmark="contentBookmark"
      :style=`{maxWidth: width+'px',}`
      @fragment="$emit('item', $event), contentFragmentOpened = false"
      @close="contentFragmentOpened = false")
  .row.full-width.q-px-sm
    content-search(
      @contentKalpa="contentKalpaFound"
      @searchString="searchString = $event")
  .row.full-width.items-start.content-start.q-pt-md
    kalpa-loader(:mangoQuery="query" :sliceSize="1000")
      template(v-slot=`{items, next}`)
        .row.full-width.items-start.content-start.q-px-sm
          ws-content-item(
            v-for="(contentBookmark,ii) in items" :key="contentBookmark.id"
            :content="contentBookmark"
            @clicked="contentBookmarkClick(contentBookmark)").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import fromContentFragment from './from_content_fragment.vue'

export default {
  name: 'itemFinder_fromContent',
  components: {fromContentFragment},
  data () {
    return {
      searchString: '',
      contentBookmark: null,
      contentFragmentOpened: false,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'CONTENT'
        },
        sort: [{updatedAt: 'desc'}]
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    width () {
      if (this.$q.screen.width < 800) return this.$q.screen.width
      else return 800
    },
  },
  methods: {
    async contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      let {items: [bookmarkFound]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: contentKalpa.oid}})
      this.$log('bookmarkFound', bookmarkFound)
      if (!bookmarkFound) {
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
        this.$log('bookmarkFound', bookmarkFound)
      }
      this.contentBookmarkClick(bookmarkFound)
    },
    contentBookmarkClick (contentBookmark) {
      this.$log('contentBookmarkClick', contentBookmark)
      let itemInput
      if (contentBookmark.contentType === 'IMAGE') {
        itemInput = {
          id: Date.now().toString(),
          thumbUrl: contentBookmark.thumbUrl,
          outputType: contentBookmark.contentType,
          layers: [
            {id: Date.now().toString(), contentOid: contentBookmark.oid, figuresAbsolute: [{t: null, points: []}]},
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
        }
        this.$emit('item', itemInput)
      }
      else if (contentBookmark.contentType === 'VIDEO') {
        this.contentBookmark = contentBookmark
        this.contentFragmentOpened = true
        // itemInput = {
        //   id: Date.now().toString(),
        //   thumbUrl: contentBookmark.thumbUrl,
        //   outputType: contentBookmark.contentType,
        //   layers: [
        //     {id: Date.now().toString(), contentOid: contentBookmark.oid, figuresAbsolute: [{t: 0, points: []}, {t: 10, points: []}]},
        //   ],
        //   operation: { items: null, operations: null, type: 'CONCAT'},
        // }
      }
    }
  }
}
</script>
