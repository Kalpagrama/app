<template lang="pug">
div(
  :style=`{
    minHeight: '70px',
  }`
  ).row.full-width
  //- header
  div(
    :style=`{
      position: 'relative',
      minHeight: '70px',
    }`
    ).row.full-width.items-start.content-start.q-px-md
    q-btn(
      @click="figureFocusToggle()"
      round flat
      :color="figureFocused ? 'red' : 'white'"
      icon="camera"
      ).q-mt-md
    .col.full-height
      name-editor(:node="node")
    q-btn(
      v-if="isOpened"
      @click="$emit('toggle')"
      round flat color="white"
      :icon="'keyboard_arrow_down'"
      ).q-mt-md
    q-btn(
      v-else
      @click="$emit('toggle')"
      flat color="white" no-caps
      ).q-mt-md Далее
  div(
    v-if="isOpened"
    :style=`{}`
    ).row.full-width
    spheres-editor-inline(:node="node")
    .row.full-width.q-pt-md.q-px-md.q-pb-sm
      q-btn(round flat color="red" icon="delete_outline" @click="nodeDelete()")
      .col
      q-btn(round flat color="green" icon="check" :loading="nodePublishing" @click="nodePublish()")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import nameEditor from './name_editor.vue'
import categoryEditor from './category_editor.vue'
import spheresEditor from './spheres_editor.vue'
import spheresEditorInline from './spheres_editor_inline.vue'

export default {
  name: 'nodeEditor',
  props: ['player', 'contentKalpa', 'isOpened'],
  components: {
    nameEditor,
    categoryEditor,
    spheresEditor,
    spheresEditorInline,
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
      figureFocused: false,
    }
  },
  watch: {
    'player.currentTime': {
      handler (to, from) {
        if (this.figureFocused) {
          if (to > this.player.figure[1].t) {
            this.player.setCurrentTime(this.player.figure[0].t)
          }
          if (to < this.player.figure[0].t) {
            this.player.setCurrentTime(this.player.figure[0].t)
          }
        }
      }
    }
  },
  methods: {
    figureFocusToggle () {
      this.$log('figureFocusToggle')
      this.figureFocused = !this.figureFocused
      if (this.contentKalpa.type === 'VIDEO') {
        if (this.figureFocused) {
          this.player.setCurrentTime(this.player.figure[0].t)
          this.player.play()
        }
      }
    },
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
      else if (this.contentKalpa.type === 'BOOK') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'BOOK',
          layers: [
            {
              id: Date.now().toString(),
              contentOid: this.contentKalpa.oid,
              figuresAbsolute: this.player.figure
            },
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
          __typename: 'Composition',
        }
      }
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
