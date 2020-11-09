<template lang="pug">
.row.full-width.items-start.content-start
  kalpa-loader(
    @items="nodesLoaded"
    :query="query"
    :immediate="true"
    :limit="1000" v-slot=`{items, next}`)
    .row.full-width.items-start.content-start
      node-item(
        v-for="(node,ii) in items" :key="node.id"
        :node="node" :nodeIndex="ii"
        v-bind="$props"
        :nodeSelected="nodeSelectedId === node.id"
        :nodeEditing="nodeEditingId === node.id"
        @edit="$emit('nodeEdit', node)"
        @select="nodeSelectedId = node.id"
        ).q-mb-sm
      //- node create btn
      q-btn(
        @click="$emit('nodeCreate')"
        flat color="green" icon="add" size="lg"
        :style=`{
          height: '60px',
          background: 'rgb(35,35,35)',
          marginBottom: $q.screen.height/2+'px',
        }`
        ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './type_drafts_item.vue'

export default {
  name: 'viewNodes_typeDrafts',
  props: ['player', 'contentKalpa', 'contentBookmark', 'nodeEditingId'],
  components: {nodeItem},
  data () {
    return {
      nodeSelectedId: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}}
        },
        sort: [{updatedAt: 'asc'}],
      }
      return res
    },
  },
  methods: {
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes.length)
      // get figures
      let figures = nodes.reduce((acc, node) => {
        node.items.map(i => {
          if (i.layers[0].contentOid === this.contentKalpa.oid) {
            let figureInput = i.layers[0].figuresAbsolute[0]
            acc.push([figureInput])
          }
        })
        return acc
      }, [])
      this.$emit('figures', figures)
    }
  }
}
</script>
