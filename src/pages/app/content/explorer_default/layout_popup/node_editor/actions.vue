<template lang="pug">
.row.full-width.items-center.content-center.justify-between.q-pt-md.q-px-md.q-pb-sm
  q-btn(round flat color="red" icon="delete_outline" @click="nodeDelete()")
  .col
  q-btn(
    @click="nodePublish()"
    flat color="green" no-caps
    :loading="nodePublishing"
    ) Опубликовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'nodeEditorActions',
  props: ['player', 'node', 'contentKalpa'],
  data () {
    return {
      nodePublishing: false,
    }
  },
  methods: {
    compositionCreate () {
      let composition
      // VIDEO select 30 sec from currentTime
      if (this.contentKalpa.type === 'VIDEO') {
        composition = {
          id: Date.now().toString(),
          thumbUrl: this.contentKalpa.thumbUrl,
          thumbHeight: this.contentKalpa.thumbHeight,
          thumbWidth: this.contentKalpa.thumbWidth,
          outputType: 'VIDEO',
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
      // IMAGE select all image, or whole ?
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
              figuresAbsolute: this.player.figure
            }
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
        // make node input
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        nodeInput.items[0] = this.compositionCreate()
        this.$log('nodeInput', nodeInput)
        // create node, publish this shit
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$emit('nodePublished', createdNode)
        // this.$q.notify({type: 'positive', message: 'Node published ' + createdNode.oid})
        // delete draft if it is a draft, man
        if (nodeInput.wsItemType === 'WS_NODE') {
          // await this.node.remove(true)
          await this.$rxdb.remove(this.node.id)
        }
        // done
        this.nodePublishing = false
        // kill player figure, it will destroy node editor
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
      // delete draft ?
      if (this.node.wsItemType === 'WS_NODE') {
        if (!confirm('Удалить?')) return
        // await this.node.remove(true)
        await this.$rxdb.remove(this.node.id)
      }
      // save draft ?
      else {
        this.player.events.emit('figure-delete')
      }
    },
    async playerFigureDeleteHandle (e) {
      this.$log('playerFigureDeleteHandle', e)
      if (this.node.wsItemType === 'WS_NODE') {
        this.player.setState('figure', null)
      }
      else {
        if (confirm('Сохранить в черновики ?')) {
          // do staff
          let nodeInput = JSON.parse(JSON.stringify(this.node))
          nodeInput.items[0] = this.compositionCreate()
          let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
          this.$log('nodeSaved', nodeSaved)
          this.player.setState('figure', null)
        }
        else {
          this.player.setState('figure', null)
        }
      }
    },
    playerFigureCreateHandle (e) {
      this.$log('playerFigureCreateHandle', e)
    },
  },
  mounted () {
    this.$log('mounted')
    this.player.events.on('figure-create', this.playerFigureCreateHandle)
    this.player.events.on('figure-delete', this.playerFigureDeleteHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.events.off('figure-create', this.playerFigureCreateHandle)
    this.player.events.off('figure-delete', this.playerFigureDeleteHandle)
  }
}
</script>
