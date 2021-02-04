<template lang="pug">
q-page(
  :style=`{
    paddingTop: '40px',
  }`).row.full-width.justify-center
  //- header
  q-page-sticky(
    expand position="top"
    :style=`{zIndex: 1000}`).b-30
    //- types
    .row.full-width.justify-center.q-px-sm
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`
        ).row.full-width.items-start.content-start.scroll.q-pt-xs
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
  //- body
  //- kalpa-loader(
    v-if="searchString.length > 3"
    :immediate="true"
    :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start.q-pa-sm
      router-link(
        v-for="(item,ii) in items" :key="ii"
        :to="itemLink(item)"
        :style=`{
          borderRadius: '10px',
          background: 'rgb(35,35,35)',
        }`
        ).row.full-width.q-mb-sm.cursor-pointer
        div(
          :style=`{
            background: 'rgb(33,33,33)',
            borderRadius: '10px',
          }`
          ).row.items-start.content-start
          img(
            :src="item.thumbUrl"
            :style=`{
              height: '50px',
              borderRadius: '10px',
            }`)
        .col
          .row.full-width.items-center.content-center.q-pa-sm
            span.text-white {{ item.name }}
            .row.full-width
              small.text-grey-6 {{ item.type }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'kalpaFinder_pageKalpagrama',
  props: ['searchString', 'kalpaTypes'],
  components: {
    // item: () => import('./item.vue')
  },
  data () {
    return {
      type: null
    }
  },
  computed: {
    types () {
      return [
        {id: 'VIDEO', name: 'Видео', selector: {types: ['VIDEO']}},
        {id: 'IMAGE', name: 'Картинки', selector: {types: ['IMAGE']}},
        {id: 'NODE', name: 'Ядра', selector: {types: ['NODE']}},
        {id: 'JOINT', name: 'Связи', selector: {types: ['JOINT']}},
        {id: 'USER', name: 'Люди', selector: {types: ['USER']}},
        {id: 'SPHERE', name: 'Сферы', selector: {types: ['WORD', 'SENTENCE']}}
      ].filter(t => {
        if (this.kalpaTypes) return this.kalpaTypes.includes(t.id)
        else return t
      })
    },
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SEARCH,
          querySearch: this.searchString,
        },
        // populateObjects: true,
        limit: 100
      }
      if (this.type) {
        res.selector.objectTypeEnum = {$in: this.type.selector.types}
      }
      else {
        res.selector.objectTypeEnum = {
          $in: this.types.reduce((acc, val) => {
            val.selector.types.map(type => {
              acc.push(type)
            })
            return acc
          }, [])
        }
      }
      // else {}
      return res
    },
  },
  methods: {
    itemLink (item) {
      let m = {
        VIDEO: '/content/',
        IMAGE: '/content/',
        BOOK: '/content',
        GIF: '/content/',
        USER: '/user/',
        NODE: '/node/',
        JOINT: '/node',
        SPHERE: '/sphere/',
        WORD: '/sphere/',
        SENTENCE: '/sphere/',
      }
      return m[item.type] + item.oid
    }
  },
  created () {
    this.$log('created')
    this.type = this.types[0]
  }
}
</script>
