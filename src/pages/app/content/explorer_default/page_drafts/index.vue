<template lang="pug">
div(
  :style=`{
    position: 'relative',
    paddingTop: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
    slot
    .row.full-width.items-center.content-center.justify-between.q-pa-sm
      span.text-grey-7.text-bold.q-ml-sm Заметки - {{ nodes.length }}
      q-btn(
        round flat color="grey-7" icon="tune")
    .row.full-width.q-px-sm
      kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000"
        @items="nodesUpdated"
        v-slot=`{items,next,nexting}`)
      div(
        v-for="(n,ni) in nodes" :key="n.id"
        :style=`{
          minHeight: '50px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.q-pa-sm.q-mb-sm
        div(
          @click="nodeClick(n,ni)"
          ).col.cursor-pointer
          .row.full-width.q-pa-sm
            span.text-white {{ n.name }}
            .row.full-width
              small.text-grey-8 {{ $time(n.items[0].layers[0].figuresAbsolute[0].t) }}
        .row.full-height.items-center.content-center
          kalpa-menu-actions(:actions="nodeActions(n)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageDrafts',
  props: ['contentKalpa', 'player', 'node'],
  data () {
    return {
      searchString: '',
      nodes: [],
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          'items.0.layers.0.contentOid': this.contentKalpa.oid
        },
        sort: [
          {updatedAt: 'desc'},
          // {'items.0.layers.0.figuresAbsolute.0.t': 'desc'}
        ]
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
    nodeActions (n) {
      return {
        edit: {
          name: 'Редактировать',
          cb: () => {
            this.nodeClick(n)
          }
        },
        delete: {
          name: 'Удалить',
          color: 'red',
          cb: async () => {
            if (confirm('Удалить?')) {
              this.$log('draftDelete', n)
              await n.remove(true)
            }
          }
        }
      }
    },
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$emit('node', n)
    },
    nodesUpdated (nodes) {
      this.$log('nodesUpdated', nodes)
      this.nodes = [...nodes].sort((a, b) => {
        return a.items[0].layers[0].figuresAbsolute[0].t - b.items[0].layers[0].figuresAbsolute[0].t
      })
      let figures = nodes.reduce((acc, node) => {
        node.items.map(i => {
          if (i.layers) {
            if (i.layers[0].contentOid === this.contentKalpa.oid) {
              let figureInput = i.layers[0].figuresAbsolute[0]
              acc.push([figureInput])
            }
          }
        })
        return acc
      }, [])
      this.figures = figures
      this.player.setState('points', figures)
    }
  }
}
</script>
