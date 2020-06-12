<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom"
    )
    ws-node-editor(
      @close="nodeEditorOpened = false"
      :node="node"
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
      }`)
  //- composition editor
  div(
    v-if="stateExplorer.compositionEditing"
    :style=`{
      position: 'absolute', zIndex: 1000,
      top: 0, left: 0, right: 0, bottom: 0,
      paddingTop: '24px',
    }`
    ).row.fit.justify-center.b-50
    composition-editor(
      @delete="compositionDelete(stateExplorer.composition)"
      :stateExplorer="stateExplorer"
      :style=`{
        maxWidth: '600px',
      }`)
  //- tools selected
  div(
    v-if="compositionsSelected.length > 0"
    :style=`{position: 'absolute', top: '26px', zIndex: 1000}`
    ).row.full-width.justify-center
    div(
      :style=`{maxWidth: stateExplorer.pageContentWidth+'px',}`
      ).row.full-width.items-center.content-center.q-py-xs.b-50
      q-btn(round flat dense color="white" icon="clear" @click="compositionsSelected = []").b-50.q-ml-xs.q-mr-xs
        q-tooltip(anchor="top middle" self="center middle") Drop selection
      q-btn(
        v-if="true"
        round dense color="green" no-caps @click="compositionsSelectedCreateNode()").q-px-sm.q-mr-sm.b-50 Create node
      q-btn(
        v-if="compositionsSelected.length > 1"
        round flat dense color="white" no-caps @click="compositionsSelectedMerge()").q-px-sm.q-mr-sm.b-50 Merge
      //- .col
      q-btn(round flat dense color="red" no-caps @click="compositionsSelectedDelete()").q-px-sm.b-50 Delete
  //- body
  .col.full-width.scroll
    div(v-if="contentOid" :style=`{paddingTop: '26px', paddingBottom: '200px'}`).row.full-width.justify-center
      kalpa-loader(:mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          div(:style=`{maxWidth: stateExplorer.pageContentWidth+'px', paddingBottom: '200px',}`).row.full-width.justify-center
            content-progress(
              v-if="!stateExplorer.compositionEditing"
              :stateExplorer="stateExplorer"
              :style=`{
                position: 'absolute', zIndex: 1000, top: '-62px',
                maxWidth: stateExplorer.pageContentWidth-80+'px'}`)
                template(v-slot:meta)
                  div(
                    v-for="(i,ii) in items" :key="i.id"
                    :style=`{
                      position: 'absolute', zIndex: 300+ii,
                      left: i.layers[0].figuresAbsolute[0].t/stateExplorer.duration*100+'%',
                      top: '0px',
                      width: '2px',
                      opacity: 0.5,
                    }`
                    ).row.full-height.bg-white
            //- header
            div(
              v-if="true"
              :style=`{
                paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.q-py-xs
              q-btn(round flat dense color="grey-7" icon="search")
                q-tooltip(anchor="top middle" self="center middle") Search
              .col
                q-input(
                  v-if="false"
                  v-model="searchString"
                  filled dark dense color="grey-6"
                  label="Find a fragment"
                ).full-width
              q-btn(round flat dense color="grey-7" icon="add" @click="stateExplorer.compositionAddClick()")
                q-tooltip(anchor="top middle" self="center middle") Add composition
              q-btn(round flat dense color="grey-7" icon="sort")
                q-tooltip(anchor="top middle" self="center middle") Sort
            //- compositions
            div(
              v-for="(c,ci) in items" :key="c.id"
              ).row.full-width.items-start.content-start
              div(
                :style=`{width: '40px', height: '40px'}`
                ).row.items-center.content-center.justify-center
                q-checkbox(
                  v-model="compositionsSelected" :val="c.id" dark dense color="grey-6"
                  :style=`{opacity: compositionsSelected.includes(c.id) ? 1 : 0.4}`)
              .col
                composition-item(
                  :value="c" :stateExplorer="stateExplorer"
                  :style=`{}`
                  ).q-mb-xs
              div(:style=`{width: '40px'}`).bg-red
            div(
              v-if="false"
              :style=`{}`).row.full-width
              div(v-for="i in 100" :key="i").row.full-width.br item {{i}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionItem from './composition_item'
import compositionEditor from './composition_editor'
import contentProgress from '../../content_progress'

export default {
  name: 'metaCompositions',
  components: {contentProgress, compositionItem, compositionEditor},
  props: ['stateExplorer'],
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
      compositionEditorOpened: false,
      compositionsSelected: [],
      contentOid: null,
      searchString: '',
      stage: 'all'
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.selector.contentType = 'COMPOSITION'
      res.selector.contentOid = this.contentOid
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  methods: {
    compositionsSelectedMerge () {
      this.$log('compositionsSelectedMerge')
      this.compositionsSelected = []
    },
    async compositionsSelectedCreateNode () {
      this.$log('compositionsSelectedCreateNode')
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
      if (this.compositionsSelected.includes(this.stateExplorer.compositionSelected)) {
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
    async compositionDelete (c) {
      this.$log('compositionDelete')
      if (!confirm('Delete composition ?')) return
      if (this.stateExplorer.compositionSelected === c.id) {
        this.compositionDrop()
      }
      await this.$rxdb.remove(c.id)
      this.$log('compositionDelete done')
    },
    compositionDrop () {
      this.$log('compositionDrop')
      this.stateExplorer.set('composition', null)
      this.stateExplorer.set('compositionSelected', null)
      this.stateExplorer.set('compositionEditing', null)
    }
  },
  mounted () {
    this.$log('mouted')
    this.contentOid = this.stateExplorer.content.oid
  }
}
</script>
