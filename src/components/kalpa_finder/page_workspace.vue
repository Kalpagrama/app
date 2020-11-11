<template lang="pug">
q-page(
  :style=`{
    paddingTop: '40px',
  }`)
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`).b-30
    //- types
    .row.full-width.q-px-sm
      .row.full-width.items-start.content-start.scroll.q-pt-xs
        .row.items-center.content-center.no-wrap
          q-btn(
            @click="type = t"
            v-for="(t,ii) in types" :key="t.id"
            flat no-caps dense
            :color="(type && type.id === t.id) ? 'green' : 'grey-7'"
            :class=`{
              'b-40': type && type.id === t.id
            }`
            :style=`{}`).q-mr-xs.q-px-xs {{ t.name }}
  kalpa-loader(
    :immediate="true"
    :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
    .row.full-width.items-start.content-start.q-pa-sm
      item(
        v-for="(item,ii) in items" :key="ii"
        @click.native="$emit('item', item)"
        :item="item"
        :style=`{
        }`
        ).q-mb-sm
        template(v-slot:tint=`{item}`)
          slot(name="tint" :item="item")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder_pageWorkspace',
  props: ['searchString', 'workspaceTypes'],
  components: {
    item: () => import('./item.vue')
  },
  data () {
    return {
      type: null
    }
  },
  computed: {
    types () {
      return [
        {id: 'VIDEO', name: 'Видео', selector: {wsItemType: 'WS_BOOKMARK', type: 'VIDEO'}},
        {id: 'IMAGE', name: 'Картинки', selector: {wsItemType: 'WS_BOOKMARK', type: 'IMAGE'}},
        {id: 'NODE_WS', name: 'Ядра черновики', selector: {wsItemType: 'WS_NODE'}},
        {id: 'NODE_BOOKMARK', name: 'Ядра сохраненные', selector: {wsItemType: 'WS_BOOKMARK', type: 'NODE'}},
        {id: 'JOINT', name: 'Связи', selector: {wsItemType: 'WS_JOINT'}},
        {id: 'USER', name: 'Люди', selector: {wsItemType: 'WS_BOOKMARK', type: 'USER'}},
        {id: 'SPHERE', name: 'Сферы', selector: {wsItemType: 'WS_BOOKMARK', type: 'SPHERE'}}
      ].filter(t => {
        if (this.workspaceTypes) return this.workspaceTypes.includes(t.id)
        else return t
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
      if (this.type) {
        res.selector = {...res.selector, ...this.type.selector}
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
  methods: {
    typeClick (type) {
      this.$log('typeClick', type)
      this.typesSelected = [type.id]
    }
  },
  created () {
    this.$log('created')
    this.type = this.types[0]
  }
}
</script>
