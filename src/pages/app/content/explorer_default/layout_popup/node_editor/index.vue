<template lang="pug">
div(
  :style=`{
    minHeight: '70px',
  }`
  ).column.full-width
  //- header
  div(
    :style=`{
      position: 'relative',
      minHeight: '70px',
    }`
    ).row.full-width.items-start.content-start.q-px-md
    q-btn(
      round flat icon="play_arrow"
      ).q-mt-md
    .col.full-height
      name-editor(:node="node")
      //- div(:style=`{textAlign: 'center'}`).row.fit.items-center.content-center.justify-center.q-px-sm
        //- span.text-white в чем суть в чем суть в чем суть
        q-input(
          v-model="node.name"
          borderless dark
          type="textarea" autogrow :rows="1"
          placeholder="В чем суть?"
          :input-style=`{
            fontSize: '20px',
            textAlign: 'center',
            lineHeight: 1.2,
          }`
          ).full-width
    q-btn(
      @click="$emit('toggle')"
      round flat
      :icon="isMini ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
      ).q-mt-md
  //- body
  .col.full-width.scroll
    category-editor(:node="node").q-mt-xl
    spheres-editor(:node="node")
    //- footer: actions publish, save, delete
    .row.full-width.justify-center.q-pa-xl
      div(:style=`{maxWidth: '280px'}`).row.full-width
        q-btn(
          @click="nodePublish()"
          color="green" no-caps
          :style=`{
            height: '50px',
          }`).full-width.q-mb-sm
          span.text-bold Опубликовать
        q-btn(outline color="green" no-caps @click="nodeSave()").full-width.q-mb-md Сохранить в черновики
        //- q-btn()
        q-btn(outline color="red" no-caps @click="nodeDelete()").full-width Удалить
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import nameEditor from './name_editor.vue'
import categoryEditor from './category_editor.vue'
import spheresEditor from './spheres_editor.vue'

export default {
  name: 'nodeEditor',
  props: ['player', 'contentKalpa', 'isMini'],
  components: {
    nameEditor,
    categoryEditor,
    spheresEditor,
  },
  data () {
    return {
      node: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      nodePublishing: false,
      nodeSaving: false,
    }
  },
  methods: {
    compositionCreate () {
      let composition
      // VIDEO select 30 sec from currentTime
      if (this.contentKalpa.type === 'VIDEO') {
        // let start = this.player.currentTime
        // let end = start + 30 > this.player.duration ? this.player.duration : start + 30
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'VIDEO',
          layers: [
            {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: this.player.figure},
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
      return composition
    },
    async nodeSave () {
      this.$log('nodeSave')
      this.$emit('nodeSaved')
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.nodePublishing = true
        await this.$wait(1000)
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        nodeInput.items[0] = this.compositionCreate()
        // nodeInput.shit...
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$emit('nodePublished', createdNode)
        // this.$q.notify({type: 'positive', message: 'Node published ' + createdNode.oid})
        this.nodePublishing = false
        this.player.setState('figure', null)
        if (!this.isMini) {
          this.$emit('toggle')
        }
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.$q.notify({type: 'negative', message: e.toString()})
        this.nodePublishing = false
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!this.isMini) {
        this.$emit('toggle')
      }
      this.player.setState('figure', null)
    },
  },
}
</script>
