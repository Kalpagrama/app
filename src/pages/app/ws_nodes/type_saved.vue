<template lang="pug">
q-page(:style=`{paddingTop: '16px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px', minHeight: '100vh'}`).row.full-width.q-pr-sm
    kalpa-loader(:mangoQuery="query" :sliceSize="1000")
      template(v-slot=`{items,next}`)
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
                q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                .col
                q-btn(round flat dense color="white" icon="edit" @click="itemEdit(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
// import wsNodeItem from 'components/ws_node_item/index.vue'

export default {
  name: 'wsNodes_typeSaved',
  // components: {wsNodeItem},
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
          stage: 'saved'
        }
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
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
    async itemEdit (item) {
      this.$log('itemEdit', item)
      // can we edit this? or make a copy? delete?
      let nodeInput = JSON.parse(JSON.stringify(item))
      delete nodeInput.id
      delete nodeInput.oid
      nodeInput.stage = 'draft'
      nodeInput.name += ' COPY'
      this.$log('itemEdit nodeInput', nodeInput)
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$router.push(`/workspace/node/${node.id}`).catch(e => e)
    },
  }
}
</script>
