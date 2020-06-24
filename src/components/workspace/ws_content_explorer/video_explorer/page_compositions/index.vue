<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom"
    )
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :value="node"
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
      }`)
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-py-sm
          div(
            v-for="(i,ii) in items" :key="i.id"
            :style=`{}`
            ).row.full-width.items-start.content-start
            div(:style=`{width: '50px', height: '50px',}`).row.items-center.content-center.justify-center
              q-checkbox(
                v-model="compositionsSelected" :val="i.id"
                dark color="grey-6"
                :style=`{opacity: 0.9}`)
            .col
              composition-item(
                @edit="compositionEdit(i)"
                @delete="compositionDelete(i)"
                :composition="i" :compositionIndex="ii").q-mb-sm
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="composition"
      :style=`{position: 'absolute', zIndex: 9999}`).row.fit.q-pt-sm.b-50
      ws-composition-editor(
        :value="composition"
        :sidPlayer="sidPlayer"
        @close="compositionEdited").full-height.b-60
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    div(
      v-if="compositionsSelected.length > 0"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: '0px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm.b-60
      q-btn(round flat color="white" icon="clear" @click="compositionsSelected = []").q-mr-sm
      q-btn(flat color="red-5" no-caps @click="compositionsSelectedDelete()") Delete
      .col
      q-btn(color="green" no-caps @click="compositionsSelectedCreateNode()") Create node
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionItem from './composition_item'

export default {
  name: 'pageCompositions',
  components: {compositionItem},
  props: ['content'],
  inject: ['sidPlayer', 'sidExplorer'],
  data () {
    return {
      composition: null,
      compositionsSelected: [],
      node: null,
      nodeEditorOpened: false,
    }
  },
  computed: {
    storeExplorer () {
      return window.stores[this.sidExplorer]
    },
    storePlayer () {
      return window.stores[this.sidPlayer]
    },
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // // name
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      res.selector.contentType = 'COMPOSITION'
      res.selector.contentOid = this.content.oid
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  // watch: {},
  methods: {
    compositionEdit (c) {
      this.$log('compositionEdit', c)
      this.composition = null
      this.$nextTick(() => {
        this.storeExplorer.compositionEditing = c.id
        this.composition = c
      })
    },
    compositionEdited (c) {
      this.$log('compositionEdited', c)
      this.storeExplorer.compositionPlaying = this.composition.id
      this.storeExplorer.compositionEditing = null
      this.composition = null
    },
    async compositionDelete (c) {
      this.$log('compositionDelete')
      if (!confirm('Delete composition ?')) return
      if (this.storeExplorer.compositionPlaying === c.id) {
        this.compositionDrop()
      }
      await this.$rxdb.remove(c.id)
      this.$log('compositionDelete done')
    },
    compositionDrop () {
      this.$log('compositionDrop')
      this.storeExplorer.compositionSelected = null
      this.storeExplorer.compositionEditing = null
    },
    async compositionsSelectedCreateNode () {
      this.$log('compositionsSelectedCreateNode')
      this.storePlayer.player.pause()
      // get compositions
      let compositions = []
      await Promise.all(
        this.compositionsSelected.map(async (id) => {
          let {items: [composition]} = await this.$rxdb.find({selector: { rxCollectionEnum: RxCollectionEnum.WS_CONTENT, id: id }})
          // TODO: save a connection to the composition, or create a copy for the special use after
          if (composition) compositions.push(JSON.parse(JSON.stringify(composition)))
        })
      )
      // node input
      let nodeName = compositions[0].name
      let nodeInput = {
        name: nodeName,
        wsItemType: 'WS_NODE',
        items: compositions,
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      this.$log('nodeInput', nodeInput)
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      this.node = item
      this.nodeEditorOpened = true
      this.compositionsSelected = []
    },
    async compositionsSelectedDelete () {
      this.$log('compositionsSelectedDelete start')
      if (!confirm('Delete selected ?')) return
      // find current comp in selected
      if (this.compositionsSelected.includes(this.storeExplorer.compositionPlaying)) {
        this.compositionDrop()
      }
      // delete compositions
      await Promise.all(
        this.compositionsSelected.map(async (id) => {
          await this.$rxdb.remove(id)
        })
      )
      this.$log('compositionsSelectedDelete done')
      this.compositionsSelected = []
    },
  }
}
</script>
