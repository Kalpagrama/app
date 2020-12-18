<template lang="pug">
.column.full-width.items-start.content-start.b-30
  //- header
  .row.full-width.justify-center
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-center.content-center.q-pa-xs
        .col
          .row.full-width.q-px-sm
            span.text-white Черновики - {{ nodes.length }}
        q-btn(
          round flat color="white" icon="tune")
        q-btn(
          @click="$emit('close')"
          round flat color="white" icon="clear")
    //- .row.full-width.q-px-sm
      q-btn(flat dense color="green" no-caps @click="nodeAddNow") Add node now
  //- body
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="query" :limit="1000"
      @items="nodesUpdated"
      v-slot=`{items,next,nexting}`)
    //- items wrapper
    .row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`
        ).row.full-width.items-start.content-start.q-pa-xs
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
    async nodeAddNow () {
      this.$log('nodeAddNow')
      if (!this.player) return
      let nodeInput = {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      }
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
      let composition = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        thumbHeight: this.contentKalpa.thumbHeight,
        thumbWidth: this.contentKalpa.thumbWidth,
        outputType: 'VIDEO',
        layers: [
          {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        __typename: 'Composition',
      }
      nodeInput.items[0] = composition
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('node', node)
    },
    nodesUpdated (nodes) {
      this.$log('nodesUpdated', nodes)
      this.nodes = [...nodes].sort((a, b) => {
        return a.items[0].layers[0].figuresAbsolute[0].t - b.items[0].layers[0].figuresAbsolute[0].t
      })
    }
  }
}
</script>
