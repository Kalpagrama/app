<template lang="pug">
div(
  :style=`{marginBottom: '100px'}`
  ).row.full-width.items-start.content-start.justify-center
  //- body
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start
    kalpa-loader(
      v-if="nodeEditing === null"
      ref="kl1" :query="queryNodesWorkspace"
      :immediate="true" @reset="$refs.kl1.next(0, () => {})"
      :limit="1000" @items="nodesWorkspaceLoaded" v-slot=`{items, next}`)
    kalpa-loader(
      v-if="nodeEditing === null"
      ref="kl2" :query="queryNodesKalpa"
      :immediate="true" @reset="$refs.kl2.next(0, () => {})"
      :limit="1000" @items="nodesKalpaLoaded" v-slot=`{items, next}`)
    .row.full-width.items-start.content-start.q-px-sm.q-pt-lg
      div(
        v-for="(node, ni) in nodes" :key="node.id || node.oid"
        ).row.full-width.items-start.content-start.q-mb-xs
        //- left side
        div(:style=`{width: '40px',}`).row.full-height.items-start.content-start.justify-center
          q-checkbox(
            v-model="nodesChecked" :val="node.id || node.oid"
            flat dense dark color="green"
            :style=`{
              opacity: nodesChecked.includes(node.id || node.oid) ? 1 : 0.3}`).q-ma-sm
          div(v-if="node.oid").row.full-width.justify-center.q-pt-sm
            q-btn(flat dense icon="language" color="grey-9" @click="$router.push('/node/'+node.oid)")
        .col
          node-list(
            :player="player"
            :contentKalpa="contentKalpa"
            :node="node"
            :isSelected="node.id === nodeSelectedId || node.oid === nodeSelectedId"
            @select="nodeSelectedId = node.id || node.oid"
            @edit="$emit('node', node)")
        //- right side
        div(:style=`{width: '40px'}`).row.full-height.items-start.content-start
          div(v-if="nodeSelectedId === node.id || nodeSelectedId === node.oid").row.full-width.justify-center
            q-btn(
              @click="nodeSelectedId = null"
              flat dense round color="grey-6" icon="keyboard_arrow_up")
            div(
              :style=`{paddingTop: '11px'}`).row.full-width.justify-center
              q-btn(round flat dense icon="edit" color="grey-6" @click="nodeEdit(node)")
            slot(name="nodeActionMine" :node="node")
  //- nodes checked menu
  transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
    q-page-sticky(
      v-if="nodesChecked.length > 0"
      expand position="bottom"
      :style=`{zIndex: 5000}`)
      .row.full-width.justify-center.q-pb-sm
        div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', borderRadius: '10px',}`
          ).row.full-width.items-center.content-center.b-40.q-pa-md
          q-btn(flat color="white" no-caps @click="nodesChecked = []") {{ $t('cance', 'Отмена') }}
          q-btn(
            v-if="nodesCheckedDeleteCan"
            flat color="red" no-caps @click="nodesCheckedDelete()") {{ $t('Delete', 'Удалить') }}
          .col
          slot(name="nodeActionMine" :node="null")
          div(v-if="!$scopedSlots.nodeActionMine").row.full-height.items-center.content-center
            q-btn(
              v-if="nodesChecked.length === 1"
              color="green" no-caps @click="nodesCheckedCreateNode()") Publish
            q-btn(
              v-if="nodesChecked.length > 1"
              color="green" no-caps @click="nodesCheckedCreateNode()") Group & Publish
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import nodeList from './node_list/index.vue'

