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
      :stateExplorer="stateExplorer"
      :style=`{
        maxWidth: '600px',
      }`)
  //- header
  .row.full-width.justify-center
    div(:style=`{maxWidth: '600px'}`).row.full-width
      //- title
      div(v-if="false").row.full-width.q-pa-md
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Fragments
      //- search
      //- div(v-if="true").row.full-width
      //-   q-btn(round flat dense color="grey-7" icon="search")
      //-   .col
      //-     q-input(
      //-       v-if="false"
      //-       v-model="searchString"
      //-       filled dark dense color="grey-6"
      //-       label="Find a fragment"
      //-     ).full-width
      //-   q-btn(round flat dense color="grey-7" icon="add" @click="stateExplorer.compositionAddClick()")
      //-   q-btn(round flat dense color="grey-7" icon="sort")
      //- tools
      div(
        v-if="false && compositionsSelected.length === 0"
        :style=`{height: '46px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat dense color="green" icon="add" @click="stateExplorer.compositionAddClick()")
        .col
        q-btn(round flat dense color="white" icon="sort")
      //- tools selected
      div(
        v-if="false && compositionsSelected.length > 0"
        :style=`{height: '46px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        q-btn(round flat dense color="white" icon="clear" @click="compositionsSelected = []").b-50.q-ml-xs.q-mr-sm
        q-btn(
          v-if="compositionsSelected.length > 1"
          round flat dense color="white" no-caps).q-px-sm.q-mr-sm.b-50 Merge
        q-btn(
          v-if="true"
          round dense color="green" no-caps).q-px-sm.q-mr-sm.b-50 Create node
        .col
        q-btn(round flat dense color="red" no-caps).q-px-sm.b-50 Delete
  //- body
  .col.full-width.scroll
    div(v-if="contentOid").row.full-width.justify-center
      kalpa-loader(:mangoQuery="mangoQuery")
        template(v-slot=`{items}`)
          div(:style=`{maxWidth: '680px'}`).row.full-width
            div(
              v-if="true"
              :style=`{
                paddingLeft: '40px', paddingRight: '40px'}`).row.full-width.q-py-xs
              q-btn(round flat dense color="grey-7" icon="search")
              .col
                q-input(
                  v-if="false"
                  v-model="searchString"
                  filled dark dense color="grey-6"
                  label="Find a fragment"
                ).full-width
              q-btn(round flat dense color="grey-7" icon="add" @click="stateExplorer.compositionAddClick()")
              q-btn(round flat dense color="grey-7" icon="sort")
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
    compositionClick (c, ci) {
      this.$log('compositionClick', c, ci)
      let compositionStart = c.layers[0].figuresAbsolute[0].t
      this.$log('compositionStart', compositionStart)
    },
    async compositionDelete () {
      this.$log('compositionDelete')
    }
  },
  mounted () {
    this.$log('mouted')
    this.contentOid = this.stateExplorer.content.oid
  }
}
</script>
