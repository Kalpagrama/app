<style lang="sass" scoped>
.node-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px', minHeight: '100vh'}`).row.full-width.items-start.content-start
    //- items
    .row.full-width.q-pt-sm.q-pr-sm
      kalpa-loader(
        :immediate="true"
        :query="query" :limit="1000")
        template(v-slot=`{items,next}`)
          masonry(
            :cols="$q.screen.width < 800 ? 2 : 4"
            :gutter="{default: 10}").full-width
            div(
              v-for="(nodeBookmark, ii) in items" :key="nodeBookmark.id"
              :style=`{position: 'relative'}`
              ).row.full-width.q-mb-sm
              //- default
              div(
                @click="nodeBookmarkSelectedId = nodeBookmark.id"
                :style=`{
                  position: 'relative', zIndex: 100,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.q-px-md.q-pt-md.b-40.node-item
                div(
                  :style=`{
                    position: 'relative', zIndex: 100,
                    height: 0, paddingBottom: '100%',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).full-width
                  div(:style=`{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,}`).row
                    img(
                      :src="nodeBookmark.thumbUrl" draggable="false"
                      :style=`{
                        objectFit: 'cover',
                        borderRadius: '10px', overflow: 'hidden',
                      }`).fit
                .row.full-width.q-py-sm.q-px-md
                  small.text-white {{ nodeBookmark.name }}
              //- tint
              slot(name="tint" :item="nodeBookmark" :itemKey="nodeBookmark.id")
              //- selected
              div(
                v-if="nodeBookmarkSelectedId === nodeBookmark.id"
                :style=`{
                  position: 'relative',
                  marginTop: '-10px', paddingTop: '14px',
                  borderRadius: '0 0 10px 10px', overflow: 'hidden',
                }`
                ).row.full-width.items-center.content-center.bg-green.q-px-xs.q-pb-xs
                q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(nodeBookmark)")
                .col
                q-btn(round flat dense color="white" icon="edit" @click="itemEdit(nodeBookmark)").q-mr-sm
                q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(nodeBookmark)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_typeSaved',
  props: {
    searchString: {type: String},
  },
  data () {
    return {
      nodeBookmarkSelectedId: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'NODE',
        },
        sort: [{updatedAt: 'desc'}]
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
    async itemDelete (nodeBookmark) {
      this.$log('itemDelete', nodeBookmark)
      if (!confirm('Delete node?')) return
      // TODO what to do if we got items on this sphere ???
      await this.$rxdb.remove(nodeBookmark.id)
    },
    async itemLaunch (nodeBookmark) {
      this.$log('itemLaunch', nodeBookmark)
      this.$router.push(`/node/${nodeBookmark.oid}`).catch(e => e)
    },
    async getSpheres (spheres) {
      return await Promise.all(
        spheres.map(async (s) => {
          // for every sphere try to find this sphere in ws
          let {items: [sphere]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: s.name,
            }
          })
          // this.$log('sphere', sphere)
          if (!sphere) {
            this.$log('sphere NOT FOUND, creating...')
            let sphereInput = {
              wsItemType: 'WS_SPHERE',
              name: s.name,
              oid: s.oid,
              spheres: []
            }
            sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          }
          // add this sphere.id bookmark.spheres array
          this.$log('adding sphere...', sphere.name)
          return sphere.id
        })
      )
    },
    async itemEdit (nodeBookmark) {
      this.$log('itemEdit', nodeBookmark)
      // get node
      let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeBookmark.oid)
      this.$log('node', node)
      // create nodeInput
      let nodeInput = {
        wsItemType: 'WS_NODE',
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
                    points: figure.points
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
  }
}
</script>
