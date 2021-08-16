<template lang="pug">
.row.full-width.items-center.content-center.justify-between.q-pt-md.q-px-xs.q-pb-sm
  //- v-if="(node.name.length > 0 || node.spheres.length > 0)"
  q-btn(
    round flat color="red" icon="delete_outline" @click="nodeDelete()")
  .col
  div(v-if="showColor")
    q-btn(round flat :style=`{borderStyle: node.color === 'orange'? 'solid' : null, borderWidth: '1px'}` color="orange" icon="lens"
      @click="setColor('orange')")
    q-btn(round flat :style=`{borderStyle: node.color === 'red'? 'solid' : null, borderWidth: '1px'}` color="red" icon="lens"
      @click="setColor('red')")
    q-btn(round flat :style=`{borderStyle: node.color === 'green'? 'solid' : null, borderWidth: '1px'}` color="green" icon="lens"
      @click="setColor('green')")
    q-btn(round flat :style=`{borderStyle: node.color === 'blue'? 'solid' : null, borderWidth: '1px'}` color='blue' icon="lens"
      @click="setColor('blue')")
  .col
  q-btn(
    @click="nodeSave()"
    flat color="grey-5" no-caps) {{$t('Save')}}
  //- v-if="true || node.name.length > 0"
  q-btn(
    @click="nodePublish()"
    flat  no-caps
    :color="canPublish ? 'green' : 'red'"
    :disable="!canPublish"
    :loading="nodePublishing") {{$t('Publish')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { UserApi } from 'src/api/user'
import { WsItemTypeEnum } from 'src/system/rxdb/common'
import {assert} from 'src/system/utils'

export default {
  name: 'nodeEditorActions',
  props: ['player', 'node', 'contentKalpa', 'showColor'],
  data () {
    return {
      nodePublishing: false,
    }
  },
  computed: {
    canPublish () {
      return !!(this.node.name)
    },
  },
  methods: {
    async setColor(color) {
      this.node.color = color
      await this.player.showAllDraftsForCurrentLocation()
    },
    async nodeSave () {
      // this.node - это wsItem. он реактивен
      assert(this.node.wsItemType === WsItemTypeEnum.WS_NODE, 'bad item type:' + JSON.stringify(this.node))
      this.node.temporary = false
      this.$emit('close')
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        // ---
        // loading
        this.nodePublishing = true
        // await this.$wait(1000)
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
        this.nodePublishing = false

        // this.player.setState('figure', null) // kill player figure, it will destroy node editor
        // todo where to wait for the progress of node creating ? here ?

        // delete draft
        await this.node.remove(true)
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
      this.node.temporary = true // будет удалено в beforeDestroy
      this.$emit('close')
      // await this.$rxdb.remove(this.node.id)
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
  async beforeDestroy () {
    this.$log('beforeDestroy', this.node.temporary)
    if (this.node.temporary) {
      this.$log('remove')
      this.node.remove(true)
    }
    // await this.player.showAllDraftsForCurrentLocation()

    this.player.events.off('figure-create', this.playerFigureCreateHandle)
    this.player.events.off('figure-delete', this.playerFigureDeleteHandle)
  }
}
</script>
