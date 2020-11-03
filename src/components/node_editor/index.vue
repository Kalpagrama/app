<template lang="pug">
.row.full-width.items-start.content-start
  //- item finder
  q-dialog(
    v-model="itemFinderOpened"
    position="bottom"
    maximized)
    item-finder(
      :node="node"
      :style=`{
        height: $q.screen.height+'px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
      }`
      @item="itemFound"
      @sphere="sphereFound"
      @close="itemFinderOpened = false")
  //- header
  .row.full-width.justify-center
    div(
      :style=`{
        height: '70px',
        maxWidth: 800+'px',
      }`).row.full-width.items-center.content-center
      q-btn(round flat color="grey-6" icon="keyboard_arrow_left" @click="$router.back()").q-mr-xs
      .col
      span(
        :style=`{fontSize: '1rem'}`).text-grey-6.text-bold Редактор ядра
      .col
      q-btn(round flat color='grey-6' icon="more_vert")
        q-popup-proxy(
          anchor="bottom right" self="top right"
          position="bottom"
          maximized dark
          )
          div(
            :class=`{
              'b-30': $q.screen.lt.md
            }`
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              minWidth: '300px',
            }`).row.full-width.items-start.content-start
            //- header
            //- div(
              v-if="$q.screen.lt.md"
              :style=`{
                textAlign: 'center'
              }`).row.full-width.justify-center.q-py-md
              span.text-white {{ node.name }}
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
  //- items mockup
  div(v-if="node.items.length === 0").row.full-width.items-start.content-start.justify-center
    div(
      :style=`{
        maxWidth: '800px', zIndex: 100,
        borderRadius: '10px', overflow: 'hidden'
      }`).row.full-width.b-40
      div(
        :style=`{
          position: 'relative',
          height: 0, paddingBottom: '60%',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width
        //- div(:style=`{position: 'absolute'}`).row.fit.items-center.content-center.justify-center.b-50.shadow-5
        q-btn(
          round flat color="green" icon="add" size="xl" @click="itemFinderOpened = true"
          :style=`{position: 'absolute', zIndex: 10}`).fit.b-50
  //- items slider
  div(v-if="node.items.length > 0").row.full-width.items-start.content-start
    //- vertical
    div(
      v-if="['SLIDER', 'VERTICAL', 'PIP', 'HORIZONTAL'].includes(node.layout)"
      ).row.full-width.items-start.content-start.justify-center
      div(
        :style=`{
          maxWidth: '800px', zIndex: 100,
          borderRadius: '10px', overflow: 'hidden',
        }`).row.full-width.items-start.content-start.b-40
        div(
          v-for="(item,ii) in node.items" :key="item.id"
          :class=`{
            'q-mb-md': ii !== node.items.length-1,
          }`
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.b-40.shadow-10
          edit-item(
            :item="item" :isActive="true"
            @next="itemNext(item)"
            @prev="itemPrev(item)"
            @duplicate="itemDuplicate(item)"
            @remove="itemRemove(item)"
            @edit="$router.push({params: {item: ii}})")
        .row.full-width.items-center.content-center.justify-center.q-py-xs
          q-btn(flat color="green" icon="add" no-caps @click="itemFinderOpened = true").full-width Add item
  .row.full-width.justify-center.q-mb-xl
    div(
      :style=`{
        maxWidth: '800px',
        marginTop: '-20px',
        paddingTop: '20px',
        borderRadius: '0 0 10px 10px', overflow: 'hidden',
      }`).row.full-width.b-40
      edit-name(:value="node.name" @input="node.name = $event").q-mb-xl
      view-publish(:node="node")
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {
    editName: () => import('./edit_name.vue'),
    editDescription: () => import('./edit_description.vue'),
    editItem: () => import('./edit_item/index.vue'),
    viewAdd: () => import('./view_add/index.vue'),
    viewPublish: () => import('./view_publish/index.vue'),
    itemFinder: () => import('./item_finder.vue')
  },
  props: {
    node: {type: Object}
  },
  data () {
    return {
      viewId: '',
      itemFinderOpened: false
    }
  },
  computed: {
    views () {
      return [
        {id: 'add', name: 'Образы', icon: 'add'},
        {id: 'publish', name: 'Publish', icon: 'check'}
      ]
    },
    layoutName () {
      let layout = this.layouts.find(l => l.id === this.node.layout)
      if (layout) return layout.name
      else return ''
    },
    layouts () {
      return [
        {id: 'SLIDER', name: this.$t('Slider', 'Слайдер')},
        {id: 'HORIZONTAL', name: this.$t('Compare', 'Сравнение')},
        {id: 'VERTICAL', name: this.$t('Vertical', 'Портянка')}
      ]
    },
    actions () {
      return {
        favorite: {
          name: 'Make favorite',
          color: 'green',
          styles: {
            fontWeight: 'bold'
          },
          cb: async () => {
            this.$log('nodeFavorite')
          }
        },
        delete: {
          name: 'Delete',
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
    sphereFound (sphere) {
      this.$log('sphereFound', sphere)
      let i = this.node.spheres.findIndex(id => id === sphere.id)
      if (i >= 0) {
        alert('Duplicate sphere!')
      }
      else {
        this.node.spheres.push(sphere.id)
      }
    },
    // itemFound (item) {
    //   this.$log('itemFound', item)
    //   item.meta = {cover: true, timeout: 3000}
    //   this.node.items.push(item)
    //   this.itemFinderOpened = false
    // },
    async itemFound (item) {
      this.$log('itemClick', item)
      this.itemFinderOpened = false
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
    itemNext (item) {
      this.$log('itemNext', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemNext itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex + 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex + 1])
          this.$set(this.node.items, itemIndex + 1, t)
        }
        else {
          alert('Nowhere to go!')
        }
      }
    },
    itemPrev (item) {
      this.$log('itemPrev', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemPrev itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex - 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex - 1])
          this.$set(this.node.items, itemIndex - 1, t)
        }
        else {
          alert('Nowhere to go!')
        }
      }
    },
    itemDuplicate (item) {
      this.$log('itemDuplicate', item)
      let itemInput = JSON.parse(JSON.stringify(item))
      itemInput.id = Date.now().toString()
      this.node.items.push(itemInput)
    },
    itemRemove (item) {
      this.$log('itemRemove', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      if (itemIndex >= 0) {
        this.$delete(this.node.items, itemIndex)
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
    let editorItem = this.$store.state.ui.editorItem
    this.$log('editorItem', editorItem)
    if (editorItem) {
      this.itemFound(JSON.parse(JSON.stringify(editorItem)))
      this.$store.commit('ui/stateSet', ['editorItem', null])
    }
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
