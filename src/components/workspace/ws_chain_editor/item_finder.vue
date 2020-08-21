<template lang="pug">
div(:style=`{position: 'relative', minHeight: $q.screen.height+'px',}`).column.full-width.b-30
  //- header
  .row.full-width.items-center.content-center.q-pt-md.q-pb-sm.q-px-md
    .col
      span(:style=`{fontSize: '19px',}`).text-white.text-bold Item finder
    //- q-btn(round flat dense color="white" icon="more_vert")
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
      template(v-slot=`{items, itemsMore}`)
        //- list-masonry(:items="items").q-px-sm
        //-   template(v-slot:item=`{item}`)
        //-     div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-50
        //-       img(:src="item.thumbUrl || item.thumbOid" :style=`{borderRadius: '10px', overflow: 'hidden',}`).full-width
        //-       div(v-if="item.name && item.name.length > 0").row.full-width.q-px-sm.q-py-xs
        //-         span.text-white {{ item.name }}
        //-       .row.full-width.text-white.bg-red
        //-         span {{ item.wsItemType }}
        .row.full-width.items-start.content-start.q-px-sm
          div(
            v-for="(i,ii) in items" :key="i.id"
            :style=`{minHeight: '100px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.q-mb-sm.b-40
            div(
              @click="itemClick(i,ii)"
              :style=`{height: '100px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-50
              img(
                :src="i.thumbUrl || i.thumbOid"
                :style=`{
                  height: '100px',
                  borderRadius: '10px', overflow: 'hidden',}`)
              .col.full-height.q-pa-sm
                span.text-white {{ i.name }}
            div(
              v-if="itemId === i.id"
              :style=`{height: '300px',}`
              ).column.full-width.b-40
              .col.full-width.scroll
                kalpa-loader(:mangoQuery="contentQuery" :sliceSize="1000")
                  template(v-slot=`{items, itemsMore}`)
                    .row.full-width.items-start.content-start.q-pa-sm
                      div(
                        v-for="(i,ii) in items" :key="ii"
                        :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-50.q-mb-xs.q-pa-sm
                        span.text-white {{ ii }}
              .row.full-width.q-pa-sm
                q-btn(
                  @click="$emit('item', i), $emit('close')"
                  color="green" no-caps).full-width Take content
  //- footer
  div(:style=`{height: '50px',}`).row.full-width.items-center.content-center.q-px-sm.b-30
    q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="$emit('close')")
    .col
      span.text-white Filters
</template>

<script>
import { ContentApi } from 'src/api/content'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsChainEditor_itemFinder',
  data () {
    return {
      searchString: '',
      itemId: null,
      item: null,
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // // add type filter
      // if (this.type !== 'all') {
      //   res.selector.contentType = this.type
      // }
      res.selector.contentType = 'VIDEO'
      // add sort
      res.sort = [{updatedAt: 'desc'}]
      // TODO: add spheres
      return res
    },
    contentQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      res.selector.contentType = 'COMPOSITION'
      res.selector.contentOid = this.item.contentOid
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
  },
  methods: {
    itemClick (item, itemIndex) {
      this.$log('itemClick', item, itemIndex)
      this.$set(this, 'itemId', item.id)
      this.$set(this, 'item', JSON.parse(JSON.stringify(item)))
    }
  }
}
</script>
