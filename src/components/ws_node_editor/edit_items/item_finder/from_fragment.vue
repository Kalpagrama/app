<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.items-start.content-start
  .row.full-width.q-px-md
    div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="searchString"
        placeholder="Find fragment"
        filled dark dense color="grey-6").full-width
  .row.full-width.items-start.content-start.q-pt-md
    kalpa-loader(:mangoQuery="query" :sliceSize="1000")
      template(v-slot=`{items, itemsMore}`)
        masonry(
          :cols="$q.screen.width < 800 ? 2 : 4"
          :gutter="{default: 10}").full-width
          ws-node-item(
            v-for="(i,ii) in items" :key="i.id" :node="i"
            @clicked="itemSelected = i.id").q-mb-sm
            template(v-slot:footer)
              //- selected
              div(
                v-if="itemSelected === i.id"
                :style=`{
                  position: 'relative',
                  marginTop: '-10px', paddingTop: '14px',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden',
                }`
                ).row.full-width.items-center.content-center.bg-green.q-px-xs.q-pb-xs
                //- q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                .col
                //- q-btn(round flat dense color="white" icon="edit" @click="itemEdit(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemFinder_fromFragment',
  data () {
    return {
      searchString: '',
      itemSelected: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'fragment'
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
    fragmentClick (fragment) {
      this.$log('fragmentClick', fragment)
      let item = JSON.parse(JSON.stringify(fragment))
      let itemInput = {
        items: item.items,
        spheres: item.spheres,
        name: item.name
      }
      this.$emit('item', itemInput)
    }
  }
}
</script>
