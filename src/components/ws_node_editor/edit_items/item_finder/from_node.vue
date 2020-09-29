<template lang="pug">
q-page(:style=`{paddingTop: '0px', paddingBottom: '200px'}`).row.full-width.items-start.content-start
  .row.full-width.q-px-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
      q-input(
        v-model="searchString"
        filled dark dense color="white"
        :placeholder="$t('wsNodeList_searchPlaceholder', 'Найти ядро')"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="white" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="white" icon="tune")
  .row.full-width.q-px-md
    q-tabs(
      v-model="type"
      dense no-caps active-color="white" align="left" switch-indicator
      ).full-width.text-grey-8
      q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
  .row.full-width.q-pt-md
    kalpa-loader(
      v-if="type === 'draft'"
      :query="queryDraft" :limit="1000")
      template(v-slot=`{items,next}`)
        masonry(
          :cols="$q.screen.width < 800 ? 2 : 4"
          :gutter="{default: 10}").full-width
          ws-node-item(
            v-for="(i,ii) in items" :key="i.id" :node="i"
            @clicked="nodeClick(i)").q-mb-sm
    kalpa-loader(
      v-if="type === 'saved'"
      :query="querySaved" :limit="1000")
      template(v-slot=`{items,next}`)
        masonry(
          :cols="$q.screen.width < 800 ? 2 : 4"
          :gutter="{default: 10}").full-width
          div(
            v-for="(nodeBookmark, ii) in items" :key="nodeBookmark.id"
            ).row.full-width.q-mb-sm
            div(
              @click="nodeBookmarkClick(nodeBookmark)"
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
    kalpa-loader(
      v-if="type === 'published'"
      :mangoQuery="queryPublished" :sliceSize="1000"
      v-slot=`{items,next}`)
      span.text-white {{items}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'itemFinder_fromNode',
  props: ['id'],
  data () {
    return {
      searchString: '',
      type: 'draft'
    }
  },
  computed: {
    queryDraft () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          // stage: 'draft'
        },
        sort: [{updatedAt: 'desc'}]
      }
      // add name filter
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
    querySaved () {
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
    },
    queryPublished () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.$store.getters.currentUser().oid,
          oidAuthor: {$eq: this.$store.getters.currentUser().oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
    types () {
      return [
        // {id: 'workspace.nodes.fragments', name: this.$t('pageApp_wsNodes_fragments', 'Фрагменты')},
        {id: 'draft', name: this.$t('pageApp_wsNodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('pageApp_wsNodes_published', 'Опубликованные')},
        {id: 'saved', name: this.$t('pageApp_wsNodes_saved', 'Сохраненные')},
      ]
    },
  },
  methods: {
    nodeClick (node) {
      this.$log('nodeClick', node)
      let _node = JSON.parse(JSON.stringify(node))
      let items = _node.items.map((item, itemIndex) => {
        return {
          id: `${Date.now()}-${itemIndex}`,
          outputType: item.outputType,
          thumbUrl: _node.thumbUrl,
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
      })
      let spheres = _node.spheres
      spheres.map(s => this.$emit('sphere', s))
      items.map(i => this.$emit('item', i))
    },
    async nodeBookmarkClick (nodeBookmark) {
      this.$log('nodeBookmarkClick', nodeBookmark)
      // get node
      let node = await this.$rxdb.get(RxCollectionEnum.OBJ, nodeBookmark.oid)
      this.$log('nodeBookmarkClick node', node)
      let items = node.items.map((item, itemIndex) => {
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
      })
      this.$log('items', items)
      let spheres = await this.getSpheres(node.spheres)
      this.$log('spheres', spheres)
      // emit items, spheres...
      spheres.map(s => this.$emit('sphere', s))
      items.map(i => this.$emit('item', i))
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
  }
}
</script>
