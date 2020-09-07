<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.items-start.content-start
  .row.full-width.q-px-md
    div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="searchString"
        placeholder="Find content"
        filled dark dense color="grey-6").full-width
  .row.full-width.items-start.content-start.q-pt-md
    kalpa-loader(:mangoQuery="query" :sliceSize="1000")
      template(v-slot=`{items, next}`)
        .row.full-width.items-start.content-start.q-px-md
          div(
            v-for="(i,ii) in items" :key="i.id"
            @click="contentClick(i)"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.items-start.content-start.b-40.q-mb-sm.k-item.q-pa-md
            img(
              :src="i.thumbOid"
              :style=`{
                height: '60px', width: '100px',
                objectFit: 'cover',
                borderRadius: '10px', overflow: 'hidden'}`).b-50
            .col.full-height
              .row.fit.items-start.content-start.q-px-md
                span.text-white {{ i.name.slice(0, 40) }}
                .row.full-width
                  small.text-grey-7 {{ i.contentType }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemFinder_fromContent',
  data () {
    return {
      searchString: '',
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
  },
  methods: {
    contentClick (content) {
      this.$log('contentClick', content)
      let item = JSON.parse(JSON.stringify(content))
      let itemInput = {
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: content.thumbOid,
            outputType: content.contentType,
            layers: [
              {id: Date.now().toString(), contentOid: content.contentOid, figuresAbsolute: [{t: 0, points: []}, {t: 10, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ],
        spheres: item.spheres,
        name: ''
      }
      this.$emit('item', itemInput)
    }
  }
}
</script>
