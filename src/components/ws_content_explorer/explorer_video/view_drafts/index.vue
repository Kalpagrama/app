<template lang="pug">
q-page(
  :style=`{
    marginTop: nodeEditingId ? '-10px' : '0px',
    paddingTop: nodeEditingId ? '0px' : '8px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
    kalpa-loader(:mangoQuery="queryDrafts" :sliceSize="1000" @items="nodesLoaded")
      template(v-slot=`{items, itemsMore}`)
        .row.full-width.items-start.content-start
          div(
            v-for="(n,ni) in items" :key="n.id"
            v-if="nodeEditingId ? nodeEditingId === n.id : true"
            :style=`{
            }`
            ).row.full-width.items-start.content-start.q-mb-sm
            q-checkbox(
              v-if="!nodeEditingId"
              v-model="nodesChecked" :val="n.id"
              flat dense dark color="green"
              :style=`{opacity: nodesChecked.includes(n.id) ? 1 : 0.3}`).q-ma-sm
            .col
              node-item(
                :player="player"
                :contentKalpa="contentKalpa"
                :contentWorkspace="contentWorkspace"
                :node="n"
                :nodeIndex="ni"
                :isSelected="n.id === nodeSelectedId"
                :isEditing="n.id === nodeEditingId"
                @select="nodeEditingId = null, nodeSelectedId = n.id"
                @edit="nodeSelectedId = null, nodeEditingId = n.id"
                @edited="nodeEditingId = null, nodeSelectedId = n.id"
                @delete="nodeDelete(n)"
                :style=`{
                }`)
            q-btn(
              v-if="!nodeEditingId"
              round flat dense color="grey-8" icon="more_vert")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'
import nodeItem from './node_item/index.vue'

export default {
  name: 'wsContentExplorer_video_viewDrafts',
  components: {nodeItem},
  props: ['contentKalpa', 'contentWorkspace', 'player'],
  data () {
    return {
      nodeSelectedId: null,
      nodeEditingId: null,
      nodesChecked: []
    }
  },
  computed: {
    queryDrafts () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          // contentOid: this.contentKalpa.oid,
          // stage: 'draft', // published? saved?
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}},
          stage: 'draft',
        },
        sort: [{updatedAt: 'desc'}],
      }
      // // name
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    }
  },
  methods: {
    async nodeCreateStart () {
      this.$log('nodeCreateStart')
      let node = await this.nodeCreate()
      this.nodeEditingId = node.id
    },
    async nodeCreate () {
      this.$log('nodeCreate')
      // start/end
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let nodeInput = {
        name: '',
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft',
        wsItemType: 'WS_NODE',
        items: [
          {
            id: Date.now().toString(),
            thumbUrl: this.contentKalpa.thumbUrl,
            outputType: 'VIDEO',
            layers: [
              {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
            ],
            operation: { items: null, operations: null, type: 'CONCAT'},
          }
        ]
      }
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeCreate node', node)
      return node
    },
    async nodeDelete (node) {
      this.$log('nodeDelete', node)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(node.id)
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes)
      if (this.nodeSelectedId || this.nodeEditingId) return
      let layers = nodes.reduce((acc, node) => {
        node.items.map(n => {
          n.layers.map(l => {
            if (l.contentOid === this.contentKalpa.oid) {
              acc.push(l)
            }
          })
        })
        return acc
      }, [])
      this.$log('layers', layers)
      this.$store.commit('ui/stateSet', ['wsContentLayers', layers])
    }
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
