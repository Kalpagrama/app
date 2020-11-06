<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    maximized)
    item-finder(
      :node="node"
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: 700+'px',
      }`
      @item="itemFound"
      @close="itemFinderOpened = false")
  q-header(reveal).b-30
    .row.full-width.justify-center.q-pt-sm.q-px-sm.b-30
      div(:style=`{maxWidth: 700+'px', height: '60px',}`
        ).row.full-width.items-center.content-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_left" @click="$router.back()").q-mr-xs
        .col
        span(
          :style=`{fontSize: '1rem'}`).text-grey-6.text-bold Редактор ядра
        .col
        q-btn(round flat color='grey-6' icon="more_vert")
          q-popup-proxy(
            anchor="bottom right" self="top right"
            position="bottom"
            maximized dark)
            div(
              :class=`{
                'b-30': $q.screen.lt.md
              }`
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
                minWidth: '300px',
              }`).row.full-width.items-start.content-start
              //- actions
              .row.full-width.items-start.content-start
                q-btn(
                  v-for="(a,akey) in actions" :key="akey"
                  @click="a.cb()"
                  flat no-caps
                  :color="a.color || 'white'"
                  :style=`{
                    height: '50px',
                    ...a.styles,
                  }`
                  ).row.full-width {{ a.name }}
  q-page-container
    q-page.row.full-width.justify-center
      div(:style=`{maxWidth: 700+'px'}`).row.full-width.items-start.content-start.justify-center
        div(
          :style=`{
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-start.content-start.justify-center
          q-btn(
            v-if="node.items.length === 0"
            round flat color="green" icon="add" size="xl" @click="itemFinderOpened = true"
            :style=`{
              height: $q.screen.width > 700 ? 400+'px' : $q.screen.width+'px'
            }`).full-width.b-40
          edit-items(
            v-else
            :node="node"
            @itemAdd="itemAddAfter = $event, itemFinderOpened = true")
          view-publish(
            :node="node"
            :style=`{maxWidth: 600+'px',}`).q-pb-xl
        //- node mockup
        //- div(
          v-if="node.items.length === 0"
          :style=`{
            position: 'relative',
            height: 0, paddingBottom: $q.screen.width > 660 ? '100%' : '180%',
          }`
          ).row.full-width
          div(
            :style=`{
              position: 'absolute', zIndex: 10, top: 0,
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
            }`
            ).column.fit
            //- items mockup btn
            .col.full-width
              q-btn(
                round flat color="green" icon="add" size="xl" @click="itemFinderOpened = true"
                :style=`{}`).fit.b-40
            //- footer
            .row.full-width.justify-center.q-pb-lg
              view-publish(
                :node="node"
                :style=`{maxWidth: '600px',}`)
        //- node with items
        //- div(
          v-else
          :style=`{
            background: 'rgb(35,35,35)',
            borderRadius: '10px',
          }`
          ).row.full-width.items-start.content-start.justify-center.q-mb-xl
          edit-items(
            v-if="node && node.items.length > 0"
            :node="node"
            @itemAdd="itemAddAfter = $event, itemFinderOpened = true")
          view-publish(
            :node="node"
            :style=`{maxWidth: '600px',}`).q-pb-lg
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {
    editItems: () => import('./edit_items/index.vue'),
    viewPublish: () => import('./view_publish/index.vue'),
    itemFinder: () => import('./item_finder.vue')
  },
  props: {
    node: {type: Object}
  },
  data () {
    return {
      itemFinderOpened: false,
      itemAddAfter: 0
    }
  },
  computed: {
    actions () {
      return {
        // favorite: {
        //   name: 'Make favorite',
        //   color: 'green',
        //   styles: {
        //     fontWeight: 'bold'
        //   },
        //   cb: async () => {
        //     this.$log('nodeFavorite')
        //   }
        // },
        delete: {
          name: 'Удалить ядро',
          color: 'red',
          styles: {},
          cb: async () => {
            this.$log('nodeDelete')
            this.$router.push('/workspace/nodes')
            await this.node.updateExtended('deletedAt', Date.now(), false)
          }
        }
      }
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemClick', item)
      this.itemFinderOpened = false
      // WS_BOOKMARK
      if (item.wsItemType === 'WS_BOOKMARK') {
        // migration...
        if (item.contentType) {
          item.type = item.contentType
          delete item.contentType
        }
        // extract everything from node
        if (item.type === 'NODE') {
          alert('GOT NODE')
          // take everything from node
          // take items
          // take spheres
          // take name
          // take description
        }
        // use video content
        // use as sphere...
        // open content node extractor...
        if (item.type === 'VIDEO') {
          this.$set(this.node, 'updatedAt', Date.now())
          await this.$wait(300)
          if (this.$route.params.id) {
            // alert('FOUND NODE go to content')
            this.$router.push(`/content/${item.oid}/?viewid=nodes&pick=node&id=${this.$route.params.id}`)
          }
          else {
            // alert('NO NODE no CONTENT')
          }
        }
        // use image content, extract nodes from the content
        if (item.type === 'IMAGE') {
          // create compositionInput
          // this.$router.push(`/content/${item.oid}/?viewid=nodes&mode=pick`)
          let itemInput = {
            id: `${Date.now().toString()}-0`,
            outputType: 'IMAGE',
            thumbUrl: item.thumbUrl,
            operation: { items: null, operations: null, type: 'CONCAT'},
            meta: {cover: true, loop: true},
            layers: [
              {
                id: `${Date.now().toString()}-0`,
                contentOid: item.oid,
                figuresAbsolute: [{t: null, points: []}, {t: null, points: []}]
              }
            ]
          }
          this.node.items.push(itemInput)
        }
        // use user, sphere, word, sentence...
        if (['USER', 'SPHERE'].includes(item.type)) {
          this.$q.notify({type: 'negative', position: 'top', message: 'You cant add sphere/user for now :('})
          // // find sphere with item.name in workspace...
          // let [sphere] = await this.$rxdb.find({
          //   selector: {
          //     rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: item.name,
          //   }
          // })
          // // do nothing?
          // if (sphere) {
          // }
          // // create sphere in workspace...
          // else {
          //   let sphereInput = {
          //     wsItemType: 'WS_SPHERE',
          //     spheres: [],
          //     name: item.name,
          //   }
          //   sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          // }
          // // emit sphere event to nodeEditor
          // this.$emit('sphere', {id: sphere.id, name: sphere.name, oid: item.oid})
        }
      }
      // node WORKSPACE
      if (item.wsItemType === 'WS_NODE') {
        // add.name
        // if (this.node.name.length === 0) this.node.name = item.name
        this.node.name += item.name
        // add.description
        // if (this.node.description.length === 0) this.node.description
        this.node.description += item.description
        // add.spheres
        item.spheres.map(s => {
          if (!this.node.spheres.includes(s)) this.node.spheres.push(s)
        })
        // add items
        item.items.map(i => {
          this.node.items.push(i)
        })
      }
      // node PUBLISHED
      if (item.type === 'NODE' && item.rate && item.oid) {
        // convert node...
        let nodeConverted = this.nodePublishedToWorkspace(item)
        this.$log('nodeConverted', nodeConverted)
        this.itemFound(nodeConverted)
      }
      // contentKalpa Image
      if (item.__typename === 'Image' && item.type === 'IMAGE') {
        // use image as is...
      }
      // contentKalpa Video
      if (item.__typename === 'Video' && item.type === 'VIDEO') {
        this.$set(this.node, 'updatedAt', Date.now())
        await this.$wait(300)
        if (this.$route.params.id) {
          this.$router.push(`/content/${item.oid}/?viewid=nodes&pick=node&id=${this.$route.params.id}`)
        }
      }
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
  },
  mounted () {
    this.$log('mounted')
    let item = this.$store.state.ui.nodeEditorItem
    this.$log('item', item)
    if (item) {
      this.itemFound(JSON.parse(JSON.stringify(item)))
      this.$store.commit('ui/stateSet', ['editorItem', null])
    }
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
