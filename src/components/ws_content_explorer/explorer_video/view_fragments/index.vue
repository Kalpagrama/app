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
            ).row.full-width.items-start.content-start
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
                @unselect="nodeSelectedId = null"
                @edit="nodeSelectedId = null, nodeEditingId = n.id"
                @edited="nodeEditingId = null, nodeSelectedId = n.id"
                @delete="nodeDelete(n)"
                :style=`{
                }`)
            q-btn(
              v-if="!nodeEditingId"
              @click="nodeMoreStart(n)"
              round flat dense color="grey-8" icon="more_vert").q-ml-xs.q-mt-xs
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-page-sticky(
      v-if="nodesChecked.length > 0"
      expand position="bottom")
      .row.full-width.justify-center.q-pb-sm
        div(:style=`{maxWidth: '800px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.b-40.q-pa-md
          q-btn(flat color="white" no-caps @click="nodesChecked = []") Close
          q-btn(flat color="red" no-caps @click="nodesCheckedDelete()") Delete
          .col
          q-btn(color="green" no-caps @click="nodesCheckedCreateNode()") Create node
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
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}},
          stage: 'fragment',
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
        stage: 'fragment',
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
    nodeMoreStart (node) {
      this.$log('nodeMoreStart', node)
      this.$q.bottomSheet({
        dark: true,
        title: node.name,
        persistent: false,
        seamless: false,
        grid: false,
        style: {
          borderRadius: '10px',
          overflow: 'hidden',
          paddingBottom: '50px',
          marginLeft: '10px',
          marginRight: '10px',
          marginBottom: '50px',
          background: 'rgb(60,60,60)',
        },
        actions: [
          {id: 'share', label: 'Share'},
          {id: 'create-node', label: 'Create node'},
        ]
      })
    },
    async nodeDelete (node) {
      this.$log('nodeDelete', node)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(node.id)
    },
    nodesCheckedDelete () {
      this.$log('nodesCheckedDelete')
      if (!confirm(this.$t('confirm_Really delete?', 'Удалить?'))) return
      this.nodesChecked.map(id => {
        this.$rxdb.remove(id)
      })
      this.nodesChecked = []
    },
    nodesCheckedCreateNode () {
      this.$log('nodesCheckedCreateNode')
      // TODO go to the editor of nodes... multinode?
      this.nodesChecked = []
    },
    nodesLoaded (nodes) {
      if (this.nodeSelectedId || this.nodeEditingId) return
      this.$log('nodesLoaded', nodes)
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
      this.$store.commit('ui/stateSet', ['wsContentLayers', JSON.parse(JSON.stringify(layers))])
    }
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
