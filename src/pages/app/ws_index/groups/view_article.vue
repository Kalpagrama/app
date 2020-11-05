<template lang="pug">
div(
  ).row.full-width.items-start.content-start
  q-dialog(
    v-model="nodeFinderOpened"
    position="bottom" maximized
    )
    node-finder(
      :node="node"
      :style=`{
        minWidth: Math.min($q.screen.width, 700)+'px',
        maxWidth: Math.min($q.screen.width, 700)+'px',
        height: $q.screen.gt.sm ? 800+'px' : $q.screen.height+'px',
      }`
      @close="nodeFinderOpened = false"
      @item='nodeItemFound'
      )
  draggable(v-model="node.items" handle=".handle").full-width
    transition-group
      div(
        v-for="(n,ni) in node.items" :key="n.id"
        :style=`{
          //- background: 'rgb(35,35,35)',
        }`
        ).row.full-width.items-start.content-start.q-mb-sm
        div(
          :style=`{
            background: 'rgb(32,32,32)',
            borderRadius: '10px',
          }`
          ).col-12
          div(
            v-if="n.type === 'TEXT'"
            :class="n.class"
            ).row.full-width
            //- @keyup.enter="nodeAdd({type: 'p', items: [], links: [], class: '', styles: {}, item: {text: ''}})"
            q-input(
              v-model="n.item.text" borderless dark type="textarea" autogrow
              autofocus spellcheck="false"
              :input-style=`{
                paddingTop: '4px',
                paddingLeft: '10px', paddingRight: '10px',
                fontSize: '14px',
                ...n.style,
              }`
              ).full-width
          div(
            v-else-if="n.type === 'NODE'"
            ).row.full-width
            node-mini(:node="n.item" :isActive="true" :isVisible="true")
          div(
            v-else-if="n.type === 'JOINT'"
            ).row.full-width
            h1.text-white JOINT
          div(
            v-else-if="n.type === 'USER'"
            ).row.full-width.items-center.content-center.q-pa-sm
            img(
              :src="n.item.thumbUrl"
              :style=`{
                width: '40px', height: '40px',
                borderRadius: '50%',
              }`)
            .col.q-px-sm
              span.text-white {{n.item.name}}
          div(
            v-else-if="['VIDEO', 'IMAGE'].includes(n.type)"
            :class="n.class"
            ).row.full-width
            content-player(
              :contentKalpa="n.item"
              :isActive="false" :isVisible="true")
          div(
            v-else-if="n.type === 'SPHERE'"
            ).row.full-width.items-center.content-center.q-pa-sm
            q-icon(name="blur_on" size="40px" color="white").q-mr-sm
            span.text-white {{ n.item.name }}
          div(v-else).row.full-width
            small.text-white {{n}}
        //- footer: menu, links
        div(:style=`{paddingLeft: '0px',}`).row.full-width.handle
          q-btn(round flat dense color="grey-9" icon="drag_indicator")
            q-popup-proxy(
              maximized dark position="bottom"
              anchor="top left" self="top left"
              cover
              )
              q-btn(color="grey-6" flat dense no-caps @click="nodeDelete(n,ni)").full-width.q-px-md Delete
          .col
            node-linker(:node="node" :n="n")
  //- add node
  div(:style=`{paddingLeft: '34px',}`).row.full-width
    q-btn(
      @click="nodeAdd({type: 'TEXT', items: [], links: [], class: '', styles: {}, item: {text: ''}})"
      flat icon="add" color="green" no-caps
      :style=`{height: '50px',}`
      ).col-6.q-mb-sm Add text
    q-btn(
      @click="nodeFinderOpened = true"
      flat icon="add" color="green" no-caps
      :style=`{height: '50px',}`
      ).col-6.q-mb-sm Add element
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import draggable from 'vuedraggable'

export default {
  name: 'viewArctive',
  props: ['node'],
  components: {
    draggable,
    nodeFinder: () => import('./node_finder.vue'),
    nodeLinker: () => import('./node_linker.vue'),
    contentPlayer: () => import('components/content_player/index.vue')
  },
  data () {
    return {
      nodeFinderOpened: false,
    }
  },
  methods: {
    nodeAdd (node) {
      this.$log('nodeAdd', node)
      node.id = Date.now().toString()
      node.order = this.node.items.length - 1
      this.node.items.push(node)
    },
    nodeDelete (node, nodeIndex) {
      this.$log('nodeDelete', node, nodeIndex)
      this.$delete(this.node.items, nodeIndex)
    },
    async nodeItemFound (item) {
      this.$log('nodeItemFound', item)
      this.nodeFinderOpened = false
      let nodeInput = {
        id: Date.now().toString(),
        type: null,
        item: null,
        style: {},
        class: '',
        items: [],
        links: [],
      }
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_BOOKMARK') {
          if (['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)) {
            nodeInput.type = 'SPHERE'
            nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          }
          if (item.type === 'USER') {
            nodeInput.type = 'USER'
            nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          }
          if (item.type === 'NODE') {
            nodeInput.type = 'NODE'
            nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          }
          if (item.type === 'JOINT') {
            nodeInput.type = 'JOINT'
            nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          }
          if (['VIDEO', 'IMAGE'].includes(item.type)) {
            nodeInput.type = item.type
            nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          }
        }
      }
      else {
        if (item.type === 'NODE') {
          nodeInput.type = 'NODE'
          nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
        }
        if (['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)) {
          nodeInput.type = 'SPHERE'
          nodeInput.item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
        }
      }
      if (!nodeInput.type) return
      this.nodeAdd(nodeInput)
    }
  }
}
</script>
