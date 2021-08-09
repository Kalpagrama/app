<template lang="pug">
.row.full-width.items-center.content-center.justify-between.q-pt-md.q-px-xs.q-pb-sm
  //- v-if="(node.name.length > 0 || node.spheres.length > 0)"
  q-btn(
    round flat color="red" icon="delete_outline" @click="nodeDelete()")
  .col
  q-btn(round flat :style=`{borderStyle: node.color === 'orange'? 'solid' : null, borderWidth: '1px'}` color="orange" icon="lens"
    @click="node.color = 'orange', $emit('update')")
  q-btn(round flat :style=`{borderStyle: node.color === 'red'? 'solid' : null, borderWidth: '1px'}` color="red" icon="lens"
    @click="node.color = 'red', $emit('update')")
  q-btn(round flat :style=`{borderStyle: node.color === 'green'? 'solid' : null, borderWidth: '1px'}` color="green" icon="lens"
    @click="node.color = 'green', $emit('update')")
  q-btn(round flat :style=`{borderStyle: node.color === 'blue'? 'solid' : null, borderWidth: '1px'}` color='blue' icon="lens"
    @click="node.color = 'blue', $emit('update')")
  .col
  q-btn(
    v-if="!node.wsItemType"
    @click="nodeSave()"
    flat color="grey-5" no-caps) Сохранить
  //- v-if="true || node.name.length > 0"
  q-btn(
    @click="nodePublish()"
    flat  no-caps
    :color="canPublish ? 'green' : 'red'"
    :disable="!canPublish"
    :loading="nodePublishing") Опубликовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { UserApi } from 'src/api/user'
import { WsItemTypeEnum } from 'src/system/rxdb/common'
import {assert} from 'src/system/utils'

