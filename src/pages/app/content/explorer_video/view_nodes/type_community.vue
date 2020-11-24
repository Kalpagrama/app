<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="nodesQuery" @items="nodesLoaded" v-slot=`{items,next,nexting}`)
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start
    div(
      v-for="node in items" :key="node.oid"
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.q-mb-xs
      //- @toggleSelect="nodeSelectedOid === node.oid ? nodeSelectedOid = null : nodeSelectedOid = node.oid"
      node-item(
        @click.native="nodeClick(node)"
        :node="node" :player="player" :contentKalpa="contentKalpa"
        :style=`{
          position: 'relative', zIndex: 10,
          borderRadius: '10px', overflow: 'hidden',
          background: nodeSelectedOid === node.oid ? 'rgb(60,60,60)' : 'rgb(35,35,35)'
        }`
        )
      //- node selected
      div(
        v-if="nodeSelectedOid === node.oid"
        :style=`{
          zIndex: 2,
          marginTop: '-10px', paddingTop: '14px',
          borderRadius: '0 0 10px 10px',
        }`
        ).row.full-width.bg-green.q-py-xs.q-px-xs
        //- slot(name="nodeActionAll" :node="node")
        composition-bar(
          v-if="true"
          :composition="node.items[0]" :player="player"
          :actionsPosition="'top'"
          :barStyles=`{
            background: 'rgba(50,50,50, 0.5)',
          }`
          :style=`{
            //- position: 'absolute', zIndex: 200,
            //- top: '0px',
            maxHeight: '22px',
            marginBottom: '40px',
          }`)
        .row.full-width
          q-btn(
            @click="nodeEdit(node)"
            round flat dense color="white" icon="edit")
          .col
          q-btn(v-if="pick" flat color="red" no-caps @click="pick(node)") Выбрать ядро
          q-btn(v-if="!pick" round flat dense color="white" icon="launch" @click="$router.push(`/node/${node.oid}`)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './type_community_item.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'viewNodes_typeCommunity',
  inject: ['pick'],
  props: ['node', 'player', 'contentKalpa', 'contentBookmark', 'onlyMine'],
  components: {
    nodeItem,
    compositionBar
  },
  data () {
    return {
      nodes: [],
      nodeSelectedOid: null,
    }
  },
  computed: {
    nodesQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid
        },
        populateObjects: true,
      }
      if (this.onlyMine) {
        res.selector.oidAuthor = {$eq: this.$store.getters.currentUser().oid}
      }
      return res
    },
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      if (this.nodeSelectedOid === node.oid) {
        this.nodeSelectedOid = null
        this.figuresUpdate(this.nodes)
      }
      else {
        this.nodeSelectedOid = node.oid
        let t = node.items[0].layers[0].figuresAbsolute[0].t
        this.player.setCurrentTime(t)
        let figures = []
        node.items.map(i => {
          if (i.layers[0].contentOid === this.contentKalpa.oid) {
            figures.push(i.layers[0].figuresAbsolute)
          }
        })
        this.$emit('figures', figures)
      }
    },
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes.length)
      this.figuresUpdate(nodes)
      this.nodes = nodes
    },
    figuresUpdate (nodes) {
      this.$log('figuresUpdate', nodes.length)
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
    },
    async nodeEdit (nodePublished) {
      this.$log('nodeEdit', nodePublished)
      let nodeWorkspace = await this.$rxdb.set(RxCollectionEnum.WS_NODE, this.nodePublishedToWorkspace(nodePublished))
      this.$emit('nodeEdit', nodeWorkspace)
    },
    nodePublishedToWorkspace (node) {
      let nodeInput = {
        name: node.name,
        category: 'FUN',
        layout: node.layout,
        wsItemType: 'WS_NODE',
        thumbUrl: node.thumbUrl,
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
      return nodeInput
    }
  }
}
</script>