export default {
  name: 'contentExplorerVideo_viewNodesMine',
  components: {nodeList},
  props: ['contentKalpa', 'player'],
  data () {
    return {
      nodeSelectedId: null,
      nodesWorkspace: [],
      nodeEditing: null,
      nodesKalpa: [],
      nodesChecked: [],
    }
  },
  computed: {
    nodes () {
      return [...this.nodesWorkspace, ...this.nodesKalpa].sort((a, b) => {
        if (a.items[0].layers[0].figuresAbsolute[0].t > b.items[0].layers[0].figuresAbsolute[0].t) {
          return 1
        }
        else {
          return -1
        }
      })
    },
    nodesCheckedDeleteCan () {
      return !this.nodesChecked.find(id => !id.startsWith('WS_NODE::'))
    },
    queryNodesWorkspace () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}},
        },
        sort: [{updatedAt: 'desc'}],
      }
      return res
    },
    queryNodesKalpa () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  },
  watch: {
    nodes: {
      deep: true,
      handler (to, from) {
        this.$log('nodes TO', to.length)
        this.nodesUpdate(to)
      }
    },
    nodeSelectedId: {
      async handler (to, from) {
        this.$log('nodeSelectedId TO', to)
        if (!to) {
          await this.$wait(300)
          this.nodesUpdate(this.nodes)
        }
      }
    }
  },
  methods: {
    async nodeEdit (node) {
      this.$log('nodeEdit', node)
      if (node.oid) {
        this.$log('COPY AND EDIT', node.oid)
        let nodeInput = {
          name: node.name,
          category: 'FUN',
          layout: node.layout,
          wsItemType: 'WS_NODE',
          thumbUrl: this.contentKalpa.thumbUrl,
          spheres: [],
          items: [
            {
              id: `${Date.now().toString()}-0`,
              thumbUrl: node.items[0].thumbUrl,
              contentOid: node.items[0].contentOid,
              outputType: node.items[0].outputType,
              operation: node.items[0].operation,
              layers: node.items[0].layers.map((layer, layerIndex) => {
                return {
                  id: `${Date.now().toString()}-0-layer`,
                  contentOid: layer.contentOid,
                  figuresAbsolute: layer.figuresAbsolute,
                  points: layer.points || []
                }
              })
            }
          ]
        }
        this.$log('nodeInput', nodeInput)
        let nodeCopied = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
        this.$emit('node', nodeCopied)
      }
      else {
        this.$emit('node', node)
      }
    },
    nodesUpdate (nodes) {
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      this.$log('nodesUpdate nodes', nodesCopy.length)
      this.$store.commit('ui/stateSet', ['contentNodes', nodesCopy])
    },
    nodesCheckedDelete () {
      this.$log('nodesCheckedDelete')
      if (!confirm(this.$t('confirm_Really delete?', 'Удалить?'))) return
      this.nodesChecked.map(id => {
        this.$rxdb.remove(id)
      })
      this.nodesChecked = []
    },
    async nodesCheckedCreateNode () {
      this.$log('nodesCheckedCreateNode')
      let nodeInput = {
        name: '',
        category: 'FUN',
        layout: 'PIP',
        wsItemType: 'WS_NODE',
        thumbUrl: '',
        spheres: [],
        items: []
      }
      // get nodes
      await Promise.all(
        this.nodesChecked.map(async (nodeId) => {
          let node = await this.$rxdb.get(RxCollectionEnum.WS_NODE, nodeId)
          // let [node] = await this.$rxdb.find({ selector: { rxCollectionEnum: RxCollectionEnum.WS_NODE, id: nodeId } })
          this.$log('node', node)
          // if we got node
          if (node) {
            // add names to spheres
            if (node.name && node.name.length > 0) {
              let [sphere] = await this.$rxdb.find({ selector: { rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: node.name } })
              // create sphere if there is no one
              if (!sphere) {
                let sphereInput = {
                  wsItemType: 'WS_SPHERE',
                  name: node.name,
                  spheres: []
                }
                sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
              }
              // add to nodeInput unique array of spheres
              if (!nodeInput.spheres.includes(sphere.id)) nodeInput.spheres.push(sphere.id)
            }
            // add spheres
            if (node.spheres && node.spheres.length > 0) {
              node.spheres.map(sphereId => {
                if (!nodeInput.spheres.includes(sphereId)) nodeInput.spheres.push(sphereId)
              })
            }
            // add items
            node.items.map((itemRaw, itemIndex) => {
              let item = JSON.parse(JSON.stringify(itemRaw))
              let itemInput = {
                id: `${Date.now().toString()}-${itemIndex}`,
                thumbUrl: item.thumbUrl,
                contentOid: item.contentOid,
                outputType: item.outputType,
                operation: item.operation,
                layers: item.layers.map((layer, layerIndex) => {
                  return {
                    id: `${Date.now().toString()}-${itemIndex}-layer`,
                    contentOid: layer.contentOid,
                    figuresAbsolute: layer.figuresAbsolute,
                    points: layer.points || []
                  }
                })
              }
              nodeInput.items.push(itemInput)
            })
          }
        })
      )
      this.$log('nodeInput', nodeInput)
      let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$router.push(`/workspace/node/${node.id}`).catch(e => e)
      this.nodesChecked.map(id => {
        this.$rxdb.remove(id)
      })
    },
    nodesCheckedGroup () {
      this.$log('nodesCheckedGroup')
    },
    nodesWorkspaceLoaded (nodes) {
      this.$log('nodesWorkspaceLoaded', nodes.length)
      this.nodesWorkspace = nodes
    },
    nodesKalpaLoaded (nodes) {
      this.$log('nodesKalpaLoaded', nodes.length)
      let nodesCopy = JSON.parse(JSON.stringify(nodes))
      this.nodesKalpa = nodesCopy.map(n => {
        let nodeInput = n
        nodeInput.items.sort((a, b) => {
          if (a.layers[0].contentOid === this.contentKalpa.oid) {
            return -1
          }
          else {
            return 1
          }
        })
        return nodeInput
      })
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['contentNodes', null])
  }
}
</script>
