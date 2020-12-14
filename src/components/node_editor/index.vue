<template lang="pug">
.row.full-width
  //- itemFinder
  q-dialog(
    v-if="showEditor"
    v-model="itemFinderShow"
    position="bottom" maximized)
    kalpa-finder(
      @contentKalpa="itemFound"
      :pages=`{
        workspace: {views: ['image', 'video', 'node', 'sphere', 'user']},
        kalpagrama: {views: ['all', 'users', 'nodes']},
        gif: {views: ['all']},
        web: {views: ['all', 'image', 'video',]}
      }`
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderShow = false")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать связь
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
  //- editors wrapper
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px'
    }`
    ).row.full-width
    //- items wrapper
    div(
      :class=`{
        'q-pa-sm': node.items.length === 2
      }`
      :style=`{
        position: 'relative', zIndex: 100,
      }`
      ).row.full-width
      //- item cols
      div(
        v-for="(item, itemii) in node.items" :key="itemii"
        :style=`{
          position: 'relative',
        }`
        :class=`{
          'col-12': node.items.length === 1,
          'col-6': node.items.length === 2
        }`
        )
        //- item paddingBottom square...
        div(
          :style=`{
            position: 'relative',
            paddingBottom: itemPaddingBottom(item, itemii),
            transform: itemTransform(item, itemii)
          }`).row.full-width
          div(
            :style=`{
              position: 'absolute',
              ...itemStyles(item,itemii)
            }`).row.fit
            item-editor(
              @add="itemFinderShow = true"
              @item="$event => itemChanged($event,itemii)"
              @editing="$event => itemEditingHandle($event,itemii)"
              @player="$emit('player', $event)"
              :item="item"
              :styles=`{
                height: '100%',
              }`
              :style=`{}`).fit
    //- editors: name, spheres, category
    div(
      v-if="showEditor"
      :style=`{
        zIndex: 10,
        paddingTop: editorsPaddingTop+'px',
      }`).row.full-width.q-pb-sm
      name-editor(:node="node")
      spheres-editor(:node="node")
      .row.full-width.justify-center
        category-editor(
          :node="node"
          :style=`{maxWidth: '400px',}`)
  //- footer: cancel, publish, link
  div(v-if="showEditor").row.full-width.justify-center.q-py-sm
    div(:style=`{maxWidth: '520px'}`).row.full-width
      q-btn(
        @click="cancel()"
        flat color="white" icon="west"
        :style=`{height: '60px', width: '60px'}`)
      .col
        q-btn(
          @click="publish()"
          color="green" no-caps
          :loading="publishing"
          :style=`{
            height: '60px',
          }`
          ).full-width
          span(:style=`{fontSize: '18px',}`).text-bold Опубликовать
      q-btn(
        @click="linkToggle()"
        flat
        color="white"
        :icon="node.items[1] ? 'link_off' : 'link'"
        :style=`{height: '60px', width: '60px'}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import kalpaFinder from 'components/kalpa_finder/index.vue'

import nameEditor from './name_editor.vue'
import spheresEditor from './spheres_editor.vue'
import categoryEditor from './category_editor.vue'
import itemEditor from './item_editor.vue'

