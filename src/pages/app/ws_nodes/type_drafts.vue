<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width.items-start.content-start
    //- items
    .row.full-width.q-pt-sm.q-pr-sm
      kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000")
        template(v-slot=`{items,next}`)
          masonry(
            :cols="$q.screen.width < 800 ? 2 : 4"
            :gutter="{default: 10}").full-width
            div(
              v-for="(item, ii) in items" :key="item.id"
              :style=`{position: 'relative'}`
              ).row.full-width
              ws-node-item(
                :node="item"
                :style=`{position: 'relative'}`
                @clicked="itemSelected = item.id").q-mb-sm
                template(v-slot:footer)
                  //- selected
                  div(
                    v-if="itemSelected === item.id"
                    :style=`{
                      position: 'relative',
                      marginTop: '-10px', paddingTop: '14px',
                      borderRadius: '0 0 10px 10px', overflow: 'hidden',
                    }`
                    ).row.full-width.items-center.content-center.bg-green.q-px-xs.q-pb-xs
                    q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(item,ii)")
                    .col
                    q-btn(round flat dense color="white" icon="edit" @click="itemEdit(item,ii)")
              slot(name="tint" :item="item" :itemKey="item.id")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_typeDrafts',
  props: {
    searchString: {type: String},
  },
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
          deletedAt: {$exists: false}
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
      // if (!confirm('Delete node?')) return
      // TODO what to do if we got items on this sphere ???
      // await this.$rxdb.remove(item.id)
      // this.$set()
      item.deletedAt = Date.now()
    },
    itemEdit (item) {
      this.$log('itemEdit', item)
      this.$router.push(`/workspace/node/${item.id}`).catch(e => e)
    },
  }
}
</script>
