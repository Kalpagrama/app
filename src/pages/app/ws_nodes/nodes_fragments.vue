<template lang="pug">
kalpa-loader(:mangoQuery="query" :sliceSize="1000")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        v-for="(n,ni) in items" :key="n.id"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.b-50.q-mb-sm
        img(
          :src="n.items[0].thumbUrl"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          )
        .col.full-height
          .row.fit.items-center.content-center.q-pa-md
            span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
        //- small.text-white {{n}}
      //-   node-bookmark(
      //-     v-for="(i,ii) in items" :key="i.id"
      //-     :node="i" :nodeIndex="ii"
      //-     @remove="nodeRemove(i)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_nodesFragments',
  props: ['searchString'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'fragment',
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  }
}
</script>
