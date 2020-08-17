<template lang="pug">
div(
  ref="nodeExplorerNodeNodes"
  :style=`{position: 'relative'}`).column.fit
  //- clip add start, open item picker to find composition in workspace
  q-btn(
    @click="itemPickerOpened = true"
    push color="green" no-caps
    :style=`{
      position: 'fixed', zIndex: 5555,
      bottom: '20px',
      left: 'calc(50% - 100px)',
      height: '50px',
      width: '200px',
    }`)
    span.text-white.text-bold {{ $t('nodeExplorer_nodeNodes_addClip', 'Добавить образ') }}
  //- ws item picker
  q-dialog(
    v-model="itemPickerOpened" position="bottom"
    @show="nodeActive = false" @hide="nodeActive = true")
    ws-item-picker(
      @item="itemPicked"
      @close="itemPickerOpened = false"
      :title="itemPickerTitle"
      :options=`{
        composition: {typesAll: true, types: []},
        content: {typesAll: true, types: [], needComposition: true}
      }`
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
      }`)
  //- node
  //- body
  .col.full-width
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items, itemsMore}`)
        .row.full-width
          //- node wrapper for visibility
          div(
            v-observe-visibility=`{
              callback: nodeVisibilityCallback,
              intersection: {
                threshold: 0.8,
              }
            }`
            ).row.full-width
            node(
              v-if="node" ctx="list" :node="node" :needFull="true"
              :visible="true" :active="nodeActive" :mini="false"
              :style=`{maxWidth: '800px', marginTop: '0px'}`)
          //- got 1 > items
          div(v-if="items.length > 1").row.fit.items-start.content-start.q-px-sm
            list-masonry(:items="items.filter(i => i.oid !== node.oid)")
              template(v-slot:item=`{item}`)
                div(
                  @click="nodeClick(item)"
                  ).row.full-width.item-start.content-start
                  img(
                    :src="item.meta.items[0].thumbUrl" draggable="false"
                    :style=`{borderRadius: '10px', overflow: 'hidden'}`).full-width
              template(v-slot:itemLast)
                div(:style=`{height: '400px'}`).row.full-width
          //- no items
          div(v-else).row.full-width.items-start.content-start.q-pa-sm
            div(
              v-for="i in 4" :key="i"
              :style=`{height: $q.screen.width < 800 ? $q.screen.width/2+'px' : 800/2+'px',}`
              ).col-6.q-pa-xs
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeExplorer-nodeNodes',
  props: ['node', 'stateNodeExplorer'],
  data () {
    return {
      nodeEditorOpened: false,
      nodeEditorItem: null,
      nodeActive: true,
      itemPickerOpened: false,
      content: null,
      contentExporerOpened: false,
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
    },
    itemPickerTitle () {
      return 'Найди образ в мастерской'
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
    nodeClick (n, ni) {
      this.$log('nodeClick', n, ni)
      this.$router.push(`/node/${n.oid}`)
    },
    nodeVisibilityCallback (isVisible, entry) {
      this.$log('nodeVisibilityCallback', isVisible, entry)
      if (isVisible) {
        this.nodeActive = true
      }
      else {
        this.nodeActive = false
      }
    },
    async itemPicked ({type, item}) {
      this.$log('itemPicked', type, item)
      this.itemPickerOpened = false
      if (type === 'composition') {
        let nodeInput = {
          name: this.node.name,
          wsItemType: 'WS_NODE',
          category: this.node.category,
          layout: this.node.layout,
          spheres: [],
          stage: 'draft',
          items: []
        }
        nodeInput.items[0] = item
        this.$log('itemPicked nodeInput', nodeInput)
        let nodeWs = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
        this.$log('itemPicked nodeWs', nodeWs)
        let nodePublished = await NodeApi.nodeCreate(nodeWs)
        await nodeWs.updateExtended('stage', 'published', false) // без debounce.
        await nodeWs.updateExtended('oid', nodePublished.oid, false) // без debounce // oid нужно при снятии с публикации
      }
      else {
        this.$q.notify({type: 'negative', message: 'Need a clip!'})
      }
    }
  }
}
</script>
