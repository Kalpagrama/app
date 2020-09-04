<template lang="pug">
q-btn(
  @click="start()"
  round flat
  color="white"
  :icon="nodeWorkspace ? 'bookmark' : 'bookmark_outline'"
  :loading="loading"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', right: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
  q-menu(
    v-model="spheresAdding"
    ref="sphereSelectorMenu" separate-close-popup
    dark cover anchor="top right")
    ws-sphere-finder(
      v-if="nodeWorkspace"
      ref="wsSphereFinder"
      :useSearch="true"
      :selectedIds="nodeWorkspace.spheres"
      :hiddenIds="[]"
      @sphere="sphereAdd")
    //- div(
      :style=`{
        width: '300px', height: '300px',
        borderRadius: '10px', overflow: 'hidden',
      }`).column.items-start.content-start.b-50
      .row.full-width
        div(
          :style=`{
            position: 'relative', zIndex: 100,
            borderRadius: '10px', overflow: 'hidden'
          }`).row.full-width
          q-input(
            v-model="searchString"
            placeholder="Find sphere"
            filled dark dense color="grey-7"
            :input-style=`{paddingLeft: '15px',}`).full-width.b-50
      .col.full-width.scroll
        kalpa-loader(:mangoQuery="spheresQuery" :sliseSize="1000")
          template(v-slot=`{items}`)
            .row.full-width.items-start.content-start.q-pt-sm
              div(
                v-for="(s,si) in items" :key="s.id"
                @click="sphereClick(s,si)"
                ).row.full-width.items-center.content-center
                q-btn(
                  flat icon="blur_on" align="start" no-caps
                  ).full-width.q-pl-sm
                  span.q-ml-sm {{s.name}}
      .row.full-width.q-pa-sm
        q-btn(
          @click="sphereCreate()"
          flat color="green" icon="add" no-caps align="left").full-width Create sphere
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import wsSphereFinder from 'components/ws_sphere_finder/index.vue'

export default {
  name: 'nodeLite__nodeBookmark',
  components: {wsSphereFinder},
  props: ['node', 'nodeFull', 'isActive', 'isVisible'],
  data () {
    return {
      loading: false,
      nodeWorkspace: null,
      searchString: '',
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  watch: {
    isActive: {
      immediate: true,
      async handler (to, from) {
        // this.$log('isActive TO', to)
        if (to) {
          this.nodeWorkspace = await this.nodeWorkspaceFind()
          this.$log('nodeWorkspace', this.nodeWorkspace)
        }
        else {
          this.loading = false
          this.spheresAdding = false
        }
      }
    }
  },
  methods: {
    start () {
      this.$log('start')
      this.loading = true
      // create bookmark of this node, with creating missing spheres, add them
      if (!this.nodeWorkspace) this.nodeWorkspaceCreate()
      // then maybe add spheres to created bookmark
      this.spheresAdding = true
      this.loading = false
    },
    sphereAdd (sphere) {
      this.$log('sphereAdd', sphere)
      let sphereFind = this.nodeWorkspace.spheres.find(id => id === sphere.id)
      if (sphereFind) {
        this.nodeWorkspace.spheres = this.nodeWorkspace.spheres.filter(id => id !== sphere.id)
      }
      else {
        this.nodeWorkspace.spheres.push(sphere.id)
      }
      this.$refs.sphereSelectorMenu.hide()
    },
    async sphereCreate () {
      this.$log('sphereCreate')
      let name = prompt('Sphere name?')
      if (name.length > 0) {
        let sphereInput = {
          wsItemType: 'WS_SPHERE',
          name: name,
          items: [
            {
              oid: this.node.oid,
              thumbOid: this.node.meta.items[0].thumbUrl,
              type: 'NODE',
              name: this.node.name
            }
          ]
        }
        let sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
        this.searchString = ''
        this.$refs.sphereSelectorMenu.hide()
      }
    },
    async nodeWorkspaceFind () {
      // this.$log('bookmarkFind')
      let {items: [item]} = await this.$rxdb.find({
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE, oid: this.node.oid,
        }
      })
      // this.$log('bookmarkFind item', item)
      return item
    },
    async bookmarkDelete () {
      try {
        // this.$log('bookmarkDelete')
        this.loading = true
        await this.$wait(300)
        let bookmark = await this.bookmarkFind()
        if (bookmark) {
          await this.$rxdb.remove(bookmark.id)
          this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark deleted!'})
          this.bookmarked = false
          this.loading = false
        }
        else {
          throw new Error('No such bookmark!')
        }
      }
      catch (e) {
        this.$log('bookmarkDelete error', e)
        this.loading = false
      }
    },
    async getSpheres () {
      return await Promise.all(
        this.nodeFull.spheres.map(async (s) => {
          // for every sphere try to find this sphere in ws
          let {items: [sphere]} = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.WS_SPHERE, name: s.name,
            }
          })
          this.$log('sphere', sphere)
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
    getItems () {
      return this.node.meta.items.map((item, itemIndex) => {
        return {
          id: `${Date.now().toString()}-${itemIndex}-item`,
          outputType: item.outputType,
          thumbUrl: item.thumbUrl,
          operation: { items: null, operations: null, type: 'CONCAT'},
          layers: item.layers.map((layer, layerIndex) => {
            return {
              id: `${Date.now().toString()}-${itemIndex}-layer`,
              contentOid: layer.contentOid,
              figuresAbsolute: layer.figuresAbsolute,
            }
          })
        }
      })
    },
    async nodeWorkspaceCreate () {
      try {
        this.$log('nodeWorkspaceCreate start')
        this.loading = true
        // await this.$wait(300)
        let nodeInput = {
          oid: this.node.oid,
          name: this.node.name,
          wsItemType: 'WS_NODE',
          thumbOid: this.node.meta.items[0].thumbUrl,
          category: this.node.category,
          stage: 'saved',
          layout: 'PIP',
          spheres: [],
          items: [],
        }
        nodeInput.spheres = await this.getSpheres()
        nodeInput.items = this.getItems()
        this.$log('nodeWorkspaceCreate nodeInput', nodeInput)
        this.nodeWorkspace = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
        this.$log('bookmarkCreate nodeWorkspace', this.nodeWorkspace)
        this.$q.notify({type: 'positive', position: 'top', message: 'Bookmark added!'})
        this.loading = false
      }
      catch (e) {
        this.$log('bookmarkCreate error', e)
        this.loading = false
        this.$q.notify({type: 'negative', position: 'top', message: e.message || e.toString()})
      }
    },
  },
}
</script>
