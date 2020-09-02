<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px', minHeight: '100vh'}`).row.full-width
    kalpa-loader(:mangoQuery="query" :sliceSize="1000")
      template(v-slot=`{items, itemsMore}`)
        masonry(
          :cols="$q.screen.width < 800 ? Math.round($q.screen.width/400) : 2"
          :gutter="{default: 10}")
          div(
            v-for="(i,ii) in items" :key="i.id"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.q-mb-sm.b-40
            //- default header
            div(
              @click="itemSelected === i.id ? itemSelected = null : itemSelected = i.id"
              :style=`{
                position: 'relative', zIndex: 100,
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.full-width.b-40.item
              img(
                v-if="i.items[0] && i.items[0].thumbUrl"
                :src="i.items[0].thumbUrl" draggable="false"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).full-width
              div(
                v-else
                :style=`{height: '100px', width: '400px', borderRadius: '10px', overflow: 'hidden'}`
                ).row.b-40
              //- footer with name
              div(v-if="i.name.length > 0").row.full-width.q-pa-sm
                span.text-white {{ i.name }}
            //- selected
            div(
              v-if="itemSelected === i.id"
              :style=`{
                position: 'relative', zIndex: 90,
                marginTop: '-10px', paddingTop: '18px',
              }`
              ).row.full-width.items-center.content-center.bg-green.q-px-sm.q-pb-sm
              q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
              .col
              q-btn(round flat dense color="white" icon="edit" @click="itemEdit(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_typePublished',
  props: ['searchString'],
  data () {
    return {
      itemSelected: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: 'published'
        }
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // // add type filter
      // if (this.type !== 'all') {
      //   res.selector.contentType = this.type
      // }
      // add sort
      res.sort = [{updatedAt: 'desc'}]
      // TODO: add spheres
      return res
    }
  },
  methods: {
    async itemDelete (item) {
      this.$log('itemDelete', item)
      if (!confirm('Delete node?')) return
      // TODO what to do if we got items on this sphere ???
      await this.$rxdb.remove(item.id)
    },
    itemEdit (item) {
      this.$log('itemEdit', item)
      this.$router.push(`/workspace/node/${item.id}`).catch(e => e)
    },
  }
}
</script>
