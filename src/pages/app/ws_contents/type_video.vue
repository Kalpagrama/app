<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width
    kalpa-loader(
      ref="kl" v-slot=`{items,next}`
      :query="query" :limit="1000"
      :immediate="true" @reset="$refs.kl.next(0, () => {})")
      masonry(
        :cols="$q.screen.width < 800 ? Math.round($q.screen.width/400) : 2"
        :gutter="{default: 10}").full-width.q-pr-sm
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
            ).row.full-width.items-start.content-start.b-40.item
            img(
              :src="i.thumbUrl" draggable="false"
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).full-width
            .row.full-width.q-pa-sm
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
            q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsContents_typeVideo',
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
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          contentType: 'VIDEO',
          type: 'CONTENT',
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    async itemDelete (item) {
      this.$log('itemDelete', item)
      if (!confirm('Delete content?')) return
      // TODO what to do if we got items on this sphere ???
      await this.$rxdb.remove(item.id)
    },
    itemLaunch (contentBookmark) {
      this.$log('itemLaunch', contentBookmark)
      this.$router.push(`/content/${contentBookmark.oid}?viewid=nodes-mine`).catch(e => e)
    },
  }
}
</script>
