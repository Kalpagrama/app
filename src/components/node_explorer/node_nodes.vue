<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- node add
  q-btn(
    @click="nodeAddStart()"
    push color="green" no-caps
    :style=`{
      position: 'fixed', zIndex: 5555,
      bottom: $q.screen.width > 1260 ? '10px' : '70px',
      left: 'calc(50% - 150px)',
      height: '50px',
      width: '300px',
    }`) Добавить образ
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      @published="nodePublished"
      @close="nodeEditorOpened = false"
      :value="nodeEditorItem"
      :options=`{
        essenceEditable: false,
        itemAdd: true,
      }`
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-60+'px',
        minHeight: $q.screen.height-60+'px',
      }`)
  //- body
  .col.full-width
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items, itemsMore}`)
        list-middle(
          @indexMiddle="indexMiddleChanged"
          :items="items" :itemsBan="itemsBan" :more="itemsMore"
          :options=`{paddingTop: 0, paddingBottom: $q.screen.height/3}`)
          //- node, nodeAdd
          template(v-slot:itemFirst)
            node(
              v-if="node" ctx="list" :node="node" :needFull="true" :visible="true" :active="nodeActive" :mini="false"
              :style=`{maxWidth: '800px', marginTop: '70px'}`)
            //- node add
            .row.full-width.justify-start.q-pa-md
              span(:style=`{fontSize: '16px',}`).text-white.text-bold {{$t('Node compositions', 'Образы ядра')}}
          //- node nodes
          template(v-slot:item=`{item, index, indexMiddle}`)
            node(
              ctx="list" layout="PIP"
              :node="item" :index="index" :essence="true"
              :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
              :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
              :active="!nodeActive && index === indexMiddle"
              :mini="false")
          //- footer for padding
          template(v-slot:itemLast)
            div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeExplorer-nodeNodes',
  props: ['node', 'stateNodeExplorer'],
  data () {
    return {
      nodeEditorOpened: false,
      nodeEditorItem: null,
      nodeActive: true,
    }
  },
  computed: {
    itemsBan () {
      return [this.node.oid]
    },
    sphereOid () {
      this.$log('node_nodes: this.node=', this.node)
      return this.node.sphereFromName.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  watch: {
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpend', to)
        if (to) this.nodeActive = false
        else this.nodeActive = true
      }
    }
  },
  methods: {
    indexMiddleChanged (to) {
      this.$log('indexMiddleChanged', to)
      if (to >= 0) this.nodeActive = false
      else this.nodeActive = true
    },
    async nodeAddStart () {
      this.$log('nodeAddStart', this.node)
      // create nodeInput
      let nodeInput = {
        name: this.node.name,
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: this.node.category,
        layout: this.node.layout,
      }
      this.$log('nodeInput', nodeInput)
      // create wsItem
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAdd item', item)
      // mute all
      this.stateNodeExplorer.set('nodeActive', false)
      this.$log('nodeAddStart done')
      // open editor
      this.nodeEditorItem = item
      this.nodeEditorOpened = true
    },
    async nodePublished (oid) {
      this.$log('nodePublished', oid)
      this.$q.notify({
        type: 'positive',
        message: 'Образ успешно добавлен!',
      })
      // await this.$wait(200)
      // this.$router.push(`/node/${oid}`).catch(e => e)
    }
  }
}
</script>
