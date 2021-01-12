<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  //- footer
  div(
    :style=`{
      //- position: 'absolute', zIndex: 1000, bottom: '0px',
      position: 'fixed', zIndex: 1000, bottom: '0px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      order: 10,
    }`
    ).row.full-width.items-center.content-center
    div(
      :style=`{
        height: '70px',
      }`
      ).row.full-width.items-center.content-center.justify-between.q-px-sm
      q-btn(
        @click="cancel()"
        flat color="grey-7" icon="west" no-caps
        :style=`{maxWidth: '60px'}`)
        .row.full-width.justify-center
          small Отмена
      //- .col
      q-btn(
        @click="publish()"
        color="green" no-caps
        :loading="publishing"
        :style=`{
          height: '40px',
        }`)
        span.text-bold Опубликовать
      q-btn(
        @click="link()"
        flat color="grey-7" icon="link" no-caps
        :style=`{maxWidth: '60px',}`)
        .row.full-width.justify-center
          small Связать
  //- body
  div(
    v-if="node"
    ).row.full-width.items-start.content-start
    composition-editor(
      :player="player"
      :composition="node.items[0]"
      :contentKalpa="contentKalpa"
      :style=`{
        borderRadius: '0 0 10px 10px',
      }`).bg-black
    name-editor(:node="node")
    spheres-editor(:node="node")
//- div(
          v-if="player && node"
          :style=`{
            //- height: $q.screen.height-heightSquare+'px',
          }`
          ).row.fit.items-between.content-between.b-30
          composition-editor(
            v-if="player && node"
            :player="player"
            :composition="node.items[0]"
            :contentKalpa="contentKalpa"
            :style=`{
            }`).bg-black
          name-editor(:node="node")
          spheres-editor(:node="node")
          div(:style=`{paddingLeft: '60px', paddingRight: '60px',}`).row.full-width.justify-center
            category-editor(:node="node" :style=`{}`)
          //- footer
          .row.full-width.justify-center
            div(
              :style=`{
                maxWidth: $store.state.ui.pageWidth+'px',
                borderRadius: '10px 10px 0 0',
              }`
              ).row.full-width.justify-between.b-40.q-px-sm.q-pb-xs.q-pt-sm
              q-btn(
                @click="node = null, headerHeight = 65"
                flat color="grey-7" icon="west" no-caps
                :style=`{maxWidth: '60px'}`)
                .row.full-width.justify-center
                  small Назад
              q-btn(
                @click="node = null, headerHeight = 65"
                flat color="green" icon="check" no-caps
                :style=`{maxWidth: '60px'}`)
                .row.full-width.justify-center
                  small Опубликовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import compositionPlayer from 'components/composition/composition_player/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'
import nameEditor from 'components/node_editor/name_editor.vue'
import spheresEditor from 'components/node_editor/spheres_editor.vue'
import categoryEditor from 'components/node_editor/category_editor.vue'

export default {
  name: 'nodeCreator',
  props: ['contentKalpa', 'player'],
  components: {
    compositionPlayer,
    compositionEditor,
    nameEditor,
    spheresEditor,
    categoryEditor
  },
  data () {
    return {
      node: null,
      nodeNew: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      publishing: false,
      saving: false,
    }
  },
  methods: {
    create () {
      let composition
      // VIDEO select 30 sec from currentTime
      if (this.contentKalpa.type === 'VIDEO') {
        let start = this.player.currentTime
        let end = start + 30 > this.player.duration ? this.player.duration : start + 30
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'VIDEO',
          layers: [
            {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          __typename: 'Composition',
        }
      }
      // IMAGE select all image
      else if (this.contentKalpa.type === 'IMAGE') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'IMAGE',
          layers: [
            {
              id: Date.now().toString(),
              contentOid: this.contentKalpa.oid,
              figuresAbsolute: [
                {t: null, points: []}
                // {t: null, points: [{x: 0, y: 0}]},
                // {t: null, points: [{x: 100, y: 0}]},
                // {t: null, points: [{x: 0, y: 100}]},
                // {t: null, points: [{x: 100, y: 100}]}
              ]},
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          __typename: 'Composition',
        }
      }
      // BOOK
      // AUDIO: like video 30 sec from currentTime
      // WEB
      let node = JSON.parse(JSON.stringify(this.nodeNew))
      node.items[0] = composition
      this.node = node
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(1000)
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        // nodeInput.shit...
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$log('publish done')
        this.$emit('publish', createdNode)
        this.publishing = false
      }
      catch (e) {
        this.$log('publish error')
        this.publishing = false
      }
    },
    save () {
      this.$log('save')
      // save/create WS_NODE
    },
    cancel () {
      this.$log('cancel')
      // save node ?
      this.$emit('cancel')
    },
  },
  mounted () {
    this.$log('mounted')
    // if this.nodeInput = ?
    this.create()
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
