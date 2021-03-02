<template lang="pug">
div(
  :style=`{
    paddingTop: '40px',
  }`
  ).row.full-width
  list-feed(
    :query="query"
    :itemMiddlePersist="true"
    :itemStyles=`{
      paddingBottom: '8px',
    }`)
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      item(
        @click.native="$emit('item', item)"
        :item="item"
        :style=`{
        }`
        ).q-mb-sm
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`).b-30
    //- types
    .row.full-width.justify-center.q-px-sm
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start.scroll.q-py-xs
        .row.items-center.content-center.no-wrap
          q-btn(
            @click="viewId = v.id"
            v-for="(v,ii) in views" :key="v.id"
            flat no-caps dense
            :color="viewId === v.id ? 'green' : 'grey-7'"
            :class=`{
              'b-40': viewId === v.id
            }`
            :style=`{}`).q-mr-xs.q-px-xs {{ v.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'
import item from './item.vue'

export default {
  name: 'kalpaFinder_pageWorkspace',
  props: ['searchString', 'page'],
  components: {
    item,
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
        {id: 'video', name: 'Видео', selector: {wsItemType: 'WS_BOOKMARK', type: 'VIDEO'}},
        {id: 'book', name: 'Книги', selector: {wsItemType: 'WS_BOOKMARK', type: 'BOOK'}},
        {id: 'image', name: 'Картинки', selector: {wsItemType: 'WS_BOOKMARK', type: 'IMAGE'}},
        {id: 'node', name: 'Ядра', selector: {wsItemType: 'WS_BOOKMARK', type: 'NODE'}},
        {id: 'joint', name: 'Связи', selector: {wsItemType: 'WS_BOOKMARK', type: 'JOINT'}},
        {id: 'sphere', name: 'Сферы', selector: {wsItemType: 'WS_BOOKMARK', type: 'SPHERE'}},
        // {id: 'user', name: 'Люди', selector: {wsItemType: 'WS_BOOKMARK', type: 'USER'}},
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
  },
  created () {
    this.$log('created')
    this.viewId = this.views[0].id
    // this.type = this.types[0]
  }
}
</script>
