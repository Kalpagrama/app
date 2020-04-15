<style lang="sass">
// .q-dialog
//   &__backdrop
//     background: none
</style>

<template lang="pug">
q-layout(
  view="hHh lpR fFf"
  :style=`{height: $q.screen.height+'px', maxHeight: '100vh'}`).window-height.bg-grey-10
  q-header(reveal).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        height: '60px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
        zIndex: 10000,
        borderRadius: '0 0 10px 10px', overflow: 'hidden'
      }`
      ).row.full-width.items-center.content-center.justify-center.bg-grey-4.shadow-20
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="keyboard_arrow_left" @click="$router.back()")
      .col.full-height
        div(@click="essenceClick()").row.fit.items-center.content-center.justify-center
          span.text-black.text-bold Как прыгать котиком?
      div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
        q-btn(round flat color="black" icon="more_vert")
  //- add node
  q-btn(
    v-if="!compositionFinderDialogShow"
    push color="green" no-caps @click="compositionFind(itemIndex)"
    :style=`{
      position: 'fixed', zIndex: 1000, bottom: '8px', left: '50%', transform: 'translate(-50%, 0%)',
      width: '200px', height: '50px'
    }`).shadow-10
    span.text-white.text-bold Добавить свой образ
  //- dialogs
  //- node editor dialog
  q-dialog(v-model="nodeEditorDialogShow" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="nodeEditorDialogShow = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-60-8-8+'px'
        }`
        ).column.full-width.items-start.bg-grey-9
        //- body
        .col.full-width.scroll
          .row.full-width.items-start.content-start
            div(
              v-for="(i,ii) in node.items" :key="ii"
              :style=`{
                position: 'relative',
                height: '400px'
              }`
              ).col-12
              //- actions
              //- edit
              q-btn(
                flat round color="white" icon="edit" @click="compositionEdit(ii)"
                :style=`{
                  position: 'absolute', zIndex: 1000, left: '8px', top: 'calc(50% - 20px)',
                  background: 'rgba(0,0,0,0.5)'}`)
              //- delete
              q-btn(
                flat round color="red" icon="delete" @click="compositionDelete(ii)"
                :style=`{
                  position: 'absolute', zIndex: 1000, left: '8px', top: '20%',
                  background: 'rgba(0,0,0,0.5)'}`)
              //- composition
              composition(
                ctx="workspace"
                :value="i"
                :visible="true"
                :active="!compositionFinderDialogShow"
                :mini="false")
            //- add item
            div(
              :style=`{
                height: '60px'
              }`
            ).row.full-width.q-pa-sm
              .col.q-pr-sm
                q-input(
                  v-model="node.name"
                  filled color="green" dark
                  placeholder="Whats the essence?"
                  :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden'}`
                  ).full-width.bg-grey-9
              q-btn(round flat color="green" icon="add" @click="compositionFind(node.items.length)"
                :style=`{width: '50px', background: '#555'}`)
        //- footer
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
          .col
          q-btn(push color="green" no-caps @click="nodePublish()").q-px-sm Publish
  //- composition finder dialog
  q-dialog(v-model="compositionFinderDialogShow" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="compositionFinderDialogShow = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-60-8-8+'px'
        }`).row.full-width.bg-grey-9
        composition-finder(
          v-if="!node.items[0]"
          @composition="compositionFound"
          @cancel="compositionFinderDialogShow = false")
  //- composition editor dialog
  q-dialog(v-model="compositionEditorDialogShow" maximized position="bottom")
    div(:style=`{height: $q.screen.height+'px', paddingTop: '68px'}` @click.self="compositionEditorDialogShow = false"
      ).row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        :style=`{
          position: 'relative', zIndex: 200, transform: 'translate3d(0,0,0)',
          maxWidth: $store.state.ui.maxWidthPage+'px',
          borderRadius: '10px', overflow: 'hidden',
          height: $q.screen.height-68+'px'
        }`
        ).row.full-width
        composition-editor(
          v-if="node.items[itemIndex]"
          :composition="node.items[itemIndex]" :content="node.items[itemIndex].content"
          @cancel="compositionEditorDialogShow = false"
          ).bg-grey-8
  //- page
  q-page-conainter
    q-page.fit
      .row.fit.justify-center
        //- div(:style=`{height: '400px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.bg-red
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.fit.justify-center
          list-masonry(
            ref="listMasonry"
            :items="items"
            @more="itemsMore").row.full-width.justify-center
            template(v-slot:item=`{item, index, isHovered}`)
              div(
                :style=`{
                  position: 'relative'
                }`
                ).row.fit
                //- layer name
                small(
                  v-if="isHovered"
                  :style=`{position: 'absolute', top: '8px', left: '8px', borderRadius: '10px', background: 'rgba(0,0,0,0.5)'}`
                  ).q-pa-sm.text-white {{item.oid}}
                //- thumbUrl
                img(
                  @click="$refs.listMasonry.itemClick(item, index)"
                  draggable="false"
                  :src="item.thumbUrl"
                  :style=`{width: '100%', objectFit: 'contain', userSelect: 'none', borderRadius: '10px', overflow: 'hidden'}`
                  ).bg-black.cursor-pointer.fit
//- </template>

<script>
import assert from 'assert'
import axios from 'axios'
const UNSPLASH_ACCESS_KEY = 'uI2AymszzNmMOoiYyNh8H1fI6EQeSfLBNy0qhQAJkOA'

export default {
  name: 'pageAppHome',
  components: {},
  props: [],
  data () {
    return {
      items: [],
      itemsPage: 1,
      itemsLoading: false,
      nodeEditorDialogShow: false,
      compositionFinderDialogShow: false,
      compositionEditorDialogShow: false,
      itemIndex: 0,
      node: {
        name: '',
        layout: 'PIP',
        category: 'FUN',
        spheres: [],
        items: []
      }
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    },
  },
  watch: {
    node: {
      deep: true,
      handler (to, from) {
        this.$log('node CHANGED', to)
      }
    }
  },
  methods: {
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        let res = await this.$store.dispatch('node/nodeCreate', JSON.parse(JSON.stringify(this.node)))
        this.$log('nodePublish res', res)
        this.$log('nodePublish done')
      }
      catch (e) {
        this.$log('nodePublish error', e)
      }
    },
    compositionFind (index) {
      this.$log('compositionFind', index)
      assert(index >= 0, 'compositionFind: No index!')
      this.itemIndex = index
      // close item on masonry...
      this.$refs.listMasonry.itemClick(null, null)
      this.nodeEditorDialogShow = true
      this.compositionFinderDialogShow = true
    },
    compositionFound (composition) {
      this.$log('compositionFound', composition)
      // prepare composition
      let compositionInput = JSON.parse(JSON.stringify(composition))
      compositionInput.layersWorkspace = compositionInput.layers
      compositionInput.layers = []
      this.$set(this.node.items, this.itemIndex, compositionInput)
      this.compositionEdit(this.itemIndex)
      this.$wait(300).then(() => {
        this.compositionFinderDialogShow = false
      })
    },
    compositionEdit (index) {
      this.$log('compositionEdit', index)
      assert(index >= 0, 'compositionEdit: No index!')
      this.compositionEditorDialogShow = true
    },
    compositionDelete (index) {
      this.$log('compositionDelete', index)
      assert(index >= 0, 'compositionDelete: No index!')
      if (!confirm('Delete item ?!')) return
      this.$delete(this.node.items, index)
    },
    compositionEdited () {
      this.$log('compositionEdited')
      this.compositionEditorDialogShow = false
    },
    async itemsMore () {
      if (this.itemsLoading) return
      this.$log('itemsMore')
      this.itemsPage += 1
      this.items = [...this.items, ...await this.itemsLoad(this.itemsPage)]
    },
    async itemsLoad (page = 1) {
      try {
        this.$log('itemsLoad start')
        this.itemsLoading = true
        await this.$wait(500)
        let res = await axios.get(
          `https://api.unsplash.com/search/photos?query=Money&per_page=30&page=${page}`,
          {
            headers: {
              Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
              'Accept-Version': 'v1'
            }
          }
        )
        this.$log('itemsLoad done')
        let items = res.data.results.map(i => {
          return {
            oid: i.id + Date.now(),
            thumbUrl: i.urls.regular,
            name: i.description || ''
          }
        })
        this.itemsLoading = false
        return items
      }
      catch (e) {
        this.$log('itemsLoad error', e)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.items = await this.itemsLoad(1)
    // this.$store.commit('ui/stateSet', ['maxWidthPage', 1000])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
