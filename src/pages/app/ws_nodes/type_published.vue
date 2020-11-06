<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width.q-pr-sm
    .row.full-width.items-start.content-start.q-pt-sm
      //- @items="nodesLoaded"
      kalpa-loader(
        :immediate="true"
        :query="queryNodes" :limit="1000" v-slot=`{items, next}`)
        .row.full-width.items-start.content-start
          q-infinite-scroll(ref="qis" @load="next" :offset="500")
          masonry(
            :cols="$q.screen.width < 800 ? 2 : 4"
            :gutter="{default: 10}").full-width.justify-start
            div(
              v-for="(node, ii) in items" :key="node.oid"
              :style=`{position: 'relative'}`
              ).row.full-width.q-mb-sm
              slot(name="tint" :item="node" :itemKey="node.oid")
              ws-node-item(
                :node="node"
                :style=`{position: 'relative'}`
                @clicked="nodeSelectedOid = node.oid").q-mb-sm
                template(v-slot:footer)
                  //- selected
                  div(
                    v-if="nodeSelectedOid === node.oid"
                    :style=`{
                      position: 'relative',
                      marginTop: '-10px', paddingTop: '14px',
                      borderRadius: '0 0 10px 10px', overflow: 'hidden',
                    }`
                    ).row.full-width.items-center.content-center.bg-green.q-px-xs.q-pb-xs
                    q-btn(round flat dense color="green-8" icon="delete_outline" @click="nodeUnpublish(node)")
                    .col
                    q-btn(round flat dense color="white" icon="edit" @click="nodeEdit(node)").q-mr-sm
                    q-btn(round flat dense color="white" icon="launch" @click="nodeLaunch(node)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectsApi } from 'src/api/objects'

export default {
  name: 'wsNodes_typePublished',
  props: {
    searchString: {type: String}
  },
  data () {
    return {
      nodeSelectedOid: null,
    }
  },
  computed: {
    queryNodes () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.$store.getters.currentUser().oid,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
    async nodeUnpublish (node) {
      this.$log('nodeUnpublish', node)
      if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      await ObjectsApi.unPublish(node.oid)
      await this.nodeEdit(node)
      this.$log('nodeUnPublish complete')
    },
    async getSpheres (spheres) {
      return await Promise.all(
        spheres.map(async (s) => {
          // for every sphere try to find this sphere in ws
          let [sphere] = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: s.name,
            }
          })
          // this.$log('sphere', sphere)
          if (!sphere) {
            this.$log('sphere NOT FOUND, creating...')
            let sphereInput = {
              name: s.name,
              oid: s.oid
            }
            sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          }
          // add this sphere.id bookmark.spheres array
          this.$log('adding sphere...', sphere.name)
          return sphere.id
        })
      )
    },
    async nodeEdit (node) {
      this.$log('nodeEdit', node)
      // get node
      // let node = await this.$rxdb.get(RxCollectionEnum.OBJ, node.oid)
      this.$log('node', node)
      // create nodeInput
      let nodeInput = {
        // stage: 'draft',
        name: node.name,
        layout: node.layout,
        category: node.category,
        thumbUrl: node.items[0].thumbUrl,
        items: node.items.map((item, itemIndex) => {
          return {
            id: `${Date.now()}-${itemIndex}`,
            outputType: item.outputType,
            thumbUrl: node.items[0].thumbUrl,
            operation: { items: null, operations: null, type: 'CONCAT'},
            layers: item.layers.map((layer, layerIndex) => {
              return {
                id: `${Date.now()}-${layerIndex}`,
                contentOid: layer.contentOid,
                figuresAbsolute: layer.figuresAbsolute.map(figure => {
                  return {
                    t: figure.t,
                    points: []
                  }
                })
              }
            })
          }
        }),
        spheres: [],
      }
      this.$log('nodeInput', nodeInput)
      nodeInput.spheres = await this.getSpheres(node.spheres)
      let nodeDraft = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$router.push(`/workspace/node/${nodeDraft.id}`).catch(e => e)
    },
    nodeLaunch (node) {
      this.$log('nodeLaunch', node)
      this.$router.push(`/node/${node.oid}`).catch(e => e)
    },
    async nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes)
      await Promise.all(
        nodes.map(async (n) => {
          let [nodeBookmark] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: n.oid}})
          if (!nodeBookmark) {
            let nodeBookmarkInput = {
              type: 'NODE',
              oid: n.oid,
              name: n.name,
              thumbUrl: n.items[0].thumbUrl,
            }
            nodeBookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, nodeBookmarkInput)
          }
          let spheres = []
          this.$log('nodeBookmark', nodeBookmark)
          // upsert spheres by names from all the nodes published...
          console.log('n.spheres.length', n.spheres.length)
          await Promise.all(
            n.spheres.map(async (s) => {
              let [sphere] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: s.name}})
              if (!sphere) {
                let sphereInput = {
                  name: s.name,
                }
                sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
              }
              spheres.push(sphere.id)
            })
          )
          nodeBookmark.spheres = spheres
        })
      )
    }
  }
}
</script>
