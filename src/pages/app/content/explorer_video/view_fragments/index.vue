<template lang="pug">
q-page(
  :style=`{
    marginTop: nodeEditing ? '-10px' : '0px',
    paddingTop: nodeEditing ? '0px' : '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '800px',}`).row.full-width.items-start.content-start
    div(
      v-if="nodeEditing === null"
      ).row.full-width.q-px-lg.q-py-xs
      q-tabs(
        v-model="viewId"
        dense active-color="white" no-caps switch-indicator
        ).full-width.text-grey-7
        q-tab(name="mine" label="Mine")
        q-tab(name="kalpa" label="Kalpa")
      //- q-btn(flat dense no-caps color="white"
        :class=`{
          'bg-green': viewId === 'mine',
          'b-40': viewId !== 'mine',
        }`).b-40.q-mr-sm.q-px-sm Mine
      //- q-btn(flat dense no-caps color="white").q-mr-sm Kalpa
    //- SELCTING
    kalpa-loader(
      v-if="nodeEditing === null" :mangoQuery="queryNodes" :sliceSize="1000" @items="nodesWorkspaceLoaded" v-slot=`{items, next}`)
    kalpa-loader(
      v-if="nodeEditing === null" :mangoQuery="queryDrafts" :sliceSize="1000" @items="nodesKalpaLoaded" v-slot=`{items, next}`)
        .row.full-width.items-start.content-start.q-px-sm.q-pt-lg
          div(
            v-for="(n,ni) in nodes" :key="n.id"
            ).row.full-width.items-start.content-start.q-mb-xl
            q-checkbox(
              v-model="nodesChecked" :val="n.id"
              flat dense dark color="green"
              :style=`{
                marginTop: '10px',
                opacity: nodesChecked.includes(n.id) ? 1 : 0.3}`).q-mx-sm
            .col
              node-list(
                :player="player"
                :contentKalpa="contentKalpa"
                :node="n"
                :nodeIndex="ni"
                :isSelected="n.id === nodeSelectedId"
                :isEditing="false"
                @select="nodeEditing = null, nodeSelectedId = n.id"
                @edit="nodeSelectedId = null, nodeEditing = n")
            //- span {{ n }}
            //- q-checkbox(
              v-model="nodesChecked" :val="n.id"
              flat dense dark color="green"
              :style=`{opacity: nodesChecked.includes(n.id) ? 1 : 0.3}`).q-ma-sm
            //- .col
              node-item(
                :player="player"
                :contentKalpa="contentKalpa"
                :node="n"
                :nodeIndex="ni"
                :isSelected="n.id === nodeSelectedId"
                :isEditing="false"
                @select="nodeEditing = null, nodeSelectedId = n.id"
                @unselect="nodeSelectedId = null"
                @edit="nodeSelectedId = null, nodeEditing = n"
                @edited="nodeEditing = null, nodeSelectedId = n.id"
                @delete="nodeDelete(n)"
                :style=`{
                }`)
    //- EDITING
    div(
      v-if="nodeEditing"
      :style=`{position: 'relative'}`).row.full-width
      node-item(
        :player="player"
        :contentKalpa="contentKalpa"
        :node="nodeEditing"
        :nodeIndex="ni"
        :isSelected="false"
        :isEditing="true"
        @select="nodeSelectedId = nodeEditing.id, nodeEditing = null"
        @unselect="nodeSelectedId = null"
        @edit="nodeSelectedId = null"
        @edited="nodeSelectedId = nodeEditing.id, nodeEditing = null"
        @delete="nodeDelete(n)"
        :style=`{
        }`)
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

import nodeItem from './node_item/index.vue'
import nodeList from './node_list/index.vue'

export default {
  name: 'wsContentExplorer_video_viewFragments',
  components: {nodeItem, nodeList},
  props: ['contentKalpa', 'player'],
  data () {
    return {
      viewId: 'mine',
      nodeSelectedId: null,
      nodeEditing: null,
      nodesChecked: [],
      fragments: [],
      nodesWorkspace: [],
      nodesKalpa: []
    }
  },
  computed: {
    nodes () {
      // return [...this.nodesWorkspace, ...this.nodesKalpa].sort((nA, nB) => {
      //   return nA.items[0].layers[0].figuresAbsolute[0].t
      // })
      return [...this.nodesWorkspace, ...this.nodesKalpa]
    },
    queryNodes () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
        }
      }
    },
    queryDrafts () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          contentOids: {$elemMatch: {$eq: this.contentKalpa.oid}},
          // stage: {$in: ['fragment', 'draft', 'saved', 'published']},
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
      this.nodeEditing = node
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
        // stage: 'fragment',
        wsItemType: 'WS_NODE',
        thumbUrl: this.contentKalpa.thumbUrl,
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
        // stage: 'draft',
        wsItemType: 'WS_NODE',
        thumbUrl: '',
        spheres: [],
        items: []
      }
      // get nodes
      await Promise.all(
        this.nodesChecked.map(async (nodeId) => {
          let {items: [node]} = await this.$rxdb.find({ selector: { rxCollectionEnum: RxCollectionEnum.WS_NODE, id: nodeId } })
          this.$log('node', node)
          // if we got node
          if (node) {
            // add names to spheres
            if (node.name && node.name.length > 0) {
              let {items: [sphere]} = await this.$rxdb.find({ selector: { rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: node.name } })
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
      this.$log('nodesWorkspaceLoaded', nodes)
      this.nodesWorkspace = nodes.map(n => {
        return {id: n.oid, ...n.meta}
      })
    },
    nodesKalpaLoaded (nodes) {
      this.$log('nodesChanged', nodes)
      this.nodesKalpa = nodes
      // let fragments = nodes.reduce((acc, node) => {
      //   acc.push(node)
      //   // if (node.stage === 'fragment') {
      //   //   acc.push(node)
      //   // }
      //   // else {
      //   //   node.items.map(i => {
      //   //     if (i.layers[0].contentOid === this.contentKalpa.oid) {
      //   //       let fragmentInput = JSON.parse(JSON.stringify(node))
      //   //       fragmentInput.id = i.id
      //   //       fragmentInput.items = [JSON.parse(JSON.stringify(i))]
      //   //       acc.push(fragmentInput)
      //   //     }
      //   //   })
      //   // }
      //   return acc
      // }, [])
      // this.$log('fragments', fragments)
      // this.fragments = fragments
      // if (this.nodeSelectedId || this.nodeEditing) return
      // this.$store.commit('ui/stateSet', ['wsContentFragments', JSON.parse(JSON.stringify(fragments))])
    }
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