export default {
  name: 'nodeEditor',
  props: ['node', 'showEditor'],
  components: {
    nameEditor,
    spheresEditor,
    categoryEditor,
    itemEditor,
    kalpaFinder,
  },
  data () {
    return {
      nodeInitial: null,
      publishing: false,
      itemFinderShow: false,
      itemEditing: null,
      editorsPaddingTop: 8
    }
  },
  methods: {
    itemStyles (item, itemii) {
      if (this.node.items.length === 1) {
        return {
          zIndex: 100
        }
      }
      else {
        if (this.itemEditing === itemii) {
          let styles = {
            zIndex: 200,
            top: '-5px',
            minWidth: 'calc(200% + 10px)',
            maxWidth: 'calc(200% + 10px)',
            minHeight: 'calc(200% + 10px)',
            maxHeight: 'calc(200% + 10px)',
          }
          if (itemii === 1) {
            styles.right = '-5px'
          }
          else {
            styles.left = '-5px'
          }
          return styles
        }
        else {
          let styles = {
            zIndex: 100,
            top: '0px',
            minWidth: '100%',
            maxWidth: '100%',
            minHeight: '100%',
            maxHeight: '100%',
          }
          return styles
        }
      }
    },
    itemPaddingBottom (item, itemii) {
      if (this.node.items.length === 1) {
        if (item.thumbHeight && item.thumbWidth) {
          return 'calc(' + item.thumbHeight / item.thumbWidth * 100 + '% + 42px)'
        }
        else {
          return '50%'
        }
      }
      else return '100%'
    },
    itemTransform (item, itemii) {
      if (this.node.items.length === 1) return 'none'
      else {
        if (this.itemEditing === itemii) {
          return 'none'
        }
        else {
          if (itemii === 0) {
            return 'perspective(600px) rotateY(8deg)'
          }
          else {
            return 'perspective(600px) rotateY(-8deg)'
          }
        }
      }
    },
    itemMinWidth (item, itemii) {
      if (this.node.items.length === 1) return '100%'
      else {
        if (this.itemEditing === itemii) {
          return '180%'
        }
        else {
          return '100%'
        }
      }
    },
    itemLeft (item, itemii) {
      // , itemEditing === itemii ? '-90%' : '0px',
      if (this.node.items.length === 1) return '0px'
      else {
        // if (this.itemEditing === itemii) {
        //   return '0px'
        // }
        // else {
        //   return '100px'
        // }
        return '0px'
      }
    },
    itemEditingHandle (isEditing, ii) {
      this.$log('itemEditingHandle', isEditing, ii)
      if (isEditing) {
        this.itemEditing = ii
        if (this.node.items.length === 1) {
          this.editorsPaddingTop = 100
        }
      }
      else {
        this.itemEditing = null
        this.editorsPaddingTop = 8
      }
    },
    async itemFound (item) {
      this.$log('itemFound', item)
      this.itemFinderShow = false
      // from ws
      if (item.wsItemType) {
        // WS_BOOKMARK
        if (item.wsItemType === 'WS_BOOKMARK') {
          item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          this.$set(this.node.items, 1, item)
        }
        // WS_NODE
        if (item.wsItemType === 'WS_NODE') {
          this.node.items[1] = item
        }
      }
      // from kalpa, published
      else {
        if (item.type === 'VIDEO') {
          alert('VIDEO')
          this.node.items[1] = item
        }
        else if (item.type === 'IMAGE') {
          this.node.items[1] = item
        }
        else if (item.type === 'NODE') {
          // ?
        }
        else if (item.type === 'USER') {
          // ?
        }
        else if (['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)) {
          // ?
        }
        else if (item.type === 'GIF') {
          alert('content.GIF')
          this.node.items[1] = item
        }
      }
    },
    itemChanged (item, ii) {
      this.$log('itemChanged', item, ii)
      this.$set(this.node.items, ii, item)
    },
    linkToggle () {
      this.$log('linkToggle')
      if (this.node.items[1]) {
        this.node.items = [this.node.items[0]]
        this.node.vertices = []
      }
      else {
        this.$set(this.node.items, 1, {type: 'ADD'})
      }
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        let nodeInput = JSON.parse(JSON.stringify(this.node))
        if (nodeInput.items.length === 1) {
          nodeInput.vertices = []
        }
        if (nodeInput.items.length === 2) {
          if (nodeInput.name.length === 0) {
          }
          else {
            nodeInput.vertices = ['ESSENCE', 'ESSENCE']
          }
        }
        this.$log('nodeInput', nodeInput)
        // rightItem ? joint : node...
        // publish content... content&content
        // publish node... node&content
        // publish user... node
        // here we have node&[content,user,sphere,node]
        let createdNode = await ObjectCreateApi.essenceCreate(nodeInput)
        this.$log('publish createdNode', createdNode)
        this.$log('publish done')
        this.publishing = false
        this.$emit('published', createdNode)
        this.cancel()
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
    cancel () {
      this.$log('cancel')
      this.$emit('node', JSON.parse(JSON.stringify(this.nodeInitial)))
      // return to prev state, self-destruct?
    }
  },
  created () {
    this.$log('created')
    if (!this.nodeInitial) this.nodeInitial = JSON.parse(JSON.stringify(this.node))
  }
}
</script>
