<template lang="pug">
q-page(
  :style=`{
    paddingTop: '40px',
  }`)
  //- kalpa-loader(
    :immediate="true"
    :query="query" :limit="1000" v-slot=`{items,next,nexting}`)
    .row.full-width.bg-red
      div(
        v-for="c in items" :key="c.oid"
        :style=`{
          height: '80px',
          marginBottom: '8px',
        }`
        ).row.full-width.items-start.content-start
        img(
          :src="c.thumbUrl"
          :style=`{
            height: '80px',
            width: '80px',
            borderRadius: '10px',
          }`)
        .col.full-height
          .row.fit.items-center.content-center
            span.text-white {{ c.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaFinder_pageContent',
  props: ['searchString', 'page'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add selector filter
      // if (this.view) {
      //   res.selector = {...res.selector, ...this.view.selector}
      // }
      // else {
      //   // res.selector = {...res.selector, ...this.types}
      // }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  }
}
</script>
