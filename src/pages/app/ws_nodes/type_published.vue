<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  kalpa-loader(
    :immediate="true"
    :query="queryNodes" :limit="1000" v-slot=`{items,next,nexting}`)
      masonry(
        :cols="$q.screen.width < $store.state.ui.pageWidth ? 2 : 4"
        :gutter="{default: 0}"
        :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`
        ).full-width.items-start.content-start.justify-start
        div(
          v-for="(node, ii) in items" :key="node.oid"
          @mouseenter="nodeOver = node.oid"
          @mouseleave="nodeOver = null"
          :style=`{position: 'relative'}`
          ).row.full-width.q-pr-sm.q-mb-sm
          slot(name="tint" :item="node" :itemKey="node.oid")
          ws-node-item(
            @click.native="$router.push('/node/'+node.oid)"
            :node="node"
            :style=`{position: 'relative'}`)
          q-btn(
            v-show="$q.screen.width < $store.state.ui.pageWidth ? true : nodeOver == node.oid"
            round flat dense icon="more_vert" color="white"
            :style=`{
              position: 'absolute', zIndex: 200, top: 0, right: '8px',
            }`)
            q-popup-proxy(
              maximized position="bottom" dark
              anchor="top right" self="top right").b-40
              div(
                :style=`{
                  borderRadius: '10px',
                }`
                ).row.full-width.items-start.content-start.b-40
                //- header
                div(
                  v-if="$q.screen.width < $store.state.ui.pageWidth"
                  ).row.full-width.items-center.content-center.justify-center.q-pa-md
                  q-icon(name="filter_tilt_shift" color="white" size="20px").q-mr-sm
                  span.text-white.text-bold "{{ node.name }}"
                //- actions
                q-btn(
                  @click="a.cb(node)"
                  v-for="(a,akey) in actions" :key="akey"
                  flat no-caps
                  :color="a.color || 'white'"
                  :style=`{height: '50px',}`).full-width
                  span {{ a.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectApi } from 'src/api/object'

export default {
  name: 'wsNodes_typePublished',
  props: {
    searchString: {type: String}
  },
  data () {
    return {
      nodeOver: null,
    }
  },
  computed: {
    queryNodes () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.$store.getters.currentUser().oid,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
    actions () {
      return {
        share: {
          name: 'Поделиться',
          cb: (node) => {
            this.$log('share...')
            // TODO: impl
          }
        },
        edit: {
          name: 'Редактировать',
          cb: (node) => {
            this.$log('edit')
          }
        },
        moveToCollection: {
          name: 'Добавить в коллекцию',
          cb: (node) => {
            this.$log('moveToCollection...')
            // move to collection
            // go to collection items
          }
        },
        unpublish: {
          name: 'Снять с публикации',
          color: 'red',
          cb: async (node) => {
            if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
            await ObjectApi.unPublish(node.oid)
            // await this.nodeEdit(node)
          }
        }
      }
    }
  },
  methods: {
    async nodeUnpublish (node) {
      this.$log('nodeUnpublish', node)
      if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      await ObjectApi.unPublish(node.oid)
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
