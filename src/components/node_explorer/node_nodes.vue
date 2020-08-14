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
    }`)
    span.text-white.text-bold {{ $t('nodeExplorer_nodeNodes_Extend this node', 'Расширить ядро') }}
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      @published="nodePublished"
      @close="nodeEditorOpened = false"
      extendType="node"
      :extendOid="node.oid"
      :value="nodeEditorItem"
      :options=`{
        ctx: 'extend',
      }`
      :style=`{
        maxWidth: '800px',
        maxHeight: $q.screen.height-0+'px',
        minHeight: $q.screen.height-0+'px',
      }`)
      template(v-slot:header)
        .row.full-width.items-center.content-center.justify-between.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="nodeEditorOpened = false")
          span(:style=`{fontSize: '16px'}`).text-white.text-bold Расширяем ядро
          q-btn(round flat color="white" icon="more_vert")
          .row.full-width.justify-center.q-py-md
            div(:style=`{maxWidth: '600px'}`).row.full-width.q-px-sm
              img(:src="node.items[0].thumbUrl" :style=`{height: '100px', borderRadius: '10px',}`)
              .col
                .row.fit.items-between.content-between.q-pa-sm
                  span.text-white.text-bold {{ node.name }}
                  .row.full-width.q-px-xs
                    q-icon(name="emoji_people" color="white" size="20px")
                    span(:style=`{fontSize: '15px'}`).text-white.text-bold {{ Math.round(node.rate * 100) }}
                  .row.full-width
                    div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.b-60.q-pa-xs
                      img(:src="node.author.thumbUrl" :style=`{width: '20px', height: '20px', borderRadius: '50%',}`).q-mr-sm
                      span.text-grey-5 {{ node.author.name }}
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
              :style=`{maxWidth: '800px', marginTop: '0px'}`)
            //- node add
            .row.full-width.justify-start.q-pa-md
              span(:style=`{fontSize: '16px',}`).text-white.text-bold {{$t('nodeExplorer_nodeNodes_Node compositions', 'Образы ядра')}}
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
        name: '',
        wsItemType: 'WS_NODE',
        items: [],
        category: this.node.category,
        layout: this.node.layout,
        spheres: [
          {name: this.node.name}
        ],
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
      // this.$router.push(`/node/${oid}`).catch(e => e)
    }
  }
}
</script>
