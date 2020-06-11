<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- composition editor
  div(
    v-if="stateExplorer.compositionEditing"
    :style=`{
      position: 'absolute', zIndex: 1000,
      top: 0, left: 0, right: 0, bottom: 0,
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
    :style=`{position: 'absolute', top: 0, zIndex: 1000}`
    ).row.full-width.justify-center
    div(
      :style=`{maxWidth: '680px',}`
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
    div(v-if="contentOid").row.full-width.justify-center
      kalpa-loader(:mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          div(:style=`{maxWidth: '680px', paddingBottom: '200px',}`).row.full-width
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

export default {
  name: 'metaCompositions',
  components: {compositionItem, compositionEditor},
  props: ['stateExplorer'],
  data () {
    return {
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
    compositionsSelectedCreateNode () {
      this.$log('compositionsSelectedCreateNode')
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
