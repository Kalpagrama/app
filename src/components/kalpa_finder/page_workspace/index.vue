<template lang="pug">
page-bookmarks(
  :isContainer="true"
  :useHeader="false"
  :pagesFilter="pagesFilter"
  :style=`{
    height: height+'px',
  }`
  mode="select"
  @bookmark="$emit('item', $event)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

import pageBookmarks from 'pages/app/workspace/page_bookmarks/index.vue'
import bookmarkListItem from 'components/bookmark/bookmark_list_item.vue'

export default {
  name: 'kalpaFinder_pageWorkspace',
  props: ['searchString', 'page', 'height'],
  components: {
    pageBookmarks,
    bookmarkListItem,
  },
  data () {
    return {
      viewId: null,
      subsriptions: []
    }
  },
  computed: {
    view () {
      if (this.viewId) return this.views.find(v => v.id === this.viewId)
      else return null
    },
    views () {
      return [
        {id: 'media', name: 'Медиа', selector: {wsItemType: 'WS_BOOKMARK', type: {$in: ['IMAGE', 'VIDEO', 'BOOK']}}},
        {id: 'node', name: 'Ядра', selector: {wsItemType: 'WS_BOOKMARK', type: 'NODE'}},
        {id: 'joint', name: 'Связи', selector: {wsItemType: 'WS_BOOKMARK', type: 'JOINT'}},
        {id: 'sphere', name: 'Сферы', selector: {wsItemType: 'WS_BOOKMARK', type: 'SPHERE'}},
        {id: 'user', name: 'Люди', selector: {wsItemType: 'WS_BOOKMARK', type: 'USER'}},
      ].filter(v => {
        if (this.page) return this.page.views.includes(v.id)
        else return true
      })
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add selector filter
      if (this.view) {
        res.selector = {...res.selector, ...this.view.selector}
      }
      else {
        // res.selector = {...res.selector, ...this.types}
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  // watch: {},
  methods: {
    // pagesFilter (pages) {
    //   return pages.filter(p => )
    // },
  },
  created () {
    this.$log('created')
    this.viewId = this.views[0].id
    // this.type = this.types[0]
  }
}
</script>
