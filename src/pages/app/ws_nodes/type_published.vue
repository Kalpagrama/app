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
          :cols="$q.screen.width < 800 ? Math.round($q.screen.width/400) : 4"
          :gutter="{default: 10}").full-width
          ws-node-item(
            v-for="(i,ii) in items" :key="i.id" :node="i"
            @clicked="itemSelected = i.id")
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
                q-btn(round flat dense color="green-8" icon="delete_outline" @click="nodeUnpublish(i)")
                .col
                q-btn(round flat dense color="white" icon="launch" @click="nodeExplore(i)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import wsNodeItem from 'components/ws_node_item/index.vue'

export default {
  name: 'wsNodes_typePublished',
  components: {wsNodeItem},
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
    async nodeUnpublish (node) {
      this.$log('nodeUnpublish', node)
      if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      await node.updateExtended('stage', 'draft', false) // без debounce
      await node.updateExtended('oid', node.oid, false) // без debounce
      await NodeApi.nodeDelete(node.oid)
      this.$log('nodeUnPublish complete')
    },
    nodeExplore (node) {
      this.$log('nodeExplore', node)
    }
  }
}
</script>