export default {
  name: 'nodeEditorActions',
  props: ['player', 'node', 'contentKalpa'],
  data () {
    return {
      nodePublishing: false,
    }
  },
  computed: {
    canPublish () {
      if (!this.node.name) {
       return false
      }
      return true
    },
  },
  methods: {
    // compositionCreate () {
    //   let composition
    //   // VIDEO select 30 sec from currentTime
    //   if (this.contentKalpa.type === 'VIDEO') {
    //     composition = {
    //       id: Date.now().toString(),
    //       thumbUrl: this.contentKalpa.thumbUrl,
    //       thumbHeight: this.contentKalpa.thumbHeight,
    //       thumbWidth: this.contentKalpa.thumbWidth,
    //       outputType: 'VIDEO',
    //       layers: [
    //         {
    //           id: Date.now().toString(),
    //           contentOid: this.contentKalpa.oid,
    //           figuresAbsolute: this.player.figure
    //         },
    //       ],
    //       operation: { items: null, operations: null, type: 'CONCAT'},
    //       __typename: 'Composition',
    //     }
    //   }
    //   // IMAGE select all image, or whole ?
    //   else if (this.contentKalpa.type === 'IMAGE') {
    //     composition = {
    //       id: Date.now().toString(),
    //       thumbUrl: this.contentKalpa.thumbUrl,
    //       thumbHeight: this.contentKalpa.thumbHeight,
    //       thumbWidth: this.contentKalpa.thumbWidth,
    //       outputType: 'IMAGE',
    //       layers: [
    //         {
    //           id: Date.now().toString(),
    //           contentOid: this.contentKalpa.oid,
    //           figuresAbsolute: this.player.figure
    //         }
    //       ],
    //       operation: { items: null, operations: null, type: 'CONCAT'},
    //       __typename: 'Composition',
    //     }
    //   }
    //   // BOOK
    //   else if (this.contentKalpa.type === 'BOOK') {
    //     composition = {
    //       id: Date.now().toString(),
    //       thumbUrl: this.contentKalpa.thumbUrl,
    //       thumbHeight: this.contentKalpa.thumbHeight,
    //       thumbWidth: this.contentKalpa.thumbWidth,
    //       outputType: 'BOOK',
    //       layers: [
    //         {
    //           id: Date.now().toString(),
    //           contentOid: this.contentKalpa.oid,
    //           figuresAbsolute: this.player.figure
    //         },
    //       ],
    //       operation: { items: null, operations: null, type: 'CONCAT'},
    //       __typename: 'Composition',
    //     }
    //   }
    //   // AUDIO: like video 30 sec from currentTime
    //   // WEB
    //   return composition
    // },
    // async contentBookmarkSave () {
    //   this.$log('contentBookmarkSave')
    //   // ---
    //   // add content to bookmarks if all is good...
    //   let {items: [bookmark]} = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK, oid: this.contentKalpa.oid}})
    //   if (bookmark) {
    //     // revive ?
    //   }
    //   else {
    //     let bookmarkInput = {
    //       type: this.contentKalpa.type,
    //       oid: this.contentKalpa.oid,
    //       name: this.contentKalpa.name,
    //       thumbUrl: this.contentKalpa.thumbUrl,
    //       isSubscribed: true
    //     }
    //     bookmark = await this.$rxdb.set(RxCollectionEnum.WS_BOOKMARK, bookmarkInput)
    //     if (!await UserApi.isSubscribed(this.contentKalpa.oid)) await UserApi.subscribe(this.contentKalpa.oid)
    //   }
    // },
    async nodeSave () {
      // this.node - это wsItem. он реактивен
      assert(this.node.wsItemType === WsItemTypeEnum.WS_NODE, 'bad item type:' + JSON.stringify(this.node))
      // this.$log('nodeSave')
      // let nodeInput = JSON.parse(JSON.stringify(this.node))
      // nodeInput.thumbUrl = this.contentKalpa.thumbUrl
      // nodeInput.items[0] = this.compositionCreate()
      // let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      // this.$log('nodeSaved', nodeSaved)
      // this.player.setState('figure', null)
      this.$emit('close')
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        // ---
        // loading
        this.nodePublishing = true
        await this.$wait(1000)
        // ---
        // make node input
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        // nodeInput.items[0] = this.compositionCreate()
        if (nodeInput.name.length === 0) {
          throw new Error(this.$t('Empty essence !'))
        }
        this.$log('nodeInput', nodeInput)
        // ---
        // create node, publish this shit
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        // this.$store.commit('ui/stateSet', ['createdNode', true])
        // this.$q.notify({type: 'positive', message: 'Node published ' + createdNode.oid})
        // delete draft
        await this.$rxdb.remove(this.node.id)
        this.nodePublishing = false

        // this.player.setState('figure', null) // kill player figure, it will destroy node editor
        // todo where to wait for the progress of node creating ? here ?
        this.$emit('publish', createdNode)
        this.$emit('close')
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.$q.notify({type: 'negative', message: e.toString()})
      } finally {
        this.nodePublishing = false
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      await this.node.remove(true)
      this.node.flushDebounce()
      // await this.$rxdb.remove(this.node.id)
      this.$emit('delete')
      this.$emit('close')
    },
    // async playerFigureDeleteHandle (e) {
    //   this.$log('playerFigureDeleteHandle', e)
    //   if (this.node.wsItemType === 'WS_NODE') {
    //     this.player.setState('figure', null)
    //   }
    //   else {
    //     // if (confirm('Сохранить в черновики ?')) {
    //     //   // do staff
    //     //   let nodeInput = JSON.parse(JSON.stringify(this.node))
    //     //   nodeInput.items[0] = this.compositionCreate()
    //     //   let nodeSaved = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
    //     //   this.$log('nodeSaved', nodeSaved)
    //     //   this.player.setState('figure', null)
    //     // }
    //     // else {
    //     //   this.player.setState('figure', null)
    //     // }
    //     this.player.setState('figure', null)
    //   }
    // },
    // playerFigureCreateHandle (e) {
    //   this.$log('playerFigureCreateHandle', e)
    // },
  },
  mounted () {
    this.$log('mounted', this.node)
    assert(this.node.wsItemType === WsItemTypeEnum.WS_NODE, 'bad wsNode:' + JSON.stringify(this.node))
    // this.player.events.on('figure-create', this.playerFigureCreateHandle)
    // this.player.events.on('figure-delete', this.playerFigureDeleteHandle)
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.player.events.off('figure-create', this.playerFigureCreateHandle)
    this.player.events.off('figure-delete', this.playerFigureDeleteHandle)
  }
}
</script>
